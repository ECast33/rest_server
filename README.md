# auth_gateway 

A TypeScript/Node.js **authentication gateway** and backend API server with **Single Sign-On via OpenID Connect (OIDC)** and **JWT-based authentication**. Built as a reusable backend foundation with support for clustering, HTTPS, MySQL persistence, and an Angular 19 SPA frontend.

---

## Architecture

This project is a **Lerna monorepo** with 5 packages:

| Package | Description |
|---|---|
| `packages/server` | Entry point — Express server, clustering, middleware & route wiring |
| `packages/authentication` | SSO (OIDC), JWT, and local auth logic via Passport.js |
| `packages/userManagement` | User CRUD, TypeORM entity, MySQL queries |
| `packages/logger` | Shared logging (Morgan HTTP logger + custom Logger) |
| `packages/ui` | Angular 19 SPA — SSO login page, auth callback, dashboard |

---

## How It Works

### Authentication Flow (SSO / OIDC + JWT)

```
Browser                     Backend (port 8000)         Identity Provider (Keycloak/etc.)
  │                               │                               │
  │── GET /api/v1/auth/sso ──────>│                               │
  │                               │── redirect to IdP login ─────>│
  │                               │                               │ (user logs in)
  │                               │<── redirect with auth code ───│
  │                               │── exchange code for tokens ──>│
  │                               │<── id_token, access_token ────│
  │                               │  (find or create local user)  │
  │<── redirect to Angular ───────│                               │
  │   /auth/callback?accessToken=…│                               │
  │                               │                               │
  │── GET /api/v1/isLoggedIn ─────│  Authorization: Bearer <jwt>  │
  │── POST /api/v1/add-user ──────│  Authorization: Bearer <jwt>  │
```

1. The Angular app redirects the browser to `GET /api/v1/auth/sso`
2. The backend redirects to your IdP's login page (Keycloak, Azure AD, Auth0, Okta, etc.)
3. After the user authenticates, the IdP redirects back to `GET /api/v1/auth/callback`
4. The backend exchanges the code for user info, then finds or auto-provisions a local user record
5. The backend issues its own **JWT access token** (1h) and **refresh token** (7d) and redirects the Angular app to `/auth/callback?accessToken=…`
6. The Angular app stores the tokens and attaches `Authorization: Bearer <token>` to every API call
7. When the access token expires, the Angular app silently exchanges the refresh token for a new one via `POST /api/v1/auth/refresh`

### Local Login (retained for admin/root emergency access)

`POST /api/v1/login` with `username`/`password` still works and also returns JWT tokens. Use this for the `root` and `admin` system accounts if your IdP is unavailable.

### Startup Sequence

1. `server.ts` boots and optionally forks worker processes via Node.js clustering
2. Each worker connects to **MySQL** via TypeORM
3. An **admin phase** auto-creates `root` and `admin` users on first run
4. Express middleware registers: CORS → body-parser → express-session → Passport (JWT + OIDC + local strategies)
5. Routes register for authentication and user management

### First-Time SSO User Provisioning

When a user logs in via SSO for the first time, a local `user` record is automatically created using the claims from the OIDC `id_token` (name, email, sub). They are assigned `ACCESS_LEVEL = OBSERVER` by default. An admin can then elevate their access level.

---

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | 22+ | |
| Yarn | 1.22+ | `npm install -g yarn` |
| TypeScript | 5.x | `npm install -g typescript` |
| MySQL | 5.7+ / 8.x | Local install or Docker |
| Angular CLI | 19.x | `npm install -g @angular/cli` |
| Docker | Any | For running Keycloak locally |

---

## Installation

```bash
# Install all workspace dependencies (backend + UI)
yarn install
```

---

## Identity Provider Setup

You need an **OpenID Connect (OIDC) Identity Provider** to issue tokens. The fastest way to get started locally is **Keycloak in Docker**.

### Option 1: Keycloak (recommended for local dev)

**Start Keycloak:**
```bash
docker run -p 8080:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  -v keycloak_data:/opt/keycloak/data \
  quay.io/keycloak/keycloak:latest start-dev
```

Or with Docker Compose (recommended — keeps Keycloak alongside MySQL):

```yaml
# docker-compose.yml
services:
  keycloak:
    image: quay.io/keycloak/keycloak:latest
    command: start-dev
    ports:
      - "8080:8080"
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
    volumes:
      - keycloak_data:/opt/keycloak/data

volumes:
  keycloak_data:
```

