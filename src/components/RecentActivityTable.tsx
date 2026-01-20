import { ChevronRight, Bot, User } from 'lucide-react'
import { RECENT_ACTIVITY } from '../constants'

const getScoreColor = (score: number) => {
  if (score >= 80) return 'bg-emerald-100 text-emerald-700'
  if (score >= 60) return 'bg-amber-100 text-amber-700'
  return 'bg-red-100 text-red-700'
}

export const RecentActivityTable = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
      <div className="flex justify-between items-center p-6 border-b border-gray-100">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Actividad Reciente</h2>
          <p className="text-sm text-gray-500 mt-1">Últimas interacciones de leads</p>
        </div>
        <a href="#" className="flex items-center gap-1 text-sm font-medium text-[#D4A745] hover:text-[#B8923D] transition-colors">
          Ver Todo
          <ChevronRight className="w-4 h-4" />
        </a>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">Lead</th>
              <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">Acción</th>
              <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">Agente</th>
              <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">Duración</th>
              <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {RECENT_ACTIVITY.map((activity) => (
              <tr key={activity.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={activity.avatar} 
                      alt={activity.name} 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">{activity.name}</span>
                      <p className="text-xs text-gray-500">{activity.project}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">{activity.action}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {activity.agent.type === 'ai' ? (
                      <span className="flex items-center gap-1.5 text-sm">
                        <Bot className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-600">{activity.agent.name}</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-sm">
                        <User className="w-4 h-4 text-[#D4A745]" />
                        <span className="text-gray-600">{activity.agent.name}</span>
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">{activity.duration}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${getScoreColor(activity.score)}`}>
                    {activity.score}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
