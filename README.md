# Portal

An enterprise **micro-frontend portal** built with Vite Module Federation, React 18, and Quarkus. MFEs are discovered at runtime from a plugin registry API — the shell never needs to be redeployed to add or remove plugins.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser                                                        │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  portal-shell  (host, :3000)                             │   │
│  │                                                          │   │
│  │  1. POST /api/auth/login  →  JWT                         │   │
│  │  2. GET  /api/plugins/manifest  →  plugin list           │   │
│  │  3. load remoteEntry.js for each plugin (MF)             │   │
│  │  4. render plugin component inside shell layout          │   │
│  └──────────────────────────────────────────────────────────┘   │
│           │                  │                  │               │
│    mfe-home (:3001)  mfe-dashboard (:3002)  mfe-hello (:3003)   │
└─────────────────────────────────────────────────────────────────┘
                          │
                  portal-api (:8080)
                  Quarkus + H2/PostgreSQL
```

### Key design decisions

| Concern | Decision |
|---|---|
| Plugin discovery | `GET /api/plugins/manifest` — returns only plugins enabled and permitted for the current user's roles |
| Module Federation | **Dynamic** — shell has no static remotes; calls `registerRemotes()` + `loadRemote()` from `@module-federation/runtime` at runtime |
| Shared React | `singleton: true` on all shared entries; MF2 handles shared-scope initialisation automatically |
| MFE CSS | `vite-plugin-css-injected-by-js` bundles each MFE's Tailwind CSS into its JS so styles apply when the chunk loads inside the shell |
| Auth | RSA-2048 JWT signed by the API, verified by MicroProfile JWT on every protected endpoint |
| Routing | Each plugin owns a sub-tree under its registered `route` (e.g. `/home/*`, `/dashboard/*`) |

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend framework | React 18, TypeScript |
| Bundler | Vite 5 |
| Module Federation | `@module-federation/vite` v1.12.0 |
| Styling | Tailwind CSS 3 · `vite-plugin-css-injected-by-js` |
| State | Zustand (persisted to `sessionStorage`) |
| Data fetching | TanStack Query v5 |
| Backend | Quarkus 3, Java 25 (code level 21) |
| Auth | SmallRye JWT, MicroProfile JWT (RSA-2048) |
| Database | H2 (dev) · PostgreSQL 17 (prod) |
| ORM | Hibernate ORM Panache |
| Build | Maven 3.9.12 (`./mvnw`), `frontend-maven-plugin` |
| Package manager | Yarn Berry 4.12.0 (node-modules linker) |
| Node | 24 LTS (v24.14.0) |
| Container runtime | Docker · nginx (unprivileged) |
| Kubernetes | Minikube · Skaffold · Helm |

---

## Project structure

```
Portal/
├── .mvn/wrapper/           # Maven wrapper (3.9.12)
├── .yarn/releases/         # Yarn Berry binary (committed)
├── helm/portal/            # Helm chart for Kubernetes
│   ├── templates/
│   │   ├── api-deployment.yaml
│   │   ├── mfe-*-deployment.yaml
│   │   ├── nginx-configmap.yaml
│   │   ├── postgres-*.yaml
│   │   └── shell-deployment.yaml
│   └── values.yaml
├── nginx/
│   ├── shell.conf          # Shell nginx: serves SPA + proxies /api/ to portal-api
│   └── mfe.conf            # MFE nginx: serves static assets with CORS headers
├── mfe-dashboard/          # Remote MFE — Analytics dashboard (:3002)
├── mfe-hello/              # Remote MFE — Hello World template (:3003)
├── mfe-home/               # Remote MFE — Home page (:3001)
├── portal-api/             # Quarkus REST API (:8080)
│   └── src/main/java/com/portal/
│       ├── auth/           # AuthResource, JwtService, User entity
│       ├── config/         # Exception mappers
│       ├── health/         # MicroProfile Health readiness check
│       └── plugin/         # Plugin entity, PluginResource, PluginService
├── portal-shell/           # Host app (:3000)
│   └── src/
│       ├── core/
│       │   ├── DynamicRemote.tsx   # Lazy + Suspense + ErrorBoundary wrapper
│       │   └── PluginLoader.ts     # Dynamic MF loader (registerRemotes + loadRemote)
│       ├── pages/          # LoginPage, NotFoundPage, AdminPluginsPage
│       ├── store/          # Zustand store (auth + plugin state)
│       └── types/          # Plugin manifest types, federation.d.ts
├── package.json            # Yarn workspace root
├── pom.xml                 # Maven aggregator
├── skaffold.yaml
└── Makefile
```

---

## Getting started

### Prerequisites

- Java 25+
- Node.js 24 LTS — or rely on the project-local binary that `./mvnw` downloads automatically on first build

### Local development

1. **Install dependencies**

   ```bash
   make install
   ```

2. **Start each service in a separate terminal**

   ```bash
   make dev-mfe-home        # http://localhost:3001
   make dev-mfe-dashboard   # http://localhost:3002
   make dev-mfe-hello       # http://localhost:3003
   make dev-shell           # http://localhost:3000
   make dev-api             # http://localhost:8080  (Quarkus dev mode, live reload)
   ```

   > The shell's Vite dev server proxies `/api/*` to `localhost:8080` so no CORS configuration is needed locally.

3. Open `http://localhost:3000` and log in with one of the seeded accounts below.

### Full Maven build

```bash
./mvnw install -DskipTests
# or: make build
```

This runs `yarn install` (generate-sources phase), builds each MFE workspace (compile phase), then packages the Quarkus API.

---

## Default credentials

| Username | Password | Roles |
|---|---|---|
| `admin` | `admin123` | `ADMIN`, `USER` |
| `user` | `user123` | `USER` |

---

## API reference

### Auth — `/api/auth`

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate and receive a signed JWT |

**Request:**
```json
{ "username": "admin", "password": "admin123" }
```

**Response:**
```json
{ "token": "<jwt>", "username": "admin", "roles": ["ADMIN", "USER"] }
```

### Plugins — `/api/plugins`

All write endpoints require `Authorization: Bearer <jwt>` with the `ADMIN` role.

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/plugins/manifest` | Bearer (any role) | Enabled plugins visible to the caller's roles |
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

### Health

`GET /q/health` — MicroProfile Health readiness check (verifies database connectivity).

---

## Adding a new MFE

`mfe-hello` is the reference template. To create a new plugin:

1. Copy `mfe-hello/` and rename it (e.g. `mfe-reports/`).
2. Update the `name`, `dev` port, and federation `name`/`exposes` in its `vite.config.ts`.
3. Add the workspace to root `package.json` (`workspaces`) and `pom.xml` (`<modules>`).
4. Copy `helm/portal/templates/mfe-hello-{deployment,service}.yaml` and update the component name.
5. Add an entry in `helm/portal/values.yaml` and `skaffold.yaml`.
6. Register the plugin via `POST /api/plugins` or add a row to `portal-api/src/main/resources/import.sql`.

The shell picks it up on next manifest refresh — no shell rebuild required.

---

## Kubernetes (Minikube)

### One-time setup

```bash
make k8s-start   # start Minikube with raised file-descriptor limits
make k8s-pull    # pull third-party base images into Minikube's Docker daemon
make keys        # generate RSA key pair (skip if keys already exist)
```

### Development loop

```bash
make k8s-dev
```

Runs `skaffold dev` inside Minikube's Docker environment. Skaffold watches for source changes, rebuilds the affected image, and rolls out the updated pod automatically.

Port-forwards match the local dev ports so Module Federation remote entry URLs work unchanged:

| Service | Local URL |
|---|---|
| portal-shell | `http://localhost:3000` |
| mfe-home | `http://localhost:3001` |
| mfe-dashboard | `http://localhost:3002` |
| mfe-hello | `http://localhost:3003` |
| portal-api | `http://localhost:8080` |

### Other commands

```bash
make k8s-build    # build images only (no deploy)
make k8s-deploy   # one-shot build + deploy (no watch)
make k8s-status   # kubectl get pods,svc
make k8s-delete   # helm uninstall portal
```

> **Important:** The Helm release name must be `portal`. The nginx `proxy_pass` target is derived from the release name as `portal-api`.

---

## Configuration

Key `application.properties` settings (all overridable by environment variable in prod):

| Property | Default | Env var override |
|---|---|---|
| `quarkus.http.port` | `8080` | — |
| `quarkus.http.cors.origins` | `http://localhost:3000` | — |
| `mp.jwt.verify.issuer` | `https://portal.example.com` | `JWT_ISSUER` |
| `%prod.quarkus.datasource.jdbc.url` | `jdbc:postgresql://localhost:5432/portal` | `DB_URL` |
| `%prod.quarkus.datasource.username` | `portal` | `DB_USER` |
| `%prod.quarkus.datasource.password` | `portal` | `DB_PASSWORD` |

### RSA keys

Pre-generated development keys live in `portal-api/src/main/resources/`. **Replace before any production deployment:**

```bash
make keys
```

---

## Security notes

- JWTs are RSA-2048 signed; the private key never leaves the API.
- The plugin manifest endpoint filters by role — users only see plugins they are permitted to access.
- `remoteEntry.js` is served with `Cache-Control: no-cache` so plugin updates are reflected immediately.
- The shell's nginx config proxies `/api/` server-side in Kubernetes, keeping the API off the public network.
- **Change all default passwords and replace the RSA keys before going to production.**
