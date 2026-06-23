import type { RsbuildConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'
import { pluginTailwindcss } from '@rsbuild/plugin-tailwindcss'
import {
  pluginModuleFederation,
  createModuleFederationConfig,
} from '@module-federation/rsbuild-plugin'

/**
 * Remote (mfe-hello) build. See mfe-home/rsbuild.config.ts for the rationale
 * behind injectStyles and assetPrefix.
 */
const config: RsbuildConfig = {
  plugins: [
    pluginReact(),
    pluginTailwindcss(),
    pluginModuleFederation(
      createModuleFederationConfig({
        name: 'mfe_hello',
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
    port: 3003,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  dev: {
    assetPrefix: 'http://localhost:3003',
  },
  output: {
    injectStyles: true,
  },
}

export default config
