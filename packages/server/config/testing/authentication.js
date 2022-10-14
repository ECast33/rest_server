module.exports = {
    initialize: function (MySQLStore) {
        return {
            secret: '#!D351Gn_1nT3rAct1v3_iM!t@t3',
            key: 'design.sid',
            resave: false,
            rolling: true, // Expiration starts counting from the last request
            saveUninitialized: false,
            unset: 'destroy',
            store: new MySQLStore({
                host: 'localhost',
                port: 3306,
                user: 'root',
                password: 'Design!123',
                database: 'user_auth_test'
            }),
            cookie: {
                maxAge: 86400000, // 24 hours
                secure: 'auto'
            }
        }
    },
    TLS_KEY: '',
    TLS_CERT: '',
    TLS_PASSPHRASE: '',

    SIGNUP_STRATEGY_NAME: 'local-signup',
    LOGIN_STRATEGY_NAME: 'local-login',

    SSH_HOST: '192.168.0.1',
    SSH_HOST_APP_USER: 'imitate',
    SSH_HOST_APP_PASSWORD: 'Design!123',
    DEFAULT_ROOT_PASSWORD: 'Design!123',
    DEFAULT_ADMIN_PASSWORD: 'Design!123',

}
