####
# Multi-stage build · context: project root
# Build:  docker build -f portal-api/Dockerfile -t portal/portal-api .
# Or via: skaffold build / skaffold dev
####

# ── Stage 1: Maven build ──────────────────────────────────────────────────
FROM docker.io/library/eclipse-temurin:25-jdk-alpine AS build
WORKDIR /build

# Copy POMs first — Docker layer cache avoids re-downloading deps unless pom.xml changes
# Sibling module pom.xml files are required by the Maven reactor even when building -pl portal-api
COPY pom.xml .
COPY mvnw mvnw
COPY .mvn .mvn
COPY portal-api/pom.xml portal-api/
COPY mfe-home/pom.xml mfe-home/
COPY mfe-dashboard/pom.xml mfe-dashboard/
COPY mfe-hello/pom.xml mfe-hello/
COPY portal-shell/pom.xml portal-shell/
RUN chmod +x mvnw && ./mvnw -pl portal-api dependency:go-offline -q --no-transfer-progress

# Copy sources and compile
COPY portal-api/src portal-api/src
RUN ./mvnw -pl portal-api package -Dmaven.test.skip=true -q --no-transfer-progress

# ── Stage 2: JRE runtime ──────────────────────────────────────────────────
FROM docker.io/library/eclipse-temurin:25-jdk-alpine
WORKDIR /deployments

COPY --from=build /build/portal-api/target/quarkus-app/lib/     lib/
COPY --from=build /build/portal-api/target/quarkus-app/*.jar    ./
COPY --from=build /build/portal-api/target/quarkus-app/app/     app/
COPY --from=build /build/portal-api/target/quarkus-app/quarkus/ quarkus/

EXPOSE 8080

ENV JAVA_OPTS="-Dquarkus.http.host=0.0.0.0 -Djava.util.logging.manager=org.jboss.logmanager.LogManager"
ENV JAVA_APP_JAR="/deployments/quarkus-run.jar"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar $JAVA_APP_JAR"]
