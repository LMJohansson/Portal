import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
  pluginName?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[Portal] MFE render error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-gray-500">
          <AlertTriangle className="w-12 h-12 text-amber-400" />
          <div className="text-center">
            <p className="font-semibold text-gray-700 mb-1">
              {this.props.pluginName
                ? `Failed to load "${this.props.pluginName}"`
                : 'Something went wrong'}
            </p>
            <p className="text-sm text-gray-400 max-w-xs">
              {this.state.error?.message ?? 'An unexpected error occurred.'}
            </p>
          </div>
          <button
            className="btn-ghost text-sm"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
