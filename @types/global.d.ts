declare module 'app-config' {
    let app: AppConfig;
    let authentication: AuthenticationConfig;
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
    SSH_HOST: string;
    SSH_HOST_APP_USER: string;
    SSH_HOST_APP_PASSWORD: string
    DEFAULT_ROOT_PASSWORD: string;
    DEFAULT_ADMIN_PASSWORD: string;
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
