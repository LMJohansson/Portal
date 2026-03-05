package com.portal.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.eclipse.microprofile.openapi.annotations.media.Schema;

@Schema(name = "TokenRequest", description = "Credentials for obtaining a JWT access token")
public class TokenRequest {

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50)
    @Schema(description = "Portal username", example = "admin", minLength = 3, maxLength = 50, required = true)
    public String username;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100)
    @Schema(description = "User password", example = "admin123", minLength = 6, maxLength = 100,
            required = true, format = "password")
    public String password;
}
