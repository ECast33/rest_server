import {AppDataSource} from "@imitate/server";
import {IUser, User} from "../entities/user.entity";

export class UserManagementService {
    constructor() {
    }

    async createNewUser(user: IUser) {
        try {
            const userRepository = AppDataSource.getRepository(User)
            return await userRepository.save(new User(user));
        } catch (error) {
            throw error;
        }
    }
}
