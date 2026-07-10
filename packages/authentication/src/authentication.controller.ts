import {Request, Response} from 'express';
import passport from 'passport';
import {Logger} from "@auth-app/logger";
import {StatusCodes} from "http-status-codes";
import {authentication, oidc} from "app-config";
import {IUser, User, UserManagementService} from "@auth-app/usermanagement";
import {ServerUtilityService} from "@auth-app/server";
import {AuthenticationUtility} from "./services/authentication.utility";
import {TokenService} from "./services/token.service";
import {buildOidcClient, oidcLoginHandler, oidcCallbackHandler} from "./strategies/oidc.strategy";
import {IGetUserAuthInfoRequest} from "../../../@types/global";

export class AuthenticationController {
    private oidcLoginMiddleware: ((req: Request, res: Response) => void) | null = null;
    private oidcCallbackMiddleware: ((req: Request, res: Response) => Promise<any>) | null = null;
    private oidcClient: any = null;

    constructor(
        private logger: Logger,
        private serverUtilityService: ServerUtilityService,
        private authenticationUtility: AuthenticationUtility,
        private tokenService: TokenService,
        private userManagementService: UserManagementService,
    ) {
        this.initOidc();
    }

    private async initOidc() {
        try {
            const client = await buildOidcClient();
            this.oidcClient = client;
            this.oidcLoginMiddleware = oidcLoginHandler(client);
            this.oidcCallbackMiddleware = oidcCallbackHandler(client, this.userManagementService, this.logger);
            this.logger.info(`OIDC discovery complete — issuer: ${oidc.ISSUER}, callback: ${oidc.CALLBACK_URL}`);
        } catch (error) {
            this.logger.error('OIDC discovery failed — SSO will not be available. Check OIDC_ISSUER in oidc.js', error);
        }
    }

    /** Initiates the OIDC SSO redirect — browser navigates here to start login */
    ssoLogin(req: Request, res: Response, next) {
        if (!this.oidcLoginMiddleware) {
            return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({message: 'SSO not configured — check server logs'});
        }
        this.oidcLoginMiddleware(req, res);
    }

    /**
     * OIDC callback — IdP redirects here after user authenticates.
     * Issues JWT tokens then redirects the SPA to its auth-callback route.
     */
    async ssoCallback(req: Request, res: Response, next) {
        if (!this.oidcCallbackMiddleware) {
            return res.redirect(`${oidc.FRONTEND_CALLBACK_URL}?error=sso_unavailable`);
        }
        try {
            const result = await this.oidcCallbackMiddleware(req, res) as {user: User; idToken?: string} | null;
            if (!result) {
                // oidcCallbackHandler already redirected on error/inactive
                return;
            }
            const {user, idToken} = result;
            const tokens = this.tokenService.buildTokenResponse(user);
            const redirectUrl = new URL(oidc.FRONTEND_CALLBACK_URL);
            redirectUrl.searchParams.set('accessToken', tokens.accessToken);
            redirectUrl.searchParams.set('refreshToken', tokens.refreshToken);
            redirectUrl.searchParams.set('expiresIn', tokens.expiresIn);
            // Handed to the SPA so it can present it back as id_token_hint on logout,
            // enabling a true RP-initiated logout that also ends the Keycloak SSO session.
            if (idToken) {
                redirectUrl.searchParams.set('idToken', idToken);
            }
            return res.redirect(redirectUrl.toString());
        } catch (error: any) {
            this.logger.error('Error issuing tokens after OIDC callback', error);
            return res.redirect(`${oidc.FRONTEND_CALLBACK_URL}?error=token_error`);
        }
    }

