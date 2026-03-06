import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { usePortalStore } from '../store/portalStore'
import { fetchPluginManifest } from '../core/api'

export function Shell() {
  const { setPlugins, setPluginsReady, sidebarOpen } = usePortalStore()

  const { data: plugins, isPending, isError } = useQuery({
    queryKey: ['plugins', 'manifest'],
    queryFn: fetchPluginManifest,
    staleTime: 60_000,
  })

  useEffect(() => {
    if (plugins !== undefined) {
      setPlugins(plugins)
      setPluginsReady(true)
    }
  }, [plugins, setPlugins, setPluginsReady])

  const outlet = isPending
    ? <div className="flex items-center justify-center h-40 animate-pulse text-gray-400">Loading…</div>
    : isError
      ? <div className="flex items-center justify-center h-40 text-red-500">Failed to load plugins — is the API running?</div>
      : <Outlet />

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar />
      <main
        className={`pt-[var(--header-height)] transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'md:pl-[var(--sidebar-width)]' : 'pl-0'}`}
      >
        <div className="p-6">
          {outlet}
        </div>
      </main>
    </div>
  )
}
