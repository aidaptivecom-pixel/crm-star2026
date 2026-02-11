import { useEffect, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Agent } from '../types/database'

interface ProfileForm {
  name: string
  last_name: string
  email: string
  phone: string
}

export function useProfile() {
  const [activeAgent, setActiveAgentState] = useState<Agent | null>(null)
  const [humanAgents, setHumanAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAgents = useCallback(async () => {
    if (!isSupabaseConfigured() || !supabase) {
      console.warn('Supabase not configured')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('agents')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (fetchError) throw fetchError

      const agents = (data || []) as Agent[]
      const humans = agents.filter(a => a.type === 'human')
      setHumanAgents(humans)

      // Read active user from localStorage (set by UserSelector)
      if (!activeAgent) {
        const storedId = localStorage.getItem('star-crm-active-user-id')
        const matchedAgent = storedId
          ? humans.find(a => a.id === storedId) || null
          : humans.find(a => a.role === 'admin') || humans[0] || null
        setActiveAgentState(matchedAgent)
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  const updateProfile = async (form: ProfileForm) => {
    if (!activeAgent || !supabase) return false

    try {
      setSaving(true)
      setError(null)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase as any)
        .from('agents')
        .update({
          name: form.name,
          last_name: form.last_name || null,
          email: form.email || null,
          phone: form.phone || null,
        })
        .eq('id', activeAgent.id)

      if (updateError) throw updateError

      // Update local state
      const updated = { ...activeAgent, ...form }
      setActiveAgentState(updated)
      setHumanAgents(prev => prev.map(a => a.id === updated.id ? updated : a))

      return true
    } catch (err) {
      console.error('Error updating profile:', err)
      setError(err instanceof Error ? err.message : 'Error al guardar')
      return false
    } finally {
      setSaving(false)
    }
  }

  const setActiveAgent = (agent: Agent) => {
    setActiveAgentState(agent)
  }

  return {
    activeAgent,
    humanAgents,
    loading,
    saving,
    error,
    updateProfile,
    setActiveAgent,
  }
}
