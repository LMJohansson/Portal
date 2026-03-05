import { TrendingUp, Users, Activity, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface Stat {
  label: string
  value: string
  change: number
  icon: typeof TrendingUp
  color: string
}

const stats: Stat[] = [
  { label: 'Total Revenue', value: '$84,320', change: 12.5, icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' },
  { label: 'Active Users', value: '2,847', change: 8.2, icon: Users, color: 'bg-blue-50 text-blue-600' },
  { label: 'Transactions', value: '14,093', change: -2.4, icon: Activity, color: 'bg-purple-50 text-purple-600' },
  { label: 'Growth Rate', value: '23.1%', change: 4.1, icon: TrendingUp, color: 'bg-amber-50 text-amber-600' },
]

const recentActivity = [
  { user: 'Alice Johnson', action: 'Registered new plugin: mfe-reports', time: '2 min ago', type: 'plugin' },
  { user: 'Bob Smith', action: 'Logged in from new device', time: '15 min ago', type: 'auth' },
  { user: 'Carol White', action: 'Updated plugin configuration', time: '1 hr ago', type: 'plugin' },
  { user: 'Dave Brown', action: 'Exported data report', time: '3 hr ago', type: 'data' },
  { user: 'Eve Davis', action: 'Added new user account', time: '5 hr ago', type: 'user' },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Key metrics and recent activity overview</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const isPositive = stat.change > 0
          return (
            <div key={stat.label} className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <span
                  className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full
                    ${isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}
                >
                  {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(stat.change)}%
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Charts placeholder + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart placeholder */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-semibold text-gray-900 mb-4">Revenue Trend (last 30 days)</h2>
          <div className="h-48 flex items-end gap-2">
            {Array.from({ length: 30 }, (_, i) => {
              const height = 30 + Math.sin(i * 0.5) * 20 + Math.random() * 30
              return (
                <div
                  key={i}
                  className="flex-1 bg-blue-100 hover:bg-blue-400 rounded-t transition-colors cursor-pointer"
                  style={{ height: `${height}%` }}
                  title={`Day ${i + 1}`}
                />
              )
            })}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>Jan 25</span>
            <span>Feb 25</span>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.map((item) => (
              <div key={item.user + item.time} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-gray-500">
                  {item.user.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{item.user}</p>
                  <p className="text-xs text-gray-400 truncate">{item.action}</p>
                  <p className="text-xs text-gray-300">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
