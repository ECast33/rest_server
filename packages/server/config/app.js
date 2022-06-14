module.exports = {
    SERVER_NAME: 'IMITATE',
    API_BASE_ROUTE: '/api/v1/',
    API_VERSION: '1',
    PORT: 8000,
    CLUSTERING_ENABLED: process.env.CLUSTERING_ENABLED || false,
    WORKER_PER_CPU: process.env.WORKER_PER_CPU || 1,
    HTTPS: false,
    UI_SERVE_PATH: 'www/IMITATE_WebApp/dist'
};
