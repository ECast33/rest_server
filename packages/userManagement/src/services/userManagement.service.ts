import {IUser} from "../entities/user.entity";
import {UserDao} from "../repositories/user.dao";

export class UserManagementService {
    constructor(private userDao: UserDao) {
    }

    async createNewUser(user: IUser) {
        return this.userDao.createNewUser(user);
    }

    async getUserById(id: number) {
        return this.userDao.getUserById(id);
    }

    async getByUsername(username: string) {
        return this.userDao.getByUsername(username);
    }

    async getUserBySub(sub: string) {
        return this.userDao.getUserBySub(sub);
    }

    async updateUserBySub(sub: string, updates: Partial<IUser>) {
        return this.userDao.updateUserBySub(sub, updates);
    }

}
