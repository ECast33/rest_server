import {Request, Response} from 'express';
import passport from 'passport';
import {Logger} from "@imitate/logger";
import {StatusCodes} from "http-status-codes";
import {authentication} from "app-config";
import {User} from "@imitate/usermanagement";

export class AuthenticationController {
    constructor(private logger: Logger) {
    }

    login(req: Request, res: Response, next) {

        passport.authenticate(authentication.LOGIN_STRATEGY_NAME, (err, user, info) => {
            if (err) {
                this.logger.error("Internal Server Error with user logging in", err);
                res.status(StatusCodes.INTERNAL_SERVER_ERROR);
                res.json(err);
                res.end();

            } else if (!user) {
                res.status(StatusCodes.UNAUTHORIZED);
                res.json(info);

            } else {
                req.login(user, async function (err) {
                    if (err) {
                        res.status(StatusCodes.UNAUTHORIZED);
                        res.json(info);
                    } else {
                        try {
                            // let result = await instance._userManagementService.updateLogin(returnedUser._id);
                            // if (result) {
                            const returnedUser = new User(user);
                            returnedUser.redactPassword();
                            res.status(StatusCodes.OK);
                            res.json(returnedUser);
                            // }
                        } catch (error) {
                            res.status(StatusCodes.INTERNAL_SERVER_ERROR);
                            res.json(error);
                            // SystemUtilityService.handleRestError('Error login', error, res);
                        }
                    }
                });
            }
        })(req, res, undefined);
    }
}
