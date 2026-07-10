module.exports = {
    // MySQL connection settings — override with environment variables in production
    OPTIONS: {
        connectionLimit: process.env.DB_CONNECTION_LIMIT || 1,
        host: process.env.DB_HOST || 'imitate-mysql.mysql.database.azure.com',
        port: process.env.DB_PORT || 3306,
        database: process.env.DB_NAME || 'user_auth',
        user: process.env.DB_USER || 'imitate',
        password: process.env.DB_PASSWORD || 'iM!t@t3De$iGn!n7Eractiv3',
        createDatabaseTable: true,
        multipleStatements: true
    },
    MONGOOSE: {
        host: process.env.MONGO_HOST || "mongodb://localhost:27017",
        options: {
            user: process.env.MONGO_USER || 'imitate',
            pass: process.env.MONGO_PASSWORD || 'Design!123Mongo',
            dbName: process.env.MONGO_DB_NAME || 'imitate_orm',
            authSource: process.env.MONGO_AUTH_SOURCE || 'imitate_orm',
            useNewUrlParser: true,
            useUnifiedTopology: true
        },
        rootOptions: {
            user: process.env.MONGO_ROOT_USER || 'root',
            pass: process.env.MONGO_ROOT_PASSWORD || 'Design!123',
            authSource: process.env.MONGO_ROOT_AUTH_SOURCE || 'admin'
        }
    }
};
