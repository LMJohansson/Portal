# Enterprise Micro-Frontend Portal

A production-grade reference implementation of a **micro-frontend portal** built with:

- **Shell**: React 19 + Vite + Module Federation 2 (dynamic remotes, no static wiring)
- **API**: Quarkus 3 (Java 21) — plugin registry, OIDC resource server
- **Auth**: Keycloak 26 — OIDC Authorization Code + PKCE
- **Infra**: Docker Compose (local dev) · Kubernetes / Skaffold / Helm (k8s-dev)

---

## Architecture

```
Browser
  │
  ├─► :3000  portal-shell    (React host app, nginx)
  │     │   MFEs loaded at runtime via Module Federation
  │     ├─► :3001  mfe-home
  │     ├─► :3002  mfe-dashboard
  │     └─► :3003  mfe-hello
  │
  ├─► :8080  portal-api      (Quarkus — plugin registry)
  │     validates Bearer tokens against Keycloak JWKS
  │
  └─► :8180  Keycloak        (OIDC IdP, realm: portal)
```

### Key design decisions

| Concern | Decision |
|---------|----------|
| Auth | OIDC Authorization Code + PKCE via Keycloak — no passwords in the app |
| Plugin discovery | `GET /api/plugins/manifest` — public endpoint, no token sent; avoids 401 when Keycloak rotates signing keys |
| Module Federation | **Dynamic** — shell has no static remotes; uses `registerRemotes()` + `loadRemote()` at runtime |
| Shared React | `singleton: true` on all shared entries; MF2 handles shared-scope init automatically |
| MFE CSS | `vite-plugin-css-injected-by-js` injects styles at load time (MF only transfers JS) |
| MFE independence | Each MFE has its own Dockerfile and `package.json`; builds are fully isolated — no workspace stubs, no cross-MFE knowledge |
| Routing | Each plugin owns a sub-tree under its registered `route` (e.g. `/home/*`) |

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | React 19, TypeScript |
| Bundler | Vite 5 |
| Module Federation | `@module-federation/vite` 1.x (build) + `@module-federation/runtime` 2.x (browser) |
| Styling | Tailwind CSS 4 (`@tailwindcss/vite`), `vite-plugin-css-injected-by-js` (per MFE) |
| State | Zustand 4 (sessionStorage persistence) |
| Data fetching | TanStack Query 5 |
| Auth (frontend) | `oidc-client-ts` 3, `react-oidc-context` 3 |
| Auth (backend) | Keycloak 26, `quarkus-oidc` (JWKS validation) |
| API | Quarkus 3.9, Java 21, MicroProfile REST + JWT |
| ORM | Hibernate ORM Panache |
| Database | H2 (dev) · PostgreSQL 17 (prod) |
| Build | Maven 3.9 (`./mvnw`), Yarn Berry 4.12, `frontend-maven-plugin` |
| Container orchestration | Docker Compose · Kubernetes + Helm + Skaffold |

---

## Project structure

```
Portal/
├── helm/portal/                 # Helm chart for Kubernetes
│   ├── files/
│   │   └── portal-realm.json    # Keycloak realm definition (single source of truth)
│   ├── templates/               # K8s manifests (API, shell, MFEs, Postgres, Keycloak)
│   └── values.yaml
├── mfe-home/                    # Remote MFE — Home page (:3001)
├── mfe-dashboard/               # Remote MFE — Analytics dashboard (:3002)
├── mfe-hello/                   # Remote MFE — Hello World template (:3003)
├── nginx/
│   ├── shell.conf               # SPA + /api/ proxy to portal-api
│   └── mfe.conf                 # Static assets with CORS headers
├── portal-api/                  # Quarkus REST API (:8080)
│   └── src/main/java/com/portal/
│       ├── config/              # ErrorResponse, exception mapper
│       ├── health/              # MicroProfile Health check
│       └── plugin/              # Plugin entity, PluginResource, PluginService
├── portal-shell/                # React host app (:3000)
│   └── src/
│       ├── auth/                # userManager.ts — oidc-client-ts singleton
│       ├── core/                # DynamicRemote, PluginLoader, api client
│       ├── pages/               # CallbackPage, AdminPluginsPage, NotFoundPage
│       ├── store/               # Zustand store (plugins + UI state)
│       └── types/               # PluginManifest, AuthUser, federation.d.ts
├── docker-compose.yml           # Full stack for local dev
├── skaffold.yaml                # Skaffold config (Minikube)
├── Makefile
├── package.json                 # Yarn workspace root
└── pom.xml                      # Maven aggregator
```

---

## Getting started

### Prerequisites

- Java 21+
- Docker (for Keycloak and Postgres)
- Node 20+ — or rely on the project-local binary that `./mvnw` downloads on first build

### 1 — Install dependencies

```sh
make install
# or: node .yarn/releases/yarn-4.12.0.cjs install
```

### 2 — Start infrastructure (Keycloak + Postgres)

```sh
make dev-keycloak
```

Starts Keycloak on **:8180** and Postgres on **:5432** via Docker Compose. Keycloak auto-imports the portal realm from `helm/portal/files/portal-realm.json`.

