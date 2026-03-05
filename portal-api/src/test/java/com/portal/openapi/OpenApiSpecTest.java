package com.portal.openapi;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.junit.jupiter.api.*;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

/**
 * Validates that the OpenAPI specification is generated correctly and that the
 * Swagger UI is accessible.
 *
 * These tests act as a smoke-test / contract-guard: if a resource class loses
 * its {@code @Tag}, a path disappears, or the security scheme is removed, the
 * relevant assertion here will catch it.
 */
@QuarkusTest
@Tag(name = "OpenAPI Specification")
@DisplayName("OpenAPI Specification — /q/openapi")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class OpenApiSpecTest {

    // ── Spec availability ────────────────────────────────────────────────────

    @Test
    @Order(1)
    @DisplayName("GET /q/openapi — 200 spec served as YAML")
    @Operation(summary = "OpenAPI spec is accessible at /q/openapi")
    @APIResponse(responseCode = "200", description = "OpenAPI YAML document returned")
    void specIsServedAsYaml() {
        given()
            .accept("application/yaml")
            .when().get("/q/openapi")
            .then()
            .statusCode(200)
            .contentType(containsString("yaml"));
    }

    @Test
    @Order(2)
    @DisplayName("GET /q/openapi?format=json — 200 spec served as JSON")
    @Operation(summary = "OpenAPI spec is accessible in JSON format")
    @APIResponse(responseCode = "200", description = "OpenAPI JSON document returned")
    void specIsServedAsJson() {
        given()
            .when().get("/q/openapi?format=json")
            .then()
            .statusCode(200)
            .contentType(ContentType.JSON);
    }

    // ── OpenAPI version ───────────────────────────────────────────────────────

    @Test
    @Order(3)
    @DisplayName("Spec declares openapi: 3.0.x")
    @Operation(summary = "Spec version is OpenAPI 3.0.x")
    @APIResponse(responseCode = "200", description = "openapi field present and correct")
    void specDeclaresOpenApi3() {
        given()
            .when().get("/q/openapi?format=json")
            .then()
            .statusCode(200)
            .body("openapi", startsWith("3.0"));
    }

    // ── Info block ────────────────────────────────────────────────────────────

    @Test
    @Order(4)
    @DisplayName("Spec info.title matches 'Enterprise Portal API'")
    @Operation(summary = "Spec info block is populated from @OpenAPIDefinition")
    @APIResponse(responseCode = "200", description = "info.title, info.version present")
    void specInfoIsPopulated() {
        given()
            .when().get("/q/openapi?format=json")
            .then()
            .statusCode(200)
            .body("info.title", equalTo("Enterprise Portal API"))
            .body("info.version", equalTo("1.0.0"))
            .body("info.contact.email", notNullValue())
            .body("info.license.name", equalTo("Apache 2.0"));
    }

    // ── Security scheme ───────────────────────────────────────────────────────

    @Test
    @Order(5)
    @DisplayName("Spec defines 'jwt' Bearer security scheme")
    @Operation(summary = "JWT security scheme is declared in components.securitySchemes")
    @APIResponse(responseCode = "200", description = "Security scheme 'jwt' present")
    void specDefinesJwtSecurityScheme() {
        given()
            .when().get("/q/openapi?format=json")
            .then()
            .statusCode(200)
            .body("components.securitySchemes.jwt", notNullValue())
            .body("components.securitySchemes.jwt.type", equalTo("http"))
            .body("components.securitySchemes.jwt.scheme", equalTo("bearer"))
            .body("components.securitySchemes.jwt.bearerFormat", equalTo("JWT"));
    }

    // ── Tags ──────────────────────────────────────────────────────────────────

    @Test
    @Order(6)
    @DisplayName("Spec contains required tag: Plugin Registry")
    @Operation(summary = "All @Tag declarations are present in the generated spec")
    @APIResponse(responseCode = "200", description = "tags array contains expected entries")
    void specContainsRequiredTags() {
        given()
            .when().get("/q/openapi?format=json")
            .then()
            .statusCode(200)
            .body("tags.name", hasItems("Plugin Registry"));
    }

    // ── Paths ─────────────────────────────────────────────────────────────────

    @Test
    @Order(8)
    @DisplayName("Spec exposes GET /api/plugins/manifest")
    @Operation(summary = "Manifest path is present in spec")
    @APIResponse(responseCode = "200", description = "path /api/plugins/manifest → get exists")
    void specExposesManifestPath() {
        given()
            .when().get("/q/openapi?format=json")
            .then()
            .statusCode(200)
            .body("paths.'/api/plugins/manifest'.get", notNullValue());
    }

    @Test
    @Order(9)
    @DisplayName("Spec exposes all /api/plugins CRUD paths")
    @Operation(summary = "All Plugin Registry paths are present in spec")
    @APIResponse(responseCode = "200", description = "paths /api/plugins and /api/plugins/{id} exist")
    void specExposesPluginCrudPaths() {
        given()
            .when().get("/q/openapi?format=json")
            .then()
            .statusCode(200)
            .body("paths.'/api/plugins'.get", notNullValue())
            .body("paths.'/api/plugins'.post", notNullValue())
            .body("paths.'/api/plugins/{id}'.get", notNullValue())
            .body("paths.'/api/plugins/{id}'.put", notNullValue())
            .body("paths.'/api/plugins/{id}'.delete", notNullValue())
            .body("paths.'/api/plugins/{id}/toggle'.patch", notNullValue());
    }

    @Test
    @Order(10)
    @DisplayName("Spec — admin paths declare jwt security requirement")
    @Operation(summary = "Protected operations declare the jwt securityRequirement")
    @APIResponse(responseCode = "200", description = "security requirement on admin GET /api/plugins")
    void specAdminPathsDeclareSecurity() {
        given()
            .when().get("/q/openapi?format=json")
            .then()
            .statusCode(200)
            .body("paths.'/api/plugins'.get.security", notNullValue());
    }

    // ── Schemas ───────────────────────────────────────────────────────────────

    @Test
    @Order(11)
    @DisplayName("Spec defines Plugin schema with required fields")
    @Operation(summary = "Plugin schema is present in components.schemas")
    @APIResponse(responseCode = "200", description = "Plugin schema has required, properties")
    void specDefinesPluginSchema() {
        given()
            .when().get("/q/openapi?format=json")
            .then()
            .statusCode(200)
            .body("components.schemas.Plugin", notNullValue())
            .body("components.schemas.Plugin.properties.pluginId", notNullValue())
            .body("components.schemas.Plugin.properties.remoteUrl", notNullValue())
            .body("components.schemas.Plugin.properties.scope", notNullValue())
            .body("components.schemas.Plugin.properties.route", notNullValue());
    }

    // ── Swagger UI ────────────────────────────────────────────────────────────

    @Test
    @Order(13)
    @DisplayName("GET /swagger-ui — 200 Swagger UI HTML served")
    @Operation(summary = "Swagger UI is accessible")
    @APIResponse(responseCode = "200", description = "Swagger UI HTML page returned")
    void swaggerUiIsAccessible() {
        given()
            .redirects().follow(true)
            .when().get("/swagger-ui")
            .then()
            .statusCode(200)
            .contentType(containsString("html"));
    }
}
