import { AlertCircle, ChevronRight, User, TrendingUp, Clock } from 'lucide-react'
import { ATTENTION_LEADS } from '../constants'
import { AttentionLead } from '../types'

const getReasonIcon = (reason: AttentionLead['reason']) => {
  switch (reason) {
    case 'human_requested':
      return <User className="w-4 h-4" />
    case 'high_score':
      return <TrendingUp className="w-4 h-4" />
    case 'no_response':
      return <Clock className="w-4 h-4" />
  }
}

const getReasonColor = (reason: AttentionLead['reason']) => {
  switch (reason) {
    case 'human_requested':
      return 'bg-red-50 border-red-200 text-red-700'
    case 'high_score':
      return 'bg-amber-50 border-amber-200 text-amber-700'
    case 'no_response':
      return 'bg-orange-50 border-orange-200 text-orange-700'
  }
}

export const AttentionAlerts = () => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <h2 className="text-lg font-semibold text-gray-900">Requieren Atención</h2>
          <span className="text-sm text-gray-500">({ATTENTION_LEADS.length})</span>
        </div>
        <a href="#" className="flex items-center gap-1 text-sm font-medium text-[#D4A745] hover:text-[#B8923D] transition-colors">
          Ver todos
          <ChevronRight className="w-4 h-4" />
        </a>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ATTENTION_LEADS.map((lead) => (
          <div 
            key={lead.id}
            className="bg-white p-4 rounded-xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <img 
                src={lead.avatar} 
                alt={lead.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{lead.name}</h3>
                  {lead.score && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      lead.score >= 80 ? 'bg-emerald-100 text-emerald-700' :
                      lead.score >= 60 ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {lead.score}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{lead.project}</p>
                
                <div className={`flex items-center gap-1.5 mt-2 px-2 py-1 rounded-md border text-xs font-medium ${getReasonColor(lead.reason)}`}>
                  {getReasonIcon(lead.reason)}
                  <span>{lead.reasonText}</span>
                </div>
                
                <p className="text-[11px] text-gray-400 mt-2">{lead.timeAgo}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
