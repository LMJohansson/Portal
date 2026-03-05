package com.portal.health;

import com.portal.plugin.Plugin;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import org.eclipse.microprofile.health.HealthCheck;
import org.eclipse.microprofile.health.HealthCheckResponse;
import org.eclipse.microprofile.health.Readiness;

@Readiness
@ApplicationScoped
public class PortalHealthCheck implements HealthCheck {

    @Override
    @Transactional
    public HealthCheckResponse call() {
        try {
            long pluginCount = Plugin.count();
            return HealthCheckResponse.named("portal-plugin-registry")
                .up()
                .withData("registeredPlugins", pluginCount)
                .withData("enabledPlugins", Plugin.count("enabled", true))
                .build();
        } catch (Exception e) {
            return HealthCheckResponse.named("portal-plugin-registry")
                .down()
                .withData("error", e.getMessage())
                .build();
        }
    }
}