Keycloak admin console: **http://localhost:8180** (admin / admin)

### 3 — Start services

Run each in a separate terminal:

```sh
make dev-api             # Quarkus on :8080 (H2 in-memory, live reload)
make dev-mfe-home        # :3001
make dev-mfe-dashboard   # :3002
make dev-mfe-hello       # :3003
make dev-shell           # :3000
```

Open **http://localhost:3000** — you are redirected to Keycloak to sign in.

### Dev credentials

| Username | Password   | Roles        |
|----------|------------|--------------|
| `admin`  | `admin123` | ADMIN, USER  |
| `user`   | `user123`  | USER         |

---

## Authentication

Auth is fully delegated to **Keycloak**. The portal uses **Authorization Code + PKCE** — no client secrets, no password forms in the app.

```
Browser                  Keycloak                  portal-api
   │                        │                          │
   │── /callback not authed ──►                        │
   │◄── redirect to /auth/authorize ──────────────────  │
   │                        │                          │
   │── user logs in ───────►│                          │
   │◄── redirect + code ────│                          │
   │                        │                          │
   │── exchange code ───────►                          │
   │◄── access_token ───────│                          │
   │                        │                          │
   │── GET /api/plugins/manifest (no token) ────────────►│
   │◄──────────────────────── plugin list ──────────────│
```

### Keycloak realm

Defined in `helm/portal/files/portal-realm.json` — imported automatically on startup in both Docker Compose and Kubernetes.

- **Client**: `portal-shell` — public, PKCE enforced, redirect URI `http://localhost:3000/*`
- **Roles**: `ADMIN`, `USER`
- **Protocol mappers**:
  - `realm-roles-to-groups` — realm roles → `groups` claim in ID, access, and userinfo tokens
  - `audience-portal-shell` — adds `portal-shell` to the access token `aud` claim (required for Quarkus OIDC audience validation)

### Adding users

Use the Keycloak admin console (realm `portal` → Users). For permanent seeded users, add entries to `helm/portal/files/portal-realm.json` under `"users"`.

### API authorization

The Quarkus API is a **Bearer Token resource server** (`quarkus-oidc`, `application-type=service`):

- Validates JWT signatures via Keycloak's JWKS endpoint (auto-discovered from realm)
- Validates the `aud` claim — access tokens must contain `portal-shell` (provided by the audience mapper)
- Maps the `groups` claim to roles for `@RolesAllowed`
- `GET /api/plugins/manifest` — fully public (`@PermitAll`), no token required or sent
- All other plugin endpoints require the `ADMIN` role

### Issuer URL in Docker / Kubernetes

In `start-dev` mode, Keycloak derives the token `iss` claim from the request `Host` header. The browser reaches Keycloak at `http://localhost:8180`, so tokens carry `iss=http://localhost:8180/realms/portal`. The API, however, connects to Keycloak via its internal service name (`http://keycloak:8080` in Docker Compose, `http://portal-keycloak:8080` in Kubernetes). The OIDC discovery document served at that internal URL would report a different issuer, causing JWT validation to fail.

The fix is `QUARKUS_OIDC_TOKEN_ISSUER=http://localhost:8180/realms/portal`, which tells Quarkus what issuer to expect in tokens while still fetching JWKS from the internal URL. This env var is pre-configured in both `docker-compose.yml` and the Helm chart (`oidc.tokenIssuer`).

---

## API reference

### Plugins — `/api/plugins`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/plugins/manifest` | None (public) | All enabled plugins |
| `GET` | `/api/plugins` | Bearer ADMIN | List all plugins |
| `GET` | `/api/plugins/{id}` | Bearer ADMIN | Get a single plugin |
| `POST` | `/api/plugins` | Bearer ADMIN | Register a new plugin |
| `PUT` | `/api/plugins/{id}` | Bearer ADMIN | Replace a plugin |
| `PATCH` | `/api/plugins/{id}/toggle` | Bearer ADMIN | Enable / disable a plugin |
| `DELETE` | `/api/plugins/{id}` | Bearer ADMIN | Remove a plugin |

**Plugin object:**
```json
{
  "pluginId": "mfe-hello",
  "name": "Hello",
  "remoteUrl": "http://localhost:3003/remoteEntry.js",
  "scope": "mfe_hello",
  "module": "./Plugin",
  "route": "/hello",
  "icon": "hand",
  "sortOrder": 3,
  "roles": "USER,ADMIN"
}
```

**Swagger UI**: http://localhost:8080/swagger-ui
**OpenAPI spec**: http://localhost:8080/q/openapi?format=json
**Health**: http://localhost:8080/q/health

---

## Makefile targets

