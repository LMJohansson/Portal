package com.portal.plugin;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;
import org.jboss.logging.Logger;

import java.util.List;

@ApplicationScoped
public class PluginService {

    private static final Logger LOG = Logger.getLogger(PluginService.class);

    public List<Plugin> findAll() {
        return Plugin.listAll();
    }

    public List<Plugin> findEnabled() {
        return Plugin.findAllEnabled();
    }

    public Plugin findById(Long id) {
        return Plugin.<Plugin>findByIdOptional(id)
            .orElseThrow(() -> new NotFoundException("Plugin not found: " + id));
    }

    public Plugin findByPluginId(String pluginId) {
        Plugin plugin = Plugin.findByPluginId(pluginId);
        if (plugin == null) throw new NotFoundException("Plugin not found: " + pluginId);
        return plugin;
    }

    @Transactional
    public Plugin create(Plugin plugin) {
        if (Plugin.findByPluginId(plugin.pluginId) != null) {
            throw new IllegalArgumentException("Plugin ID already exists: " + plugin.pluginId);
        }
        plugin.persist();
        LOG.infof("Plugin registered: %s (%s)", plugin.name, plugin.pluginId);
        return plugin;
    }

    @Transactional
    public Plugin update(Long id, Plugin updated) {
        Plugin existing = findById(id);
        existing.name = updated.name;
        existing.description = updated.description;
        existing.remoteUrl = updated.remoteUrl;
        existing.scope = updated.scope;
        existing.module = updated.module;
        existing.route = updated.route;
        existing.icon = updated.icon;
        existing.sortOrder = updated.sortOrder;
        existing.enabled = updated.enabled;
        existing.roles = updated.roles;
        LOG.infof("Plugin updated: %s", existing.pluginId);
        return existing;
    }

    @Transactional
    public void delete(Long id) {
        Plugin plugin = findById(id);
        LOG.infof("Plugin deleted: %s", plugin.pluginId);
        plugin.delete();
    }

    @Transactional
    public Plugin toggleEnabled(Long id) {
        Plugin plugin = findById(id);
        plugin.enabled = !plugin.enabled;
        LOG.infof("Plugin %s: %s", plugin.pluginId, plugin.enabled ? "enabled" : "disabled");
        return plugin;
    }
}
