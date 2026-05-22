import {Issuer, generators, CallbackParamsType} from 'openid-client';
import * as Config from 'app-config';
import {ACCESS_LEVELS, IUser, User, UserManagementService} from '@imitate/usermanagement';
import {Logger} from '@imitate/logger';
import moment from 'moment';
import {Request, Response} from 'express';

export const OIDC_STRATEGY_NAME = 'oidc';

/**
 * Builds the OIDC client via provider discovery.
 * Discovery reads /.well-known/openid-configuration automatically so
 * authorizationURL / tokenURL / userInfoURL never need to be hardcoded.
 */
export async function buildOidcClient() {
    const issuer = await Issuer.discover(Config.oidc.ISSUER);
    return new issuer.Client({
        client_id: Config.oidc.CLIENT_ID,
        client_secret: Config.oidc.CLIENT_SECRET,
        redirect_uris: [Config.oidc.CALLBACK_URL],
        response_types: ['code'],
    });
}

/**
 * Returns Express middleware that starts the OIDC authorization redirect.
 * A nonce + state are stored in the session so they can be verified on callback.
 */
export function oidcLoginHandler(client: any) {
    return (req: Request, res: Response) => {
        const state = generators.state();
        const nonce = generators.nonce();

        req.session['oidcState'] = state;
        req.session['oidcNonce'] = nonce;

        const redirectUrl = client.authorizationUrl({
            scope: Config.oidc.SCOPE,
            state,
            nonce,
        });

        res.redirect(redirectUrl);
    };
}

/**
 * Returns Express middleware that handles the IdP callback.
 * Validates state + nonce, exchanges the code, fetches user claims,
 * then finds or auto-provisions a local user record.
 */
export function oidcCallbackHandler(
    client: any,
    userManagementService: UserManagementService,
    logger: Logger,
) {
    return async (req: Request, res: Response) => {
        try {
            const state = req.session['oidcState'];
            const nonce = req.session['oidcNonce'];

            if (!state || !nonce) {
                logger.warn('OIDC callback — missing session state/nonce');
                return res.redirect(`${Config.oidc.FRONTEND_CALLBACK_URL}?error=missing_state`);
            }

            const params: CallbackParamsType = client.callbackParams(req);
            const tokenSet = await client.callback(Config.oidc.CALLBACK_URL, params, {state, nonce});
            const claims = tokenSet.claims();

            const sub: string = claims.sub;
            const email: string = (claims.email as string) || null;
            const firstName: string = (claims.given_name as string) || (claims.name as string)?.split(' ')[0] || 'Unknown';
            const lastName: string = (claims.family_name as string) || (claims.name as string)?.split(' ').slice(1).join(' ') || 'User';
            const username: string = (claims.preferred_username as string) || email || sub;

            let user = await userManagementService.getUserBySub(sub);

            if (!user) {
                const newUser: IUser = {
                    sub,
                    username,
                    password: '',
                    first_name: firstName,
                    last_name: lastName,
                    email,
                    created: moment().unix(),
                    access_level: ACCESS_LEVELS.OBSERVER,
                    owner_id: 0,
                    is_enabled: true,
                    organization_id: 1,
                    job_title: '',
                    last_login: moment().unix(),
                    agreed_to_lic: false,
                    logins: 1,
                    time_in_app: 0,
                    id: null,
                };
                user = await userManagementService.createNewUser(new User(newUser));
            } else {
                user = await userManagementService.updateUserBySub(sub, {
                    last_login: moment().unix(),
                    logins: (user.logins || 0) + 1,
                });
            }

            if (!user.is_enabled) {
                return res.redirect(`${Config.oidc.FRONTEND_CALLBACK_URL}?error=unauthorized`);
            }

            return user;

        } catch (error) {
            logger.error('OIDC callback error', error);
            return null;
        }
    };
}
