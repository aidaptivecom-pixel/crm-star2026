/**
 * Mappers: Convert Supabase database types to UI types
 * 
 * Database types (src/types/database.ts) use snake_case
 * UI types (src/types.ts) use camelCase
 */

import type { Lead, Conversation as DbConversation, Message as DbMessage, Project } from '../types/database'
import type {
  PipelineLead,
  Conversation,
  Message,
  LeadDetail,
  AttentionLead,
  LiveConversation,
  LeadActivity,
  AgentType,
  ChannelType,
  PipelineStage,
  ConversationStatus,
} from '../types'

// ============ UTILITIES ============

/** Compute relative time-ago string */
export function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHrs = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'Ahora'
  if (diffMin < 60) return `Hace ${diffMin} min`
  if (diffHrs < 24) return `Hace ${diffHrs} ${diffHrs === 1 ? 'hora' : 'horas'}`
  if (diffDays < 7) return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`
  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Format date as short string */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ============ SAFE CASTERS ============

function safeAgentType(val: string | null | undefined): AgentType {
  if (val === 'emprendimientos' || val === 'inmuebles' || val === 'tasaciones') return val
  return 'emprendimientos'
}

function safeChannel(val: string | null | undefined): ChannelType {
  if (val === 'whatsapp' || val === 'instagram' || val === 'facebook') return val
  return 'whatsapp'
}

function safeStage(val: string | null | undefined): PipelineStage {
  if (val === 'nuevo' || val === 'calificado' || val === 'contactado' || val === 'visita' || val === 'cierre') return val
  return 'nuevo'
}

function safeConversationStatus(val: string | null | undefined): ConversationStatus {
  if (val === 'ai_active' || val === 'needs_human' || val === 'pending_approval' || val === 'closed') return val
  return 'ai_active'
}

// ============ LEAD MAPPERS ============

/** DB Lead → UI PipelineLead */
export function mapLeadToPipelineLead(lead: Lead, projects?: Project[]): PipelineLead {
  const projectName =
    lead.project ||
    (lead.project_id && projects
      ? projects.find(p => p.id === lead.project_id)?.name
      : undefined) ||
    'Sin proyecto'

  return {
    id: lead.id,
    name: lead.name || 'Sin nombre',
    phone: lead.phone || '',
    email: lead.email ?? undefined,
    project: projectName,
    agentType: safeAgentType(lead.agent_type),
    channel: safeChannel(lead.channel),
    score: lead.score || 0,
    budget: lead.budget ?? undefined,
    budgetCurrency: lead.budget_currency ?? undefined,
    interest: lead.interest || '',
    stage: safeStage(lead.stage),
    createdAt: formatDate(lead.created_at),
    lastActivity: lead.last_activity || timeAgo(lead.last_activity_at || lead.updated_at || lead.created_at),
    assignedTo: lead.assigned_to ?? undefined,
    notes: lead.notes ?? undefined,
    scheduledDate: lead.scheduled_date ?? undefined,
  }
}

/** DB Lead → UI AttentionLead */
export function mapLeadToAttentionLead(
  lead: Lead,
  reason: AttentionLead['reason'],
  reasonText: string,
): AttentionLead {
  return {
    id: lead.id,
    avatar: '',
    name: lead.name || 'Sin nombre',
    reason,
    reasonText,
    project: lead.project || 'Sin proyecto',
    timeAgo: timeAgo(lead.last_activity_at || lead.updated_at || lead.created_at),
    score: lead.score ?? undefined,
  }
}

/** DB Lead → UI LeadActivity */
export function mapLeadToActivity(lead: Lead): LeadActivity {
  return {
    id: lead.id,
    avatar: '',
    name: lead.name || 'Sin nombre',
    project: lead.project || 'Sin proyecto',
    action:
      lead.stage === 'calificado' ? 'Calificado' :
      lead.stage === 'contactado' ? 'Contactado' :
      lead.stage === 'visita' ? 'Visita agendada' :
      lead.stage === 'cierre' ? 'En cierre' :
      'Nuevo lead',
    agent: lead.assigned_to
      ? { type: 'human' as const, name: lead.assigned_to }
      : { type: 'ai' as const, name: 'Agente' },
    duration: '-',
    score: lead.score || 0,
  }
}

/** DB Lead → UI LeadDetail */
export function mapLeadToLeadDetail(lead: Lead): LeadDetail {
  // Parse history from JSON if available
  const history: LeadDetail['history'] = []
  if (lead.history && Array.isArray(lead.history)) {
    for (const item of lead.history) {
      if (typeof item === 'object' && item !== null) {
        const h = item as Record<string, unknown>
        history.push({
          action: String(h.action || ''),
          date: String(h.date || ''),
          completed: Boolean(h.completed),
        })
      }
    }
  }

  // If no history, create a basic one
  if (history.length === 0) {
    history.push({
      action: 'Primer contacto',
      date: formatDate(lead.created_at),
      completed: true,
    })
  }

  return {
    id: lead.id,
    name: lead.name || 'Sin nombre',
    phone: lead.phone || '',
    email: lead.email ?? undefined,
    score: lead.score || 0,
    interest: lead.interest || '',
    budget: lead.budget ?? undefined,
    budgetCurrency: lead.budget_currency ?? undefined,
    project: lead.project || 'Sin proyecto',
    agentType: safeAgentType(lead.agent_type),
    channel: safeChannel(lead.channel),
    createdAt: formatDate(lead.created_at),
    history,
  }
}

// ============ CONVERSATION MAPPERS ============

/** DB Message → UI Message */
export function mapDbMessageToUi(msg: DbMessage): Message {
  return {
    id: msg.id,
    content: msg.content,
    sender: msg.sender,
    senderName: msg.sender_name ?? undefined,
    timestamp:
      msg.timestamp ||
      (msg.sent_at
        ? new Date(msg.sent_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
        : ''),
    status: msg.status ?? undefined,
  }
}

/** DB Conversation + optional Messages → UI Conversation */
export function mapDbConversationToUi(conv: DbConversation, messages: DbMessage[] = []): Conversation {
  return {
    id: conv.id,
    leadId: conv.lead_id || '',
    avatar: conv.avatar || '',
    name: conv.name || 'Sin nombre',
    phone: conv.phone || '',
    project: conv.project || 'Sin proyecto',
    agentType: safeAgentType(conv.agent_type),
    status: safeConversationStatus(conv.status),
    channel: safeChannel(conv.channel),
    lastMessage: conv.last_message || '',
    lastMessageTime: conv.last_message_time || timeAgo(conv.last_message_at || conv.updated_at || conv.created_at),
    unread: conv.unread || false,
    isTyping: conv.is_typing || false,
    messages: messages.map(mapDbMessageToUi),
    draftResponse: (conv as any).draft_response || null,
    draftCreatedAt: (conv as any).draft_created_at || null,
    draftAttachments: (conv as any).draft_attachments || null,
  }
}

/** DB Conversation → UI LiveConversation (for dashboard) */
export function mapDbConversationToLive(conv: DbConversation): LiveConversation {
  return {
    id: conv.id,
    avatar: conv.avatar || '',
    name: conv.name || 'Sin nombre',
    project: conv.project || 'Sin proyecto',
    status: conv.is_typing ? 'typing' : 'waiting',
    lastActivity: conv.is_typing
      ? 'Escribiendo...'
      : timeAgo(conv.last_message_at || conv.updated_at),
    agentType: safeAgentType(conv.agent_type),
  }
}
