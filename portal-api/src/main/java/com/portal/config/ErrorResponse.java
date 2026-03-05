package com.portal.config;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

@Schema(name = "ErrorResponse", description = "Standard error body")
public record ErrorResponse(
    @Schema(description = "Human-readable error message", example = "Plugin not found: 99")
    String message
) {}
