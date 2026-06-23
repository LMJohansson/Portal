# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An enterprise micro-frontend portal: a React host (`portal-shell`) that loads
independently-built remote apps (`mfe-home`, `mfe-dashboard`, `mfe-hello`) at
runtime via Module Federation, plus a Quarkus backend (`portal-api`). It is a
hybrid build: Maven aggregator over `frontend-maven-plugin` + Yarn Berry npm
workspaces. Auth is Keycloak OIDC (Authorization Code + PKCE).

## Build tooling: Rsbuild (not Vite)

The frontend was migrated from Vite to **Rsbuild** (Rspack-based). When reading
older notes or commits, treat anything Vite-specific as obsolete:

- Build config is `<app>/rsbuild.config.ts` (the old `vite.config.ts` files are
  deleted). Module Federation uses `@module-federation/rsbuild-plugin`
  (`pluginModuleFederation` + `createModuleFederationConfig`).
- **CSS for federated remotes**: handled by `output.injectStyles: true` in each
  MFE's rsbuild config — Rspack MF only ships JS, so this inlines the MFE's
  Tailwind CSS into its chunk. The old `vite-plugin-css-injected-by-js` and the
  `fixMF2CjsNaming` Rollup workaround no longer exist and should not be reintroduced.
- Tailwind is wired via `@rsbuild/plugin-tailwindcss` (Tailwind v4).
- `dev.assetPrefix: 'http://localhost:<port>'` in each MFE makes dev chunk URLs
  absolute so the shell can load them cross-origin. In production, chunks are
  resolved relative to `remoteEntry.js` **only because** each MFE sets
  `output.assetPrefix: 'auto'` — this is NOT Rsbuild's default (it defaults to
  `/`, which makes federated async chunks 404 against the shell origin). Do not
  remove the `'auto'` setting.

## Code Style

- General Clean Code best practices

## Common commands

Run from repo root. `yarn` is Yarn Berry 4.12 pinned at `.yarn/releases/yarn-4.12.0.cjs`.

```bash
# Install deps (immutable)
yarn install

# Frontend dev servers (each in its own terminal) — also: make dev-shell, etc.
yarn workspace portal-shell run dev        # :3000 (host, proxies /api → :8080)
yarn workspace mfe-home run dev            # :3001
yarn workspace mfe-dashboard run dev       # :3002
yarn workspace mfe-hello run dev           # :3003

# Build a single workspace (tsc -b && rsbuild build)
yarn workspace portal-shell run build

# Lint a workspace (flat config resolves up to root eslint.config.mjs)
yarn workspace mfe-home run lint

# Frontend tests (Rstest + Testing Library + happy-dom)
yarn workspace mfe-home run test           # one workspace
yarn test:frontend                         # all four workspaces
make test-frontend

# Backend
make dev-api                               # ./mvnw -pl portal-api quarkus:dev
make test                                  # ./mvnw -pl portal-api test  (Java/JUnit)

# Infra needed before dev (Keycloak :8180 + Postgres)
make dev-keycloak

# Full build (MFEs → shell → API), via Maven
make build                                 # ./mvnw install -DskipTests
```

Frontend tests use **Rstest** (`@rstest/core`, the Rspack-native runner) with React
Testing Library + happy-dom. Each workspace has `rstest.config.ts` and a `test/`
dir (`rstest.setup.ts` wires `@testing-library/jest-dom` matchers). Tests are smoke
level: MFE page renders + the shell's Zustand store. They are intentionally **not**
wired into the Maven build.

## Dependency policy

Prefer the latest **LTS** for anything with an LTS track — **Java 25**, Node 24
(Krypton), Quarkus 3.33 (not the newer non-LTS 3.36/3.37). npm packages have no LTS
line, so use latest stable; Keycloak/Postgres images track latest stable.

### Ports
3000 shell · 3001 mfe-home · 3002 mfe-dashboard · 3003 mfe-hello · 8080 portal-api · 8180 Keycloak

### Dev credentials (Keycloak realm `portal`)
`admin / admin123` (ADMIN, USER) · `user / user123` (USER) · Keycloak admin `admin / admin`

## Module Federation architecture (the big picture)

