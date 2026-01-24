export interface MetricData {
  title: string
  value: string
  change: string
  isPositive: boolean
  type?: 'usage'
  usagePercent?: number
}

export interface ChartDataPoint {
  date: string
  total: number
  qualified: number
}

export interface LeadActivity {
  id: string
  avatar: string
  name: string
  project: string
  action: string
  agent: {
    type: 'ai' | 'human'
    name: string
  }
  duration: string
  score: number
}

export interface AttentionLead {
  id: string
  avatar: string
  name: string
  reason: 'human_requested' | 'high_score' | 'no_response'
  reasonText: string
  project: string
  timeAgo: string
  score?: number
}

export interface LiveConversation {
  id: string
  avatar: string
  name: string
  project: string
  status: 'typing' | 'waiting'
  lastActivity: string
  agentType: 'emprendimientos' | 'inmuebles' | 'tasaciones'
}

// ============ NOTIFICATION TYPES ============

export type NotificationType = 'new_lead' | 'escalation' | 'high_score' | 'message' | 'system'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  leadId?: string
  conversationId?: string
  read: boolean
  createdAt: string
  avatar?: string
}

// ============ INBOX TYPES ============

export type AgentType = 'emprendimientos' | 'inmuebles' | 'tasaciones'
export type ConversationStatus = 'ai_active' | 'needs_human' | 'closed'
export type ChannelType = 'whatsapp' | 'instagram' | 'facebook'

export interface Message {
  id: string
  content: string
  sender: 'lead' | 'ai' | 'human'
  senderName?: string
  timestamp: string
  status?: 'sent' | 'delivered' | 'read'
}

export interface Conversation {
  id: string
  leadId: string
  avatar: string
  name: string
  phone: string
  project: string
  agentType: AgentType
  status: ConversationStatus
  channel: ChannelType
  lastMessage: string
  lastMessageTime: string
  unread: boolean
  isTyping: boolean
  messages: Message[]
}

export interface LeadDetail {
  id: string
  name: string
  phone: string
  email?: string
  score: number
  interest: string
  budget?: string
  budgetCurrency?: 'USD' | 'ARS'
  project: string
  agentType: AgentType
  channel: ChannelType
  createdAt: string
  history: {
    action: string
    date: string
    completed: boolean
  }[]
}

// ============ PIPELINE TYPES ============

export type PipelineStage = 'nuevo' | 'calificado' | 'contactado' | 'visita' | 'cierre'

export interface PipelineLead {
  id: string
  name: string
  phone: string
  email?: string
  project: string
  agentType: AgentType
  channel: ChannelType
  score: number
  budget?: string
  budgetCurrency?: 'USD' | 'ARS'
  interest: string
  stage: PipelineStage
  createdAt: string
  lastActivity: string
  assignedTo?: string
  notes?: string
  scheduledDate?: string
}

export interface PipelineColumn {
  id: PipelineStage
  title: string
  color: string
}
