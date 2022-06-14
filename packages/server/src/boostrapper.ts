import {Express} from "express";
import * as bodyParser from "body-parser";
import express_session from "express-session";
import * as Config from 'app-config';
import passport from 'passport';
import MySQLStore from "express-mysql-session";

export class Bootstrapper {
    constructor(private app: Express) {
    }

    public registerMiddleware() {
        // AuthenticationModule.initialize(passport);
        // CorsService.init(app);
        // SiteHostingService.init(app);
        this.app.use(bodyParser.urlencoded({limit: "1000mb", extended: true, parameterLimit: 50000}));
        this.app.use(bodyParser.json({limit: "1000mb"}));
        this.app.use(express_session(Config.authentication.initialize(MySQLStore)));
        this.app.use(passport.initialize());
        this.app.use(passport.session());
    }
}