- **Dynamic federation**: the shell declares **no static remotes**. It fetches
  `GET /api/plugins/manifest` (enabled plugins filtered by the user's roles),
  then `registerRemotes()` + `loadRemote('scope/Module')` from
  `@module-federation/runtime` at runtime. Strip the `./` prefix from
  `plugin.module` (`./Plugin` → `Plugin`). **Remote type is `'global'`** — Rspack /
  `@module-federation/rsbuild-plugin` emits a global-format `remoteEntry.js`
  (`mf-manifest.json` → `remoteEntry.type === "global"`); the old Vite/ESM value
  `'module'` fails at runtime with Federation `RUNTIME-002` ("remote entry interface
  does not contain init").
- **MF bridge boundary** (`@module-federation/bridge-react`): each MFE wraps its
  root with `createBridgeComponent` (from the **`/v19`** entry, React 19) and owns
  its own `BrowserRouter` (from `@module-federation/bridge-react/**router-v7**`,
  which reads `basename` from the bridge runtime context). The shell uses
  `createRemoteAppComponent` (from the package **main** entry) and passes
  `basename={plugin.route}`. **Each MFE gets its own React root**, so shell-side
  context (auth, Zustand) is NOT visible inside an MFE — pass data through the
  bridge's `props`.
- **Shared singletons**: `react`, `react-dom`, and `@module-federation/bridge-react`
  are `singleton: true` in both host and remote rsbuild configs. **Do NOT** put
  `react-router`/`react-router-dom` in `shared` — the bridge webpack plugin manages
  router sharing and throws otherwise; instead `react-router` is a direct dependency
  of every app.
- **Each MFE `rsbuild.config.ts` must export via `defineConfig({...})`**, not a typed
  `const`/plain object — only `defineConfig` runs the normalization that wires
  `dev.assetPrefix` into the MF `publicPath`. Otherwise dev chunks 404 against the
  shell origin.
- **MFE expose pattern**: each MFE exposes `./Plugin`. Default export = the
  bridge component (used when federated); named export = the raw React root
  (e.g. `HomeRoot`) used by standalone bootstrap. Import `./index.css` in
  `Plugin.tsx` (not just `bootstrap.tsx`) — only `Plugin.tsx` mounts under MF.
- **Bootstrap pattern**: `main.tsx → import('./bootstrap')` (async import is
  required for MF shared-module init). Bootstrap renders the raw root directly;
  the root brings its own router, so no outer router wrapper.

Key shell files: `portal-shell/src/core/PluginLoader.ts` (dynamic MF
registration + load), `core/DynamicRemote.tsx` (bridge remote + ErrorBoundary),
`store/portalStore.ts` (Zustand plugin/UI store), `auth/userManager.ts`
(singleton `oidc-client-ts` UserManager).

## Yarn Berry constraints

- `nodeLinker: node-modules` with `nmHoistingLimits: workspaces` — deps stay in
  each workspace's own `node_modules` and are **not hoisted**. The bridge-react
  MF plugin resolves `bridge-react`/`react-router` from `<app>/node_modules`;
  hoisting would hide them and silently skip its router alias setup. Do not
  remove this setting.

## Backend & build wiring

- Quarkus 3.33 (LTS) / Java 25 (LTS), Hibernate ORM Panache; H2 (dev + `%test`),
  Postgres (prod). Config in `portal-api/src/main/resources/application.yaml`
  (profile blocks `%dev`/`%test`/`%prod`). Plugin CRUD + manifest in
  `portal-api/src/main/java/com/portal/plugin/PluginResource.java`.
- Maven multi-module: root pom runs `yarn install` (generate-sources); each
  frontend submodule (packaging=pom) runs `yarn workspace <name> run build`
  (compile, workingDirectory=root). Node is shared via `frontend-maven-plugin`
  `installDirectory=${maven.multiModuleProjectDirectory}` → `./node/`.
- **MF `remoteEntry.js` lives at the root of `dist/`** (not `dist/assets/`). DB
  seed URLs and nginx config must use `/remoteEntry.js`.

## K8s / Skaffold

- `skaffold.yaml` + `helm/portal/`; `make k8s-dev` = `eval $(minikube docker-env)
  && skaffold dev`. Helm release name **must** be `portal` so service
  `portal-api` matches the nginx `proxy_pass`. nginx `shell.conf` is templated.
- Four root-context multi-stage Dockerfiles: `portal-api`, `mfe-home`,
  `mfe-dashboard`, `portal-shell`.