```bash
docker compose up -d
```

**Configure a client in Keycloak:**

1. Open `http://localhost:8080` → log in as `admin`/`admin`
2. Create a new **Realm** (e.g. `imitate`) — top-left dropdown → **Create Realm**
3. Go to **Clients** → **Create client**
   - Client type: `OpenID Connect`
   - Client ID: `imitate-app`
   - Click **Next**
4. Enable **Client authentication** (confidential client) → **Next** → **Save**
5. Go to the **Credentials** tab — copy the **Client Secret**
6. Go to the **Settings** tab → add to **Valid redirect URIs**:
   ```
   http://localhost:8000/api/v1/auth/callback
   ```
7. Create a test user: **Users** → **Add user** → fill in name/email → **Credentials** → set a password

**Your values are:**

| Variable | Value |
|---|---|
| `OIDC_ISSUER` | `http://localhost:8080/realms/imitate` |
| `OIDC_CLIENT_ID` | `imitate-app` |
| `OIDC_CLIENT_SECRET` | *(from Credentials tab)* |
| `OIDC_CALLBACK_URL` | `http://localhost:8000/api/v1/auth/callback` |

### Option 2: Microsoft Entra ID (Azure AD)

1. Azure Portal → **App registrations** → **New registration**
2. Set redirect URI: `http://localhost:8000/api/v1/auth/callback`
3. Go to **Certificates & secrets** → **New client secret**

| Variable | Value |
|---|---|
| `OIDC_ISSUER` | `https://login.microsoftonline.com/{tenant-id}/v2.0` |
| `OIDC_CLIENT_ID` | Application (client) ID from Overview |
| `OIDC_CLIENT_SECRET` | Value from Certificates & secrets |

### Option 3: Auth0

1. Auth0 Dashboard → **Applications** → **Create Application** → Regular Web App
2. Add `http://localhost:8000/api/v1/auth/callback` to **Allowed Callback URLs**

| Variable | Value |
|---|---|
| `OIDC_ISSUER` | `https://your-tenant.auth0.com` |
| `OIDC_CLIENT_ID` | Client ID from Settings tab |
| `OIDC_CLIENT_SECRET` | Client Secret from Settings tab |

---

## Configuration

### OIDC + JWT (`packages/server/config/standard/oidc.js`)

Update these values (or override with environment variables in production):

```js
module.exports = {
    ISSUER:                 'http://localhost:8080/realms/imitate',
    CLIENT_ID:              'imitate-app',
    CLIENT_SECRET:          'your-client-secret-from-keycloak',
    CALLBACK_URL:           'http://localhost:8000/api/v1/auth/callback',
    SCOPE:                  'openid profile email',

    JWT_SECRET:             'change-me-in-production',   // long random string
    JWT_EXPIRY:             '1h',
    REFRESH_TOKEN_SECRET:   'change-refresh-in-production',
    REFRESH_TOKEN_EXPIRY:   '7d',

    FRONTEND_CALLBACK_URL:  'http://localhost:4200/auth/callback',
};
```

### Session + TLS (`packages/server/config/standard/authentication.js`)

Sessions are still used to carry OIDC state across the redirect round-trip.

### Database (`packages/server/config/standard/database.js`)

Update MySQL credentials to match your local setup.

### Full Configuration Reference

| File | Purpose |
|---|---|
| `packages/server/config/standard/app.js` | Port, API base route, clustering, UI serve path |
| `packages/server/config/standard/oidc.js` | OIDC provider settings, JWT secrets and expiry |
| `packages/server/config/standard/authentication.js` | Session secret, cookie settings, TLS, default passwords |
| `packages/server/config/standard/database.js` | MySQL connection options |

---

## Database Setup

### 1. Create the database

```bash
db-migrate --config ./packages/server/config/system/database-create.json --end local db:create user_auth
```

To drop:
```bash
db-migrate --config ./packages/server/config/system/database-create.json --end local db:drop user_auth
```

### 2. Run migrations

```bash
db-migrate --config ./packages/server/config/system/database-migration.json --end local up --force-exit
```

> **Note:** TypeORM is configured with `synchronize: true` in development — the `user` table schema (including the new `sub` column for SSO) is auto-synced on startup.

---

## Running the Application

### Development (recommended)

Run the backend and Angular UI in separate terminals:

