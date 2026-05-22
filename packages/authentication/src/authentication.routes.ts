import {AuthenticationController} from "./authentication.controller";
import {AuthenticationValidator} from "./authentication.validator";
import {BaseRouter} from "@imitate/server";
import {AuthenticationUtility} from "./services/authentication.utility";
import * as Config from 'app-config';
import {Router} from "express";

export class AuthenticationRoutes {

    private BASE: string = Config.app.API_BASE_ROUTE;
    private LOGIN_ENDPOINT: string = this.BASE + 'login';
    private LOGOUT_ENDPOINT: string = this.BASE + 'logout';
    private IS_LOGGED_IN_ENDPOINT: string = this.BASE + 'isLoggedIn';
    private SSO_LOGIN_ENDPOINT: string = this.BASE + 'auth/sso';
    private SSO_CALLBACK_ENDPOINT: string = this.BASE + 'auth/callback';
    private REFRESH_TOKEN_ENDPOINT: string = this.BASE + 'auth/refresh';
    protected _router: Router;

    constructor(private authenticationController: AuthenticationController,
                private authenticationValidator: AuthenticationValidator,
                private authenticationUtility: AuthenticationUtility) {
        this._router = Router();

        // SSO / OpenID Connect routes
        this._router.get(this.SSO_LOGIN_ENDPOINT,
            this.authenticationController.ssoLogin.bind(this.authenticationController));

        this._router.get(this.SSO_CALLBACK_ENDPOINT,
            this.authenticationController.ssoCallback.bind(this.authenticationController));

        this._router.post(this.REFRESH_TOKEN_ENDPOINT,
            this.authenticationController.refreshToken.bind(this.authenticationController));

        // Legacy local login — retained for admin/root access
        this._router.post(this.LOGIN_ENDPOINT, this.authenticationValidator.login,
            this.authenticationController.login.bind(this.authenticationController));

        this._router.get(this.LOGOUT_ENDPOINT, this.authenticationUtility.requiresAuth.bind(this.authenticationUtility),
            this.authenticationController.logout.bind(this.authenticationController));

        this._router.get(this.IS_LOGGED_IN_ENDPOINT, this.authenticationUtility.requiresAuth.bind(this.authenticationUtility),
            this.authenticationController.isLoggedIn.bind(this.authenticationController));
    }

    get router(): Router {
        return this._router;
    }

}
