import * as Config from 'app-config';
import {Worker} from './worker';
import os from "os";
import cluster from "cluster";
import {Logger} from "@imitate/logger";

export class Server {
    public logger: Logger = new Logger();

    constructor() {
        process.on('SIGINT', () => {
            this.shutdown();
        });
    }

    async start() {
        try {
            // const numCPUs = os.cpus().length * Config.app.WORKER_PER_CPU;
            // if (cluster.isMaster) {
            //     let db = await this.databaseService.initialize(truncate);
            //     let run = await this.startupService.run();
            //     // check for prod worker fork
            //
            //     if (Config.app.CLUSTERING_ENABLED && process.env.NODE_ENV != 'testing') {
            //         for (let i = 0; i < numCPUs; i++) {
            //             cluster.fork();
            //         }
            //
            //         cluster.on('exit', (worker, code, signal) => {
            //             console.log(`worker ${worker.process.pid} died. code: ${code} signal: ${signal}`);
            //             cluster.fork();
            //         });
            //         return this;
            //     } else {
            //         return new Worker(new Bootstrapper(), this.databaseService);
            //     }
            // } else {
            //
            // }
            return new Worker(this.logger);
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

const server = new Server();
server.start().then(async (instance) => {
    instance.start().then(() => {
        server.logger.info('Worker', process.pid, 'Online');
        server.logger.info('Serving UI out of:', Config.app.UI_SERVE_PATH);
        server.logger.info(Config.app.SERVER_NAME + ' Server Online. Port: ' + Config.app.PORT || 8000);

    });
});
