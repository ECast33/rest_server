import {Request, Response} from 'express';
import {StatusCodes} from "http-status-codes";
import {validate} from "class-validator"
import {IUser} from "./entities/user.entity";

export class UserManagementValidator {

    getUser(req: Request, res: Response, next) {
        //to do: have this validator do something meaningful.
        next();
    }

    async addNewUser(req: Request, res: Response, next) {
        let user = req.body.user as IUser;
        const errors = await validate(user);
        if (errors.length != 0) {
            //to do: throw an error here.
        } else {
            next();
        }
    }

    updateUser(req: Request, res: Response, next) {
        //to do: have this validator do something meaningful.
        next();
    }

    deactivateUser(req: Request, res: Response, next) {
        //to do: have this validator do something meaningful.
        next();
    }
}
