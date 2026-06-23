import { Routes, Route, Navigate } from 'react-router-dom'
import { createBridgeComponent } from '@module-federation/bridge-react/v19'
import { BrowserRouter } from '@module-federation/bridge-react/router-v7'
import DashboardPage from './pages/DashboardPage'
import './index.css'

export function DashboardRoot() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<DashboardPage />} />
        <Route path="*" element={<Navigate to="" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default createBridgeComponent({
  rootComponent: DashboardRoot,
})

export const pluginMeta = {
  name: 'mfe-dashboard',
  version: '1.0.0',
}
