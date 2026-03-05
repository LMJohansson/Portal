package com.portal;

import jakarta.ws.rs.core.Application;
import org.eclipse.microprofile.openapi.annotations.Components;
import org.eclipse.microprofile.openapi.annotations.OpenAPIDefinition;
import org.eclipse.microprofile.openapi.annotations.enums.SecuritySchemeIn;
import org.eclipse.microprofile.openapi.annotations.enums.SecuritySchemeType;
import org.eclipse.microprofile.openapi.annotations.info.Contact;
import org.eclipse.microprofile.openapi.annotations.info.Info;
import org.eclipse.microprofile.openapi.annotations.info.License;
import org.eclipse.microprofile.openapi.annotations.security.SecurityScheme;
import org.eclipse.microprofile.openapi.annotations.servers.Server;
import org.eclipse.microprofile.openapi.annotations.servers.ServerVariable;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@OpenAPIDefinition(
    info = @Info(
        title = "Enterprise Portal API",
        version = "1.0.0",
        description = """
            REST API for the Enterprise Micro-Frontend Portal.

            ## Authentication
            Most write operations and admin endpoints require a Bearer JWT token.
            Obtain one via `POST /api/auth/login`, then pass it in the
            `Authorization: Bearer <token>` header.

            ## Roles
            | Role    | Access                          |
            |---------|----------------------------------|
            | `USER`  | Read-only — plugin manifest      |
            | `ADMIN` | Full CRUD on plugin registry     |
            """,
        contact = @Contact(
            name = "Portal Engineering",
            email = "portal-engineering@example.com"
        ),
        license = @License(
            name = "Apache 2.0",
            url = "https://www.apache.org/licenses/LICENSE-2.0.html"
        )
    ),
    servers = {
        @Server(
            url = "http://localhost:{port}",
            description = "Local development",
            variables = @ServerVariable(
                name = "port",
                defaultValue = "8080",
                description = "Quarkus dev server port"
            )
        ),
        @Server(url = "https://api.portal.example.com", description = "Production")
    },
    tags = {
        @Tag(name = "Authentication", description = "Login and JWT token lifecycle"),
        @Tag(name = "Plugin Registry", description = "CRUD management of micro-frontend plugins")
    },
    components = @Components(
        securitySchemes = @SecurityScheme(
            securitySchemeName = "jwt",
            type = SecuritySchemeType.HTTP,
            scheme = "bearer",
            bearerFormat = "JWT",
            description = "JWT issued by `POST /api/auth/login`. Lifespan: 8 hours."
        )
    )
)
public class PortalApplication extends Application {}
