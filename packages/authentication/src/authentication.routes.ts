import {AuthenticationController} from "./authentication.controller";
import {AuthenticationValidator} from "./authentication.validator";
import {BaseRouter} from "@imitate/server";
import {AuthenticationUtility} from "./services/authentication.utility";

export class AuthenticationRoutes extends BaseRouter {

    private LOGIN_ENDPOINT: string = this.baseUrl() + 'login';
    private LOGOUT_ENDPOINT: string = this.baseUrl() + 'logout';
    private IS_LOGGED_IN_ENDPOINT: string = this.baseUrl() + 'isLoggedIn';

    constructor(private authenticationController: AuthenticationController,
                private authenticationValidator: AuthenticationValidator,
                private authenticationUtility: AuthenticationUtility) {
        super();
        // ROUTES
        this.router.post(this.LOGIN_ENDPOINT, this.authenticationValidator.login,
            this.authenticationController.login.bind(this.authenticationController));

        this.router.get(this.LOGOUT_ENDPOINT, this.authenticationUtility.requiresAuth.bind(this.authenticationUtility),
            this.authenticationController.logout.bind(this.authenticationController));

        this.router.get(this.IS_LOGGED_IN_ENDPOINT, this.authenticationController.isLoggedIn.bind(this.authenticationController));
    }

}
