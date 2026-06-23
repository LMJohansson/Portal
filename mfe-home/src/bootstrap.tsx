/**
 * Standalone bootstrap — used when running mfe-home independently (dev mode).
 * When loaded by the portal shell, only Plugin.tsx is mounted via the bridge.
 *
 * The default export of Plugin.tsx is now the bridge component (not a React
 * component), so we import the raw root component to render it directly.
 * The root brings its own BrowserRouter, so no outer router is needed here.
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import { HomeRoot } from './Plugin'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className="p-6">
      <HomeRoot />
    </div>
  </React.StrictMode>
)
