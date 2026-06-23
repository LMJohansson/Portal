/**
 * Plugin.tsx — the federated entry point exposed as "./Plugin".
 *
 * See mfe-home/src/Plugin.tsx for an explanation of the bridge wrapping.
 */
import { Routes, Route, Navigate } from 'react-router-dom'
import { createBridgeComponent } from '@module-federation/bridge-react/v19'
import { BrowserRouter } from '@module-federation/bridge-react/router-v7'
import HelloPage from './pages/HelloPage'
import './index.css'

export function HelloRoot() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<HelloPage />} />
        <Route path="*" element={<Navigate to="" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default createBridgeComponent({
  rootComponent: HelloRoot,
})

/** Optional metadata the shell can read */
export const pluginMeta = {
  name: 'mfe-hello',
  version: '1.0.0',
}
