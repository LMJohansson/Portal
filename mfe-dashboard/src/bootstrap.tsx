import React from 'react'
import ReactDOM from 'react-dom/client'
import { DashboardRoot } from './Plugin'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className="p-6">
      <DashboardRoot />
    </div>
  </React.StrictMode>
)
