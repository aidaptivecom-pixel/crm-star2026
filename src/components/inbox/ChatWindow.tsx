import { useState, useRef, useEffect } from 'react'
import { Send, Hand, Bot, User, ChevronLeft, UserCircle } from 'lucide-react'
import { Conversation } from '../../types'
import { Avatar } from '../Avatar'
import { DraftApproval } from './DraftApproval'

// Direct Supabase REST API calls (avoids type issues)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

const supabaseRest = {
  async insert(table: string, data: Record<string, unknown>) {
    if (!SUPABASE_URL || !SUPABASE_KEY) return null
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(data)
    })
    return res.json()
  },
  async update(table: string, id: string, data: Record<string, unknown>) {
    if (!SUPABASE_URL || !SUPABASE_KEY) return null
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    return res.ok
  }
}

interface ChatWindowProps {
  conversation: Conversation
  onBack?: () => void
  onViewLead?: () => void
}

export const ChatWindow = ({ conversation, onBack, onViewLead }: ChatWindowProps) => {
  const [message, setMessage] = useState('')
  const [draftResponse, setDraftResponse] = useState<string | null>(null)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [optimisticMessages, setOptimisticMessages] = useState<Array<{
    id: string
    content: string
    sender: 'human' | 'ai'
    senderName: string
    timestamp: Date
    pending?: boolean
  }>>([])
  const [isSending, setIsSending] = useState(false)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Load draft from conversation data
  useEffect(() => {
    const draft = conversation.draftResponse
    setDraftResponse(draft || null)
  }, [conversation.id, conversation.draftResponse])

  // Clear optimistic messages when conversation changes
  useEffect(() => {
    setOptimisticMessages([])
  }, [conversation.id])

  // Auto-scroll to bottom
  useEffect(() => {
    const container = messagesContainerRef.current
    if (container) {
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight
      })
    }
  }, [conversation.messages, conversation.id, draftResponse, optimisticMessages])

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
      case 'pending_approval':
        return (
          <span className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-1 bg-amber-50 text-amber-600 text-[10px] sm:text-xs font-medium rounded-full">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
            <span className="hidden sm:inline">Pendiente aprobación</span>
            <span className="sm:hidden">Pendiente</span>
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

  const handleApprove = async (text: string) => {
    try {
      // 1. Send message via WhatsApp (call n8n webhook)
      await fetch('https://star.igreen.com.ar/webhook/send-approved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversation.id,
          phone: conversation.phone,
          message: text,
          lead_name: conversation.name
        })
      }).catch(() => {}) // Don't fail if webhook is not ready

      // 2. Save message to DB
      await supabaseRest.insert('messages', {
        conversation_id: conversation.id,
        content: text,
        sender: 'ai',
        sender_name: 'Agente STAR',
        message_type: 'text',
        status: 'sent',
        ai_generated: true
      })

      // 3. Clear draft and update conversation
      await supabaseRest.update('conversations', conversation.id, {
        draft_response: null,
        draft_created_at: null,
        status: 'ai_active',
        last_message: text,
        last_message_by: 'agent'
      })

      setDraftResponse(null)
      
      // Add message to optimistic state instead of reloading
      setOptimisticMessages(prev => [...prev, {
        id: `approved-${Date.now()}`,
        content: text,
        sender: 'ai' as const,
        senderName: 'Agente STAR',
        timestamp: new Date(),
        pending: false
      }])
    } catch (error) {
      console.error('Error approving draft:', error)
      alert('Error al enviar el mensaje. Intenta de nuevo.')
    }
  }

  const handleRegenerate = async () => {
    setIsRegenerating(true)
    try {
      const response = await fetch('https://star.igreen.com.ar/webhook/regenerate-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversation.id,
          lead_id: conversation.leadId
        })
      })
      
      const data = await response.json()
      if (data.draft) {
        setDraftResponse(data.draft)
      }
    } catch (error) {
      console.error('Error regenerating draft:', error)
      alert('Error al regenerar. Intenta de nuevo.')
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleDismissDraft = async () => {
    try {
      await supabaseRest.update('conversations', conversation.id, {
        draft_response: null,
        draft_created_at: null
      })
      setDraftResponse(null)
    } catch (error) {
      console.error('Error dismissing draft:', error)
    }
  }

  const handleSend = async () => {
    if (!message.trim() || isSending) return
    
    const messageText = message.trim()
    const tempId = `temp-${Date.now()}`
    
    // Optimistic update - show message immediately
    setOptimisticMessages(prev => [...prev, {
      id: tempId,
      content: messageText,
      sender: 'human',
      senderName: 'Humano',
      timestamp: new Date(),
      pending: true
    }])
    setMessage('')
    setIsSending(true)
    
    try {
      // Save message to DB
      await supabaseRest.insert('messages', {
        conversation_id: conversation.id,
        content: messageText,
        sender: 'human',
        sender_name: 'Humano',
        message_type: 'text',
        status: 'sent',
        ai_generated: false
      })

      // Update conversation
      await supabaseRest.update('conversations', conversation.id, {
        last_message: messageText,
        last_message_by: 'human',
        status: 'ai_active'
      })

      // Send via WhatsApp (don't wait)
      fetch('https://star.igreen.com.ar/webhook/send-approved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversation.id,
          phone: conversation.phone,
          message: messageText,
          lead_name: conversation.name
        })
      }).catch(() => {})

      // Mark as sent (remove pending)
      setOptimisticMessages(prev => 
        prev.map(m => m.id === tempId ? { ...m, pending: false } : m)
      )
    } catch (error) {
      console.error('Error sending message:', error)
      // Remove failed message
      setOptimisticMessages(prev => prev.filter(m => m.id !== tempId))
      alert('Error al enviar. Intenta de nuevo.')
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleTakeControl = async () => {
    try {
      await supabaseRest.update('conversations', conversation.id, {
        ai_enabled: false,
        status: 'needs_human'
      })
      // No reload needed - realtime will update the UI
    } catch (error) {
      console.error('Error taking control:', error)
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-w-0 h-full overflow-hidden">
      {/* Chat Header */}
      <div className="flex-shrink-0 px-3 sm:px-6 py-3 sm:py-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
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

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4"
      >
        {conversation.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'lead' ? 'justify-start' : 'justify-end'}`}
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
              {msg.sender !== 'lead' && msg.senderName && (
                <div className={`px-3 sm:px-4 pt-2 pb-0 flex items-center gap-1.5 ${
                  msg.sender === 'ai' ? 'text-blue-100' : 'text-amber-100'
                }`}>
                  {msg.sender === 'ai' ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                  <span className="text-[10px] font-medium">{msg.senderName}</span>
                </div>
              )}
              
              <div className="px-3 sm:px-4 py-2">
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${msg.sender === 'lead' ? 'text-gray-400' : 'text-white/70'}`}>
                  {msg.timestamp}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Optimistic messages (pending send) */}
        {optimisticMessages.map((msg) => (
          <div key={msg.id} className="flex justify-end">
            <div className={`max-w-[85%] sm:max-w-[70%] bg-[#D4A745] text-white rounded-2xl rounded-br-md ${msg.pending ? 'opacity-70' : ''}`}>
              <div className="px-3 sm:px-4 pt-2 pb-0 flex items-center gap-1.5 text-amber-100">
                <User className="w-3 h-3" />
                <span className="text-[10px] font-medium">{msg.senderName}</span>
                {msg.pending && <span className="text-[10px]">• Enviando...</span>}
              </div>
              <div className="px-3 sm:px-4 py-2">
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className="text-[10px] mt-1 text-white/70">
                  {msg.timestamp.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
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

      {/* Draft Approval */}
      {(draftResponse || isRegenerating) && (
        <DraftApproval
          draft={draftResponse || ''}
          onApprove={handleApprove}
          onRegenerate={handleRegenerate}
          onDismiss={handleDismissDraft}
          isLoading={isRegenerating}
        />
      )}

      {/* Input Area */}
      <div className="flex-shrink-0 p-3 sm:p-4 bg-white border-t border-gray-200">
        <div className="flex items-center gap-2 sm:gap-3">
          {conversation.status === 'ai_active' && (
            <button 
              onClick={handleTakeControl}
              className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-amber-100 transition-colors flex-shrink-0"
            >
              <Hand className="w-4 h-4" />
              <span className="hidden md:inline">Tomar control</span>
            </button>
          )}
          
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
