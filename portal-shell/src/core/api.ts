import axios, { type InternalAxiosRequestConfig } from 'axios'
import { userManager } from '../auth/userManager'
import type { PluginManifest } from '../types/plugin'

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

// Authenticated client — attaches Bearer token to every request.
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use(async (config) => {
  const user = await userManager.getUser()
  if (user?.access_token && !user.expired) {
    config.headers.Authorization = `Bearer ${user.access_token}`
  }
  return config
})

// On 401, attempt a silent token refresh (uses the refresh token — no redirect).
// If the refresh succeeds the original request is retried once with the new token.
// If it fails (e.g. Keycloak restarted and invalidated all sessions), the stale
// user is cleared so react-oidc-context triggers an interactive login on next render.
apiClient.interceptors.response.use(
  (r) => r,
  async (err) => {
    const config = err.config as InternalAxiosRequestConfig & { _retry?: boolean }
    if (err.response?.status === 401 && !config._retry) {
      config._retry = true
      try {
        await userManager.signinSilent()
      } catch {
        // Refresh token invalid (e.g. Keycloak restarted) — force re-login.
        await userManager.removeUser()
        return Promise.reject(err)
      }
      // signinSilent succeeded — retry once with the fresh token.
      return apiClient.request(config)
    }
    return Promise.reject(err)
  },
)

// Unauthenticated client — used for @PermitAll endpoints.
// Never sends a Bearer token so a stale/rotated token cannot trigger a 401.
const publicClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ── Plugins ───────────────────────────────────────────────────────────────────

export async function fetchPluginManifest(): Promise<PluginManifest[]> {
  const res = await publicClient.get<PluginManifest[]>('/plugins/manifest')
  return res.data
}

export async function fetchAllPlugins(): Promise<PluginManifest[]> {
  const res = await apiClient.get<PluginManifest[]>('/plugins')
  return res.data
}

export async function createPlugin(plugin: Omit<PluginManifest, 'id'>): Promise<PluginManifest> {
  const res = await apiClient.post<PluginManifest>('/plugins', plugin)
  return res.data
}

export async function updatePlugin(id: number, plugin: Partial<PluginManifest>): Promise<PluginManifest> {
  const res = await apiClient.put<PluginManifest>(`/plugins/${id}`, plugin)
  return res.data
}

export async function deletePlugin(id: number): Promise<void> {
  await apiClient.delete(`/plugins/${id}`)
}

export async function togglePlugin(id: number): Promise<PluginManifest> {
  const res = await apiClient.patch<PluginManifest>(`/plugins/${id}/toggle`)
  return res.data
}
