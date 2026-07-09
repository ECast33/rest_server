import * as Config from 'app-config';
import {Request, Response, NextFunction} from 'express';
import {StatusCodes} from "http-status-codes";
import * as bcrypt from 'bcrypt';
import {ACCESS_LEVELS, User, UserManagementService} from "@auth-app/usermanagement";
import {IGetUserAuthInfoRequest} from "../../../../@types/global";
import moment from 'moment';
import {Logger} from "@auth-app/logger";
import passport from 'passport';
import {JWT_STRATEGY_NAME} from "../strategies/jwt.strategy";

export class AuthenticationUtility {

    constructor(private logger: Logger, private userManagementService: UserManagementService) {
    }

    sanitizeUserData(user: User): User {
        user.redactPassword();
        return user;
    }

    generateHash(password: string): string {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
    }

    validPassword(attempt: string, password: string): boolean {
        return bcrypt.compareSync(attempt, password);
    }

    /**
     * requiresAuth — supports both JWT Bearer tokens (primary) and legacy sessions (fallback).
     * Protected routes should use this middleware guard.
     */
    requiresAuth(req: Request, res: Response, next: NextFunction) {
        // First try JWT Bearer token strategy
        passport.authenticate(JWT_STRATEGY_NAME, {session: false}, (err, user) => {
            if (err) {
                this.logger.error('requiresAuth JWT error', err);
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).end();
                return;
            }
            if (user) {
                (req as unknown as IGetUserAuthInfoRequest).user = user;
                this.requiresActiveAccount(req as unknown as IGetUserAuthInfoRequest, res, next);
                return;
            }
            // Fallback: session-based auth (legacy / admin console)
            if (req.isAuthenticated()) {
                this.requiresActiveAccount((req as unknown as IGetUserAuthInfoRequest), res, next);
            } else {
                res.status(StatusCodes.UNAUTHORIZED).end();
            }
        })(req, res, next);
    }

    requiresActiveAccount(req: IGetUserAuthInfoRequest, res: Response, next: any) {
        if (req && req.user.is_enabled || req.user.access_level === ACCESS_LEVELS.ROOT) {
            next();
        } else {
            if (req.session) {
                req.session.destroy(() => {
                    res.status(StatusCodes.FORBIDDEN).end();
                });
            } else {
                res.status(StatusCodes.FORBIDDEN).end();
            }
        }
    }

    async adminPhase(): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                let success = false;
                let root = await this.userManagementService.getByUsername('root');
                let admin = await this.userManagementService.getByUsername('admin');
                if (!root && !admin) {
                    let password = this.generateHash(Config.authentication.DEFAULT_ROOT_PASSWORD);
                    let rootSuccess = await this.userManagementService.createNewUser(new User({
                        logins: 0,
                        access_level: ACCESS_LEVELS.ROOT,
                        agreed_to_lic: false,
                        created: moment().unix(),
                        email: null,
                        first_name: 'root',
                        id: null,
                        sub: null,
                        is_enabled: true,
                        job_title: 'Root User',
                        last_login: null,
                        last_name: 'user',
                        organization_id: 1,
                        owner_id: 0,
                        password: password,
                        username: 'root',
                        time_in_app: 0
                    }));

                    let adminSuccess = await this.userManagementService.createNewUser(new User({
                        logins: 0,
                        access_level: ACCESS_LEVELS.ADMIN,
                        agreed_to_lic: false,
                        created: moment().unix(),
                        email: null,
                        first_name: 'admin',
                        id: null,
                        sub: null,
                        is_enabled: true,
                        job_title: 'Admin',
                        last_login: null,
                        last_name: 'user',
                        organization_id: 1,
                        owner_id: 0,
                        password: password,
                        username: 'admin',
                        time_in_app: 0
                    }));
                    success = (adminSuccess !== null && rootSuccess !== null);
                    resolve(success);
                } else if (!root) {
                    let password = this.generateHash(Config.authentication.DEFAULT_ROOT_PASSWORD);

                    let rootSuccess = await this.userManagementService.createNewUser(new User({
                        logins: 0,
                        access_level: ACCESS_LEVELS.ROOT,
                        agreed_to_lic: false,
                        created: moment().unix(),
                        email: null,
                        first_name: 'root',
                        id: null,
                        sub: null,
                        is_enabled: true,
                        job_title: 'Root User',
                        last_login: null,
                        last_name: 'user',
                        organization_id: 1,
                        owner_id: 0,
                        password: password,
                        username: 'root',
                        time_in_app: 0
                    }));
                    success = (rootSuccess !== null);
                    resolve(success);
                } else if (!admin) {
                    let password = this.generateHash(Config.authentication.DEFAULT_ROOT_PASSWORD);
                    let adminSuccess = await this.userManagementService.createNewUser(new User({
                        logins: 0,
                        access_level: ACCESS_LEVELS.ADMIN,
                        agreed_to_lic: false,
                        created: moment().unix(),
                        email: null,
                        first_name: 'admin',
                        id: null,
                        sub: null,
                        is_enabled: true,
                        job_title: 'Admin',
                        last_login: null,
                        last_name: 'user',
                        organization_id: 1,
                        owner_id: 0,
                        password: password,
                        username: 'admin',
                        time_in_app: 0

                    }));
                    success = (adminSuccess !== null);
                    resolve(success);
                } else if (root && admin) {
                    success = true;
                    this.logger.info("Admin phase complete");
                    resolve(success);
                }
            } catch (error) {
                reject(error);
            }
        });
    }
}