```sh
make install           # yarn install (all workspaces)
make build             # full Maven build (MFEs → shell → API), skips tests
make test              # Quarkus unit + integration tests
make clean             # remove all build artefacts

# ── Local dev ──────────────────────────────────────────
make dev               # print startup instructions
make dev-keycloak      # docker compose up keycloak postgres -d
make dev-db            # docker compose up postgres -d
make dev-api           # ./mvnw quarkus:dev
make dev-shell         # vite dev on :3000
make dev-mfe-home      # vite dev on :3001
make dev-mfe-dashboard # vite dev on :3002
make dev-mfe-hello     # vite dev on :3003

# ── Kubernetes ─────────────────────────────────────────
make k8s-start         # minikube start (run once)
make k8s-pull          # pull base images into Minikube (run once)
make k8s-dev           # skaffold dev — build, deploy, port-forward, watch
make k8s-build         # build images only
make k8s-deploy        # one-shot build + deploy
make k8s-delete        # helm uninstall
make k8s-status        # kubectl get pods,svc
```

---

## Kubernetes / Skaffold

### First-time setup

```sh
make k8s-start   # start Minikube with raised file-descriptor limits
make k8s-pull    # pull base images (Node, nginx, JDK, Postgres, Keycloak, busybox)
```

### Dev loop

```sh
make k8s-dev
```

Skaffold builds all five application images into Minikube's Docker daemon and deploys via the Helm chart. Port-forwards match the local dev ports:

| Service       | Local port | Notes |
|---------------|-----------|-------|
| portal-shell  | 3000 | |
| mfe-home      | 3001 | MF remote entry URL must match |
| mfe-dashboard | 3002 | MF remote entry URL must match |
| mfe-hello     | 3003 | |
| portal-api    | 8080 | |
| Keycloak      | 8180 | Browser hits this for OIDC login |

The shell image is built with `VITE_OIDC_AUTHORITY` defaulting to `http://localhost:8180/realms/portal`, which matches the port-forward — no rebuild needed.

Startup order is enforced by init containers:
1. `wait-postgres` — polls `pg_isready` before the API starts
2. `wait-keycloak` — polls the realm endpoint (`/realms/portal`) before the API starts

### Helm values

| Key | Default | Notes |
|-----|---------|-------|
| `oidc.authServerUrl` | `http://portal-keycloak:8080/realms/portal` | Internal K8s URL used by the API to fetch JWKS |
| `oidc.tokenIssuer` | `http://localhost:8180/realms/portal` | External URL — must match the `iss` claim in tokens |
| `keycloak.adminPassword` | `admin` | **Change for non-local environments** |
| `db.password` | `portal` | **Change for non-local environments** |

> The Helm release name must be `portal` — the nginx `proxy_pass` and OIDC URL are derived from it.

---

## Adding a new MFE

`mfe-hello` is the reference template.

1. **Copy** `mfe-hello/`, rename the directory and update `name` / `dev` port in `package.json` and federation `name`/`exposes` in `vite.config.ts`.

2. **Add** the workspace to root `package.json` (`workspaces`) and root `pom.xml` (`<modules>`).

3. **CSS** — add `vite-plugin-css-injected-by-js` to the MFE's own `devDependencies` and run `yarn install`. In `vite.config.ts`, add `tailwindcss()` first and `cssInjectedByJs()` before `federation()`. Import `./index.css` (containing `@import "tailwindcss"`) in `Plugin.tsx`.

4. **Register** — add an entry via the admin UI at `/admin/plugins`, or add a row to `portal-api/src/main/resources/import.sql` (dev seed).

5. **K8s** — copy `helm/portal/templates/mfe-hello-{deployment,service}.yaml`, update the component name, add a `values.yaml` entry and a `skaffold.yaml` artifact + port-forward.

The shell picks up new plugins on the next manifest refresh — no shell rebuild required.

---

## Configuration reference

Key `application.properties` settings (all overridable by environment variable):

| Property | Default | Override |
|----------|---------|----------|
| `quarkus.http.port` | `8080` | — |
| `quarkus.oidc.auth-server-url` | `http://localhost:8180/realms/portal` | `QUARKUS_OIDC_AUTH_SERVER_URL` |
| `quarkus.oidc.token.issuer` | _(unset — uses discovery)_ | `QUARKUS_OIDC_TOKEN_ISSUER` |
| `quarkus.oidc.connection-retry-count` | `10` | — |
| `%prod.quarkus.datasource.jdbc.url` | `jdbc:postgresql://localhost:5432/portal` | `DB_URL` |
| `%prod.quarkus.datasource.username` | `portal` | `DB_USER` |
| `%prod.quarkus.datasource.password` | `portal` | `DB_PASSWORD` |

Frontend OIDC settings (baked in at build time, override via `.env.local` in dev):

| Variable | Default |
|----------|---------|
| `VITE_OIDC_AUTHORITY` | `http://localhost:8180/realms/portal` |
| `VITE_OIDC_CLIENT_ID` | `portal-shell` |
| `VITE_API_URL` | `/api` |

---

## Security notes

- No passwords or secrets ever reach the browser — Keycloak owns the login form.
- The plugin manifest endpoint is public and returns all enabled plugins; no Bearer token is sent to it, so a Keycloak restart (new signing keys) never breaks the initial page load.
- `remoteEntry.js` is served with `Cache-Control: no-cache` so plugin updates are reflected immediately.
- In Kubernetes, the shell's nginx proxies `/api/` server-side, keeping the API off the public network.
- **Change `keycloak.adminPassword`, `db.password`, and Keycloak user passwords before any non-local deployment.**
