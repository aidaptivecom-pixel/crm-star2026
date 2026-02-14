import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Search, Filter, MessageSquare } from 'lucide-react'
import { ConversationList } from '../components/inbox/ConversationList'
import { ChatWindow } from '../components/inbox/ChatWindow'
import { LeadPanel } from '../components/inbox/LeadPanel'
import { LeadDetailModal } from '../components/LeadDetailModal'
import { useConversations, useMessages, useLeads } from '../hooks'
import { mapDbConversationToUi, mapLeadToLeadDetail, mapLeadToPipelineLead } from '../lib/mappers'
import { AgentType, ConversationStatus, ChannelType, PipelineLead } from '../types'

export const Inbox = () => {
  const { conversationId } = useParams()
  const navigate = useNavigate()
  
  const [selectedId, setSelectedId] = useState<string | null>(conversationId || null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [showLeadModal, setShowLeadModal] = useState(false)
  
  // Filters
  const [agentFilter, setAgentFilter] = useState<AgentType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<ConversationStatus | 'all'>('all')
  const [channelFilter, setChannelFilter] = useState<ChannelType | 'all'>('all')

  // Data from Supabase
  const { conversations: dbConversations, loading: convsLoading } = useConversations()
  const { messages: dbMessages, loading: msgsLoading } = useMessages(selectedId || '')
  const { leads: dbLeads } = useLeads()

  // Map DB conversations to UI conversations (without messages, for list)
  const uiConversations = useMemo(
    () => dbConversations.map(c => mapDbConversationToUi(c, [])),
    [dbConversations],
  )

  // Update URL when conversation changes
  useEffect(() => {
    if (selectedId && selectedId !== conversationId) {
      navigate(`/inbox/${selectedId}`, { replace: true })
    }
  }, [selectedId, conversationId, navigate])

  // Set initial conversation from URL
  useEffect(() => {
    if (conversationId && !selectedId) {
      setSelectedId(conversationId)
    } else if (!conversationId && !selectedId && uiConversations.length > 0) {
      // Don't auto-select on mobile
      if (window.innerWidth >= 1024) {
        setSelectedId(uiConversations[0].id)
      }
    }
  }, [conversationId, selectedId, uiConversations])

  // Filter conversations
  const filteredConversations = uiConversations.filter(conv => {
    const matchesSearch = conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conv.project.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesAgent = agentFilter === 'all' || conv.agentType === agentFilter
    const matchesStatus = statusFilter === 'all' || conv.status === statusFilter
    const matchesChannel = channelFilter === 'all' || conv.channel === channelFilter
    
    return matchesSearch && matchesAgent && matchesStatus && matchesChannel
  })

  // Build selected conversation WITH messages
  const selectedConversation = useMemo(() => {
    if (!selectedId) return null
    const dbConv = dbConversations.find(c => c.id === selectedId)
    if (!dbConv) return null
    return mapDbConversationToUi(dbConv, dbMessages)
  }, [selectedId, dbConversations, dbMessages])

  // Get lead for the selected conversation
  const selectedLead = useMemo(() => {
    if (!selectedConversation?.leadId) return null
    const dbLead = dbLeads.find(l => l.id === selectedConversation.leadId)
    if (!dbLead) return null
    return mapLeadToLeadDetail(dbLead)
  }, [selectedConversation, dbLeads])

  // Get PipelineLead for modal
  const getLeadForModal = (): PipelineLead | null => {
    if (!selectedConversation) return null
    
    // Try to find the lead in our leads data
    const dbLead = dbLeads.find(l => l.id === selectedConversation.leadId)
    if (dbLead) return mapLeadToPipelineLead(dbLead)
    
    // Fallback: create from conversation data
    return {
      id: selectedConversation.leadId,
      name: selectedConversation.name,
      phone: selectedConversation.phone,
      project: selectedConversation.project,
      agentType: selectedConversation.agentType,
      channel: selectedConversation.channel,
      score: 50,
      interest: 'Consulta general',
      stage: 'nuevo',
      createdAt: 'Hoy',
      lastActivity: selectedConversation.lastMessageTime,
    }
  }

  const unreadCount = uiConversations.filter(c => c.unread).length

  const handleBack = () => {
    setSelectedId(null)
    navigate('/inbox', { replace: true })
  }

  const handleSelectConversation = (id: string) => {
    setSelectedId(id)
  }

  const handleViewLead = () => {
    setShowLeadModal(true)
  }

  const leadForModal = getLeadForModal()

  if (convsLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#F8F9FA]">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#D4A745] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Cargando conversaciones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#F8F9FA]">
      {/* Header */}
      <div className="flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <MessageSquare className="w-5 sm:w-6 h-5 sm:h-6 text-[#D4A745]" />
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Inbox</h1>
            {unreadCount > 0 && (
              <span className="bg-[#D4A745] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:block relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 lg:w-64 bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50 focus:border-[#D4A745]"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                showFilters || agentFilter !== 'all' || statusFilter !== 'all' || channelFilter !== 'all'
                  ? 'bg-[#D4A745]/10 border-[#D4A745] text-[#D4A745]'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filtros</span>
            </button>
          </div>
        </div>

        <div className="sm:hidden mt-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar conversación..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50 focus:border-[#D4A745]"
            />
          </div>
        </div>

        {showFilters && (
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">Agente:</span>
              <div className="flex gap-1">
                {[
                  { value: 'all', label: 'Todos' },
                  { value: 'emprendimientos', label: '🔵 Emprendimientos' },
                  { value: 'inmuebles', label: '🟣 Propiedades' },
                  { value: 'tasaciones', label: '🟡 Tasaciones' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setAgentFilter(opt.value as AgentType | 'all')}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      agentFilter === opt.value
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">Estado:</span>
              <div className="flex gap-1">
                {[
                  { value: 'all', label: 'Todos' },
                  { value: 'pending_approval', label: '📟 Pendiente' },
                  { value: 'ai_active', label: '🤖 IA Activa' },
                  { value: 'needs_human', label: '🔴 Escalado' },
                  { value: 'closed', label: '✅ Cerrado' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setStatusFilter(opt.value as ConversationStatus | 'all')}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      statusFilter === opt.value
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {(agentFilter !== 'all' || statusFilter !== 'all' || channelFilter !== 'all') && (
              <button
                onClick={() => {
                  setAgentFilter('all')
                  setStatusFilter('all')
                  setChannelFilter('all')
                }}
                className="text-xs text-[#D4A745] hover:text-[#b8923c] font-medium"
              >
                Limpiar
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <div className={`${
          selectedId ? 'hidden lg:flex' : 'flex'
        } w-full lg:w-80 lg:min-w-[320px] flex-shrink-0 flex-col overflow-hidden`}>
          {filteredConversations.length === 0 && !convsLoading ? (
            <div className="flex-1 flex items-center justify-center bg-white border-r border-gray-200">
              <div className="text-center p-4">
                <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No hay conversaciones</p>
              </div>
            </div>
          ) : (
            <ConversationList
              conversations={filteredConversations}
              selectedId={selectedId}
              onSelect={handleSelectConversation}
            />
          )}
        </div>

        <div className={`${
          selectedId ? 'flex' : 'hidden lg:flex'
        } flex-1 flex-col min-w-0 overflow-hidden`}>
          {selectedConversation ? (
            msgsLoading ? (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <div className="animate-spin w-6 h-6 border-2 border-[#D4A745] border-t-transparent rounded-full mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Cargando mensajes...</p>
                </div>
              </div>
            ) : (
              <ChatWindow 
                conversation={selectedConversation} 
                onBack={handleBack}
                onViewLead={handleViewLead}
              />
            )
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Selecciona una conversación</p>
              </div>
            </div>
          )}
        </div>

        <div className="hidden xl:flex flex-col overflow-hidden">
          {selectedLead && (
            <LeadPanel 
              lead={selectedLead} 
              onViewFullProfile={handleViewLead}
            />
          )}
        </div>
      </div>

      {showLeadModal && leadForModal && (
        <LeadDetailModal
          lead={leadForModal}
          onClose={() => setShowLeadModal(false)}
          currentPage="inbox"
        />
      )}
    </div>
  )
}
