import { Hand, Puzzle, Rocket, Code2 } from 'lucide-react'

export default function HelloPage() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-8">
        <div className="max-w-2xl">
          <p className="text-emerald-200 text-sm font-medium mb-2 uppercase tracking-wider">
            Hello World Plugin · MFE Demo
          </p>
          <h1 className="text-3xl font-bold mb-3 leading-tight flex items-center gap-3">
            <Hand className="w-8 h-8" />
            Hello from mfe-hello!
          </h1>
          <p className="text-emerald-100 text-base leading-relaxed">
            This is a dynamically loaded micro-frontend. It was built independently,
            deployed to its own container, and registered in the plugin registry —
            the shell loaded it at runtime without any redeployment.
          </p>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: Puzzle,
            title: 'Module Federation',
            desc: 'Loaded via @module-federation/vite at runtime from remoteEntry.js.',
          },
          {
            icon: Rocket,
            title: 'Independent Deploy',
            desc: 'Built and served from its own container on port 3003. No shell rebuild needed.',
          },
          {
            icon: Code2,
            title: 'Your starting point',
            desc: 'Copy this MFE as a template and replace HelloPage with your own content.',
          },
        ].map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="rounded-xl border border-gray-200 bg-white p-5 flex flex-col gap-3 shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Icon className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Fun greeting */}
      <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-5 text-center">
        <p className="text-emerald-800 font-medium text-lg">
          🌍 Hello, World! — from your first custom micro-frontend.
        </p>
        <p className="text-emerald-600 text-sm mt-1">
          Edit <code className="bg-emerald-100 px-1 rounded">mfe-hello/src/pages/HelloPage.tsx</code> to get started.
        </p>
      </div>
    </div>
  )
}
