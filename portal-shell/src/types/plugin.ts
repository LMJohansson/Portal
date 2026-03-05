/** Represents a micro-frontend plugin as returned by the portal API */
export interface PluginManifest {
  id: number
  pluginId: string
  name: string
  description: string
  /** Full URL to the Module Federation remoteEntry.js */
  remoteUrl: string
  /** Module Federation scope (must match vite.config federation name in the MFE) */
  scope: string
  /** Exposed module path, e.g. "./Plugin" */
  module: string
  /** React Router route path, e.g. "/home" */
  route: string
  icon: string
  sortOrder: number
  enabled: boolean
  roles: string
}

/** The React component that every MFE must expose from its "./Plugin" module */
export interface PluginComponent {
  default: React.ComponentType
  /** Optional metadata the MFE can export alongside the component */
  pluginMeta?: {
    name?: string
    version?: string
  }
}

export interface AuthUser {
  username: string
  fullName: string
  email: string
  roles: string[]
}

export interface AuthState {
  token: string | null
  user: AuthUser | null
}
