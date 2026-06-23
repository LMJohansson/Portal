import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'
import { pluginTailwindcss } from '@rsbuild/plugin-tailwindcss'
import {
  pluginModuleFederation,
  createModuleFederationConfig,
} from '@module-federation/rsbuild-plugin'

/**
 * Remote (mfe-home) build.
 *
 * Exposes `./Plugin` (the bridge component). `output.injectStyles` inlines this
 * MFE's CSS into JS so its Tailwind styles travel with the federated chunk when
 * the shell loads it (Rspack MF only fetches JS otherwise). `dev.assetPrefix`
 * makes dev chunk URLs absolute so the shell can load them cross-origin; in
 * production the MF runtime resolves chunks relative to remoteEntry.js (auto).
 */
export default defineConfig({
  plugins: [
    pluginReact(),
    pluginTailwindcss(),
    pluginModuleFederation(
      createModuleFederationConfig({
        name: 'mfe_home',
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
    port: 3001,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  dev: {
    assetPrefix: 'http://localhost:3001',
  },
  output: {
    injectStyles: true,
    // Production: resolve async chunk URLs relative to remoteEntry.js (the MFE
    // origin) instead of the document origin (the shell). Without this, Rsbuild
    // defaults publicPath to '/', so federated chunks 404 against the shell.
    // Dev is unaffected — it uses dev.assetPrefix above.
    assetPrefix: 'auto',
  },
})
