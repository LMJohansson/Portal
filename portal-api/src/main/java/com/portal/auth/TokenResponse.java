package com.portal.auth;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

import java.util.Set;

@Schema(name = "TokenResponse", description = "Successful authentication response containing a JWT access token")
public class TokenResponse {

    @Schema(description = "JWT Bearer token to include in the Authorization header",
            example = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...")
    public String accessToken;

    @Schema(description = "Token type, always 'Bearer'", example = "Bearer")
    public String tokenType = "Bearer";

    @Schema(description = "Token validity in seconds", example = "28800")
    public long expiresIn;

    @Schema(description = "Authenticated user's username", example = "admin")
    public String username;

    @Schema(description = "Authenticated user's display name", example = "Admin User")
    public String fullName;

    @Schema(description = "Authenticated user's email address", example = "admin@portal.example.com")
    public String email;

    @Schema(description = "Set of roles granted to this user", example = "[\"ADMIN\", \"USER\"]")
    public Set<String> roles;

    public TokenResponse() {}

    public TokenResponse(String accessToken, long expiresIn, User user) {
        this.accessToken = accessToken;
        this.expiresIn = expiresIn;
        this.username = user.username;
        this.fullName = user.fullName;
        this.email = user.email;
        this.roles = user.getRoleSet();
    }
}
