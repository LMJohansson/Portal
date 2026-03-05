import {
  Home, BarChart2, Settings, Shield, ChevronRight,
  type LucideIcon
} from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { usePortalStore } from '../store/portalStore'
import type { PluginManifest } from '../types/plugin'

/** Maps icon name strings (from the API) to Lucide components */
const ICON_MAP: Record<string, LucideIcon> = {
  home: Home,
  'bar-chart': BarChart2,
  settings: Settings,
  shield: Shield,
}

function PluginIcon({ name }: { name: string }) {
  const Icon = ICON_MAP[name] ?? ChevronRight
  return <Icon className="w-5 h-5 flex-shrink-0" />
}

interface NavItemProps {
  plugin: PluginManifest
}

function NavItem({ plugin }: NavItemProps) {
  const location = useLocation()
  const isActive = location.pathname.startsWith(plugin.route)

  return (
    <NavLink
      to={plugin.route}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
        transition-colors group
        ${isActive
          ? 'bg-brand-50 text-brand-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
    >
      <span className={isActive ? 'text-brand-600' : 'text-gray-400 group-hover:text-gray-600'}>
        <PluginIcon name={plugin.icon} />
      </span>
      <span className="truncate">{plugin.name}</span>
      {isActive && <ChevronRight className="w-3 h-3 ml-auto text-brand-500" />}
    </NavLink>
  )
}

export function Sidebar() {
  const { plugins, sidebarOpen, hasRole } = usePortalStore()

  return (
    <>
      {/* Backdrop (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20 md:hidden"
          onClick={() => usePortalStore.getState().setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-[var(--header-height)] bottom-0 z-30
          bg-white border-r border-gray-200 flex flex-col
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-[var(--sidebar-width)]' : 'w-0 overflow-hidden'}`}
      >
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Applications
          </p>
          {plugins.map((plugin) => (
            <NavItem key={plugin.pluginId} plugin={plugin} />
          ))}
        </nav>

        {/* Admin section */}
        {hasRole('ADMIN') && (
          <div className="p-3 border-t border-gray-100">
            <p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Admin
            </p>
            <NavLink
              to="/admin/plugins"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive ? 'bg-amber-50 text-amber-700' : 'text-gray-600 hover:bg-gray-100'}`
              }
            >
              <Shield className="w-5 h-5 flex-shrink-0" />
              Plugin Registry
            </NavLink>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">Enterprise Portal v1.0.0</p>
        </div>
      </aside>
    </>
  )
}
