-- Plugin registry (users are managed by Keycloak)
INSERT INTO plugin (plugin_id, name, description, remote_url, scope, module, route, icon, sort_order, enabled, roles, created_at, updated_at)
VALUES
    ('mfe-home',      'Home',      'Portal home page',    'http://localhost:3001/remoteEntry.js', 'mfe_home',      './Plugin', '/home',      'home',      1, true, 'USER,ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('mfe-dashboard', 'Dashboard', 'Analytics dashboard', 'http://localhost:3002/remoteEntry.js', 'mfe_dashboard', './Plugin', '/dashboard', 'bar-chart', 2, true, 'USER,ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('mfe-hello',     'Hello',     'Hello World example', 'http://localhost:3003/remoteEntry.js', 'mfe_hello',     './Plugin', '/hello',     'hand',      3, true, 'USER,ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
