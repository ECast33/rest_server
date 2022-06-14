module.exports = {
    OPTIONS: {
        connectionLimit: 1,
        host: 'localhost',
        database: 'imitate_dev',
        user: 'imitate',
        password: 'iM!t@t3De$iGn!n7Eractiv3',
        createDatabaseTable: true,
        multipleStatements: true
    },
    MONGOOSE: {
        host: "mongodb://localhost:27017",
        options: {
            user: 'imitate',
            pass: 'Design!123Mongo',
            dbName: 'imitate_dev',
            authSource: 'imitate_dev',
            useNewUrlParser: true,
            useUnifiedTopology: true
        },
        rootOptions: {
            user: 'root',
            pass: 'Design!123',
            authSource: 'admin'
        }
    }
};
