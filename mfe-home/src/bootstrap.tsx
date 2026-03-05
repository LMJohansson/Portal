/**
 * Standalone bootstrap — used when running mfe-home independently (dev mode).
 * When loaded by the portal shell, only Plugin.tsx is mounted.
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import Plugin from './Plugin'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <div className="p-6">
        <Plugin />
      </div>
    </BrowserRouter>
  </React.StrictMode>
)
