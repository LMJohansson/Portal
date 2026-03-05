/**
 * Plugin.tsx — the federated entry point exposed as "./Plugin".
 *
 * The portal shell imports this component dynamically via Module Federation.
 * Keep this file lean: it just composes pages and routes for this MFE.
 */
import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import './index.css'

export default function HomePlugin() {
  return (
    <Routes>
      <Route index element={<HomePage />} />
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  )
}

/** Optional metadata the shell can read */
export const pluginMeta = {
  name: 'mfe-home',
  version: '1.0.0',
}
