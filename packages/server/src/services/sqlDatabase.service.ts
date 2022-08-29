import * as mysql from 'mysql';
import * as Config from 'app-config';
import {Logger} from "@imitate/logger";
import {AppDataSource} from "./appDataSource";

export class SqlDatabaseService {
    // private connectionPool: mysql.Pool = mysql.createPool(Config.database.OPTIONS);

    constructor(private logger: Logger) {
    }

    async initDataSource() {
        try {
            return await AppDataSource.initialize();
        } catch (error) {
            this.logger.error("Error during Data Source initialization", error);
        }
    }

    initialize(truncate?: boolean) {
        return new Promise(async (resolve, reject) => {
            try {
                // if (this.connectionPool === undefined) {
                //     this.connectionPool = mysql.createPool(Config.database.OPTIONS);
                // }

                // // let conn = await this.tryToConnectToMongo();
                // if (truncate) {
                //     // let truncateRes = await this.truncateDatabase();
                // }
                // if (this.connectionPool) resolve(true);
            } catch (error) {
                this.logger.error(error);
                reject(new Error("Error initializing database service"));
            }
        });
    }

    // getPool(): mysql.Pool {
    //     // return this.connectionPool;
    // }

    // query<T>(baseSql: string, args: Array<any>): Promise<T> {
    //     return new Promise<T>((resolve, reject) => {
    //         this.getPool().query(baseSql, args, (err, rows) => {
    //             if (err) {
    //                 this.logger.error('Error in db query', err);
    //                 reject(new Error(err.message));
    //             } else
    //                 resolve(rows);
    //         });
    //     });
    // }
}
