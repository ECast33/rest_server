import {AuthenticationController} from "./authentication.controller";
import {AuthenticationValidator} from "./authentication.validator";
import {BaseRouter} from "@imitate/server";
import {AuthenticationUtility} from "./services/authentication.utility";
import * as Config from 'app-config';
import {Router} from "express";

export class AuthenticationRoutes {

    private LOGIN_ENDPOINT: string = Config.app.API_BASE_ROUTE + 'login';
    private LOGOUT_ENDPOINT: string = Config.app.API_BASE_ROUTE + 'logout';
    private IS_LOGGED_IN_ENDPOINT: string = Config.app.API_BASE_ROUTE + 'isLoggedIn';
    protected _router: Router;

    constructor(private authenticationController: AuthenticationController,
                private authenticationValidator: AuthenticationValidator,
                private authenticationUtility: AuthenticationUtility) {
        this._router = Router();
        // ROUTES
        this._router.post(this.LOGIN_ENDPOINT, this.authenticationValidator.login,
            this.authenticationController.login.bind(this.authenticationController));

        this._router.get(this.LOGOUT_ENDPOINT, this.authenticationUtility.requiresAuth.bind(this.authenticationUtility),
            this.authenticationController.logout.bind(this.authenticationController));

        this._router.get(this.IS_LOGGED_IN_ENDPOINT, this.authenticationController.isLoggedIn.bind(this.authenticationController));
    }

    get router(): Router {
        return this._router;
    }

}
