import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';
// @module-federation/vite injects CJS proxy imports (e.g. "import{r as require$0}...")
// in its generateBundle hook. Rollup's CJS transform for packages like react-dom
// already uses "require$$0" (double $) internally for the same module. This plugin
// runs after federation's generateBundle and renames the import alias to match.
var fixMF2CjsNaming = {
    name: 'fix-mf2-cjs-naming-conflict',
    enforce: 'post',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    generateBundle: function (_, bundle) {
        for (var key in bundle) {
            var chunk = bundle[key];
            if (chunk.type !== 'chunk' || !chunk.code)
                continue;
            if (chunk.code.indexOf('{r as require$0}') !== -1 && chunk.code.indexOf('require$$0') !== -1) {
                chunk.code = chunk.code.replace(/\{r as require\$0\}/g, function () { return '{r as require$$0}'; });
            }
        }
    },
};
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        tailwindcss(),
        react(),
        federation({
            name: 'portal_shell',
            // Remotes are loaded dynamically at runtime via the plugin registry API.
            // Do NOT add remotes here — the shell uses registerRemotes() at runtime.
            remotes: {},
            shared: {
                react: { singleton: true, requiredVersion: '^19.0.0' },
                'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
                'react-router-dom': { singleton: true, requiredVersion: '^6.22.3' },
            },
        }),
        fixMF2CjsNaming,
    ],
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
            },
        },
    },
    build: {
        target: 'esnext',
        minify: false,
        cssCodeSplit: false,
    },
});
