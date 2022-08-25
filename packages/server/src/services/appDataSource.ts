import "reflect-metadata"
import {DataSource} from "typeorm"
import {User} from "@imitate/usermanagement";

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "Design!123",
    database: "imitate_test",
    synchronize: true,
    logging: false,
    entities: [User],
    migrations: [],
    subscribers: [],
});
