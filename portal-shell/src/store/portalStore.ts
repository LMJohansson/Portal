import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AuthUser, PluginManifest } from '../types/plugin'

interface PortalStore {
  // ── Auth ───────────────────────────────────────────────────────────────────
  token: string | null
  user: AuthUser | null
  setAuth: (token: string, user: AuthUser) => void
  clearAuth: () => void
  isAuthenticated: () => boolean
  hasRole: (role: string) => boolean

  // ── Plugin Registry ────────────────────────────────────────────────────────
  plugins: PluginManifest[]
  setPlugins: (plugins: PluginManifest[]) => void

  // ── UI State ───────────────────────────────────────────────────────────────
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

export const usePortalStore = create<PortalStore>()(
  persist(
    (set, get) => ({
      // Auth
      token: null,
      user: null,
      setAuth: (token, user) => {
        localStorage.setItem('portal:token', token)
        set({ token, user })
      },
      clearAuth: () => {
        localStorage.removeItem('portal:token')
        set({ token: null, user: null })
      },
      isAuthenticated: () => get().token !== null,
      hasRole: (role) => get().user?.roles.includes(role) ?? false,

      // Plugins
      plugins: [],
      setPlugins: (plugins) => set({ plugins }),

      // UI
      sidebarOpen: true,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: 'portal-store',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
)
