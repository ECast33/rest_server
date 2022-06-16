import * as http from 'http';
import express from 'express';
import * as Config from 'app-config';
import https from "https";
import fs from "fs";
import {Logger, MorganProvider} from "@imitate/logger";
import {Bootstrapper} from "./boostrapper";
import {SqlDatabaseService} from "./services/sqlDatabase.service";
import {PassportService} from "@imitate/authentication";
import {UserDao} from "@imitate/usermanagement";

export class Worker {
    private app = express();
    private express_server: any;
    private port = Config.app.PORT || 8000;
    private bootstrapper: Bootstrapper = new Bootstrapper(this.app, new PassportService(this.logger, new UserDao(this.logger, new SqlDatabaseService(this.logger))));

    constructor(public logger: Logger, private databaseService: SqlDatabaseService) {
    }

    async start() {
        // START THE SERVER SEQUENCE
        // =============================================================================
        this.logger.info('Starting Server Process...');
        return new Promise(async (resolve, reject) => {
            let DB = await this.databaseService.initialize();
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
        this.bootstrapper.registerMiddleware();
        this.bootstrapper.registerRoutes();
        // this.morganProvider.init();
        // Final Chain Error Handling
        this.app.use((req, res, next) => {
            // log.error(err.stack);
            res.status(500).send('Internal Server Error');
        }, err => {
            this.logger.error(err);
        });

        process.on('SIGINT', () => {
            this.shutdown();
        });
    }


}
