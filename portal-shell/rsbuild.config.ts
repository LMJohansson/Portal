import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'
import { pluginTailwindcss } from '@rsbuild/plugin-tailwindcss'
import {
  pluginModuleFederation,
  createModuleFederationConfig,
} from '@module-federation/rsbuild-plugin'

/**
 * Host (portal-shell) build.
 *
 * Remotes are NOT declared here — the shell registers them at runtime via
 * `registerRemotes()` from `@module-federation/runtime`, driven by the plugin
 * manifest API. Only the shared singletons are declared so host and remotes
 * resolve the same React / Router / bridge instances.
 */
export default defineConfig({
  plugins: [
    pluginReact(),
    pluginTailwindcss(),
    pluginModuleFederation(
      createModuleFederationConfig({
        name: 'portal_shell',
        shared: {
          react: { singleton: true, requiredVersion: '^19.0.0' },
          'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
          '@module-federation/bridge-react': { singleton: true },
        },
      }),
    ),
  ],
  source: {
    entry: { index: './src/main.tsx' },
  },
  html: {
    template: './index.html',
  },
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
