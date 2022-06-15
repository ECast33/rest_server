export type IUser = {
    id: number;
    username: string;
    password: string;
    first_name: string;
    last_name: string;
    email: string;
    created: number;
    access_level: number | string;
    owner_id: number;
    is_enabled: number | boolean;
    organization_id: number;
    job_title: string;
    last_login: number;
    agreed_to_lic: number | boolean;
    logins: number;
    time_in_app: number;
}

export class User {
    private id: number;
    private username: string;
    private password: string;
    private first_name: string;
    private last_name: string;
    private email: string;
    private created: number;
    private access_level: number;
    private owner_id: number;
    private is_enabled: number | boolean;
    private organization_id: number;
    private job_title: string;
    private last_login: number;
    private agreed_to_lic: number | boolean;
    private logins: number;
    private time_in_app: number;

    constructor(user: IUser) {
        user.is_enabled = (user.is_enabled === 1 || user.is_enabled === true);
        user.agreed_to_lic = (user.agreed_to_lic === 1 || user.agreed_to_lic === true);
        Object.assign(this, user);
    }

    redactPassword(): void {
        this.password = 'REDACTED';
    }

    fullName(): string {
        return this.first_name + ' ' + this.last_name;
    }

    get _time_in_app(): number {
        return this.time_in_app;
    }

    set _time_in_app(value: number) {
        this.time_in_app = value;
    }

    get _logins(): number {
        return this.logins;
    }

    set _logins(value: number) {
        this.logins = value;
    }

    get _agreed_to_lic(): number | boolean {
        return this.agreed_to_lic;
    }

    set _agreed_to_lic(value: number | boolean) {
        this.agreed_to_lic = value;
    }

    get _last_login(): number {
        return this.last_login;
    }

    set _last_login(value: number) {
        this.last_login = value;
    }

    get _job_title(): string {
        return this.job_title;
    }

    set _job_title(value: string) {
        this.job_title = value;
    }

    get _organization_id(): number {
        return this.organization_id;
    }

    set _organization_id(value: number) {
        this.organization_id = value;
    }

    get _is_enabled(): number | boolean {
        return this.is_enabled;
    }

    set _is_enabled(value: number | boolean) {
        this.is_enabled = value;
    }

    get _owner_id(): number {
        return this.owner_id;
    }

    set _owner_id(value: number) {
        this.owner_id = value;
    }

    get _access_level(): number {
        return this.access_level;
    }

    set _access_level(value: number) {
        this.access_level = value;
    }

    get _created(): number {
        return this.created;
    }

    set _created(value: number) {
        this.created = value;
    }

    get _email(): string {
        return this.email;
    }

    set _email(value: string) {
        this.email = value;
    }

    get _last_name(): string {
        return this.last_name;
    }

    set _last_name(value: string) {
        this.last_name = value;
    }

    get _first_name(): string {
        return this.first_name;
    }

    set _first_name(value: string) {
        this.first_name = value;
    }

    get _password(): string {
        return this.password;
    }

    set _password(value: string) {
        this.password = value;
    }

    get _username(): string {
        return this.username;
    }

    set _username(value: string) {
        this.username = value;
    }

    get _id(): number {
        return this.id;
    }

    set _id(value: number) {
        this.id = value;
    }

}
