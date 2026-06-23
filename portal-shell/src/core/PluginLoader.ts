/**
 * PluginLoader — registers a federated remote with the MF runtime and
 * returns a loader for its bridge module.
 *
 * The loader resolves to the MFE's bridge entry (the object returned by
 * `createBridgeComponent`). `createRemoteAppComponent` from
 * `@module-federation/bridge-react` consumes the loader and handles the
 * mount / unmount lifecycle.
 */
import { registerRemotes, loadRemote } from '@module-federation/runtime'
import type { PluginManifest } from '../types/plugin'

const registeredScopes = new Set<string>()

function ensureRegistered(plugin: PluginManifest): void {
  if (registeredScopes.has(plugin.scope)) return
  registerRemotes([
    {
      name: plugin.scope,
      entry: plugin.remoteUrl,
      // Rspack / @module-federation/rsbuild-plugin emits a "global"-format
      // remoteEntry.js (mf-manifest.json → remoteEntry.type === "global"),
      // not the ESM "module" format Vite produced. Mismatch here surfaces at
      // runtime as RUNTIME-002 "remote entry interface does not contain init".
      type: 'global',
    },
  ])
  registeredScopes.add(plugin.scope)
}

export function loadPluginModule(plugin: PluginManifest): Promise<unknown> {
  ensureRegistered(plugin)
  // loadRemote expects "scope/Module" — strip the "./" prefix from plugin.module
  // (e.g. "./Plugin" → "Plugin")
  const modulePath = plugin.module.replace(/^\.\//, '')
  return loadRemote(`${plugin.scope}/${modulePath}`) as Promise<unknown>
}
