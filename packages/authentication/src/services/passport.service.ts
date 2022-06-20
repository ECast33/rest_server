import {AuthenticationUtility} from "./authentication.utility";

let LocalStrategy = require('passport-local').Strategy;
import {Logger} from "@imitate/logger";
import {PassportStatic} from "passport";
import {authentication} from "app-config";
import {User, UserDao} from "@imitate/usermanagement";


export class PassportService {

    constructor(private logger: Logger, private userDao: UserDao,
                private authenticationUtility: AuthenticationUtility) {
    }

    initialize(passport: PassportStatic) {
        // =========================================================================
        // passport session setup ==================================================
        // =========================================================================
        // required for persistent login sessions
        // passport needs ability to serialize and unserialize users out of session

        // used to serialize the user for the session
        passport.serializeUser((user: any, done) => {
            done(null, user.id);
        });

        // used to deserialize the user
        passport.deserializeUser(async (id: number, done) => {
            try {
                const user = await this.userDao.getUserById(id);
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

        passport.use(authentication.LOGIN_STRATEGY_NAME, new LocalStrategy({
                // by default, local strategy uses username and password
                usernameField: 'username',
                passwordField: 'password',
            },
            async (username: string, password: string, done) => { // callback with email and password from our form
                try {
                    let user = await this.userDao.getByUsername(username);
                    if (!user) {
                        // if no user is found, return the message
                        return done(null, false, {message: 'Wrong credentials'});
                    } else if (!this.authenticationUtility.validPassword(password, user._password)) {
                        // if the user is found but the password is wrong
                        return done(null, false, {message: 'Wrong credentials'});
                    } else if (!user._is_enabled) {
                        // if the user's account is disabled
                        return done(null, false, {message: 'Inactive Account'});
                    } else {
                        // all is well, return successful user
                        return done(null, user);
                    }

                } catch (error) {
                    return done(error);
                }
            }));
    }
}
