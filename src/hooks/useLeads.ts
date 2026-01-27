import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Lead } from '../types/database'

export function useLeads(filters?: {
  stage?: string
  agentType?: string
  projectId?: string
  limit?: number
}) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLeads()
  }, [filters?.stage, filters?.agentType, filters?.projectId])

  async function fetchLeads() {
    if (!isSupabaseConfigured() || !supabase) {
      console.warn('Supabase not configured, using fallback data')
      setLeads([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      if (filters?.stage) query = query.eq('stage', filters.stage)
      if (filters?.agentType) query = query.eq('agent_type', filters.agentType)
      if (filters?.projectId) query = query.eq('project_id', filters.projectId)
      if (filters?.limit) query = query.limit(filters.limit)

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      setLeads(data || [])
    } catch (err) {
      console.error('Error fetching leads:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setLeads([])
    } finally {
      setLoading(false)
    }
  }

  const leadsByStage = (stage: string) => leads.filter(l => l.stage === stage)

  const stats = {
    total: leads.length,
    nuevo: leads.filter(l => l.stage === 'nuevo').length,
    calificado: leads.filter(l => l.stage === 'calificado').length,
    contactado: leads.filter(l => l.stage === 'contactado').length,
    visita: leads.filter(l => l.stage === 'visita').length,
    cierre: leads.filter(l => l.stage === 'cierre').length,
    hot: leads.filter(l => (l.score || 0) >= 70).length,
    warm: leads.filter(l => (l.score || 0) >= 40 && (l.score || 0) < 70).length,
    cold: leads.filter(l => (l.score || 0) < 40).length,
  }

  return {
    leads,
    loading,
    error,
    refetch: fetchLeads,
    leadsByStage,
    stats,
    isConfigured: isSupabaseConfigured()
  }
}

export function useLead(id: string) {
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) fetchLead()
  }, [id])

  async function fetchLead() {
    if (!isSupabaseConfigured() || !supabase) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError
      setLead(data)
    } catch (err) {
      console.error('Error fetching lead:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return { lead, loading, error, refetch: fetchLead }
}