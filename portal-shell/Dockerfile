####
# Multi-stage build · context: project root
# Build:  docker build -f portal-shell/Dockerfile -t portal/portal-shell .
# Or via: skaffold build / skaffold dev
####

# ── Stage 1: Build ───────────────────────────────────────────────────────
FROM node:24-alpine AS build
WORKDIR /app

COPY .yarnrc.yml yarn.lock ./
COPY .yarn/releases/ .yarn/releases/
COPY portal-shell/package.json ./package.json
RUN node .yarn/releases/yarn-4.12.0.cjs install

COPY portal-shell/ ./
RUN node .yarn/releases/yarn-4.12.0.cjs run build

# ── Stage 2: nginx static server + API proxy ─────────────────────────────
FROM nginx:stable-alpine
COPY --from=build /app/dist/ /usr/share/nginx/html/
COPY nginx/shell.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
