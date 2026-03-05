import React, { Suspense, lazy } from 'react'
import { Loader2 } from 'lucide-react'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { loadPlugin } from './PluginLoader'
import type { PluginManifest } from '../types/plugin'

interface Props {
  plugin: PluginManifest
}

/**
 * DynamicRemote — renders a federated micro-frontend.
 *
 * Wraps the lazy-loaded MFE component in:
 *   - React.Suspense  → shows a spinner while the remote loads
 *   - ErrorBoundary   → catches render errors in the remote
 */
export function DynamicRemote({ plugin }: Props) {
  // lazy() is called outside render in a ref so the factory is stable
  const LazyComponent = React.useMemo(
    () =>
      lazy(async () => {
        const Component = await loadPlugin(plugin)
        return { default: Component }
      }),
    // Rebuild only if the remote URL changes (e.g. hot update)
    [plugin.scope, plugin.remoteUrl, plugin.module]
  )

  return (
    <ErrorBoundary pluginName={plugin.name}>
      <Suspense fallback={<PluginLoadingSpinner name={plugin.name} />}>
        <LazyComponent />
      </Suspense>
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
