import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Conversation, Message } from '../types/database'

export function useConversations(filters?: {
  status?: string
  agentType?: string
  channel?: string
  leadId?: string
}) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchConversations()
  }, [filters?.status, filters?.agentType, filters?.channel, filters?.leadId])

  async function fetchConversations() {
    if (!isSupabaseConfigured() || !supabase) {
      setConversations([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('conversations')
        .select('*')
        .order('last_message_at', { ascending: false })

      if (filters?.status) query = query.eq('status', filters.status)
      if (filters?.agentType) query = query.eq('agent_type', filters.agentType)
      if (filters?.channel) query = query.eq('channel', filters.channel)
      if (filters?.leadId) query = query.eq('lead_id', filters.leadId)

      const { data, error: fetchError } = await query
      if (fetchError) throw fetchError
      setConversations(data || [])
    } catch (err) {
      console.error('Error fetching conversations:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    total: conversations.length,
    active: conversations.filter(c => c.status === 'ai_active').length,
    needsHuman: conversations.filter(c => c.status === 'needs_human').length,
    closed: conversations.filter(c => c.status === 'closed').length,
    unread: conversations.filter(c => c.unread).length,
  }

  return { conversations, loading, error, refetch: fetchConversations, stats, isConfigured: isSupabaseConfigured() }
}

export function useMessages(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (conversationId) fetchMessages()
  }, [conversationId])

  async function fetchMessages() {
    if (!isSupabaseConfigured() || !supabase) {
      setMessages([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('sent_at', { ascending: true })

      if (fetchError) throw fetchError
      setMessages(data || [])
    } catch (err) {
      console.error('Error fetching messages:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  // Subscribe to realtime messages
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase || !conversationId) return

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [conversationId])

  return { messages, loading, error, refetch: fetchMessages }
}