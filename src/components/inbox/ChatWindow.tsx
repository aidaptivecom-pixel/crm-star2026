import { useState, useRef, useEffect } from 'react'
import { Send, Hand, Bot, User, ChevronLeft, UserCircle } from 'lucide-react'
import { Conversation } from '../../types'
import { Avatar } from '../Avatar'

interface ChatWindowProps {
  conversation: Conversation
  onBack?: () => void
  onViewLead?: () => void
}

export const ChatWindow = ({ conversation, onBack, onViewLead }: ChatWindowProps) => {
  const [message, setMessage] = useState('')
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom ONLY within the messages container
  useEffect(() => {
    const container = messagesContainerRef.current
    if (container) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight
      })
    }
  }, [conversation.messages, conversation.id])

  const getAgentBadge = (type: Conversation['agentType']) => {
    switch (type) {
      case 'emprendimientos':
        return <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-medium rounded">Emp</span>
      case 'inmuebles':
        return <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-medium rounded">Inm</span>
      case 'tasaciones':
        return <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-medium rounded">Tas</span>
    }
  }

  const getStatusBadge = (status: Conversation['status']) => {
    switch (status) {
      case 'needs_human':
        return (
          <span className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-1 bg-red-50 text-red-600 text-[10px] sm:text-xs font-medium rounded-full">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            <span className="hidden sm:inline">Necesita humano</span>
            <span className="sm:hidden">Urgente</span>
          </span>
        )
      case 'ai_active':
        return (
          <span className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] sm:text-xs font-medium rounded-full">
            <Bot className="w-3 h-3" />
            <span className="hidden sm:inline">IA activa</span>
          </span>
        )
      case 'closed':
        return (
          <span className="flex items-center gap-1.5 px-1.5 sm:px-2 py-1 bg-gray-100 text-gray-600 text-[10px] sm:text-xs font-medium rounded-full">
            Cerrado
          </span>
        )
    }
  }

  const handleSend = () => {
    if (message.trim()) {
      // Here you would send the message
      console.log('Sending:', message)
      setMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-w-0 h-full overflow-hidden">
      {/* Chat Header - Fixed */}
      <div className="flex-shrink-0 px-3 sm:px-6 py-3 sm:py-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Back button - Mobile only */}
            {onBack && (
              <button
                onClick={onBack}
                className="lg:hidden p-1.5 -ml-1.5 hover:bg-gray-100 rounded-lg text-gray-600"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            
            <Avatar name={conversation.name} size="md" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 text-sm sm:text-base truncate">{conversation.name}</span>
                {getAgentBadge(conversation.agentType)}
              </div>
              <span className="text-xs sm:text-sm text-gray-500 truncate block">{conversation.project}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {getStatusBadge(conversation.status)}
            {/* Lead profile button */}
            <button 
              onClick={onViewLead}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-[#D4A745] transition-colors"
              title="Ver perfil del lead"
            >
              <UserCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages - Scrollable container with fixed height */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4"
      >
        {conversation.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === 'lead' ? 'justify-start' : 'justify-end'
            }`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[70%] ${
                msg.sender === 'lead'
                  ? 'bg-white border border-gray-200 rounded-2xl rounded-bl-md'
                  : msg.sender === 'ai'
                  ? 'bg-blue-500 text-white rounded-2xl rounded-br-md'
                  : 'bg-[#D4A745] text-white rounded-2xl rounded-br-md'
              }`}
            >
              {/* Sender label for AI/Human */}
              {msg.sender !== 'lead' && msg.senderName && (
                <div className={`px-3 sm:px-4 pt-2 pb-0 flex items-center gap-1.5 ${
                  msg.sender === 'ai' ? 'text-blue-100' : 'text-amber-100'
                }`}>
                  {msg.sender === 'ai' ? (
                    <Bot className="w-3 h-3" />
                  ) : (
                    <User className="w-3 h-3" />
                  )}
                  <span className="text-[10px] font-medium">{msg.senderName}</span>
                </div>
              )}
              
              <div className="px-3 sm:px-4 py-2">
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${
                  msg.sender === 'lead' ? 'text-gray-400' : 'text-white/70'
                }`}>
                  {msg.timestamp}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {conversation.isTyping && (
          <div className="flex justify-end">
            <div className="bg-blue-500 text-white rounded-2xl rounded-br-md px-3 sm:px-4 py-3">
              <div className="flex items-center gap-1.5">
                <Bot className="w-3 h-3 text-blue-100" />
                <span className="text-[10px] text-blue-100 font-medium">Agente escribiendo</span>
              </div>
              <div className="flex gap-1 mt-1">
                <span className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area - Fixed */}
      <div className="flex-shrink-0 p-3 sm:p-4 bg-white border-t border-gray-200">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Take Control Button - Hidden on small mobile */}
          {conversation.status === 'ai_active' && (
            <button className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-amber-100 transition-colors flex-shrink-0">
              <Hand className="w-4 h-4" />
              <span className="hidden md:inline">Tomar control</span>
            </button>
          )}
          
          {/* Message Input - No autofocus to prevent page scroll */}
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe un mensaje..."
              rows={1}
              className="w-full px-3 sm:px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50 focus:border-[#D4A745]"
            />
          </div>
          
          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="p-2.5 bg-[#D4A745] text-white rounded-xl hover:bg-[#c49a3d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
