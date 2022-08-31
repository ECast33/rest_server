import * as Config from 'app-config';
import {Request, Response} from 'express';
import {StatusCodes} from "http-status-codes";
import * as bcrypt from 'bcrypt';
import {ACCESS_LEVELS, User, UserManagementService} from "@imitate/usermanagement";
import {IGetUserAuthInfoRequest} from "../../../../@types/global";
import moment from 'moment';

export class AuthenticationUtility {

    constructor(private userManagementService: UserManagementService) {
    }

    sanitizeUserData(user: User): User {
        user.redactPassword();
        return user;
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

    async adminPhase(): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                // TODO: inject DAO
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
                } else if (root && admin) {
                    success = true;
                }
                resolve(success);
            } catch (error) {
                reject(error);
            }
        });
    }
}
