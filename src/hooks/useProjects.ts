import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Project } from '../types/database'

// Fallback data when Supabase is not configured
const FALLBACK_PROJECTS: Project[] = []

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProjects()
  }, [])

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

  return { 
    projects, 
    loading, 
    error, 
    refetch: fetchProjects,
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
