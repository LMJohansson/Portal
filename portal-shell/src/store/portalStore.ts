import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { PluginManifest } from '../types/plugin'

interface PortalStore {
  // ── Plugin Registry ────────────────────────────────────────────────────────
  plugins: PluginManifest[]
  pluginsReady: boolean
  setPlugins: (plugins: PluginManifest[]) => void
  setPluginsReady: (ready: boolean) => void

  // ── UI State ───────────────────────────────────────────────────────────────
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

export const usePortalStore = create<PortalStore>()(
  persist(
    (set) => ({
      // Plugins
      plugins: [],
      pluginsReady: false,
      setPlugins: (plugins) => set({ plugins }),
      setPluginsReady: (ready) => set({ pluginsReady: ready }),

      // UI
      sidebarOpen: true,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: 'portal-store',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
)
