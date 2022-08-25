import * as http from 'http';
import express from 'express';
import * as Config from 'app-config';
import https from "https";
import fs from "fs";
import {Logger} from "@imitate/logger";
import {AppContext} from "./appContext";
import {SqlDatabaseService} from "./services/sqlDatabase.service";
import {PassportService, AuthenticationUtility} from "@imitate/authentication";
import {UserDao} from "@imitate/usermanagement";
import path from "path";

export class Worker {
    private app = express();
    private express_server: any;
    private port = Config.app.PORT || 8000;
    private context: AppContext;
    private readonly passportService: PassportService;
    private authUtility: AuthenticationUtility;

    constructor(public logger: Logger, private databaseService: SqlDatabaseService) {
        this.authUtility = new AuthenticationUtility();
        this.passportService = new PassportService(this.logger, new UserDao(this.logger, new SqlDatabaseService(this.logger)), this.authUtility)
        this.context = new AppContext(this.app, this.passportService);
    }

    async start() {
        // START THE SERVER SEQUENCE
        // =============================================================================
        this.logger.info('Starting Server Process...');
        return new Promise(async (resolve, reject) => {
            // let DB = await this.databaseService.initialize();
            this.logger.info(path.join(__dirname))
            let dataSource = await this.databaseService.initDataSource();
            this.bootstrap();
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

    bootstrap() {
        this.context.registerMiddleware();
        this.context.registerRoutes();

        // Final Chain Error Handling
        this.app.use((err: any, req, res, next) => {
            this.logger.error(err.stack);
            res.status(500).send('Internal Server Error');
        });

        process.on('SIGINT', () => {
            this.shutdown();
        });
    }


}
