import {Express} from "express";
import * as bodyParser from "body-parser";
import express_session from "express-session";
import * as Config from 'app-config';
import passport from 'passport';
import cors from 'cors';
import MySQLStoreFactory from "express-mysql-session";
import {
    PassportService,
    AuthenticationRoutes,
    AuthenticationController,
    AuthenticationValidator, AuthenticationUtility, TokenService
} from "@imitate/authentication";
import {Logger, MorganProvider} from "@imitate/logger";
import {ServerUtilityService} from "./services/serverUtility.service";
import {
    UserManagementController,
    UserManagementRoutes,
    UserManagementService,
    UserManagementValidator
} from "@imitate/usermanagement";

const MySQLStore = MySQLStoreFactory(express_session);

export class AppContext {
    private logger: Logger;
    private morganProvider: MorganProvider;
    private serverUtilityService: ServerUtilityService;
    private authenticationUtility: AuthenticationUtility;
    private tokenService: TokenService;
    private userManagementRoutes: UserManagementRoutes;
    private userManagementService: UserManagementService;

    constructor(private app: Express, private passportService: PassportService) {
        this.logger = new Logger();
        this.morganProvider = new MorganProvider(this.app);
        this.serverUtilityService = new ServerUtilityService(this.logger);
        this.userManagementService = new UserManagementService();
        this.authenticationUtility = new AuthenticationUtility(this.logger, this.userManagementService);
        this.tokenService = new TokenService();

        this.userManagementRoutes = new UserManagementRoutes(
            new UserManagementController(this.logger, this.serverUtilityService, this.userManagementService),
            new UserManagementValidator(),
            this.authenticationUtility
        );
    }

    public registerMiddleware() {
        this.morganProvider.init();
        this.passportService.initialize(passport);

        // CORS — allow the Angular dev server and the production SPA origin
        this.app.use(cors({
            origin: [
                'http://localhost:4200',
                process.env.FRONTEND_ORIGIN || 'http://localhost:4200',
            ],
            credentials: true,
        }));

        this.app.use(bodyParser.urlencoded({limit: "1000mb", extended: true, parameterLimit: 50000}));
        this.app.use(bodyParser.json({limit: "1000mb"}));

        // Session is still needed to carry OIDC state/nonce across the redirect/callback round-trip
        this.app.use(express_session(Config.authentication.initialize(MySQLStore)) as any);
        this.app.use(passport.initialize() as any);
        this.app.use(passport.session() as any);
    }

    public registerRoutes() {
        return new Promise((resolve, reject) => {
            this.app.use(new AuthenticationRoutes(
                new AuthenticationController(this.logger, this.serverUtilityService, this.authenticationUtility, this.tokenService, this.userManagementService),
                new AuthenticationValidator(),
                this.authenticationUtility
            ).router);

            this.app.use(this.userManagementRoutes.router);

            resolve(true);
        });
    }

}
