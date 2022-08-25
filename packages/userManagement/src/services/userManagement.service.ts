import {IUser, User} from "../interfaces/user";
import {AppDataSource} from "@imitate/server";

export class UserManagementService {
    constructor() {
    }

    async createNewUser(user: IUser) {
        try {
            const userRepository = AppDataSource.getRepository(User)
            let savedUser = await userRepository.save(new User(user));
        } catch (error) {
            throw error;
        }
    }
}
