import {Express} from "express";
import * as bodyParser from "body-parser";
import express_session from "express-session";
import * as Config from 'app-config';
import passport from 'passport';
import MySQLStore from "express-mysql-session";
import {
    PassportService,
    AuthenticationRoutes,
    AuthenticationController,
    AuthenticationValidator, AuthenticationUtility
} from "@imitate/authentication";
import {Logger, MorganProvider} from "@imitate/logger";
import {ServerUtilityService} from "./services/serverUtility.service";
import {
    UserManagementController,
    UserManagementRoutes,
    UserManagementService,
    UserManagementValidator
} from "@imitate/usermanagement";

export class AppContext {
    private logger: Logger;
    private morganProvider: MorganProvider;
    private serverUtilityService: ServerUtilityService;
    private authenticationUtility: AuthenticationUtility;

    constructor(private app: Express, private passportService: PassportService) {
        // instantiate needed dependencies
        this.logger = new Logger();
        this.morganProvider = new MorganProvider(this.app);
        this.serverUtilityService = new ServerUtilityService(this.logger);
        this.authenticationUtility = new AuthenticationUtility(this.logger, new UserManagementService());
    }

    public registerMiddleware() {
        this.morganProvider.init();
        this.passportService.initialize(passport);
        // CorsService.init(app);
        // SiteHostingService.init(app);
        this.app.use(bodyParser.urlencoded({limit: "1000mb", extended: true, parameterLimit: 50000}));
        this.app.use(bodyParser.json({limit: "1000mb"}));
        this.app.use(express_session(Config.authentication.initialize(MySQLStore)));
        this.app.use(passport.initialize());
        this.app.use(passport.session());
    }

    public registerRoutes() {
        return new Promise((resolve, reject) => {
            this.app.use(new AuthenticationRoutes(new AuthenticationController(this.logger, this.serverUtilityService, this.authenticationUtility),
                new AuthenticationValidator(), this.authenticationUtility).router);

            this.app.use(new UserManagementRoutes(new UserManagementController(this.logger, this.serverUtilityService, new UserManagementService()),
                new UserManagementValidator(), this.authenticationUtility).router);
            
            resolve(true);
        });


    }

}
