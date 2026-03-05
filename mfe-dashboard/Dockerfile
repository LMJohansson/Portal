####
# Multi-stage build · context: project root
# Build:  docker build -f mfe-dashboard/Dockerfile -t portal/mfe-dashboard .
# Or via: skaffold build / skaffold dev
####

# ── Stage 1: Yarn workspace build ────────────────────────────────────────
FROM quay.io/sclorg/nodejs-24-c9s:latest AS build
USER root
WORKDIR /app

# Workspace root manifests + Yarn Berry binary (committed to repo)
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/releases/ .yarn/releases/

# Each workspace member's package.json to establish the dependency graph
COPY mfe-home/package.json      mfe-home/
COPY mfe-dashboard/package.json mfe-dashboard/
COPY mfe-hello/package.json     mfe-hello/
COPY portal-shell/package.json  portal-shell/

RUN sh -c "ulimit -n 65536 && node .yarn/releases/yarn-4.12.0.cjs install --immutable"

# Copy this MFE's full source, then build
COPY mfe-dashboard/ mfe-dashboard/
RUN sh -c "ulimit -n 65536 && node .yarn/releases/yarn-4.12.0.cjs workspace mfe-dashboard run build"

# ── Stage 2: nginx static server ─────────────────────────────────────────
FROM quay.io/nginx/nginx-unprivileged:stable-alpine
COPY --from=build /app/mfe-dashboard/dist/ /usr/share/nginx/html/
# Default config baked into image; overridden by ConfigMap in Kubernetes
COPY nginx/mfe.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
