import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from 'react-oidc-context'

export default function LoginPage() {
  const { isAuthenticated, isLoading, signinRedirect } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        navigate('/', { replace: true })
      } else {
        signinRedirect()
      }
    }
  }, [isAuthenticated, isLoading, signinRedirect, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-900 to-brand-700 flex items-center justify-center">
      <div className="card p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl font-bold">P</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Enterprise Portal</h1>
        <p className="text-gray-500 text-sm mt-2 animate-pulse">Redirecting to sign in…</p>
      </div>
    </div>
  )
}
