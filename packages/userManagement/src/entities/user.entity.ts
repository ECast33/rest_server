

import {Entity, PrimaryGeneratedColumn, Column} from "typeorm"
import {
    IsBoolean,
    IsEmail,
    IsIn,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    MinLength
} from "class-validator"
import {ACCESS_LEVELS} from "../enums/accessLevel"

export type IUser = {
    id: number;
    sub: string;
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
    // server-generated; not supplied by the client
    @IsOptional()
    @IsInt()
    id: number;

    @Column({nullable: true, unique: true})
    // server-managed (SSO subject identifier)
    @IsOptional()
    @IsString()
    sub: string;

    @Column()
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    username: string;

    @Column()
    @IsString()
    @MinLength(8)
    password: string;

    @Column()
    @IsString()
    @IsNotEmpty()
    first_name: string;

    @Column()
    @IsString()
    @IsNotEmpty()
    last_name: string;

    @Column({nullable: true})
    @IsOptional()
    @IsEmail()
    email: string;

    @Column()
    // server-managed timestamp
    @IsOptional()
    @IsInt()
    created: number;

    @Column()
    @IsIn(Object.values(ACCESS_LEVELS).filter(value => typeof value === 'number'))
    access_level: number;

    @Column()
    @IsInt()
    owner_id: number;

    @Column()
    @IsBoolean()
    is_enabled: boolean;

    @Column()
    @IsInt()
    organization_id: number;

    @Column()
    @IsString()
    @IsNotEmpty()
    job_title: string;

    @Column({nullable: true})
    // server-managed timestamp
    @IsOptional()
    @IsInt()
    last_login: number;

    @Column()
    @IsBoolean()
    agreed_to_lic: boolean;

    @Column()
    // server-managed login counter
    @IsOptional()
    @IsInt()
    logins: number;

    @Column({nullable: true})
    // server-managed usage counter
    @IsOptional()
    @IsInt()
    time_in_app: number;

    redactPassword(): void {
        this.password = 'REDACTED';
    }
}
