import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { Shell } from './components/Shell'
import { DynamicRemote } from './core/DynamicRemote'
import { usePortalStore } from './store/portalStore'
import NotFoundPage from './pages/NotFoundPage'
import LoginPage from './pages/LoginPage'

const AdminPluginsPage = lazy(() => import('./pages/AdminPluginsPage'))

function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = usePortalStore((s) => s.isAuthenticated())
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function RequireRole({ role, children }: { role: string; children: React.ReactNode }) {
  const hasRole = usePortalStore((s) => s.hasRole(role))
  if (!hasRole) return <Navigate to="/home" replace />
  return <>{children}</>
}

export default function App() {
  const plugins = usePortalStore((s) => s.plugins)
  const firstPlugin = plugins[0]

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          element={
            <RequireAuth>
              <Shell />
            </RequireAuth>
          }
        >
          {/* Redirect root to first registered plugin or /home */}
          <Route
            index
            element={<Navigate to={firstPlugin?.route ?? '/home'} replace />}
          />

          {/* Admin routes */}
          <Route
            path="/admin/plugins"
            element={
              <RequireRole role="ADMIN">
                <Suspense fallback={<div className="animate-pulse p-6">Loading…</div>}>
                  <AdminPluginsPage />
                </Suspense>
              </RequireRole>
            }
          />

          {/* Dynamically registered MFE routes — inlined so React Router sees <Route> elements directly */}
          {plugins.map((plugin) => (
            <Route
              key={plugin.pluginId}
              path={`${plugin.route}/*`}
              element={<DynamicRemote plugin={plugin} />}
            />
          ))}

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
