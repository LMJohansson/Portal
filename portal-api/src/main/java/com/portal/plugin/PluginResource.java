package com.portal.plugin;

import com.portal.config.ErrorResponse;
import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.enums.ParameterIn;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.ExampleObject;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.parameters.Parameter;
import org.eclipse.microprofile.openapi.annotations.parameters.RequestBody;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.eclipse.microprofile.openapi.annotations.security.SecurityRequirement;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;

@Path("/api/plugins")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Plugin Registry")
public class PluginResource {

    @Inject
    PluginService pluginService;

    @Inject
    JsonWebToken jwt;

    // ── Public manifest ───────────────────────────────────────────────────────

    @GET
    @Path("/manifest")
    @PermitAll
    @Operation(
        summary = "Get plugin manifest",
        description = """
            Returns the list of **enabled** plugins visible to the caller.
            If a valid JWT is present in the `Authorization` header, results are
            additionally filtered to plugins whose `roles` overlap with the token's groups.
            The portal shell calls this endpoint on startup to build the navigation and routes.
            """
    )
    @APIResponses({
        @APIResponse(
            responseCode = "200",
            description = "Manifest returned (may be empty if no plugins match the caller's roles)",
            content = @Content(
                mediaType = MediaType.APPLICATION_JSON,
                schema = @Schema(type = org.eclipse.microprofile.openapi.annotations.enums.SchemaType.ARRAY,
                                 implementation = Plugin.class),
                examples = @ExampleObject(
                    name = "two plugins",
                    value = """
                        [
                          {
                            "id": 1,
                            "pluginId": "mfe-home",
                            "name": "Home",
                            "description": "Portal home page",
                            "remoteUrl": "http://localhost:3001/assets/remoteEntry.js",
                            "scope": "mfe_home",
                            "module": "./Plugin",
                            "route": "/home",
                            "icon": "home",
                            "sortOrder": 1,
                            "enabled": true,
                            "roles": "USER,ADMIN",
                            "createdAt": "2026-01-15T10:00:00",
                            "updatedAt": "2026-01-15T10:00:00"
                          }
                        ]
                        """
                )
            )
        )
    })
    public List<Plugin> manifest() {
        List<Plugin> enabled = pluginService.findEnabled();
        if (jwt != null && jwt.getSubject() != null) {
            var userRoles = jwt.getGroups();
            return enabled.stream()
                .filter(p -> p.roles == null || p.roles.isBlank() || hasAccess(p.roles, userRoles))
                .toList();
        }
        return enabled;
    }

    // ── Admin — list all ─────────────────────────────────────────────────────

