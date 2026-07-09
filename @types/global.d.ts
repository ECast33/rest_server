import {IUser, User} from "@auth-app/usermanagement";
import {Request} from 'express';

declare module 'app-config' {
    let app: AppConfig;
    let authentication: AuthenticationConfig;
    let oidc: OidcConfig;
    // let options: OptionsConfig;
    let database: DatabaseConfig;
}

interface AppConfig {
    SERVER_NAME: string;
    API_BASE_ROUTE: string;
    API_VERSION: Number;
    PORT: Number;
    CLUSTERING_ENABLED: Boolean;
    WORKER_PER_CPU: number;
    HTTPS: Boolean;
    UI_SERVE_PATH: string;
}

interface AuthenticationConfig {
    initialize: Function;
    TLS_KEY: string;
    TLS_CERT: string;
    TLS_PASSPHRASE: string;
    SIGNUP_STRATEGY_NAME: string,
    LOGIN_STRATEGY_NAME: string,

    SSH_HOST: string;
    SSH_HOST_APP_USER: string;
    SSH_HOST_APP_PASSWORD: string
    DEFAULT_ROOT_PASSWORD: string;
    DEFAULT_ADMIN_PASSWORD: string;
}

interface OidcConfig {
    ISSUER: string;
    CLIENT_ID: string;
    CLIENT_SECRET: string;
    CALLBACK_URL: string;
    SCOPE: string;
    JWT_SECRET: string;
    JWT_EXPIRY: string;
    REFRESH_TOKEN_SECRET: string;
    REFRESH_TOKEN_EXPIRY: string;
    FRONTEND_CALLBACK_URL: string;
}

interface JwtPayload {
    sub: string;
    id: number;
    username: string;
    access_level: number;
    organization_id: number;
    iat?: number;
    exp?: number;
}

interface DatabaseConfig {
    OPTIONS: DatabaseConfigOptions;
    MONGOOSE: MongooseConfig;
}

interface DatabaseConfigOptions {
    connectionLimit: number;
    host: string;
    database: string;
    user: string;
    password: string;
    createDatabaseTable: Boolean;
}

interface MongooseConfig {
    host: string;
    options: ConnectionOptions;
}

export interface IGetUserAuthInfoRequest extends Request {
    user: User;
    session: any;
    login: any;
    logout: any;

    isAuthenticated(): boolean;
}
