/**
 * Plugin.tsx — the federated entry point exposed as "./Plugin".
 *
 * The portal shell imports this component dynamically via Module Federation.
 * Keep this file lean: it just composes pages and routes for this MFE.
 */
import { Routes, Route, Navigate } from 'react-router-dom'
import HelloPage from './pages/HelloPage'
import './index.css'

export default function HelloPlugin() {
  return (
    <Routes>
      <Route index element={<HelloPage />} />
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  )
}

/** Optional metadata the shell can read */
export const pluginMeta = {
  name: 'mfe-hello',
  version: '1.0.0',
}
