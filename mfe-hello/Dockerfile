####
# Multi-stage build · context: project root
# Build:  docker build -f mfe-hello/Dockerfile -t portal/mfe-hello .
# Or via: skaffold build / skaffold dev
####

# ── Stage 1: Build ───────────────────────────────────────────────────────
FROM node:24-alpine AS build
WORKDIR /app

COPY .yarnrc.yml yarn.lock ./
COPY .yarn/releases/ .yarn/releases/
COPY mfe-hello/package.json ./package.json
RUN node .yarn/releases/yarn-4.12.0.cjs install

COPY mfe-hello/ ./
RUN node .yarn/releases/yarn-4.12.0.cjs run build

# ── Stage 2: nginx static server ─────────────────────────────────────────
FROM nginx:stable-alpine
COPY --from=build /app/dist/ /usr/share/nginx/html/
COPY nginx/mfe.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
