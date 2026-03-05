package com.portal.plugin;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.eclipse.microprofile.openapi.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "plugin", uniqueConstraints = @UniqueConstraint(columnNames = "plugin_id"))
@Schema(name = "Plugin", description = "A registered micro-frontend plugin in the portal registry")
public class Plugin extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @NotBlank
    @Size(max = 100)
    @Pattern(regexp = "^[a-z][a-z0-9-]*$", message = "Plugin ID must be lowercase alphanumeric with hyphens")
    @Column(name = "plugin_id", nullable = false, unique = true, length = 100)
    @Schema(description = "Unique slug identifier for the plugin. Must be lowercase alphanumeric with hyphens.",
            example = "mfe-reports", pattern = "^[a-z][a-z0-9-]*$", maxLength = 100, required = true)
    public String pluginId;

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    @Schema(description = "Human-readable display name shown in the sidebar navigation",
            example = "Reports", maxLength = 100, required = true)
    public String name;

    @Size(max = 500)
    @Schema(description = "Optional description shown in the admin plugin registry",
            example = "Financial reporting and data export micro-frontend", maxLength = 500)
    public String description;

    @NotBlank
    @Column(name = "remote_url", nullable = false)
    @Schema(description = "Absolute URL to the Module Federation remoteEntry.js file",
            example = "http://localhost:3003/assets/remoteEntry.js", required = true)
    public String remoteUrl;

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    @Schema(description = "Module Federation scope name — must exactly match the `name` field in the MFE's vite.config federation config",
            example = "mfe_reports", maxLength = 100, required = true)
    public String scope;

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    @Schema(description = "Exposed module path as declared in the MFE's `exposes` config",
            example = "./Plugin", maxLength = 100, required = true)
    public String module;

    @NotBlank
    @Column(nullable = false, length = 200)
    @Schema(description = "React Router path at which this plugin is mounted in the shell",
            example = "/reports", maxLength = 200, required = true)
    public String route;

    @Size(max = 50)
    @Schema(description = "Lucide-react icon name rendered in the sidebar navigation",
            example = "bar-chart", maxLength = 50)
    public String icon;

    @Column(name = "sort_order", nullable = false)
    @Schema(description = "Ascending sort order for sidebar display. Lower values appear first.",
            example = "10", defaultValue = "100")
    public int sortOrder = 100;

    @Column(nullable = false)
    @Schema(description = "Whether this plugin is active and included in the manifest",
            example = "true", defaultValue = "true")
    public boolean enabled = true;

    @Column(length = 500)
    @Schema(description = "Comma-separated list of roles that are allowed to see and load this plugin. Empty means unrestricted.",
            example = "USER,ADMIN", maxLength = 500)
    public String roles;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Schema(description = "UTC timestamp when the plugin was registered", readOnly = true,
            example = "2026-01-15T10:30:00")
    public LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    @Schema(description = "UTC timestamp of the last modification", readOnly = true,
            example = "2026-02-01T08:00:00")
    public LocalDateTime updatedAt;

    @PrePersist
    void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public static List<Plugin> findAllEnabled() {
        return list("enabled = true ORDER BY sortOrder ASC");
    }

    public static Plugin findByPluginId(String pluginId) {
        return find("pluginId", pluginId).firstResult();
    }
}
