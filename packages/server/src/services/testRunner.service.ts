import * as Config from 'app-config';
import {SqlDatabaseService} from "./sqlDatabase.service";
import {Logger} from "@imitate/logger";
import {Server} from "../server";
import {getDataSource} from "./appDataSource";

export namespace TestRunnerService {
    export const SERVER_ENDPOINT = 'http://localhost:' + Config.app.PORT + Config.app.API_BASE_ROUTE;
    export const dataBaseService = new SqlDatabaseService(new Logger());
    export let initialized = false;


    export function init(truncate?) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!initialized) {
                    // const db = getDataSource().synchronize();
                    new Server(new Logger(), new SqlDatabaseService(new Logger())).start().then((server) => {
                        if (server) {
                            setTimeout(() => {
                                resolve(server);
                            }, 1000); // timeout  to wait for server on  tests find why it doesn't wait on its own.
                        }
                    });
                }
            } catch (e) {
                reject(e);
            }
        });
    }
}
