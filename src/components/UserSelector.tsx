import { useEffect, useState } from 'react'
import { Star, Loader2 } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Agent } from '../types/database'

interface UserSelectorProps {
  onSelect: (id: string, name: string, role: string) => void
}

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-[#D4A745]',
  agent: 'bg-blue-500',
  developer: 'bg-emerald-500',
  viewer: 'bg-gray-400',
}

function getInitials(name: string, lastName?: string | null): string {
  const first = name?.charAt(0) || ''
  const last = lastName?.charAt(0) || name?.split(' ')[1]?.charAt(0) || ''
  return (first + last).toUpperCase()
}

function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    admin: 'Administrador',
    agent: 'Agente',
    developer: 'Desarrollador',
    viewer: 'Visualizador',
  }
  return labels[role] || role
}

export function UserSelector({ onSelect }: UserSelectorProps) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAgents() {
      if (!isSupabaseConfigured() || !supabase) {
        setLoading(false)
        return
      }
      try {
        const { data, error } = await supabase
          .from('agents')
          .select('*')
          .eq('is_active', true)
          .eq('type', 'human')
          .order('name')

        if (error) throw error
        setAgents((data || []) as Agent[])
      } catch (err) {
        console.error('Error fetching agents:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAgents()
  }, [])

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-[#D4A745] rounded-xl flex items-center justify-center shadow-md">
          <Star className="w-7 h-7 text-white fill-white" />
        </div>
        <span className="font-bold text-3xl tracking-tight text-gray-900">STAR</span>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">¿Quién está usando el sistema?</h1>
      <p className="text-gray-500 mb-10">Seleccioná tu perfil para continuar</p>

      {/* Grid */}
      {loading ? (
        <Loader2 className="w-8 h-8 text-[#D4A745] animate-spin" />
      ) : agents.length === 0 ? (
        <p className="text-gray-500">No se encontraron usuarios activos</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 max-w-4xl">
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => onSelect(agent.id, agent.name, agent.role || 'viewer')}
              className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer group"
            >
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold ${ROLE_COLORS[agent.role || 'viewer'] || 'bg-gray-400'} group-hover:ring-4 group-hover:ring-[#D4A745]/20 transition-all`}
              >
                {getInitials(agent.name, agent.last_name)}
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-800 text-sm">
                  {agent.name} {agent.last_name || ''}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {getRoleLabel(agent.role || 'viewer')}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
