import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { usePortalStore } from '../store/portalStore'
import { fetchPluginManifest } from '../core/api'

export function Shell() {
  const { setPlugins, sidebarOpen } = usePortalStore()

  const { data: plugins } = useQuery({
    queryKey: ['plugins', 'manifest'],
    queryFn: fetchPluginManifest,
    staleTime: 60_000,
  })

  useEffect(() => {
    if (plugins) setPlugins(plugins)
  }, [plugins, setPlugins])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar />
      <main
        className={`pt-[var(--header-height)] transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'md:pl-[var(--sidebar-width)]' : 'pl-0'}`}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
