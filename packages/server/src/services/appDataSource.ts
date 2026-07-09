import "reflect-metadata"
import {DataSource} from "typeorm"
import path from "path";


export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    username: process.env.DB_ROOT_USER || "root",
    password: process.env.DB_ROOT_PASSWORD || "Design!123",
    database: (process.env.NODE_ENV != 'testing') ? (process.env.DB_NAME || 'user_auth') : 'user_auth_test',
    synchronize: true,
    logging: false,
    entities: [path.join(__dirname, '../../../**/entities/**.entity{.ts,.js}')],
    migrations: [],
    subscribers: []
});

export function getDataSource() {
    return AppDataSource;
}
