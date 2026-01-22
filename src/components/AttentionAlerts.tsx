import { AlertTriangle, ArrowRight, Clock, MessageSquareWarning, TrendingUp } from 'lucide-react'
import { ATTENTION_LEADS } from '../constants'
import { Avatar } from './Avatar'

export const AttentionAlerts = () => {
  const getReasonIcon = (reason: string) => {
    switch (reason) {
      case 'human_requested':
        return <MessageSquareWarning className="w-4 h-4 text-red-500" />
      case 'high_score':
        return <TrendingUp className="w-4 h-4 text-amber-500" />
      case 'no_response':
        return <Clock className="w-4 h-4 text-orange-500" />
      default:
        return <AlertTriangle className="w-4 h-4 text-red-500" />
    }
  }

  const getReasonBg = (reason: string) => {
    switch (reason) {
      case 'human_requested':
        return 'bg-red-50 border-red-100'
      case 'high_score':
        return 'bg-amber-50 border-amber-100'
      case 'no_response':
        return 'bg-orange-50 border-orange-100'
      default:
        return 'bg-gray-50 border-gray-100'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-100 text-emerald-700'
    if (score >= 60) return 'bg-amber-100 text-amber-700'
    return 'bg-red-100 text-red-700'
  }

  return (
    <div className="mb-6 sm:mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative">
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900">Requieren Atención</h2>
          <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
            {ATTENTION_LEADS.length}
          </span>
        </div>
        <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#D4A745] transition-colors">
          <span className="hidden sm:inline">Ver todos</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {ATTENTION_LEADS.map((lead) => (
          <div
            key={lead.id}
            className={`p-3 sm:p-4 rounded-xl border ${getReasonBg(lead.reason)} hover:shadow-md transition-all cursor-pointer`}
          >
            <div className="flex items-start gap-3">
              <Avatar name={lead.name} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">{lead.name}</h3>
                  {lead.score && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${getScoreColor(lead.score)}`}>
                      {lead.score}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-500 truncate">{lead.project}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  {getReasonIcon(lead.reason)}
                  <span className="text-xs font-medium text-gray-700">{lead.reasonText}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{lead.timeAgo}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
