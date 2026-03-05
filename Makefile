.PHONY: all install build dev clean test keys help \
        k8s-start k8s-dev k8s-build k8s-deploy k8s-delete k8s-status k8s-pull \
        dev-api dev-mfe-home dev-mfe-dashboard dev-mfe-hello dev-shell

# ── Detect OS for mvnw ───────────────────────────────────────────────────────
MVNW := ./mvnw
ifeq ($(OS),Windows_NT)
  MVNW := mvnw.cmd
endif

# Prefer project-local node downloaded by frontend-maven-plugin; fall back to system node
NODE := $(shell test -x ./node/node && echo ./node/node || echo node)
YARN := $(NODE) .yarn/releases/yarn-4.12.0.cjs

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
	  awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

keys: ## Generate RSA key pair for JWT (run once)
	openssl genrsa -out portal-api/src/main/resources/privateKey.pem 2048
	openssl pkcs8 -topk8 -inform PEM -in portal-api/src/main/resources/privateKey.pem \
	  -out portal-api/src/main/resources/privateKey.pkcs8.pem -nocrypt
	openssl rsa -in portal-api/src/main/resources/privateKey.pem \
	  -pubout -out portal-api/src/main/resources/publicKey.pem
	@echo "Keys generated. REPLACE THESE BEFORE GOING TO PRODUCTION."

install: ## Install all dependencies (Yarn Berry)
	$(YARN) install

build: ## Build everything (MFEs first, then shell, then API)
	$(MVNW) install -DskipTests

dev: ## Start full dev stack (requires tmux or multiple terminals)
	@echo "Run each in a separate terminal:"
	@echo "  $(YARN) workspace mfe-home run dev"
	@echo "  $(YARN) workspace mfe-dashboard run dev"
	@echo "  $(YARN) workspace mfe-hello run dev"
	@echo "  $(YARN) workspace portal-shell run dev"
	@echo "  $(MVNW) -pl portal-api quarkus:dev"

dev-api: ## Start only the Quarkus API in dev mode
	$(MVNW) -pl portal-api quarkus:dev

dev-mfe-home: ## Start mfe-home dev server
	$(YARN) workspace mfe-home run dev

dev-mfe-dashboard: ## Start mfe-dashboard dev server
	$(YARN) workspace mfe-dashboard run dev

dev-mfe-hello: ## Start mfe-hello dev server
	$(YARN) workspace mfe-hello run dev

dev-shell: ## Start portal-shell dev server
	$(YARN) workspace portal-shell run dev

test: ## Run all tests
	$(MVNW) -pl portal-api test

clean: ## Clean all build artifacts
	$(MVNW) clean
	rm -rf portal-shell/dist mfe-home/dist mfe-dashboard/dist mfe-hello/dist

# ── Kubernetes / Skaffold ────────────────────────────────────────────────────
k8s-start: ## Start Minikube with settings required by this project (run once)
	minikube start --docker-opt="default-ulimit=nofile=65536:65536"

k8s-dev: ## Run skaffold dev (build + deploy + port-forward + watch)
	eval $$(minikube docker-env) && skaffold dev --trigger=polling --watch-poll-interval=1000 --port-forward

k8s-build: ## Build all images into Minikube's Docker daemon
	eval $$(minikube docker-env) && skaffold build

k8s-deploy: ## One-shot build + deploy (no watch)
	eval $$(minikube docker-env) && skaffold run --port-forward


k8s-pull: ## Pull third-party images into Minikube's Docker daemon (run once)
	eval $$(minikube docker-env) && \
	  docker pull quay.io/sclorg/nodejs-24-c9s:latest && \
	  docker pull quay.io/nginx/nginx-unprivileged:stable-alpine && \
	  docker pull docker.io/library/eclipse-temurin:25-jdk-alpine && \
	  docker pull docker.io/library/postgres:17

k8s-delete: ## Remove the Helm release from the cluster
	skaffold delete

k8s-status: ## Show pod and service status
	kubectl get pods,svc -l app.kubernetes.io/instance=portal
