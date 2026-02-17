import { useNavigate } from 'react-router-dom'
import { X, Phone, MessageCircle, Calendar, Users, Trello, Inbox } from 'lucide-react'
import { Avatar } from './Avatar'
import { PipelineLead, PipelineStage, AgentType } from '../types'

interface LeadDetailModalProps {
  lead: PipelineLead
  onClose: () => void
  currentPage: 'leads' | 'pipeline' | 'inbox'
}

export const LeadDetailModal = ({ lead, onClose, currentPage }: LeadDetailModalProps) => {
  const navigate = useNavigate()

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'bg-emerald-100 text-emerald-700'
    if (score >= 40) return 'bg-amber-100 text-amber-700'
    return 'bg-red-100 text-red-700'
  }

  const getScoreDot = (score: number) => {
    if (score >= 70) return 'bg-emerald-500'
    if (score >= 40) return 'bg-amber-500'
    return 'bg-red-500'
  }

  const getStageBadge = (stage: PipelineStage) => {
    const colors: Record<PipelineStage, string> = {
      nuevo: 'bg-gray-500',
      calificado: 'bg-blue-500',
      contactado: 'bg-purple-500',
      visita: 'bg-amber-500',
      cierre: 'bg-emerald-500',
    }
    const labels: Record<PipelineStage, string> = {
      nuevo: 'Nuevo',
      calificado: 'Calificado',
      contactado: 'Contactado',
      visita: 'Visita',
      cierre: 'Cierre',
    }
    return (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium text-white ${colors[stage]}`}>
        {labels[stage]}
      </span>
    )
  }

  const getAgentTypeBadge = (type: AgentType) => {
    const config: Record<AgentType, { label: string; color: string }> = {
      emprendimientos: { label: 'Emprendimientos', color: 'bg-blue-100 text-blue-700' },
      inmuebles: { label: 'Propiedades', color: 'bg-purple-100 text-purple-700' },
      tasaciones: { label: 'Tasaciones', color: 'bg-amber-100 text-amber-700' },
    }
    return (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${config[type].color}`}>
        {config[type].label}
      </span>
    )
  }

  const handleNavigate = (page: 'leads' | 'pipeline' | 'inbox') => {
    onClose()
    if (page === 'inbox') {
      // TODO: Navigate to specific conversation when we have real IDs
      navigate('/inbox')
    } else {
      navigate(`/${page}`)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <Avatar name={lead.name} size="lg" />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900">{lead.name}</h3>
            <p className="text-sm text-gray-500">{lead.project}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${getScoreColor(lead.score)}`}>
                <span className={`w-2 h-2 rounded-full ${getScoreDot(lead.score)}`} />
                Score {lead.score}
              </span>
              {getStageBadge(lead.stage)}
              {getAgentTypeBadge(lead.agentType)}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Details */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Teléfono</span>
            <span className="text-gray-900 font-medium">{lead.phone}</span>
          </div>
          {lead.email && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Email</span>
              <span className="text-gray-900 truncate ml-4">{lead.email}</span>
            </div>
          )}
          {lead.budget && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Ticket</span>
              <span className="text-emerald-600 font-semibold">{lead.budgetCurrency || 'USD'} {lead.budget}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Interés</span>
            <span className="text-gray-900 truncate ml-4">{lead.interest}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Canal</span>
            <span className="text-gray-900 capitalize">{lead.channel}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Creado</span>
            <span className="text-gray-900">{lead.createdAt}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Última actividad</span>
            <span className="text-gray-900">{lead.lastActivity}</span>
          </div>
          {lead.assignedTo && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Asignado a</span>
              <span className="text-gray-900">{lead.assignedTo}</span>
            </div>
          )}
          {lead.scheduledDate && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Visita agendada</span>
              <span className="text-purple-600 font-medium">{lead.scheduledDate}</span>
            </div>
          )}
          {lead.notes && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Notas</p>
              <p className="text-sm text-amber-700 bg-amber-50 p-2.5 rounded-lg">{lead.notes}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-4">
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors">
            <Phone className="w-4 h-4" />
            Llamar
          </button>
          <button 
            onClick={() => handleNavigate('inbox')}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Chat
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors">
            <Calendar className="w-4 h-4" />
            Agendar
          </button>
        </div>

        {/* Navigation Links */}
        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-2">Ver en</p>
          <div className="flex gap-2">
            {currentPage !== 'pipeline' && (
              <button
                onClick={() => handleNavigate('pipeline')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                <Trello className="w-3.5 h-3.5" />
                Pipeline
              </button>
            )}
            {currentPage !== 'leads' && (
              <button
                onClick={() => handleNavigate('leads')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                <Users className="w-3.5 h-3.5" />
                Leads
              </button>
            )}
            {currentPage !== 'inbox' && (
              <button
                onClick={() => handleNavigate('inbox')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                <Inbox className="w-3.5 h-3.5" />
                Historial Chat
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
