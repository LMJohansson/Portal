package com.portal.auth;

import io.quarkus.elytron.security.common.BcryptUtil;
import jakarta.annotation.security.PermitAll;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.ExampleObject;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.parameters.RequestBody;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.logging.Logger;

@Path("/api/auth")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Authentication")
public class AuthResource {

    private static final Logger LOG = Logger.getLogger(AuthResource.class);

    @Inject
    JwtService jwtService;

    @POST
    @Path("/login")
    @PermitAll
    @Transactional
    @Operation(
        summary = "Authenticate and receive a JWT token",
        description = """
            Validates username and password against the user store.
            On success returns a signed EdDSA JWT valid for 8 hours.
            Include the returned `accessToken` in subsequent requests as:
            `Authorization: Bearer <accessToken>`
            """
    )
    @RequestBody(
        description = "User credentials",
        required = true,
        content = @Content(
            mediaType = MediaType.APPLICATION_JSON,
            schema = @Schema(implementation = TokenRequest.class),
            examples = {
                @ExampleObject(
                    name = "admin",
                    summary = "Admin user",
                    value = """
                        { "username": "admin", "password": "admin123" }
                        """
                ),
                @ExampleObject(
                    name = "regular user",
                    summary = "Regular user",
                    value = """
                        { "username": "user", "password": "user123" }
                        """
                )
            }
        )
    )
    @APIResponses({
        @APIResponse(
            responseCode = "200",
            description = "Authentication successful — JWT token returned",
            content = @Content(
                mediaType = MediaType.APPLICATION_JSON,
                schema = @Schema(implementation = TokenResponse.class),
                examples = @ExampleObject(
                    name = "success",
                    value = """
                        {
                          "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
                          "tokenType": "Bearer",
                          "expiresIn": 28800,
                          "username": "admin",
                          "fullName": "Admin User",
                          "email": "admin@portal.example.com",
                          "roles": ["ADMIN", "USER"]
                        }
                        """
                )
            )
        ),
        @APIResponse(
            responseCode = "400",
            description = "Request body failed validation (missing or too-short fields)",
            content = @Content(
                mediaType = MediaType.APPLICATION_JSON,
                schema = @Schema(implementation = ErrorResponse.class),
                examples = @ExampleObject(
                    value = """
                        { "message": "Username is required" }
                        """
                )
            )
        ),
        @APIResponse(
            responseCode = "401",
            description = "Invalid credentials — username not found, user disabled, or wrong password",
            content = @Content(
                mediaType = MediaType.APPLICATION_JSON,
                schema = @Schema(implementation = ErrorResponse.class),
                examples = @ExampleObject(
                    value = """
                        { "message": "Invalid credentials" }
                        """
                )
            )
        )
    })
    public Response login(@Valid TokenRequest request) {
        User user = User.findByUsername(request.username);

        if (user == null || !user.enabled) {
            LOG.warnf("Login attempt for unknown/disabled user: %s", request.username);
            return Response.status(Response.Status.UNAUTHORIZED)
                .entity(new ErrorResponse("Invalid credentials"))
                .build();
        }

        if (!BcryptUtil.matches(request.password, user.passwordHash)) {
            LOG.warnf("Invalid password for user: %s", request.username);
            return Response.status(Response.Status.UNAUTHORIZED)
                .entity(new ErrorResponse("Invalid credentials"))
                .build();
        }

        String token = jwtService.generateToken(
            user.username, user.fullName, user.email, user.getRoleSet());

        LOG.infof("User logged in: %s", user.username);
        return Response.ok(new TokenResponse(token, jwtService.getLifespanSeconds(), user)).build();
    }

    // Renamed from the private record so it's visible to OpenAPI schema scanning
    @Schema(name = "ErrorResponse", description = "Standard error body")
    public record ErrorResponse(
        @Schema(description = "Human-readable error message", example = "Invalid credentials")
        String message
    ) {}
}
