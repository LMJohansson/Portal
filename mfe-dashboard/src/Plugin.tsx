import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import './index.css'

export default function DashboardPlugin() {
  return (
    <Routes>
      <Route index element={<DashboardPage />} />
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  )
}

export const pluginMeta = {
  name: 'mfe-dashboard',
  version: '1.0.0',
}
