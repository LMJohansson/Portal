import { beforeEach, expect, test } from '@rstest/core'
import { usePortalStore } from '../src/store/portalStore'
import type { PluginManifest } from '../src/types/plugin'

const initial = usePortalStore.getInitialState()

beforeEach(() => {
  // Reset to a known baseline between tests (the store is a module singleton).
  usePortalStore.setState(initial, true)
})

test('starts with sensible defaults', () => {
  const s = usePortalStore.getState()
  expect(s.plugins).toEqual([])
  expect(s.pluginsReady).toBe(false)
  expect(s.sidebarOpen).toBe(true)
})

test('setPlugins replaces the plugin list', () => {
  const plugins = [{ pluginId: 'mfe-home', scope: 'mfe_home' }] as unknown as PluginManifest[]
  usePortalStore.getState().setPlugins(plugins)
  expect(usePortalStore.getState().plugins).toBe(plugins)
})

test('setPluginsReady flips the readiness flag', () => {
  usePortalStore.getState().setPluginsReady(true)
  expect(usePortalStore.getState().pluginsReady).toBe(true)
})

test('toggleSidebar inverts sidebarOpen', () => {
  expect(usePortalStore.getState().sidebarOpen).toBe(true)
  usePortalStore.getState().toggleSidebar()
  expect(usePortalStore.getState().sidebarOpen).toBe(false)
  usePortalStore.getState().toggleSidebar()
  expect(usePortalStore.getState().sidebarOpen).toBe(true)
})
