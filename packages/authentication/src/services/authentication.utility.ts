import {Request, Response} from 'express';
import {StatusCodes} from "http-status-codes";
import * as bcrypt from 'bcrypt';
import {ACCESS_LEVELS} from "@imitate/usermanagement";
import {IGetUserAuthInfoRequest} from "../../../../@types/global";

export class AuthenticationUtility {

    constructor() {
    }

    // Generating a hash
    generateHash(password: string): string {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
    }

    // Check for valid password
    validPassword(attempt: string, password: string): boolean {
        return bcrypt.compareSync(attempt, password);
    }

    requiresAuth(req: Request, res: Response, next: any) {
        if (req.isAuthenticated())
            this.requiresActiveAccount((req as IGetUserAuthInfoRequest), res, next);
        else {
            res.status(StatusCodes.UNAUTHORIZED);
            res.end();
        }
    }

    requiresActiveAccount(req: IGetUserAuthInfoRequest, res: Response, next: any) {
        if (req && req.user.is_enabled || req.user.access_level === ACCESS_LEVELS.ROOT) {
            next();
        } else {
            if (req.session) {
                req.session.destroy((err) => {
                    res.status(StatusCodes.FORBIDDEN);
                    res.end();
                });
            } else {
                res.status(StatusCodes.FORBIDDEN);
                res.end();
            }
        }
    }
}
