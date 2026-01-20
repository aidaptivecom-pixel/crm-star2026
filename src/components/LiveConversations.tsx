import { MessageCircle, ArrowRight } from 'lucide-react'
import { LIVE_CONVERSATIONS } from '../constants'
import { Avatar } from './Avatar'

export const LiveConversations = () => {
  const getAgentDot = (type: string) => {
    switch (type) {
      case 'emprendimientos':
        return 'bg-blue-500'
      case 'inmuebles':
        return 'bg-purple-500'
      case 'tasaciones':
        return 'bg-amber-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-[#D4A745]" />
          <h3 className="font-bold text-gray-900">En Vivo</h3>
          <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
            {LIVE_CONVERSATIONS.length}
          </span>
        </div>
        <button className="text-sm text-gray-500 hover:text-[#D4A745] transition-colors flex items-center gap-1">
          Ver todos
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Conversations List */}
      <div className="space-y-3">
        {LIVE_CONVERSATIONS.map((conv) => (
          <div
            key={conv.id}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {/* Avatar */}
            <div className="relative">
              <Avatar name={conv.name} size="sm" />
              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getAgentDot(conv.agentType)}`} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-gray-900">{conv.name}</span>
              </div>
              <p className="text-xs text-gray-500 truncate">{conv.project}</p>
            </div>

            {/* Status */}
            <div className="text-right">
              {conv.status === 'typing' ? (
                <div className="flex items-center gap-1">
                  <span className="flex gap-0.5">
                    <span className="w-1.5 h-1.5 bg-[#D4A745] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#D4A745] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#D4A745] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              ) : (
                <span className="text-xs text-gray-400">{conv.lastActivity}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
