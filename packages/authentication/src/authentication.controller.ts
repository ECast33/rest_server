import {Request, Response} from 'express';
import passport from 'passport';
import {Logger} from "@imitate/logger";
import {StatusCodes} from "http-status-codes";
import {authentication} from "app-config";
import {IUser, User} from "@imitate/usermanagement";
import {ServerUtilityService} from "@imitate/server";
import {AuthenticationUtility} from "./services/authentication.utility";

export class AuthenticationController {
    constructor(private logger: Logger, private serverUtilityService: ServerUtilityService,
                private authenticationUtility: AuthenticationUtility) {
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
                req.login(user, async (err) => {
                    if (err) {
                        res.status(StatusCodes.UNAUTHORIZED);
                        res.json(info);
                    } else {
                        try {
                            // let result = await instance._userManagementService.updateLogin(returnedUser._id);
                            // if (result) {
                            const returnedUser = new User(user);
                            returnedUser.redactPassword();
                            this.serverUtilityService.handleSuccess(returnedUser, res);
                            // }
                        } catch (error: any) {
                            this.serverUtilityService.handleRestError('Error login', error, res);
                        }
                    }
                });
            }
        })(req, res, undefined);
    }

    async logout(req: Request, res: Response) {
        try {
            // const success = await this._userManagementService.updateTimeInApp(req.user);
            req.logout((err) => {
                if (err) {
                    throw err;
                } else {
                    this.serverUtilityService.handleSuccess(true, res);
                }
            });

        } catch (error: any) {
            this.serverUtilityService.handleRestError('Error logout ', error, res);
        }

    }

    isLoggedIn(req: Request, res: Response) {
        let response: any = {
            isLoggedIn: req.isAuthenticated()
        };

        if (req.isAuthenticated()) response.userProfile = this.authenticationUtility.sanitizeUserData(new User(req.user as IUser));
        this.serverUtilityService.handleSuccess(response, res);
    }
}
