import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from 'react-oidc-context'
import { lazy, Suspense, useEffect, useRef } from 'react'
import { Shell } from './components/Shell'
import { DynamicRemote } from './core/DynamicRemote'
import { usePortalStore } from './store/portalStore'
import { userManager } from './auth/userManager'
import NotFoundPage from './pages/NotFoundPage'
import CallbackPage from './pages/CallbackPage'

const AdminPluginsPage = lazy(() => import('./pages/AdminPluginsPage'))

function RequireAuth({ children }: { children: React.ReactNode }) {
  const auth = useAuth()
  // Prevent calling signinRedirect() more than once per mount, and bail out
  // while a navigation is already in flight (activeNavigator is set).
  const didRedirect = useRef(false)

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated && !auth.activeNavigator && !didRedirect.current) {
      didRedirect.current = true
      void auth.signinRedirect()
    }
  }, [auth])

  if (auth.isLoading || auth.activeNavigator || !auth.isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center animate-pulse text-gray-400">Loading…</div>
  }
  return <>{children}</>
}

function RequireRole({ role, children }: { role: string; children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const groups = (user?.profile?.groups as string[] | undefined) ?? []
  if (isLoading) return null
  if (!groups.includes(role)) return <Navigate to="/home" replace />
  return <>{children}</>
}

function IndexRedirect() {
  const plugins = usePortalStore((s) => s.plugins)
  const pluginsReady = usePortalStore((s) => s.pluginsReady)
  if (!pluginsReady) {
    // Shell is fetching plugins — wait so we don't land on a non-existent route
    return null
  }
  if (plugins.length === 0) {
    return <div className="p-6 text-gray-500">No plugins available.</div>
  }
  return <Navigate to={plugins[0].route} replace />
}

function AppRoutes() {
  const plugins = usePortalStore((s) => s.plugins)

  return (
    <Routes>
      <Route path="/callback" element={<CallbackPage />} />

      <Route
        element={
          <RequireAuth>
            <Shell />
          </RequireAuth>
        }
      >
        <Route
          index
          element={<IndexRedirect />}
        />

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
  )
}

// AuthProvider lives inside BrowserRouter so CallbackPage can use useNavigate.
// onSigninCallback only cleans the URL — it must NOT navigate, because at that
// point the auth state has not yet been committed to React context.  Navigation
// is handled by CallbackPage's useEffect, which fires after isAuthenticated=true.
function AuthWrapper() {
  return (
    <AuthProvider
      userManager={userManager}
      onSigninCallback={() => window.history.replaceState({}, '', '/callback')}
    >
      <AppRoutes />
    </AuthProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthWrapper />
    </BrowserRouter>
  )
}
