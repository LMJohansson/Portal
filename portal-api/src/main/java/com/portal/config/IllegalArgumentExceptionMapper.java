package com.portal.config;

import com.portal.config.ErrorResponse;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;

@Provider
public class IllegalArgumentExceptionMapper implements ExceptionMapper<IllegalArgumentException> {

    @Override
    @APIResponse(responseCode = "409", description = "Conflict — resource already exists",
        content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    public Response toResponse(IllegalArgumentException e) {
        return Response.status(Response.Status.CONFLICT)
            .entity(new ErrorResponse(e.getMessage()))
            .build();
    }
}
