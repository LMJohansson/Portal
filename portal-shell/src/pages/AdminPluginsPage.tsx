import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, ToggleLeft, ToggleRight, ExternalLink } from 'lucide-react'
import { fetchAllPlugins, deletePlugin, togglePlugin, createPlugin } from '../core/api'
import type { PluginManifest } from '../types/plugin'

export default function AdminPluginsPage() {
  const qc = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)

  const { data: plugins = [], isLoading } = useQuery({
    queryKey: ['plugins', 'all'],
    queryFn: fetchAllPlugins,
  })

  const deleteMut = useMutation({
    mutationFn: deletePlugin,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['plugins'] })
    },
  })

  const toggleMut = useMutation({
    mutationFn: togglePlugin,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plugins'] }),
  })

  if (isLoading) return <div className="animate-pulse text-gray-400">Loading plugins…</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plugin Registry</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage micro-frontend plugins dynamically
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4" />
          Register Plugin
        </button>
      </div>

      {showCreate && (
        <CreatePluginForm
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false)
            qc.invalidateQueries({ queryKey: ['plugins'] })
          }}
        />
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Name', 'Route', 'Remote URL', 'Scope', 'Roles', 'Order', 'Status', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {plugins.map((plugin) => (
              <tr key={plugin.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{plugin.name}</p>
                  <p className="text-xs text-gray-400">{plugin.pluginId}</p>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{plugin.route}</td>
                <td className="px-4 py-3 max-w-[200px]">
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-xs text-gray-500 truncate">{plugin.remoteUrl}</span>
                    <a href={plugin.remoteUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    </a>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{plugin.scope}</td>
                <td className="px-4 py-3">
                  {plugin.roles?.split(',').map((r) => (
                    <span key={r} className="inline-flex px-1.5 py-0.5 text-xs bg-blue-50 text-blue-700 rounded mr-1">
                      {r.trim()}
                    </span>
                  ))}
                </td>
                <td className="px-4 py-3 text-gray-600">{plugin.sortOrder}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 text-xs rounded-full font-medium
                    ${plugin.enabled ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {plugin.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      className="btn-ghost p-1.5"
                      title={plugin.enabled ? 'Disable' : 'Enable'}
                      onClick={() => toggleMut.mutate(plugin.id)}
                    >
                      {plugin.enabled
                        ? <ToggleRight className="w-5 h-5 text-green-500" />
                        : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                    </button>
                    <button
                      className="btn-ghost p-1.5 text-red-500 hover:bg-red-50"
                      title="Delete"
                      onClick={() => {
                        if (confirm(`Delete plugin "${plugin.name}"?`)) {
                          deleteMut.mutate(plugin.id)
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {plugins.length === 0 && (
          <div className="text-center py-12 text-gray-400">No plugins registered yet.</div>
        )}
      </div>
    </div>
  )
}

// ── Inline Create Form ────────────────────────────────────────────────────────

function CreatePluginForm({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: () => void
}) {
  const [form, setForm] = useState({
    pluginId: '',
    name: '',
    description: '',
    remoteUrl: '',
    scope: '',
    module: './Plugin',
    route: '/',
    icon: 'home',
    sortOrder: 100,
    enabled: true,
    roles: 'USER,ADMIN',
  })
  const [error, setError] = useState('')

  const createMut = useMutation({
    mutationFn: (data: Omit<PluginManifest, 'id'>) => createPlugin(data),
    onSuccess: onCreated,
    onError: (e: Error) => setError(e.message),
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    setForm((f) => ({
      ...f,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  return (
    <div className="card p-6">
      <h2 className="font-semibold text-gray-900 mb-4">Register New Plugin</h2>
      <div className="grid grid-cols-2 gap-4">
        {[
          { name: 'pluginId', label: 'Plugin ID', placeholder: 'mfe-my-app' },
          { name: 'name', label: 'Display Name', placeholder: 'My App' },
          { name: 'remoteUrl', label: 'Remote Entry URL', placeholder: 'http://localhost:3003/remoteEntry.js' },
          { name: 'scope', label: 'Federation Scope', placeholder: 'mfe_my_app' },
          { name: 'module', label: 'Exposed Module', placeholder: './Plugin' },
          { name: 'route', label: 'Route', placeholder: '/my-app' },
          { name: 'icon', label: 'Icon', placeholder: 'home' },
          { name: 'roles', label: 'Roles', placeholder: 'USER,ADMIN' },
        ].map(({ name, label, placeholder }) => (
          <div key={name}>
            <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
            <input
              name={name}
              value={String(form[name as keyof typeof form])}
              onChange={handleChange}
              placeholder={placeholder}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        ))}
      </div>
      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
      <div className="flex gap-3 mt-4">
        <button className="btn-primary" onClick={() => createMut.mutate(form)}>
          Register
        </button>
        <button className="btn-ghost" onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}
