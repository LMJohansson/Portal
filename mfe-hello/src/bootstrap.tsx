/**
 * Standalone bootstrap — used when running mfe-hello independently (dev mode).
 * When loaded by the portal shell, only Plugin.tsx is mounted via the bridge.
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelloRoot } from './Plugin'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className="p-6">
      <HelloRoot />
    </div>
  </React.StrictMode>
)
