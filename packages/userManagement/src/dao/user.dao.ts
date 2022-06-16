import {SqlDatabaseService} from "@imitate/server";
import {IUser, User} from "../interfaces/user";
import {Logger} from "@imitate/logger";
import _ from "lodash";

export class UserDao {
    constructor(private logger: Logger, private sqlDatabaseService: SqlDatabaseService) {
    }

    async getUserById(id: number): Promise<User> {
        let baseSql = 'SELECT * FROM users WHERE id = ?';
        let args = [id];
        try {
            let rows = await this.sqlDatabaseService.query<Array<IUser>>(baseSql, args);
            if (rows.length) {
                const user = <IUser>_.first(rows);
                return new User(user);
            } else {
                throw ('no user found');
            }

        } catch (error) {
            this.logger.error('Error getting user by id', error);
            throw (error);
        }
    }

    async getByUsername(username: string): Promise<User> {
        let baseSql = 'SELECT * FROM users WHERE username = ?';
        let args = [username];
        try {
            let rows = await this.sqlDatabaseService.query<any>(baseSql, args);
            let user = <IUser>_.first(rows);
            return new User(user);
        } catch (error) {
            this.logger.error('Error getting user by username', error);
            throw(error);
        }
    }
}
