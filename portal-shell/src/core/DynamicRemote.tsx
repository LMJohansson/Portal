import { useMemo } from 'react'
import { Loader2 } from 'lucide-react'
import { createRemoteAppComponent } from '@module-federation/bridge-react'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { loadPluginModule } from './PluginLoader'
import type { PluginManifest } from '../types/plugin'

interface Props {
  plugin: PluginManifest
}

/**
 * DynamicRemote — renders a federated micro-frontend through
 * `@module-federation/bridge-react`.
 *
 * Each MFE is bridge-wrapped on its own side, so it owns its React root and
 * its own router. The bridge mounts it into a host div and forwards
 * `basename` so the MFE's BrowserRouter scopes to the plugin route.
 */
export function DynamicRemote({ plugin }: Props) {
  // Stable per (scope, remoteUrl, module) — rebuilds only on hot updates of
  // the remote entry. The bridge caches the module internally.
  const Remote = useMemo(
    () =>
      createRemoteAppComponent({
        loader: () =>
          loadPluginModule(plugin) as Promise<{ default: unknown }>,
        loading: <PluginLoadingSpinner name={plugin.name} />,
        fallback: ({ error }: { error?: Error }) => (
          <div className="p-6 text-red-600">
            Failed to load <strong>{plugin.name}</strong>:{' '}
            {error?.message ?? String(error)}
          </div>
        ),
      }),
    [plugin.scope, plugin.remoteUrl, plugin.module, plugin.name]
  )

  return (
    <ErrorBoundary pluginName={plugin.name}>
      <Remote basename={plugin.route} />
    </ErrorBoundary>
  )
}

function PluginLoadingSpinner({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-center min-h-[300px] gap-3 text-gray-400">
      <Loader2 className="w-6 h-6 animate-spin" />
      <span className="text-sm">Loading {name}…</span>
    </div>
  )
}
