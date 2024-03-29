import * as http from 'http';
import express from 'express';
import * as Config from 'app-config';
import https from "https";
import fs from "fs";
import {Logger} from "@imitate/logger";
import {AppContext} from "./appContext";
import {SqlDatabaseService} from "./services/sqlDatabase.service";
import {PassportService, AuthenticationUtility} from "@imitate/authentication";
import {UserManagementService} from "@imitate/usermanagement";

export class Worker {
    private app = express();
    private express_server: any;
    private port = Config.app.PORT || 8000;
    private context: AppContext;
    private readonly passportService: PassportService;
    private readonly authUtility: AuthenticationUtility;
    private readonly userManagementService: UserManagementService;

    constructor(public logger: Logger, private databaseService: SqlDatabaseService) {
        this.userManagementService = new UserManagementService();
        this.authUtility = new AuthenticationUtility(this.logger, this.userManagementService);
        this.passportService = new PassportService(this.logger, this.userManagementService, this.authUtility)
        this.context = new AppContext(this.app, this.passportService);
    }

    async start() {
        // START THE SERVER SEQUENCE
        // =============================================================================
        return new Promise(async (resolve, reject) => {
            this.logger.info('Starting Server Process...');
            let dataSource = await this.databaseService.initDataSource();
            if (dataSource) {
                this.logger.info("Data Source has been initialized!");
                const admin = await this.authUtility.adminPhase();
            }
            await this.bootstrap();
            if (Config.app.HTTPS) {
                this.express_server = https.createServer({
                    key: fs.readFileSync(Config.authentication.TLS_KEY),
                    cert: fs.readFileSync(Config.authentication.TLS_CERT),
                    passphrase: Config.authentication.TLS_PASSPHRASE
                }, this.app).listen(this.port);
            } else {
                this.express_server = http.createServer(this.app).listen(this.port);
            }
            if (this.express_server) resolve(true);
        });
    }

    shutdown() {
        if (this.express_server) {
            this.express_server.close();
        }
    }

    async bootstrap() {
        return new Promise(async (resolve, reject) => {
            this.context.registerMiddleware();
            await this.context.registerRoutes();

            // Final Chain Error Handling
            this.app.use((err: any, req, res, next) => {
                this.logger.error(err.stack);
                res.status(500).send('Internal Server Error');
            });

            process.on('SIGINT', () => {
                this.shutdown();
            });

            resolve(true);
        });

    }


}