    /** Legacy local username/password login — retained for admin/root access */
    login(req: Request, res: Response, next) {
        passport.authenticate(authentication.LOGIN_STRATEGY_NAME, (err, user, info) => {
            if (err) {
                this.logger.error("Internal Server Error with user logging in", err);
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err).end();
            } else if (!user) {
                res.status(StatusCodes.UNAUTHORIZED).json(info);
            } else {
                req.login(user, async (err) => {
                    if (err) {
                        res.status(StatusCodes.UNAUTHORIZED).json(info);
                    } else {
                        try {
                            const returnedUser = new User(user);
                            returnedUser.redactPassword();
                            const tokens = this.tokenService.buildTokenResponse(returnedUser);
                            this.serverUtilityService.handleSuccess({user: returnedUser, ...tokens}, res);
                        } catch (error: any) {
                            this.serverUtilityService.handleRestError('Error login', error, res);
                        }
                    }
                });
            }
        })(req, res, undefined);
    }

    /** Exchanges a valid refresh token for a new access token */
    async refreshToken(req: Request, res: Response) {
        try {
            const {refreshToken} = req.body;
            if (!refreshToken) {
                return res.status(StatusCodes.BAD_REQUEST).json({message: 'refreshToken is required'});
            }
            const payload = this.tokenService.verifyRefreshToken(refreshToken);
            const {accessToken, expiresIn} = this.tokenService.buildTokenResponse({id: payload.id, sub: payload.sub} as User);
            this.serverUtilityService.handleSuccess({accessToken, expiresIn}, res);
        } catch (error: any) {
            this.logger.error("Refresh token error", error);
            res.status(StatusCodes.UNAUTHORIZED).json({message: 'Invalid or expired refresh token'});
        }
    }

    async logout(req: Request, res: Response) {
        try {
            // SSO/JWT clients (the primary auth path) never establish a Passport session —
            // ssoCallback issues JWT tokens directly without calling req.login(). There's
            // nothing server-side to tear down for them beyond the app's own scratch
            // session data (oidcState/oidcNonce). Only fall through to req.logout() for
            // legacy session-authenticated clients.
            const hasSession = !!(req.session && (req.session as any).passport?.user);
            if (!hasSession) {
                // Destroy the app's own session for hygiene, even though it holds no
                // Passport user for SSO clients.
                req.session?.destroy(() => {});

                // If the client hands back the OIDC id_token it received at login, build
                // a Keycloak RP-initiated logout URL so the browser can navigate there
                // and truly end the user's SSO session (not just discard the app's JWT).
                // Without this, Keycloak's own session cookie stays alive and the next
                // "Sign in" attempt (even with prompt=login) reflects a still-logged-in IdP.
                const idToken = (req.query.idToken as string) || (req.body && req.body.idToken);
                if (idToken && this.oidcClient) {
                    try {
                        const ssoLogoutUrl = this.oidcClient.endSessionUrl({
                            id_token_hint: idToken,
                            post_logout_redirect_uri: oidc.POST_LOGOUT_REDIRECT_URL,
                        });
                        this.serverUtilityService.handleSuccess({ssoLogoutUrl}, res);
                        return;
                    } catch (error: any) {
                        this.logger.error('Error building SSO end-session URL', error);
                    }
                }

                this.serverUtilityService.handleSuccess(true, res);
                return;
            }

            req.logout((err) => {
                if (err) {
                    this.serverUtilityService.handleRestError('Error logout ', err, res);
                    return;
                }
                req.session?.destroy(() => {});
                this.serverUtilityService.handleSuccess(true, res);
            });
        } catch (error: any) {
            this.serverUtilityService.handleRestError('Error logout ', error, res);
        }
    }

    isLoggedIn(req: Request, res: Response) {
        const authedReq = req as unknown as IGetUserAuthInfoRequest;
        const isLoggedIn = req.isAuthenticated() || !!authedReq.user;
        let response: any = {isLoggedIn};
        if (isLoggedIn && authedReq.user) {
            response.userProfile = this.authenticationUtility.sanitizeUserData(new User(authedReq.user as IUser));
        }
        this.serverUtilityService.handleSuccess(response, res);
    }
}
