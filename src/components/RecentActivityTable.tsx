import { ArrowRight, Bot, User } from 'lucide-react'
import { RECENT_ACTIVITY } from '../constants'
import { Avatar } from './Avatar'

export const RecentActivityTable = () => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-100 text-emerald-700'
    if (score >= 60) return 'bg-amber-100 text-amber-700'
    return 'bg-red-100 text-red-700'
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100">
        <h3 className="font-bold text-gray-900 text-sm sm:text-base">Actividad Reciente</h3>
        <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#D4A745] transition-colors">
          <span className="hidden sm:inline">Ver Todo</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Table with horizontal scroll on mobile */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th className="px-4 sm:px-6 py-3">Lead</th>
              <th className="px-4 sm:px-6 py-3">Acción</th>
              <th className="px-4 sm:px-6 py-3">Agente</th>
              <th className="px-4 sm:px-6 py-3">Duración</th>
              <th className="px-4 sm:px-6 py-3 text-right">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {RECENT_ACTIVITY.map((activity) => (
              <tr key={activity.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                <td className="px-4 sm:px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={activity.name} size="sm" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{activity.name}</p>
                      <p className="text-xs text-gray-500 truncate">{activity.project}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-4">
                  <span className="text-sm text-gray-700">{activity.action}</span>
                </td>
                <td className="px-4 sm:px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    {activity.agent.type === 'ai' ? (
                      <Bot className="w-4 h-4 text-blue-500" />
                    ) : (
                      <User className="w-4 h-4 text-gray-500" />
                    )}
                    <span className="text-sm text-gray-600">{activity.agent.name}</span>
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-4">
                  <span className="text-sm text-gray-500">{activity.duration}</span>
                </td>
                <td className="px-4 sm:px-6 py-4 text-right">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${getScoreColor(activity.score)}`}>
                    {activity.score}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile hint for scroll */}
      <div className="sm:hidden px-4 py-2 text-center border-t border-gray-100">
        <p className="text-xs text-gray-400">← Desliza para ver más →</p>
      </div>
    </div>
  )
}
