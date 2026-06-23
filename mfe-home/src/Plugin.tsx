/**
 * Plugin.tsx — the federated entry point exposed as "./Plugin".
 *
 * Wrapped with `createBridgeComponent` so the shell consumes this MFE through
 * `@module-federation/bridge-react`. The bridge gives the MFE its own React
 * root and isolates its router, while still synchronising basename and the
 * browser URL with the host shell.
 *
 * `BrowserRouter` is imported from the bridge's router-v7 entry (react-router 7)
 * so basename is read from the bridge runtime context when mounted by the shell,
 * and falls back to the standalone basename when running via bootstrap.tsx. The
 * bridge APIs come from the `/v19` entry, which targets React 19's createRoot.
 */
import { Routes, Route, Navigate } from 'react-router-dom'
import { createBridgeComponent } from '@module-federation/bridge-react/v19'
import { BrowserRouter } from '@module-federation/bridge-react/router-v7'
import HomePage from './pages/HomePage'
import './index.css'

export function HomeRoot() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<HomePage />} />
        <Route path="*" element={<Navigate to="" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default createBridgeComponent({
  rootComponent: HomeRoot,
})

/** Optional metadata the shell can read */
export const pluginMeta = {
  name: 'mfe-home',
  version: '1.0.0',
}
