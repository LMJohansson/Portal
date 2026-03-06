import { Home, Star, Zap, Shield, ArrowRight } from 'lucide-react'

const features = [
  { icon: Zap, title: 'Module Federation', desc: 'Independent deployments via Vite Module Federation — no rebuild of the shell required.' },
  { icon: Shield, title: 'OIDC Auth', desc: 'Authorization Code + PKCE via Keycloak. Role-based access enforced at both the API and the plugin manifest level.' },
  { icon: Home, title: 'Plugin Registry', desc: 'Register, enable/disable and hot-swap micro-frontends at runtime via the admin panel.' },
  { icon: Star, title: 'Quarkus Backend', desc: 'Supersonic sub-atomic Java backend with OpenAPI docs and MicroProfile Health.' },
]

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 text-white p-8">
        <div className="max-w-2xl">
          <p className="text-blue-200 text-sm font-medium mb-2 uppercase tracking-wider">
            Enterprise Portal · Home
          </p>
          <h1 className="text-3xl font-bold mb-3 leading-tight">
            Pluggable Micro-Frontend Architecture
          </h1>
          <p className="text-blue-100 text-base leading-relaxed">
            This portal dynamically loads independent React applications at runtime
            using Vite Module Federation. Each MFE is built, versioned and deployed
            independently — the shell simply fetches the plugin manifest and mounts
            the remote components.
          </p>
        </div>
      </div>

      {/* Feature grid */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-5 flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Quick Links</h2>
        <div className="space-y-2">
          {[
            { label: 'Swagger UI (API docs)', href: 'http://localhost:8080/swagger-ui' },
            { label: 'OpenAPI spec (JSON)', href: 'http://localhost:8080/q/openapi?format=json' },
            { label: 'Health check', href: 'http://localhost:8080/q/health' },
          ].map(({ label, href }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <span className="text-sm text-gray-700">{label}</span>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
