import { useEffect, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Appraisal } from '../types/database'

export type AppraisalStatus = 
  | 'web_estimate' 
  | 'remote_gathering'
  | 'visit_scheduled' 
  | 'visit_completed' 
  | 'processing' 
  | 'draft' 
  | 'pending_review' 
  | 'approved_by_admin' 
  | 'signed' 
  | 'delivered' 
  | 'cancelled'

export const APPRAISAL_STATUS_CONFIG: Record<AppraisalStatus, { label: string; color: string; bgColor: string }> = {
  web_estimate: { label: 'Web', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  remote_gathering: { label: 'Remota', color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  visit_scheduled: { label: 'Agendada', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  visit_completed: { label: 'Visitada', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  processing: { label: 'En Proceso', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  draft: { label: 'Borrador', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  pending_review: { label: 'Revisar', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  approved_by_admin: { label: 'Aprobada', color: 'text-green-600', bgColor: 'bg-green-100' },
  signed: { label: 'Firmada', color: 'text-green-600', bgColor: 'bg-green-100' },
  delivered: { label: 'Entregada', color: 'text-green-700', bgColor: 'bg-green-200' },
  cancelled: { label: 'Cancelada', color: 'text-red-600', bgColor: 'bg-red-100' },
}

export function useAppraisals(filters?: {
  status?: AppraisalStatus
  type?: 'market_valuation' | 'formal_appraisal'
  agentId?: string
  limit?: number
}) {
  const [appraisals, setAppraisals] = useState<Appraisal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const updateAppraisalInState = useCallback((updatedAppraisal: Appraisal) => {
    setAppraisals(current => 
      current.map(appraisal => 
        appraisal.id === updatedAppraisal.id ? { ...appraisal, ...updatedAppraisal } : appraisal
      )
    )
  }, [])

  const fetchAppraisals = useCallback(async (options?: { silent?: boolean }) => {
    if (!isSupabaseConfigured() || !supabase) {
      console.warn('Supabase not configured, using fallback data')
      setAppraisals([])
      setLoading(false)
      return
    }

    try {
      if (!options?.silent) setLoading(true)
      setError(null)

      let query = supabase
        .from('appraisals')
        .select('*')
        .order('created_at', { ascending: false })

      if (filters?.status) query = query.eq('status', filters.status)
      if (filters?.type) query = query.eq('type', filters.type)
      if (filters?.agentId) query = query.eq('assigned_agent_id', filters.agentId)
      if (filters?.limit) query = query.limit(filters.limit)

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      setAppraisals(data || [])
    } catch (err) {
      console.error('Error fetching appraisals:', err)
      if (!options?.silent) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
        setAppraisals([])
      }
    } finally {
      if (!options?.silent) setLoading(false)
    }
  }, [filters?.status, filters?.type, filters?.agentId, filters?.limit])

  useEffect(() => {
    fetchAppraisals()

    // Suscribirse a cambios en tiempo real
    if (isSupabaseConfigured() && supabase) {
      const channel = supabase
        .channel('appraisals-realtime')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'appraisals' },
          (payload) => {
            console.log('Appraisal actualizado en tiempo real:', payload.new)
            // Refetch full data — realtime payload may not include large JSONB columns
            fetchAppraisals({ silent: true })
          }
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'appraisals' },
          (payload) => {
            console.log('Nueva tasación:', payload.new)
            setAppraisals(current => [payload.new as Appraisal, ...current])
          }
        )
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'appraisals' },
          (payload) => {
            console.log('Tasación eliminada:', payload.old)
            setAppraisals(current => current.filter(a => a.id !== (payload.old as Appraisal).id))
          }
        )
        .subscribe()

      return () => {
        supabase?.removeChannel(channel)
      }
    }
  }, [fetchAppraisals, updateAppraisalInState])

  const appraisalsByStatus = useCallback((status: AppraisalStatus) => 
    appraisals.filter(a => a.status === status), [appraisals])

  const stats = {
    total: appraisals.length,
    web_estimate: appraisals.filter(a => a.status === 'web_estimate').length,
    visit_scheduled: appraisals.filter(a => a.status === 'visit_scheduled').length,
    visit_completed: appraisals.filter(a => a.status === 'visit_completed').length,
    processing: appraisals.filter(a => a.status === 'processing').length,
    draft: appraisals.filter(a => a.status === 'draft').length,
    pending_review: appraisals.filter(a => a.status === 'pending_review').length,
    approved_by_admin: appraisals.filter(a => a.status === 'approved_by_admin').length,
    signed: appraisals.filter(a => a.status === 'signed').length,
    delivered: appraisals.filter(a => a.status === 'delivered').length,
    cancelled: appraisals.filter(a => a.status === 'cancelled').length,
  }

  return {
    appraisals,
    loading,
    error,
    refetch: fetchAppraisals,
    appraisalsByStatus,
    stats,
    isConfigured: isSupabaseConfigured()
  }
}

export function useAppraisal(id: string) {
  const [appraisal, setAppraisal] = useState<Appraisal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) fetchAppraisal()
  }, [id])

  async function fetchAppraisal() {
    if (!isSupabaseConfigured() || !supabase) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('appraisals')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError
      setAppraisal(data)
    } catch (err) {
      console.error('Error fetching appraisal:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return { appraisal, loading, error, refetch: fetchAppraisal }
}

// Funciones de mutación
// Nota: Usamos cast temporal hasta regenerar los tipos de Supabase con los nuevos campos
export async function updateAppraisalStatus(id: string, status: AppraisalStatus) {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase not configured')
  }

  const { data, error } = await (supabase as any)
    .from('appraisals')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Appraisal
}

export async function scheduleVisit(id: string, visitDate: string, visitNotes?: string) {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase not configured')
  }

  // If notes provided, merge into property_data
  let updateObj: any = { 
    status: 'visit_scheduled',
    type: 'formal_appraisal',
    visit_scheduled_at: visitDate,
    updated_at: new Date().toISOString() 
  }

  if (visitNotes) {
    // Fetch current property_data to merge
    const { data: current } = await (supabase as any).from('appraisals').select('property_data').eq('id', id).single()
    const propertyData = current?.property_data || {}
    updateObj.property_data = { ...propertyData, visit_notes: visitNotes }
  }

  const { data, error } = await (supabase as any)
    .from('appraisals')
    .update(updateObj)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Appraisal
}

export async function completeVisit(id: string, notes?: string) {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase not configured')
  }

  const { data, error } = await (supabase as any)
    .from('appraisals')
    .update({ 
      status: 'visit_completed', 
      visited_at: new Date().toISOString(),
      notes: notes || null,
      updated_at: new Date().toISOString() 
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Appraisal
}

export async function createAppraisal(appraisal: Partial<Appraisal>) {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase not configured')
  }

  const { data, error } = await (supabase as any)
    .from('appraisals')
    .insert({
      ...appraisal,
      status: appraisal.status || 'web_estimate',
      type: appraisal.type || 'market_valuation',
    })
    .select()
    .single()

  if (error) throw error
  return data as Appraisal
}
