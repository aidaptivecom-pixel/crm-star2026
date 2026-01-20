import { Radio } from 'lucide-react'
import { LIVE_CONVERSATIONS } from '../constants'
import { LiveConversation } from '../types'

const getAgentBadge = (agentType: LiveConversation['agentType']) => {
  switch (agentType) {
    case 'emprendimientos':
      return <span className="w-2 h-2 rounded-full bg-blue-500" title="Emprendimientos" />
    case 'inmuebles':
      return <span className="w-2 h-2 rounded-full bg-purple-500" title="Inmuebles" />
    case 'tasaciones':
      return <span className="w-2 h-2 rounded-full bg-amber-500" title="Tasaciones" />
  }
}

export const LiveConversations = () => {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] h-full">
      <div className="flex items-center gap-2 mb-4">
        <Radio className="w-4 h-4 text-emerald-500" />
        <h2 className="text-sm font-semibold text-gray-900">En Vivo</h2>
        <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
          {LIVE_CONVERSATIONS.length}
        </span>
      </div>
      
      <div className="space-y-3">
        {LIVE_CONVERSATIONS.map((conv) => (
          <div 
            key={conv.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="relative">
              <img 
                src={conv.avatar} 
                alt={conv.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="absolute -bottom-0.5 -right-0.5">
                {getAgentBadge(conv.agentType)}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">{conv.name}</span>
                {conv.status === 'typing' && (
                  <span className="flex gap-0.5">
                    <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate">{conv.project}</p>
            </div>
            
            <span className={`text-xs font-medium ${
              conv.status === 'typing' ? 'text-emerald-600' : 'text-gray-400'
            }`}>
              {conv.lastActivity}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
