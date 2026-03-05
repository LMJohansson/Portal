import axios from 'axios'
import type { PluginManifest } from '../types/plugin'

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT to every request if present
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('portal:token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Redirect to login on 401
apiClient.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('portal:token')
      localStorage.removeItem('portal:user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginPayload {
  username: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  expiresIn: number
  username: string
  fullName: string
  email: string
  roles: string[]
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const res = await apiClient.post<LoginResponse>('/auth/login', payload)
  return res.data
}

// ── Plugins ───────────────────────────────────────────────────────────────────

export async function fetchPluginManifest(): Promise<PluginManifest[]> {
  const res = await apiClient.get<PluginManifest[]>('/plugins/manifest')
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
