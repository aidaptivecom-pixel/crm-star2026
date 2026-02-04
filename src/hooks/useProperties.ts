import { useEffect, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export interface Property {
  id: string
  address: string
  neighborhood: string | null
  city: string | null
  type: string
  operation: string
  rooms: number | null
  bathrooms: number | null
  sqm_total: number | null
  sqm_covered: number | null
  price: number | null
  currency: string | null
  expenses: number | null
  expenses_currency: string | null
  status: string | null
  description: string | null
  features: string[] | null
  photos: string[] | null
  video_url: string | null
  tour_360_url: string | null
  floor: string | null
  orientation: string | null
  antiquity: number | null
  garage: boolean | null
  storage: boolean | null
  agent_id: string | null
  external_id: string | null
  zonaprop_url: string | null
  created_at: string | null
  updated_at: string | null
}

export interface PropertyInput {
  address: string
  neighborhood?: string
  city?: string
  type: string
  operation: string
  rooms?: number
  bathrooms?: number
  sqm_total?: number
  sqm_covered?: number
  price?: number
  currency?: string
  expenses?: number
  expenses_currency?: string
  status?: string
  description?: string
  features?: string[]
  photos?: string[]
  video_url?: string
  tour_360_url?: string
  floor?: string
  orientation?: string
  antiquity?: number
  garage?: boolean
  storage?: boolean
  agent_id?: string
  external_id?: string
  zonaprop_url?: string
}

export function useProperties(filters?: {
  status?: string
  type?: string
  operation?: string
  limit?: number
}) {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const updatePropertyInState = useCallback((updatedProperty: Property) => {
    setProperties(current =>
      current.map(prop =>
        prop.id === updatedProperty.id ? { ...prop, ...updatedProperty } : prop
      )
    )
  }, [])

  useEffect(() => {
    fetchProperties()

    // Suscribirse a cambios en tiempo real
    if (isSupabaseConfigured() && supabase) {
      const channel = supabase
        .channel('properties-realtime')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'properties' },
          (payload) => {
            console.log('Propiedad actualizada:', payload.new)
            updatePropertyInState(payload.new as Property)
          }
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'properties' },
          (payload) => {
            console.log('Nueva propiedad:', payload.new)
            setProperties(current => [payload.new as Property, ...current])
          }
        )
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'properties' },
          (payload) => {
            console.log('Propiedad eliminada:', payload.old)
            setProperties(current => current.filter(p => p.id !== (payload.old as Property).id))
          }
        )
        .subscribe()

      return () => {
        supabase?.removeChannel(channel)
      }
    }
  }, [filters?.status, filters?.type, filters?.operation, updatePropertyInState])

  async function fetchProperties() {
    if (!isSupabaseConfigured() || !supabase) {
      console.warn('Supabase not configured, using fallback data')
      setProperties([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })

      if (filters?.status) query = query.eq('status', filters.status)
      if (filters?.type) query = query.eq('type', filters.type)
      if (filters?.operation) query = query.eq('operation', filters.operation)
      if (filters?.limit) query = query.limit(filters.limit)

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      setProperties(data || [])
    } catch (err) {
      console.error('Error fetching properties:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setProperties([])
    } finally {
      setLoading(false)
    }
  }

  async function createProperty(input: PropertyInput): Promise<Property | null> {
    if (!isSupabaseConfigured() || !supabase) {
      console.error('Supabase not configured')
      return null
    }

    try {
      const { data, error: insertError } = await (supabase
        .from('properties') as any)
        .insert(input)
        .select()
        .single()

      if (insertError) throw insertError

      return data as Property
    } catch (err) {
      console.error('Error creating property:', err)
      setError(err instanceof Error ? err.message : 'Error al crear propiedad')
      return null
    }
  }

  async function updateProperty(id: string, updates: Partial<PropertyInput>): Promise<Property | null> {
    if (!isSupabaseConfigured() || !supabase) {
      console.error('Supabase not configured')
      return null
    }

    try {
      const updateData = { ...updates, updated_at: new Date().toISOString() }
      const { data, error: updateError } = await (supabase
        .from('properties') as any)
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      return data as Property
    } catch (err) {
      console.error('Error updating property:', err)
      setError(err instanceof Error ? err.message : 'Error al actualizar propiedad')
      return null
    }
  }

  async function deleteProperty(id: string): Promise<boolean> {
    if (!isSupabaseConfigured() || !supabase) {
      console.error('Supabase not configured')
      return false
    }

    try {
      const { error: deleteError } = await (supabase
        .from('properties') as any)
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      return true
    } catch (err) {
      console.error('Error deleting property:', err)
      setError(err instanceof Error ? err.message : 'Error al eliminar propiedad')
      return false
    }
  }

  const stats = {
    total: properties.length,
    disponible: properties.filter(p => p.status === 'disponible').length,
    reservada: properties.filter(p => p.status === 'reservada').length,
    vendida: properties.filter(p => p.status === 'vendida').length,
    venta: properties.filter(p => p.operation === 'venta').length,
    alquiler: properties.filter(p => p.operation === 'alquiler').length,
  }

  return {
    properties,
    loading,
    error,
    refetch: fetchProperties,
    createProperty,
    updateProperty,
    deleteProperty,
    stats,
    isConfigured: isSupabaseConfigured()
  }
}

export function useProperty(id: string) {
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) fetchProperty()
  }, [id])

  async function fetchProperty() {
    if (!isSupabaseConfigured() || !supabase) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError
      setProperty(data)
    } catch (err) {
      console.error('Error fetching property:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return { property, loading, error, refetch: fetchProperty }
}