**Terminal 1 — Backend (live reload):**
```bash
yarn tsnode
# Server starts on http://localhost:8000
```

**Terminal 2 — Angular UI:**
```bash
cd packages/ui
npm start
# UI starts on http://localhost:4200
```

Then open `http://localhost:4200` — clicking **Continue with SSO** will redirect through Keycloak and back.

### Production

```bash
# Build all packages
yarn build

# Run compiled server with PM2
NODE_CONFIG_DIR=./packages/server/config/standard \
  pm2 --no-daemon start build/server.js --name='IMITATE'
```

The server will also serve the built Angular app from `www/WebApp/dist` (configurable via `UI_SERVE_PATH` in `app.js`). Copy `packages/ui/dist/ui` there before starting.

---

## Running Tests

```bash
yarn tests
```

Tests use Mocha + Chai against the `user_auth_test` database (`NODE_ENV=testing`).

---

## API Reference

All routes are prefixed with `/api/v1/`.

### SSO / JWT (primary auth flow)

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| GET | `/api/v1/auth/sso` | No | Initiates OIDC redirect to IdP login page |
| GET | `/api/v1/auth/callback` | No | OIDC callback — issues JWT, redirects Angular app |
| POST | `/api/v1/auth/refresh` | No | Exchange refresh token for a new access token |

**Refresh token request body:**
```json
{ "refreshToken": "<your-refresh-token>" }
```

### Legacy local login (admin/root access)

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| POST | `/api/v1/login` | No | Log in with username + password, returns JWT tokens |
| GET | `/api/v1/logout` | Yes | Log out |
| GET | `/api/v1/isLoggedIn` | Yes | Returns auth status and user profile |

**Login request body:**
```json
{ "username": "admin", "password": "Design!123" }
```

**Login / SSO callback response:**
```json
{
  "accessToken": "<jwt>",
  "refreshToken": "<jwt>",
  "expiresIn": "1h",
  "user": { "id": 1, "username": "admin", "first_name": "admin", ... }
}
```

### User management

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| POST | `/api/v1/add-user` | No | Create a new local user |

### Using the JWT in API calls

After login or SSO callback, attach the token to every request:

```
Authorization: Bearer <accessToken>
```

The Angular app's `JwtInterceptor` does this automatically. For external clients (curl, Postman, etc.):

```bash
curl -H "Authorization: Bearer <token>" http://localhost:8000/api/v1/isLoggedIn
```

---

## Angular UI (`packages/ui`)

Built with **Angular 19** (standalone components, signals, functional interceptors).

| Route | Description |
|---|---|
| `/login` | SSO login page with "Continue with SSO" button |
| `/auth/callback` | Receives JWT tokens from backend redirect, stores them, navigates to home |
| `/home` | Protected dashboard — displays user profile and stats |

**Key files:**

| File | Purpose |
|---|---|
| `src/app/core/auth/auth.service.ts` | Manages auth state with Angular signals, handles token storage and refresh |
| `src/app/core/auth/auth.guard.ts` | Redirects unauthenticated users to `/login` |
| `src/app/core/auth/jwt.interceptor.ts` | Attaches Bearer token to all HTTP requests, auto-refreshes on 401 |
| `src/environments/environment.ts` | Dev API base URL (`http://localhost:8000/api/v1/`) |
| `src/environments/environment.prod.ts` | Production API base URL (`/api/v1/`) |

---

## Access Levels

| Level | Name | Value |
|---|---|---|
| 0 | ROOT | Full system access |
| 2 | ADMIN | Administrative access |
| 4 | SUPERVISOR | Supervisor access |
| 6 | OBSERVER | Read-only (default for new SSO users) |
| 8 | INSTRUCTOR | Instructor access |

New users provisioned automatically from SSO are assigned **OBSERVER** by default. An ADMIN or ROOT user must elevate their access level.

---

## Security Notes

- Passwords are hashed with **bcrypt** (8 salt rounds) and never returned in API responses
- JWT secrets (`JWT_SECRET`, `REFRESH_TOKEN_SECRET`) **must be changed** from the defaults before deploying to production — use long random strings
- The session secret in `authentication.js` should also be rotated in production
- `OIDC_CALLBACK_URL` must be registered with your IdP — any mismatch is rejected by the IdP as a security control
- HTTPS/TLS is configurable via `HTTPS: true` and the `TLS_KEY`/`TLS_CERT` fields in `authentication.js`

