import { useEffect, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Project } from '../types/database'

export interface ProjectInput {
  slug: string
  name: string
  location?: string | null
  direccion?: string | null
  description?: string | null
  estado?: 'preventa' | 'en_construccion' | 'entrega_inmediata' | 'disponible' | 'vendido' | null
  entrega?: string | null
  units_available?: number | null
  total_units?: number | null
  price_min?: number | null
  price_max?: number | null
  price_currency?: string | null
  precio_m2_min?: number | null
  precio_m2_max?: number | null
  features?: any | null
  amenities?: any | null
  tipologias?: any | null
  tipologias_texto?: string | null
  oferta_especial?: any | null
  lotes_disponibles?: any | null
  financiacion?: string | null
  contact_phone?: string | null
  website?: string | null
  images?: any | null
  brochure_url?: string | null
  pendiente_info?: boolean | null
}

const FALLBACK_PROJECTS: Project[] = []

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const updateProjectInState = useCallback((updatedProject: Project) => {
    setProjects(current =>
      current.map(p =>
        p.id === updatedProject.id ? { ...p, ...updatedProject } : p
      )
    )
  }, [])

  useEffect(() => {
    fetchProjects()

    // Real-time subscription
    if (isSupabaseConfigured() && supabase) {
      const channel = supabase
        .channel('projects-realtime')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'projects' },
          (payload) => {
            console.log('Proyecto actualizado:', payload.new)
            updateProjectInState(payload.new as Project)
          }
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'projects' },
          (payload) => {
            console.log('Nuevo proyecto:', payload.new)
            setProjects(current => [payload.new as Project, ...current])
          }
        )
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'projects' },
          (payload) => {
            console.log('Proyecto eliminado:', payload.old)
            setProjects(current => current.filter(p => p.id !== (payload.old as any).id))
          }
        )
        .subscribe()

      return () => {
        supabase?.removeChannel(channel)
      }
    }
  }, [updateProjectInState])

  async function fetchProjects() {
    if (!isSupabaseConfigured() || !supabase) {
      console.warn('Supabase not configured, using fallback data')
      setProjects(FALLBACK_PROJECTS)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .order('name')

      if (fetchError) throw fetchError

      setProjects(data || [])
    } catch (err) {
      console.error('Error fetching projects:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setProjects(FALLBACK_PROJECTS)
    } finally {
      setLoading(false)
    }
  }

  async function createProject(input: ProjectInput): Promise<Project | null> {
    if (!isSupabaseConfigured() || !supabase) {
      console.error('Supabase not configured')
      return null
    }

    try {
      const { data, error: insertError } = await (supabase
        .from('projects') as any)
        .insert(input)
        .select()
        .single()

      if (insertError) throw insertError

      return data as Project
    } catch (err) {
      console.error('Error creating project:', err)
      setError(err instanceof Error ? err.message : 'Error al crear emprendimiento')
      return null
    }
  }

  async function updateProject(id: string, updates: Partial<ProjectInput>): Promise<Project | null> {
    if (!isSupabaseConfigured() || !supabase) {
      console.error('Supabase not configured')
      return null
    }

    try {
      const updateData = { ...updates, updated_at: new Date().toISOString() }
      const { data, error: updateError } = await (supabase
        .from('projects') as any)
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      return data as Project
    } catch (err) {
      console.error('Error updating project:', err)
      setError(err instanceof Error ? err.message : 'Error al actualizar emprendimiento')
      return null
    }
  }

  async function deleteProject(id: string): Promise<boolean> {
    if (!isSupabaseConfigured() || !supabase) {
      console.error('Supabase not configured')
      return false
    }

    try {
      const { error: deleteError } = await (supabase
        .from('projects') as any)
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      return true
    } catch (err) {
      console.error('Error deleting project:', err)
      setError(err instanceof Error ? err.message : 'Error al eliminar emprendimiento')
      return false
    }
  }

  const stats = {
    total: projects.length,
    en_construccion: projects.filter(p => p.estado === 'en_construccion').length,
    entrega_inmediata: projects.filter(p => p.estado === 'entrega_inmediata' || p.estado === 'disponible').length,
    preventa: projects.filter(p => p.estado === 'preventa').length,
  }

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    stats,
    isConfigured: isSupabaseConfigured()
  }
}

export function useProject(slug: string) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (slug) fetchProject()
  }, [slug])

  async function fetchProject() {
    if (!isSupabaseConfigured() || !supabase) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .single()

      if (fetchError) throw fetchError

      setProject(data)
    } catch (err) {
      console.error('Error fetching project:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return { project, loading, error, refetch: fetchProject }
}
