/**
 * PluginLoader — dynamic Module Federation loader.
 *
 * Uses @module-federation/enhanced/runtime to:
 *   1. Register the remote at the given URL (once per scope)
 *   2. Load the exposed module
 *   3. Return the default React component
 *
 * All loaded modules are cached to avoid redundant network requests.
 */
import { registerRemotes, loadRemote } from '@module-federation/runtime'
import type { PluginManifest } from '../types/plugin'

const registeredScopes = new Set<string>()
const moduleCache = new Map<string, React.ComponentType>()

export async function loadPlugin(plugin: PluginManifest): Promise<React.ComponentType> {
  const cacheKey = `${plugin.scope}/${plugin.module}`

  if (moduleCache.has(cacheKey)) {
    return moduleCache.get(cacheKey)!
  }

  if (!registeredScopes.has(plugin.scope)) {
    registerRemotes([{
      name: plugin.scope,
      entry: plugin.remoteUrl,
      type: 'module',
    }])
    registeredScopes.add(plugin.scope)
  }

  // loadRemote expects "scope/Module" — strip the "./" prefix from plugin.module
  // e.g. "./Plugin" → "Plugin"
  const modulePath = plugin.module.replace(/^\.\//, '')
  const mod = await loadRemote<{ default: React.ComponentType }>(`${plugin.scope}/${modulePath}`)
  if (!mod) throw new Error(`Module "${plugin.scope}/${modulePath}" did not load`)
  const Component = mod.default

  moduleCache.set(cacheKey, Component)
  return Component
}

/** Invalidate cached module (e.g. after hot-reload in dev) */
export function evictPlugin(scope: string, module: string): void {
  moduleCache.delete(`${scope}/${module}`)
  registeredScopes.delete(scope)
}
