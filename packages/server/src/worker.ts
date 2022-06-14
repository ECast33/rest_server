import * as http from 'http';
import express from 'express';
import * as Config from 'app-config';
import https from "https";
import fs from "fs";
import {Logger, MorganProvider} from "@imitate/logger";
import {Bootstrapper} from "./boostrapper";

export class Worker {
    private app = express();
    private express_server: any;
    private port = Config.app.PORT || 8000;
    private morganProvider: MorganProvider = new MorganProvider(this.app);
    private bootstrapper: Bootstrapper = new Bootstrapper(this.app);

    constructor(private logger: Logger) {
    }

    async start() {
        // START THE SERVER SEQUENCE
        // =============================================================================
        this.logger.info('Starting Server Process...');
        return new Promise(async (resolve, reject) => {
            // let DB = await this.databaseService.initialize();
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
        this.bootstrapper.registerMiddleware();
        // await this.bootstrapper.registerRoutes(this.app);
        this.morganProvider.init();
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
