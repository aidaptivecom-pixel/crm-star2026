import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

// Types
export interface CompanySettings {
  id: string
  company_name: string
  phone: string | null
  email: string | null
  address: string | null
  logo_url: string | null
  business_hours_start: string
  business_hours_end: string
  business_days: number[]
  timezone: string
}

export interface UserSettings {
  id: string
  sound_enabled: boolean
  desktop_notifications: boolean
  email_notifications: boolean
  notification_sound: string
  theme: string
  language: string
}

export interface AgentConfig {
  id: string
  agent_type: string
  is_active: boolean
  auto_reply_enabled: boolean
  response_delay_seconds: number
  max_conversations: number
  handoff_threshold: number
  active_hours_start: string | null
  active_hours_end: string | null
  active_days: number[] | null
}

// Hook
export function useSettings() {
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null)
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null)
  const [agentConfigs, setAgentConfigs] = useState<AgentConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load all settings
  const loadSettings = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured()) {
      setLoading(false)
      setError('Supabase not configured')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      // Load company settings - use any to bypass type checking for new tables
      const { data: company, error: companyError } = await (supabase as any)
        .from('company_settings')
        .select('*')
        .limit(1)
        .single()
      
      if (companyError && companyError.code !== 'PGRST116') {
        console.warn('Company settings error:', companyError)
      }
      setCompanySettings(company)

      // Load user settings (first one for now, later filter by user)
      const { data: user, error: userError } = await (supabase as any)
        .from('user_settings')
        .select('*')
        .limit(1)
        .single()
      
      if (userError && userError.code !== 'PGRST116') {
        console.warn('User settings error:', userError)
      }
      setUserSettings(user)

      // Load agent configs
      const { data: agents, error: agentsError } = await (supabase as any)
        .from('agent_config')
        .select('*')
        .order('agent_type')
      
      if (agentsError) {
        console.warn('Agent config error:', agentsError)
      }
      setAgentConfigs(agents || [])

    } catch (err) {
      console.error('Error loading settings:', err)
      setError(err instanceof Error ? err.message : 'Error loading settings')
    } finally {
      setLoading(false)
    }
  }, [])

  // Save company settings
  const saveCompanySettings = useCallback(async (data: Partial<CompanySettings>) => {
    if (!supabase) return false
    
    setSaving(true)
    setError(null)
    
    try {
      if (companySettings?.id) {
        const { error } = await (supabase as any)
          .from('company_settings')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', companySettings.id)
        
        if (error) throw error
        setCompanySettings(prev => prev ? { ...prev, ...data } : null)
      } else {
        // Insert new
        const { data: newData, error } = await (supabase as any)
          .from('company_settings')
          .insert(data)
          .select()
          .single()
        
        if (error) throw error
        setCompanySettings(newData)
      }
      return true
    } catch (err) {
      console.error('Error saving company settings:', err)
      setError(err instanceof Error ? err.message : 'Error saving')
      return false
    } finally {
      setSaving(false)
    }
  }, [companySettings])

  // Save user settings
  const saveUserSettings = useCallback(async (data: Partial<UserSettings>) => {
    if (!supabase) return false
    
    setSaving(true)
    setError(null)
    
    try {
      if (userSettings?.id) {
        const { error } = await (supabase as any)
          .from('user_settings')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', userSettings.id)
        
        if (error) throw error
        setUserSettings(prev => prev ? { ...prev, ...data } : null)
      } else {
        const { data: newData, error } = await (supabase as any)
          .from('user_settings')
          .insert(data)
          .select()
          .single()
        
        if (error) throw error
        setUserSettings(newData)
      }
      return true
    } catch (err) {
      console.error('Error saving user settings:', err)
      setError(err instanceof Error ? err.message : 'Error saving')
      return false
    } finally {
      setSaving(false)
    }
  }, [userSettings])

  // Save agent config
  const saveAgentConfig = useCallback(async (agentType: string, data: Partial<AgentConfig>) => {
    if (!supabase) return false
    
    setSaving(true)
    setError(null)
    
    try {
      const { error } = await (supabase as any)
        .from('agent_config')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('agent_type', agentType)
      
      if (error) throw error
      
      setAgentConfigs(prev => 
        prev.map(a => a.agent_type === agentType ? { ...a, ...data } : a)
      )
      return true
    } catch (err) {
      console.error('Error saving agent config:', err)
      setError(err instanceof Error ? err.message : 'Error saving')
      return false
    } finally {
      setSaving(false)
    }
  }, [])

  // Get agent config by type
  const getAgentConfig = useCallback((agentType: string) => {
    return agentConfigs.find(a => a.agent_type === agentType)
  }, [agentConfigs])

  // Load on mount
  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  return {
    // Data
    companySettings,
    userSettings,
    agentConfigs,
    // State
    loading,
    saving,
    error,
    // Actions
    loadSettings,
    saveCompanySettings,
    saveUserSettings,
    saveAgentConfig,
    getAgentConfig,
    // Setters for optimistic updates
    setCompanySettings,
    setUserSettings,
    setAgentConfigs,
  }
}
