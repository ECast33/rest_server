import {getDataSource} from "@auth-app/server";
import {Logger} from "@auth-app/logger";
import {Repository} from "typeorm";
import {IUser, User} from "../entities/user.entity";

export class UserDao {
    constructor(private logger: Logger) {
    }

    // Single shared accessor for the TypeORM repository — every CRUD method below goes through this.
    private getRepository(): Repository<User> {
        return getDataSource().getRepository(User);
    }

    async createNewUser(user: IUser): Promise<User> {
        try {
            return await this.getRepository().save(new User(user));
        } catch (error) {
            this.logger.error('Error creating new user', error);
            throw error;
        }
    }

    async getUserById(id: number): Promise<User | null> {
        try {
            return await this.getRepository().findOneBy({id});
        } catch (error) {
            this.logger.error('Error getting user by id', error);
            throw error;
        }
    }

    async getByUsername(username: string): Promise<User | null> {
        try {
            return await this.getRepository().findOneBy({username});
        } catch (error) {
            this.logger.error('Error getting user by username', error);
            throw error;
        }
    }

    async getUserBySub(sub: string): Promise<User | null> {
        try {
            return await this.getRepository().findOneBy({sub});
        } catch (error) {
            this.logger.error('Error getting user by sub', error);
            throw error;
        }
    }

    async updateUserBySub(sub: string, updates: Partial<IUser>): Promise<User | null> {
        try {
            await this.getRepository().update({sub}, updates as any);
            return await this.getRepository().findOneBy({sub});
        } catch (error) {
            this.logger.error('Error updating user by sub', error);
            throw error;
        }
    }
}
