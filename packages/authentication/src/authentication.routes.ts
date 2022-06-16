import {AuthenticationController} from "./authentication.controller";
import {AuthenticationValidator} from "./authentication.validator";
import {BaseRouter} from "@imitate/server";

export class AuthenticationRoutes extends BaseRouter {

    private LOGIN_ENDPOINT: string = this.baseUrl() + 'login';

    constructor(private authenticationController: AuthenticationController, private authenticationValidator: AuthenticationValidator) {
        super();
        
        // ROUTES 
        this.router.post(this.LOGIN_ENDPOINT, this.authenticationValidator.login, this.authenticationController.login.bind(this.authenticationController));
    }

}
