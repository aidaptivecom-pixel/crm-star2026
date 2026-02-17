import { Conversation } from '../../types'
import { Avatar } from '../Avatar'

interface ConversationListProps {
  conversations: Conversation[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export const ConversationList = ({ conversations, selectedId, onSelect }: ConversationListProps) => {
  const getAgentLabel = (type: Conversation['agentType']) => {
    switch (type) {
      case 'emprendimientos':
        return <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Emprendimientos</span>
      case 'inmuebles':
        return <span className="text-[10px] font-medium text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">Propiedades</span>
      case 'tasaciones':
        return <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Tasaciones</span>
    }
  }

  const getChannelIcon = (channel: Conversation['channel']) => {
    switch (channel) {
      case 'whatsapp':
        return '💬'
      case 'instagram':
        return '📷'
      case 'facebook':
        return '👤'
    }
  }

  const getStatusBorder = (status: Conversation['status']) => {
    switch (status) {
      case 'needs_human':
        return 'border-l-4 border-red-500'
      case 'pending_approval':
        return 'border-l-4 border-orange-400'
      case 'ai_active':
        return 'border-l-4 border-green-400'
      case 'closed':
        return 'border-l-4 border-gray-300'
      default:
        return 'border-l-4 border-transparent'
    }
  }

  const getStatusIndicator = (status: Conversation['status'], isTyping: boolean) => {
    if (isTyping) {
      return (
        <div className="flex items-center gap-1">
          <span className="flex gap-0.5">
            <span className="w-1 h-1 bg-[#D4A745] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-1 bg-[#D4A745] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-1 bg-[#D4A745] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </span>
        </div>
      )
    }
    
    switch (status) {
      case 'needs_human':
        return <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      case 'ai_active':
        return <span className="w-2 h-2 rounded-full bg-emerald-500" />
      case 'closed':
        return <span className="w-2 h-2 rounded-full bg-gray-400" />
    }
  }

  return (
    <div className="h-full border-r border-gray-200 bg-white overflow-y-auto">
      <div className="p-3">
        <div className="text-xs font-medium text-gray-500 mb-2 px-2">
          {conversations.length} conversaciones
        </div>
        
        <div className="space-y-1">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${getStatusBorder(conv.status)} ${
                selectedId === conv.id
                  ? 'bg-gray-100'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Avatar with status */}
                <div className="relative flex-shrink-0">
                  <Avatar name={conv.name} size="md" agentType={conv.agentType} />
                  {conv.unread && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#D4A745] rounded-full border-2 border-white" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`font-medium text-sm truncate ${
                        conv.unread ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {conv.name}
                      </span>
                      {getAgentLabel(conv.agentType)}
                    </div>
                    <span className="text-[10px] text-gray-400 flex-shrink-0">
                      {conv.lastMessageTime}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs text-gray-500 truncate">{conv.project}</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-xs flex-shrink-0">{getChannelIcon(conv.channel)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs truncate ${
                      conv.unread ? 'text-gray-700 font-medium' : 'text-gray-500'
                    }`}>
                      {conv.lastMessage}
                    </p>
                    {conv.isTyping && getStatusIndicator(conv.status, true)}
                    {conv.unread && !conv.isTyping && (
                      <span className="w-2 h-2 rounded-full bg-[#D4A745] flex-shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {conversations.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">No hay conversaciones</p>
          </div>
        )}
      </div>
    </div>
  )
}
