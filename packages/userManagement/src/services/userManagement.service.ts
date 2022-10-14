import {getDataSource} from "@imitate/server";
import {IUser, User} from "../entities/user.entity";

export class UserManagementService {
    constructor() {
    }

    async createNewUser(user: IUser) {
        try {
            const userRepository = getDataSource().getRepository(User);
            return await userRepository.save(new User(user));
        } catch (error) {
            throw error;
        }
    }

    async getUserById(id: number) {
        try {
            const userRepository = getDataSource().getRepository(User);
            return await userRepository.findOneBy({
                id: id
            });
        } catch (error) {
            throw error;
        }
    }

    async getByUsername(username: string) {
        try {
            const userRepository = getDataSource().getRepository(User);
            const user = await userRepository.findOneBy({
                username: username
            });
            if (user) return user;
        } catch (error) {
            throw error;
        }
    }

}
