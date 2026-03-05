import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { federation } from '@module-federation/vite'
import cssInjectedByJs from 'vite-plugin-css-injected-by-js'

const fixMF2CjsNaming = {
  name: 'fix-mf2-cjs-naming-conflict',
  enforce: 'post' as const,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  generateBundle(_: any, bundle: any) {
    for (const key in bundle) {
      const chunk = bundle[key]
      if (chunk.type !== 'chunk' || !chunk.code) continue
      if (chunk.code.indexOf('{r as require$0}') !== -1 && chunk.code.indexOf('require$$0') !== -1) {
        chunk.code = chunk.code.replace(/\{r as require\$0\}/g, () => '{r as require$$0}')
      }
    }
  },
}

export default defineConfig({
  plugins: [
    react(),
    cssInjectedByJs(),
    federation({
      name: 'mfe_hello',
      filename: 'remoteEntry.js',
      exposes: {
        './Plugin': './src/Plugin',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^19.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
        'react-router-dom': { singleton: true, requiredVersion: '^6.22.3' },
      },
    }),
    fixMF2CjsNaming,
  ],
  server: {
    port: 3003,
    cors: true,
  },
  preview: {
    port: 3003,
    cors: true,
  },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
})
