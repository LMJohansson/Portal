-- Default users (passwords are bcrypt hashed: "admin123" and "user123")
INSERT INTO portal_user (username, password_hash, full_name, email, roles, enabled, created_at)
VALUES
    ('admin', '$2a$10$GeKsQmfn6D.LkCZCU7ExG.Bq/OPpCbRY9TWeMTCFJzX/liZzvVFEy', 'Admin User',    'admin@portal.example.com', 'ADMIN,USER', true, CURRENT_TIMESTAMP),
    ('user',  '$2a$10$DjfeIpXcxPzIPlOqgjQul.jgNS6Rck0yew/pZQQrti55WTuW8ty0S', 'Regular User', 'user@portal.example.com',  'USER',       true, CURRENT_TIMESTAMP);

-- Default plugin registry
INSERT INTO plugin (plugin_id, name, description, remote_url, scope, module, route, icon, sort_order, enabled, roles, created_at, updated_at)
VALUES
    ('mfe-home',      'Home',      'Portal home page',    'http://localhost:3001/remoteEntry.js', 'mfe_home',      './Plugin', '/home',      'home',      1, true, 'USER,ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('mfe-dashboard', 'Dashboard', 'Analytics dashboard', 'http://localhost:3002/remoteEntry.js', 'mfe_dashboard', './Plugin', '/dashboard', 'bar-chart', 2, true, 'USER,ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('mfe-hello',     'Hello',     'Hello World example', 'http://localhost:3003/remoteEntry.js', 'mfe_hello',     './Plugin', '/hello',     'hand',      3, true, 'USER,ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
