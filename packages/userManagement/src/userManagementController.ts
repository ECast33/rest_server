import {Request, Response} from 'express';
import {Logger} from "@imitate/logger";
import {ServerUtilityService} from "@imitate/server";
import {UserManagementService} from "./index";

export class UserManagementController {
    constructor(private logger: Logger, private serverUtilityService: ServerUtilityService,
                private _userManagementService: UserManagementService) {
    }

    async addNewUser(req: Request, res: Response) {
        try {
            let result = await this._userManagementService.createNewUser(req.body.user);
            this.serverUtilityService.handleSuccess(result, res);
        } catch (error: any) {
            this.serverUtilityService.handleRestError('Error addNewUser', error, res);
        }
    }
}
