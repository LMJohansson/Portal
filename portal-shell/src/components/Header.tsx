import { Menu, Bell, LogOut, User, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from 'react-oidc-context'
import { usePortalStore } from '../store/portalStore'

export function Header() {
  const { user, signoutRedirect } = useAuth()
  const { toggleSidebar } = usePortalStore()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const fullName = user?.profile.name ?? user?.profile.preferred_username ?? ''
  const email = user?.profile.email ?? ''
  const username = user?.profile.preferred_username ?? ''
  const roles = (user?.profile?.groups as string[] | undefined) ?? []

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 h-[var(--header-height)]
        bg-white border-b border-gray-200 flex items-center px-4 gap-3 shadow-sm"
    >
      {/* Sidebar toggle */}
      <button className="btn-ghost p-2" onClick={toggleSidebar} aria-label="Toggle sidebar">
        <Menu className="w-5 h-5" />
      </button>

      {/* Brand */}
      <div className="flex items-center gap-2 flex-1">
        <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
          <span className="text-white text-xs font-bold">P</span>
        </div>
        <span className="font-semibold text-gray-900 hidden sm:block">Enterprise Portal</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button className="btn-ghost p-2 relative" aria-label="Notifications">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            className="btn-ghost flex items-center gap-2 pl-2 pr-3"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
              <User className="w-4 h-4 text-brand-700" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-900 leading-tight">{fullName}</p>
              <p className="text-xs text-gray-400">{roles.join(', ')}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-gray-200 shadow-lg z-50 py-1">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium">{username}</p>
                  <p className="text-xs text-gray-400">{email}</p>
                </div>
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600
                    hover:bg-red-50 transition-colors"
                  onClick={() => signoutRedirect()}
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
