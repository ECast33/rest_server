module.exports = {
    // OpenID Connect Provider settings — override with environment variables in production
    ISSUER: process.env.OIDC_ISSUER || 'http://localhost:8080/realms/imitate',
    CLIENT_ID: process.env.OIDC_CLIENT_ID || 'imitate-app',
    CLIENT_SECRET: process.env.OIDC_CLIENT_SECRET || 'Xf51OtHMrfpkoBrgj0sdSC0EjjBFzhDo',
    CALLBACK_URL: process.env.OIDC_CALLBACK_URL || 'http://localhost:8000/api/v1/auth/callback',

    // Scopes requested from the IdP (openid is required; profile/email for user info)
    SCOPE: process.env.OIDC_SCOPE || 'openid profile email',

    // JWT settings for app-issued tokens
    JWT_SECRET: process.env.JWT_SECRET || 'change-me-in-production-use-a-long-random-string',
    JWT_EXPIRY: process.env.JWT_EXPIRY || '1h',
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || 'change-refresh-secret-in-production',
    REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || '7d',

    // Where the Angular SPA lives — the callback redirects here with the token
    FRONTEND_CALLBACK_URL: process.env.FRONTEND_CALLBACK_URL || 'http://localhost:4200/auth/callback',

    // Where Keycloak sends the browser back to after RP-initiated logout completes
    POST_LOGOUT_REDIRECT_URL: process.env.OIDC_POST_LOGOUT_REDIRECT_URL || 'http://localhost:4200/login',
};
