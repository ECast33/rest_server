import {UserManagementValidator} from "./userManagementValidator";
import {UserManagementController} from "./userManagementController";
import {AuthenticationUtility} from "@imitate/authentication";
import * as Config from 'app-config';
import {Router} from "express";

export class UserManagementRoutes {
    private ADD_NEW_USER_ENDPOINT: string = this.baseUrl + 'add-user';
    // private UPDATE_USER_ENDPOINT: string = this.baseUrl() + 'update-user';
    // private GET_USER_ENDPOINT: string = this.baseUrl() + 'get-user';
    // private DEACTIVATE_USER_ENDPOINT: string = this.baseUrl() + 'deactivateUser';
    protected _router: Router;

    constructor(private userManagementController: UserManagementController, private userManagementValidator: UserManagementValidator,
                private _authenticationUtility: AuthenticationUtility) {

        this._router = Router();
        // ROUTES
        this._router.post(this.ADD_NEW_USER_ENDPOINT, this.userManagementValidator.addNewUser,
            this.userManagementController.addNewUser.bind(this.userManagementController));

        // this.router.get(this.GET_USER_ENDPOINT, this.userManagementValidator.getUser,
        //     this.userManagementController.getUserById.bind(this.userManagementController));
        //
        // this.router.post(this.UPDATE_USER_ENDPOINT, this.userManagementValidator.updateUser,
        //     this.userManagementController.updateUser.bind(this.userManagementController));
        //
        // this.router.post(this.DEACTIVATE_USER_ENDPOINT, this.userManagementValidator.deactivateUser,
        //     this.userManagementController.deactivateUser.bind(this.userManagementController));
    }

    get router(): Router {
        return this._router;
    }

    get baseUrl() {
        return `${Config.app.API_BASE_ROUTE}`
    }
}
