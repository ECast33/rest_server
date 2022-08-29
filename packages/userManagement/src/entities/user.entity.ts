import {Entity, PrimaryGeneratedColumn, Column} from "typeorm"

export type IUser = {
    id: number;
    username: string;
    password: string;
    first_name: string;
    last_name: string;
    email: string;
    created: number;
    access_level: number;
    owner_id: number;
    is_enabled: number | boolean;
    organization_id: number;
    job_title: string;
    last_login: number;
    agreed_to_lic: number | boolean;
    logins: number;
    time_in_app: number;
}

@Entity({name: 'user'})
export class User implements IUser {

    constructor(user: IUser) {
        // not allowed in entity convention
        // user.is_enabled = (user.is_enabled === 1 || user.is_enabled === true);
        // user.agreed_to_lic = (user.agreed_to_lic === 1 || user.agreed_to_lic === true);
        Object.assign(this, user);
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column({select: false})
    password: string;

    @Column()
    first_name: string;

    @Column()
    last_name: string;

    @Column()
    email: string;

    @Column()
    created: number;

    @Column()
    access_level: number;

    @Column()
    owner_id: number;

    @Column()
    is_enabled: boolean;

    @Column()
    organization_id: number;

    @Column()
    job_title: string;

    @Column()
    last_login: number;

    @Column()
    agreed_to_lic: boolean;

    @Column()
    logins: number;

    @Column({nullable: true})
    time_in_app: number;

    redactPassword(): void {
        this.password = 'REDACTED';
    }
}
