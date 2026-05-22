import "reflect-metadata"
import {DataSource} from "typeorm"
import path from "path";


export const AppDataSource = new DataSource({
    type: "mysql",
    connectorPackage: "mysql2",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "Design!123",
    database: (process.env.NODE_ENV != 'testing') ? 'user_auth' : 'user_auth_test',
    synchronize: true,
    logging: false,
    entities: [path.join(__dirname, '../../../**/entities/**.entity{.ts,.js}')],
    migrations: [],
    subscribers: [],
});

export function getDataSource() {
    return AppDataSource;
}
