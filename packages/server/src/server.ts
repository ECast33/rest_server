import * as Config from 'app-config';
import {Worker} from './worker';
import os from "os";
import cluster from "cluster";
import {Logger} from "@imitate/logger";
import {SqlDatabaseService} from "./services/sqlDatabase.service";


export class Server {

    constructor(public logger: Logger, private qlDatabaseService: SqlDatabaseService) {
        process.on('SIGINT', () => {
            this.shutdown();
        });
    }

    async start() {
        try {
            const numCPUs = os.cpus().length * Config.app.WORKER_PER_CPU;
            if (cluster.isPrimary) {
                // let db = await this.qlDatabaseService.initialize(truncate);
                // let run = await this.startupService.run();

                // check for prod worker fork
                if (Config.app.CLUSTERING_ENABLED && process.env.NODE_ENV != 'testing') {
                    for (let i = 0; i < numCPUs; i++) {
                        cluster.fork();
                    }

                    cluster.on('exit', (worker, code, signal) => {
                        this.logger.warn(`worker ${worker.process.pid} died. code: ${code} signal: ${signal}`);
                        cluster.fork();
                    });
                    return this;
                } else {
                    return new Worker(this.logger, this.qlDatabaseService);
                }
            } else {
                return new Worker(this.logger, this.qlDatabaseService);
            }

        } catch (error) {
            this.logger.fatal('Server failed to startup', error);
            throw new Error('error');
        }
    }

    shutdown() {
        setTimeout(() => {
            this.logger.warn('shutting down');
            process.exit(0);
        }, 10);

        // kill the process with pid and signal = 'SIGINT'
        process.kill(process.pid, 'SIGINT');
    }
}

// self starting server
const server = new Server(new Logger(), new SqlDatabaseService(new Logger()));
server.start().then(async (instance) => {
    instance.start().then(() => {
        instance.logger.info('Worker', process.pid, 'Online');
        instance.logger.info('Serving UI out of:', Config.app.UI_SERVE_PATH);
        instance.logger.info(Config.app.SERVER_NAME + ' Server Online. Port: ' + Config.app.PORT || 8000);

    });
});
