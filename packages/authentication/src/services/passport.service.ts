import {AuthenticationUtility} from "./authentication.utility";

let LocalStrategy = require('passport-local').Strategy;
import {Logger} from "@imitate/logger";
import {PassportStatic} from "passport";
import {authentication} from "app-config";
import {User, UserManagementService} from "@imitate/usermanagement";
import {buildJwtStrategy, JWT_STRATEGY_NAME} from "../strategies/jwt.strategy";


export class PassportService {

    constructor(private logger: Logger, private userManagementService: UserManagementService,
                private authenticationUtility: AuthenticationUtility) {
    }

    initialize(passport: PassportStatic) {
        // Session serialization — still needed to carry OIDC state/nonce across redirect
        passport.serializeUser((user: any, done) => {
            done(null, user.id);
        });

        passport.deserializeUser(async (id: number, done) => {
            try {
                const user = await this.userManagementService.getUserById(id);
                if (!user) {
                    return done(undefined, false);
                } else {
                    return done(undefined, user);
                }
            } catch (error) {
                this.logger.error('Error getting user By id ', id, error);
                return done(error, false);
            }
        });

        // JWT Bearer token strategy — used for all protected API routes
        passport.use(JWT_STRATEGY_NAME, buildJwtStrategy(this.userManagementService, this.logger));

        // Local username/password strategy — retained for admin/root emergency access
        passport.use(authentication.LOGIN_STRATEGY_NAME, new LocalStrategy({
                usernameField: 'username',
                passwordField: 'password',
            },
            async (username: string, password: string, done) => {
                try {
                    let user = await this.userManagementService.getByUsername(username);
                    if (!user) {
                        return done(null, false, {message: 'Wrong credentials'});
                    } else if (!this.authenticationUtility.validPassword(password, user.password)) {
                        return done(null, false, {message: 'Wrong credentials'});
                    } else if (!user.is_enabled) {
                        return done(null, false, {message: 'Inactive Account'});
                    } else {
                        return done(null, user);
                    }

                } catch (error) {
                    return done(error);
                }
            }));
    }
}
