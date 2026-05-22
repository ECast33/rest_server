# `@imitate/authentication`

Handles all authentication strategies for the IMITATE gateway: **OpenID Connect (OIDC) SSO**, **JWT Bearer tokens**, and a local username/password fallback. Built on Passport.js.

---

## Strategies

| Strategy | Name | Purpose |
|---|---|---|
| `oidc` | `passport-openidconnect` | Handles the SSO redirect and IdP callback flow |
| `jwt` | `passport-jwt` | Validates Bearer tokens on every protected API route |
| `local-login` | `passport-local` | Username/password fallback for root/admin access |

---

## Services

### `PassportService`
Registers all three Passport strategies. Called once at startup by `AppContext`.

### `TokenService`
Issues and verifies the app's own JWTs (separate from the IdP's tokens).

```typescript
tokenService.generateAccessToken(user)   // 1h JWT signed with JWT_SECRET
tokenService.generateRefreshToken(user)  // 7d JWT signed with REFRESH_TOKEN_SECRET
tokenService.verifyAccessToken(token)    // returns JwtPayload or throws
tokenService.buildTokenResponse(user)    // { accessToken, refreshToken, expiresIn }
```

### `AuthenticationUtility`
Middleware guards and password utilities.

```typescript
authUtility.requiresAuth(req, res, next)         // JWT Bearer first, session fallback
authUtility.requiresActiveAccount(req, res, next) // checks is_enabled flag
authUtility.generateHash(password)               // bcrypt hash
authUtility.validPassword(attempt, hash)         // bcrypt compare
authUtility.adminPhase()                         // auto-creates root/admin on first run
```

---

## Routes

All prefixed with `/api/v1/`.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/auth/sso` | Initiates OIDC redirect to IdP |
| GET | `/auth/callback` | OIDC callback — issues JWT, redirects SPA |
| POST | `/auth/refresh` | Exchange refresh token for new access token |
| POST | `/login` | Local username/password login (returns JWT) |
| GET | `/logout` | Logout (requires auth) |
| GET | `/isLoggedIn` | Returns auth status and user profile (requires auth) |

---

## Configuration

Settings live in `packages/server/config/standard/oidc.js` and are accessed via `app-config` as `Config.oidc`.

| Key | Description |
|---|---|
| `ISSUER` | IdP base URL (e.g. `http://localhost:8080/realms/imitate`) |
| `CLIENT_ID` | OAuth2 client ID registered with your IdP |
| `CLIENT_SECRET` | OAuth2 client secret |
| `CALLBACK_URL` | Must match the redirect URI registered with your IdP |
| `SCOPE` | OIDC scopes — `openid profile email` by default |
| `JWT_SECRET` | Secret used to sign access tokens |
| `JWT_EXPIRY` | Access token lifetime (default `1h`) |
| `REFRESH_TOKEN_SECRET` | Secret used to sign refresh tokens |
| `REFRESH_TOKEN_EXPIRY` | Refresh token lifetime (default `7d`) |
| `FRONTEND_CALLBACK_URL` | Angular app route that receives the tokens after SSO |
