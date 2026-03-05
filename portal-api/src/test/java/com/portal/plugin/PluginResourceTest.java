package com.portal.plugin;

import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import io.restassured.http.ContentType;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.junit.jupiter.api.*;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

/**
 * Contract tests for {@code /api/plugins}.
 *
 * Each test method is annotated with the MicroProfile OpenAPI annotations that
 * describe the contract it verifies, making the test suite a living document of
 * the API specification.
 *
 * Execution order ensures CREATE runs before READ-by-ID, UPDATE and DELETE.
 */
@QuarkusTest
@Tag(name = "Plugin Registry")
@DisplayName("Plugin Registry API — /api/plugins")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class PluginResourceTest {

    // Shared ID captured after create so subsequent tests can reference it
    private static long createdPluginId;

    // ── GET /api/plugins/manifest ─────────────────────────────────────────────

    @Test
    @Order(1)
    @DisplayName("GET /manifest — 200 public (unauthenticated)")
    @Operation(operationId = "getPluginManifest",
               summary = "Get plugin manifest",
               description = "Public endpoint; returns enabled plugins for the caller's roles.")
    @APIResponse(responseCode = "200", description = "Manifest returned")
    void manifestIsPublic() {
        given()
            .when().get("/api/plugins/manifest")
            .then()
            .statusCode(200)
            .contentType(ContentType.JSON)
            .body("$", notNullValue())
            .body("$", hasSize(greaterThanOrEqualTo(0)));
    }

    @Test
    @Order(2)
    @DisplayName("GET /manifest — 200 with authenticated USER (role filter applied)")
    @Operation(operationId = "getPluginManifest")
    @APIResponse(responseCode = "200", description = "Manifest filtered to caller's roles")
    @TestSecurity(user = "user", roles = "USER")
    void manifestFilteredByUserRole() {
        given()
            .when().get("/api/plugins/manifest")
            .then()
            .statusCode(200)
            .contentType(ContentType.JSON)
            // Verify only plugins accessible to USER role are returned
            .body("findAll { it.roles != null && !it.roles.contains('USER') }", empty());
    }

    // ── GET /api/plugins ──────────────────────────────────────────────────────

    @Test
    @Order(3)
    @DisplayName("GET /api/plugins — 401 when unauthenticated")
    @Operation(operationId = "listAllPlugins", summary = "List all plugins")
    @APIResponse(responseCode = "401", description = "Missing or invalid JWT")
    void findAllRequiresAuth() {
        given()
            .when().get("/api/plugins")
            .then()
            .statusCode(401);
    }

    @Test
    @Order(4)
    @DisplayName("GET /api/plugins — 403 when authenticated as USER (not ADMIN)")
    @Operation(operationId = "listAllPlugins")
    @APIResponse(responseCode = "403", description = "Authenticated user lacks ADMIN role")
    @TestSecurity(user = "user", roles = "USER")
    void findAllForbiddenForUser() {
        given()
            .when().get("/api/plugins")
            .then()
            .statusCode(403);
    }

    @Test
    @Order(5)
    @DisplayName("GET /api/plugins — 200 list all for ADMIN (includes disabled)")
    @Operation(operationId = "listAllPlugins")
    @APIResponse(responseCode = "200", description = "Full plugin list")
    @TestSecurity(user = "admin", roles = "ADMIN")
    void adminCanListAllPlugins() {
        given()
            .when().get("/api/plugins")
            .then()
            .statusCode(200)
            .contentType(ContentType.JSON)
            .body("$", hasSize(greaterThanOrEqualTo(2)))
            .body("[0].pluginId", notNullValue())
            .body("[0].remoteUrl", notNullValue());
    }

    // ── POST /api/plugins ─────────────────────────────────────────────────────

    @Test
    @Order(6)
    @DisplayName("POST /api/plugins — 401 when unauthenticated")
    @Operation(operationId = "createPlugin", summary = "Register a new plugin")
    @APIResponse(responseCode = "401", description = "Missing or invalid JWT")
    void createRequiresAuth() {
        given()
            .contentType(ContentType.JSON)
            .body("""
                { "pluginId": "mfe-anon", "name": "Anon", "remoteUrl": "http://x",
                  "scope": "mfe_anon", "module": "./Plugin", "route": "/anon" }
                """)
            .when().post("/api/plugins")
            .then()
            .statusCode(401);
    }

    @Test
    @Order(7)
    @DisplayName("POST /api/plugins — 400 when required fields are missing")
    @Operation(operationId = "createPlugin")
    @APIResponse(responseCode = "400", description = "Validation error — missing required fields")
    @TestSecurity(user = "admin", roles = "ADMIN")
    void createFailsValidationWhenRequiredFieldsMissing() {
        given()
            .contentType(ContentType.JSON)
            .body("""
                { "name": "Incomplete Plugin" }
                """)
            .when().post("/api/plugins")
            .then()
            .statusCode(400);
    }

    @Test
    @Order(8)
    @DisplayName("POST /api/plugins — 400 when pluginId fails pattern constraint")
    @Operation(operationId = "createPlugin")
    @APIResponse(responseCode = "400", description = "Validation error — pluginId pattern mismatch")
    @TestSecurity(user = "admin", roles = "ADMIN")
    void createFailsValidationWhenPluginIdInvalid() {
        given()
            .contentType(ContentType.JSON)
            .body("""
                {
                  "pluginId": "MFE_Invalid!",
                  "name": "Bad ID",
                  "remoteUrl": "http://localhost:3099/assets/remoteEntry.js",
                  "scope": "mfe_bad",
                  "module": "./Plugin",
                  "route": "/bad"
                }
                """)
            .when().post("/api/plugins")
            .then()
            .statusCode(400);
    }

    @Test
    @Order(9)
    @DisplayName("POST /api/plugins — 201 ADMIN successfully registers a plugin")
    @Operation(operationId = "createPlugin")
    @APIResponse(responseCode = "201", description = "Plugin registered")
    @TestSecurity(user = "admin", roles = "ADMIN")
    void adminCanCreatePlugin() {
        createdPluginId = given()
            .contentType(ContentType.JSON)
            .body("""
                {
                  "pluginId": "mfe-test",
                  "name": "Test MFE",
                  "description": "Test plugin",
                  "remoteUrl": "http://localhost:3099/assets/remoteEntry.js",
                  "scope": "mfe_test",
                  "module": "./Plugin",
                  "route": "/test",
                  "icon": "flask",
                  "sortOrder": 99,
                  "enabled": true,
                  "roles": "USER,ADMIN"
                }
                """)
            .when().post("/api/plugins")
            .then()
            .statusCode(201)
            .contentType(ContentType.JSON)
            .body("pluginId", equalTo("mfe-test"))
            .body("id", notNullValue())
            .body("createdAt", notNullValue())
            .extract().path("id");
    }

    @Test
    @Order(10)
    @DisplayName("POST /api/plugins — 409 when pluginId already exists (mapped by IllegalArgumentExceptionMapper)")
    @Operation(operationId = "createPlugin")
    @APIResponse(responseCode = "409", description = "pluginId already exists")
    @TestSecurity(user = "admin", roles = "ADMIN")
    void createConflictsOnDuplicatePluginId() {
        given()
            .contentType(ContentType.JSON)
            .body("""
                {
                  "pluginId": "mfe-test",
                  "name": "Duplicate",
                  "remoteUrl": "http://localhost:3099/assets/remoteEntry.js",
                  "scope": "mfe_test",
                  "module": "./Plugin",
                  "route": "/test2"
                }
                """)
            .when().post("/api/plugins")
            .then()
            .statusCode(409)
            .body("message", containsString("mfe-test"));
    }

    // ── GET /api/plugins/{id} ─────────────────────────────────────────────────

    @Test
    @Order(11)
    @DisplayName("GET /api/plugins/{id} — 200 ADMIN retrieves a plugin by ID")
    @Operation(operationId = "getPlugin", summary = "Get plugin by ID")
    @APIResponse(responseCode = "200", description = "Plugin found")
    @TestSecurity(user = "admin", roles = "ADMIN")
    void adminCanGetPluginById() {
        given()
            .when().get("/api/plugins/{id}", createdPluginId)
            .then()
            .statusCode(200)
            .body("pluginId", equalTo("mfe-test"))
            .body("scope", equalTo("mfe_test"));
    }

    @Test
    @Order(12)
    @DisplayName("GET /api/plugins/{id} — 404 when plugin does not exist")
    @Operation(operationId = "getPlugin")
    @APIResponse(responseCode = "404", description = "Plugin not found")
    @TestSecurity(user = "admin", roles = "ADMIN")
    void getPluginReturns404WhenNotFound() {
        given()
            .when().get("/api/plugins/{id}", 99999)
            .then()
            .statusCode(404);
    }

    // ── PUT /api/plugins/{id} ─────────────────────────────────────────────────

    @Test
    @Order(13)
    @DisplayName("PUT /api/plugins/{id} — 200 ADMIN updates a plugin")
    @Operation(operationId = "updatePlugin", summary = "Update plugin")
    @APIResponse(responseCode = "200", description = "Plugin updated")
    @TestSecurity(user = "admin", roles = "ADMIN")
    void adminCanUpdatePlugin() {
        given()
            .contentType(ContentType.JSON)
            .body("""
                {
                  "pluginId": "mfe-test",
                  "name": "Test MFE (Updated)",
                  "description": "Updated description",
                  "remoteUrl": "http://localhost:3099/assets/remoteEntry.js",
                  "scope": "mfe_test",
                  "module": "./Plugin",
                  "route": "/test",
                  "icon": "star",
                  "sortOrder": 50,
                  "enabled": true,
                  "roles": "ADMIN"
                }
                """)
            .when().put("/api/plugins/{id}", createdPluginId)
            .then()
            .statusCode(200)
            .body("name", equalTo("Test MFE (Updated)"))
            .body("sortOrder", equalTo(50))
            .body("icon", equalTo("star"))
            .body("updatedAt", notNullValue());
    }

    @Test
    @Order(14)
    @DisplayName("PUT /api/plugins/{id} — 404 when plugin does not exist")
    @Operation(operationId = "updatePlugin")
    @APIResponse(responseCode = "404", description = "Plugin not found")
    @TestSecurity(user = "admin", roles = "ADMIN")
    void updatePluginReturns404WhenNotFound() {
        given()
            .contentType(ContentType.JSON)
            .body("""
                {
                  "pluginId": "mfe-ghost",
                  "name": "Ghost",
                  "remoteUrl": "http://localhost:3099/assets/remoteEntry.js",
                  "scope": "mfe_ghost",
                  "module": "./Plugin",
                  "route": "/ghost"
                }
                """)
            .when().put("/api/plugins/{id}", 99999)
            .then()
            .statusCode(404);
    }

    // ── PATCH /api/plugins/{id}/toggle ────────────────────────────────────────

    @Test
    @Order(15)
    @DisplayName("PATCH /api/plugins/{id}/toggle — 200 ADMIN disables a plugin")
    @Operation(operationId = "togglePlugin", summary = "Toggle plugin enabled/disabled")
    @APIResponse(responseCode = "200", description = "Plugin toggled — enabled flag flipped")
    @TestSecurity(user = "admin", roles = "ADMIN")
    void adminCanDisablePlugin() {
        given()
            .when().patch("/api/plugins/{id}/toggle", createdPluginId)
            .then()
            .statusCode(200)
            .body("enabled", equalTo(false));
    }

    @Test
    @Order(16)
    @DisplayName("PATCH /api/plugins/{id}/toggle — 200 ADMIN re-enables a plugin")
    @Operation(operationId = "togglePlugin")
    @APIResponse(responseCode = "200", description = "Plugin toggled — enabled flag flipped back")
    @TestSecurity(user = "admin", roles = "ADMIN")
    void adminCanReEnablePlugin() {
        given()
            .when().patch("/api/plugins/{id}/toggle", createdPluginId)
            .then()
            .statusCode(200)
            .body("enabled", equalTo(true));
    }

    @Test
    @Order(17)
    @DisplayName("PATCH /api/plugins/{id}/toggle — 404 when plugin does not exist")
    @Operation(operationId = "togglePlugin")
    @APIResponse(responseCode = "404", description = "Plugin not found")
    @TestSecurity(user = "admin", roles = "ADMIN")
    void toggleReturns404WhenNotFound() {
        given()
            .when().patch("/api/plugins/{id}/toggle", 99999)
            .then()
            .statusCode(404);
    }

    // ── DELETE /api/plugins/{id} ──────────────────────────────────────────────

    @Test
    @Order(18)
    @DisplayName("DELETE /api/plugins/{id} — 403 when authenticated as USER")
    @Operation(operationId = "deletePlugin", summary = "Delete plugin")
    @APIResponse(responseCode = "403", description = "Authenticated user lacks ADMIN role")
    @TestSecurity(user = "user", roles = "USER")
    void deleteForbiddenForUser() {
        given()
            .when().delete("/api/plugins/{id}", createdPluginId)
            .then()
            .statusCode(403);
    }

    @Test
    @Order(19)
    @DisplayName("DELETE /api/plugins/{id} — 204 ADMIN deletes a plugin")
    @Operation(operationId = "deletePlugin")
    @APIResponse(responseCode = "204", description = "Plugin deleted")
    @TestSecurity(user = "admin", roles = "ADMIN")
    void adminCanDeletePlugin() {
        given()
            .when().delete("/api/plugins/{id}", createdPluginId)
            .then()
            .statusCode(204);
    }

    @Test
    @Order(20)
    @DisplayName("DELETE /api/plugins/{id} — 404 after deletion (idempotency check)")
    @Operation(operationId = "deletePlugin")
    @APIResponse(responseCode = "404", description = "Plugin not found after deletion")
    @TestSecurity(user = "admin", roles = "ADMIN")
    void getAfterDeleteReturns404() {
        given()
            .when().get("/api/plugins/{id}", createdPluginId)
            .then()
            .statusCode(404);
    }
}
