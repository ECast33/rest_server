module.exports = {
    initialize: function (MySQLStore) {
        return {
            secret: process.env.SESSION_SECRET || '#!D351Gn_1nT3rAct1v3_iM!t@t3',
            key: 'imitate.sid',
            resave: false,
            rolling: true, // Expiration starts counting from the last request
            saveUninitialized: false,
            unset: 'destroy',
            store: new MySQLStore({
                host: process.env.DB_HOST || 'localhost',
                port: process.env.DB_PORT || 3306,
                user: process.env.DB_ROOT_USER || 'root',
                password: process.env.DB_ROOT_PASSWORD || 'Design!123',
                database: process.env.DB_NAME || 'user_auth'
            }),
            cookie: {
                maxAge: 86400000, // 24 hours
                secure: 'auto'
            }
        }
    },
    TLS_KEY: process.env.TLS_KEY || '',
    TLS_CERT: process.env.TLS_CERT || '',
    TLS_PASSPHRASE: process.env.TLS_PASSPHRASE || '',

    SIGNUP_STRATEGY_NAME: 'local-signup',
    LOGIN_STRATEGY_NAME: 'local-login',

    SSH_HOST: process.env.SSH_HOST || '192.168.0.1',
    SSH_HOST_APP_USER: process.env.SSH_HOST_APP_USER || 'imitate',
    SSH_HOST_APP_PASSWORD: process.env.SSH_HOST_APP_PASSWORD || 'Design!123',
    DEFAULT_ROOT_PASSWORD: process.env.DEFAULT_ROOT_PASSWORD || 'Design!123',
    DEFAULT_ADMIN_PASSWORD: process.env.DEFAULT_ADMIN_PASSWORD || 'Design!123',

}