    @GET
    @RolesAllowed("ADMIN")
    @SecurityRequirement(name = "jwt")
    @Operation(
        summary = "List all plugins",
        description = "Returns every plugin regardless of `enabled` status. Requires `ADMIN` role."
    )
    @APIResponses({
        @APIResponse(
            responseCode = "200",
            description = "Full plugin list",
            content = @Content(
                mediaType = MediaType.APPLICATION_JSON,
                schema = @Schema(type = org.eclipse.microprofile.openapi.annotations.enums.SchemaType.ARRAY,
                                 implementation = Plugin.class)
            )
        ),
        @APIResponse(responseCode = "401", description = "Missing or invalid JWT",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @APIResponse(responseCode = "403", description = "Authenticated user lacks ADMIN role",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public List<Plugin> findAll() {
        return pluginService.findAll();
    }

    // ── Admin — get by ID ────────────────────────────────────────────────────

    @GET
    @Path("/{id}")
    @RolesAllowed("ADMIN")
    @SecurityRequirement(name = "jwt")
    @Operation(summary = "Get plugin by ID", description = "Fetches a single plugin by its surrogate primary key.")
    @Parameter(name = "id", in = ParameterIn.PATH, required = true,
               description = "Plugin surrogate primary key", example = "1")
    @APIResponses({
        @APIResponse(
            responseCode = "200",
            description = "Plugin found",
            content = @Content(mediaType = MediaType.APPLICATION_JSON,
                               schema = @Schema(implementation = Plugin.class))
        ),
        @APIResponse(responseCode = "401", description = "Missing or invalid JWT",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @APIResponse(responseCode = "403", description = "Authenticated user lacks ADMIN role",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @APIResponse(responseCode = "404", description = "No plugin with that ID",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class),
                examples = @ExampleObject(value = """
                    { "message": "Plugin not found: 99" }
                    """)))
    })
    public Plugin findById(@PathParam("id") Long id) {
        return pluginService.findById(id);
    }

    // ── Admin — create ───────────────────────────────────────────────────────

    @POST
    @RolesAllowed("ADMIN")
    @SecurityRequirement(name = "jwt")
    @Operation(
        summary = "Register a new plugin",
        description = """
            Adds a micro-frontend to the portal registry.
            The portal shell picks up the new plugin on the next manifest refresh
            (or immediately if the admin triggers a reload).
            `pluginId` must be unique across the registry.
            """
    )
    @RequestBody(
        description = "Plugin registration payload",
        required = true,
        content = @Content(
            mediaType = MediaType.APPLICATION_JSON,
            schema = @Schema(implementation = Plugin.class),
            examples = @ExampleObject(
                name = "mfe-reports",
                summary = "Register a Reports MFE",
                value = """
                    {
                      "pluginId": "mfe-reports",
                      "name": "Reports",
                      "description": "Financial reporting micro-frontend",
                      "remoteUrl": "http://localhost:3003/assets/remoteEntry.js",
                      "scope": "mfe_reports",
                      "module": "./Plugin",
                      "route": "/reports",
                      "icon": "bar-chart",
                      "sortOrder": 3,
                      "enabled": true,
                      "roles": "USER,ADMIN"
                    }
                    """
            )
        )
    )
    @APIResponses({
        @APIResponse(
            responseCode = "201",
            description = "Plugin successfully registered",
            content = @Content(mediaType = MediaType.APPLICATION_JSON,
                               schema = @Schema(implementation = Plugin.class))
        ),
        @APIResponse(responseCode = "400", description = "Validation error — missing required field or constraint violation",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @APIResponse(responseCode = "401", description = "Missing or invalid JWT",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @APIResponse(responseCode = "403", description = "Authenticated user lacks ADMIN role",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @APIResponse(responseCode = "409", description = "`pluginId` already exists in the registry",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class),
                examples = @ExampleObject(value = """
                    { "message": "Plugin ID already exists: mfe-reports" }
                    """)))
    })
    public Response create(@Valid Plugin plugin) {
        Plugin created = pluginService.create(plugin);
        return Response.status(Response.Status.CREATED).entity(created).build();
    }

    // ── Admin — update ───────────────────────────────────────────────────────

    @PUT
    @Path("/{id}")
    @RolesAllowed("ADMIN")
    @SecurityRequirement(name = "jwt")
    @Operation(
        summary = "Update plugin",
        description = "Replaces all mutable fields of an existing plugin. `pluginId` cannot be changed."
    )
    @Parameter(name = "id", in = ParameterIn.PATH, required = true,
               description = "Plugin surrogate primary key", example = "1")
    @RequestBody(
        description = "Updated plugin fields",
        required = true,
        content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = Plugin.class))
    )
    @APIResponses({
        @APIResponse(responseCode = "200", description = "Plugin updated",
            content = @Content(mediaType = MediaType.APPLICATION_JSON,
                               schema = @Schema(implementation = Plugin.class))),
        @APIResponse(responseCode = "400", description = "Validation error",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @APIResponse(responseCode = "401", description = "Missing or invalid JWT",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @APIResponse(responseCode = "403", description = "Authenticated user lacks ADMIN role",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @APIResponse(responseCode = "404", description = "Plugin not found",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public Plugin update(@PathParam("id") Long id, @Valid Plugin plugin) {
        return pluginService.update(id, plugin);
    }

    // ── Admin — delete ───────────────────────────────────────────────────────

    @DELETE
    @Path("/{id}")
    @RolesAllowed("ADMIN")
    @SecurityRequirement(name = "jwt")
    @Operation(
        summary = "Delete plugin",
        description = "Permanently removes the plugin from the registry. The shell will stop serving it on the next manifest refresh."
    )
    @Parameter(name = "id", in = ParameterIn.PATH, required = true,
               description = "Plugin surrogate primary key", example = "1")
    @APIResponses({
        @APIResponse(responseCode = "204", description = "Plugin deleted — no content returned"),
        @APIResponse(responseCode = "401", description = "Missing or invalid JWT",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @APIResponse(responseCode = "403", description = "Authenticated user lacks ADMIN role",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @APIResponse(responseCode = "404", description = "Plugin not found",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public Response delete(@PathParam("id") Long id) {
        pluginService.delete(id);
        return Response.noContent().build();
    }

    // ── Admin — toggle ───────────────────────────────────────────────────────

    @PATCH
    @Path("/{id}/toggle")
    @RolesAllowed("ADMIN")
    @SecurityRequirement(name = "jwt")
    @Operation(
        summary = "Toggle plugin enabled/disabled",
        description = """
            Flips the `enabled` flag on a plugin without a full PUT.
            Disabling a plugin removes it from the manifest immediately;
            the shell will no longer route to it for new sessions.
            """
    )
    @Parameter(name = "id", in = ParameterIn.PATH, required = true,
               description = "Plugin surrogate primary key", example = "2")
    @APIResponses({
        @APIResponse(responseCode = "200", description = "Plugin toggled — returns updated state",
            content = @Content(mediaType = MediaType.APPLICATION_JSON,
                               schema = @Schema(implementation = Plugin.class))),
        @APIResponse(responseCode = "401", description = "Missing or invalid JWT",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @APIResponse(responseCode = "403", description = "Authenticated user lacks ADMIN role",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @APIResponse(responseCode = "404", description = "Plugin not found",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public Plugin toggle(@PathParam("id") Long id) {
        return pluginService.toggleEnabled(id);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private boolean hasAccess(String pluginRoles, java.util.Set<String> userRoles) {
        for (String role : pluginRoles.split(",")) {
            if (userRoles.contains(role.trim())) return true;
        }
        return false;
    }
}
