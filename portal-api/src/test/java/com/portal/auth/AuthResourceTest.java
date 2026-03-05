package com.portal.auth;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

/**
 * Contract tests for {@code /api/auth}.
 *
 * Each test method carries the MicroProfile OpenAPI annotations that describe
 * the contract clause it verifies.
 */
@QuarkusTest
@Tag(name = "Authentication")
@DisplayName("Authentication API — /api/auth")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class AuthResourceTest {

    // ── POST /api/auth/login ──────────────────────────────────────────────────

    @Test
    @org.junit.jupiter.api.Order(1)
    @DisplayName("POST /login — 200 admin credentials return a valid JWT")
    @Operation(operationId = "login",
               summary = "Authenticate and receive a JWT token",
               description = "Validates credentials and returns a signed RS256 JWT.")
    @APIResponses({
        @APIResponse(responseCode = "200", description = "Authentication successful — JWT returned")
    })
    void loginWithAdminCredentialsReturnsToken() {
        given()
            .contentType(ContentType.JSON)
            .body("""
                { "username": "admin", "password": "admin123" }
                """)
            .when().post("/api/auth/login")
            .then()
            .statusCode(200)
            .contentType(ContentType.JSON)
            .body("accessToken", notNullValue())
            .body("accessToken", not(emptyString()))
            .body("tokenType", equalTo("Bearer"))
            .body("expiresIn", equalTo(28800))
            .body("username", equalTo("admin"))
            .body("fullName", notNullValue())
            .body("email", notNullValue())
            .body("roles", hasItems("ADMIN", "USER"));
    }

    @Test
    @org.junit.jupiter.api.Order(2)
    @DisplayName("POST /login — 200 regular user credentials return a valid JWT")
    @Operation(operationId = "login")
    @APIResponse(responseCode = "200", description = "Authentication successful — JWT returned")
    void loginWithUserCredentialsReturnsToken() {
        given()
            .contentType(ContentType.JSON)
            .body("""
                { "username": "user", "password": "user123" }
                """)
            .when().post("/api/auth/login")
            .then()
            .statusCode(200)
            .body("accessToken", notNullValue())
            .body("roles", hasItem("USER"))
            .body("roles", not(hasItem("ADMIN")));
    }

    @Test
    @org.junit.jupiter.api.Order(3)
    @DisplayName("POST /login — 401 wrong password")
    @Operation(operationId = "login")
    @APIResponse(responseCode = "401", description = "Invalid credentials — wrong password")
    void loginWithWrongPasswordReturns401() {
        given()
            .contentType(ContentType.JSON)
            .body("""
                { "username": "admin", "password": "wrongpassword" }
                """)
            .when().post("/api/auth/login")
            .then()
            .statusCode(401)
            .body("message", equalTo("Invalid credentials"));
    }

    @Test
    @org.junit.jupiter.api.Order(4)
    @DisplayName("POST /login — 401 unknown username")
    @Operation(operationId = "login")
    @APIResponse(responseCode = "401", description = "Invalid credentials — user not found")
    void loginWithUnknownUsernameReturns401() {
        given()
            .contentType(ContentType.JSON)
            .body("""
                { "username": "nobody", "password": "doesNotMatter" }
                """)
            .when().post("/api/auth/login")
            .then()
            .statusCode(401)
            .body("message", equalTo("Invalid credentials"));
    }

    @Test
    @org.junit.jupiter.api.Order(5)
    @DisplayName("POST /login — 400 missing username")
    @Operation(operationId = "login")
    @APIResponse(responseCode = "400", description = "Validation error — missing required field")
    void loginWithMissingUsernameReturns400() {
        given()
            .contentType(ContentType.JSON)
            .body("""
                { "password": "admin123" }
                """)
            .when().post("/api/auth/login")
            .then()
            .statusCode(400);
    }

    @Test
    @org.junit.jupiter.api.Order(6)
    @DisplayName("POST /login — 400 missing password")
    @Operation(operationId = "login")
    @APIResponse(responseCode = "400", description = "Validation error — missing required field")
    void loginWithMissingPasswordReturns400() {
        given()
            .contentType(ContentType.JSON)
            .body("""
                { "username": "admin" }
                """)
            .when().post("/api/auth/login")
            .then()
            .statusCode(400);
    }

    @Test
    @org.junit.jupiter.api.Order(7)
    @DisplayName("POST /login — 400 username shorter than minLength (3)")
    @Operation(operationId = "login")
    @APIResponse(responseCode = "400", description = "Validation error — username too short")
    void loginWithTooShortUsernameReturns400() {
        given()
            .contentType(ContentType.JSON)
            .body("""
                { "username": "ab", "password": "admin123" }
                """)
            .when().post("/api/auth/login")
            .then()
            .statusCode(400);
    }

    @Test
    @org.junit.jupiter.api.Order(8)
    @DisplayName("POST /login — 400 password shorter than minLength (6)")
    @Operation(operationId = "login")
    @APIResponse(responseCode = "400", description = "Validation error — password too short")
    void loginWithTooShortPasswordReturns400() {
        given()
            .contentType(ContentType.JSON)
            .body("""
                { "username": "admin", "password": "abc" }
                """)
            .when().post("/api/auth/login")
            .then()
            .statusCode(400);
    }

    @Test
    @org.junit.jupiter.api.Order(9)
    @DisplayName("POST /login — 400 empty request body")
    @Operation(operationId = "login")
    @APIResponse(responseCode = "400", description = "Validation error — empty body")
    void loginWithEmptyBodyReturns400() {
        given()
            .contentType(ContentType.JSON)
            .body("{}")
            .when().post("/api/auth/login")
            .then()
            .statusCode(400);
    }

    @Test
    @org.junit.jupiter.api.Order(10)
    @DisplayName("POST /login — token payload contains expected JWT claims")
    @Operation(operationId = "login",
               description = "Verifies the token structure matches the documented TokenResponse schema.")
    @APIResponse(responseCode = "200", description = "JWT payload matches TokenResponse schema")
    void loginTokenContainsExpectedFields() {
        given()
            .contentType(ContentType.JSON)
            .body("""
                { "username": "admin", "password": "admin123" }
                """)
            .when().post("/api/auth/login")
            .then()
            .statusCode(200)
            // Verify every documented TokenResponse field is present
            .body("$", hasKey("accessToken"))
            .body("$", hasKey("tokenType"))
            .body("$", hasKey("expiresIn"))
            .body("$", hasKey("username"))
            .body("$", hasKey("fullName"))
            .body("$", hasKey("email"))
            .body("$", hasKey("roles"))
            // Sanity-check value types
            .body("expiresIn", isA(Integer.class))
            .body("roles", isA(java.util.List.class));
    }
}
