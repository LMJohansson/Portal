import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'
import { pluginTailwindcss } from '@rsbuild/plugin-tailwindcss'
import {
  pluginModuleFederation,
  createModuleFederationConfig,
} from '@module-federation/rsbuild-plugin'

/**
 * Remote (mfe-dashboard) build. See mfe-home/rsbuild.config.ts for the
 * rationale behind injectStyles and assetPrefix.
 */
export default defineConfig({
  plugins: [
    pluginReact(),
    pluginTailwindcss(),
    pluginModuleFederation(
      createModuleFederationConfig({
        name: 'mfe_dashboard',
        filename: 'remoteEntry.js',
        exposes: {
          './Plugin': './src/Plugin',
        },
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
    port: 3002,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  dev: {
    assetPrefix: 'http://localhost:3002',
  },
  output: {
    injectStyles: true,
  },
})
