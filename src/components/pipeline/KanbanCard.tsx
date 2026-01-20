import { useState } from 'react'
import { MoreHorizontal, Phone, Mail, Calendar, ChevronRight } from 'lucide-react'
import { PipelineLead, PipelineStage } from '../../types'
import { Avatar } from '../Avatar'

interface KanbanCardProps {
  lead: PipelineLead
  allColumns: { id: PipelineStage; title: string; color: string }[]
  currentStage: PipelineStage
  onMove: (leadId: string, newStage: PipelineStage) => void
}

export const KanbanCard = ({ lead, allColumns, currentStage, onMove }: KanbanCardProps) => {
  const [showMenu, setShowMenu] = useState(false)

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-100 text-emerald-700'
    if (score >= 60) return 'bg-amber-100 text-amber-700'
    return 'bg-red-100 text-red-700'
  }

  const getAgentBadge = (type: PipelineLead['agentType']) => {
    switch (type) {
      case 'emprendimientos':
        return <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
      case 'inmuebles':
        return <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
      case 'tasaciones':
        return <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
    }
  }

  const getChannelIcon = (channel: PipelineLead['channel']) => {
    switch (channel) {
      case 'whatsapp': return '💬'
      case 'instagram': return '📷'
      case 'facebook': return '👤'
    }
  }

  const currentIndex = allColumns.findIndex(c => c.id === currentStage)
  const nextStage = allColumns[currentIndex + 1]

  return (
    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Avatar name={lead.name} size="sm" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-sm text-gray-900 truncate">{lead.name}</span>
              {getAgentBadge(lead.agentType)}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span>{lead.project}</span>
              <span className="text-gray-300">·</span>
              <span>{getChannelIcon(lead.channel)}</span>
            </div>
          </div>
        </div>
        
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-8 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
              <button className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <Phone className="w-4 h-4" /> Llamar
              </button>
              <button className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email
              </button>
              <button className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Agendar
              </button>
              <hr className="my-1" />
              {allColumns.filter(c => c.id !== currentStage).map(col => (
                <button
                  key={col.id}
                  onClick={() => { onMove(lead.id, col.id); setShowMenu(false) }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <span className={`w-2 h-2 rounded-full ${col.color}`} />
                  Mover a {col.title}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Interest */}
      <p className="text-xs text-gray-600 mb-2 truncate">{lead.interest}</p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${getScoreColor(lead.score)}`}>
            {lead.score}
          </span>
          {lead.budget && (
            <span className="text-xs text-gray-500">
              USD {lead.budget}
            </span>
          )}
        </div>
        
        {nextStage && (
          <button
            onClick={(e) => { e.stopPropagation(); onMove(lead.id, nextStage.id) }}
            className="flex items-center gap-0.5 text-[10px] text-gray-400 hover:text-[#D4A745] transition-colors"
            title={`Mover a ${nextStage.title}`}
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Scheduled Date */}
      {lead.scheduledDate && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1 text-xs text-purple-600">
            <Calendar className="w-3 h-3" />
            <span>{lead.scheduledDate}</span>
          </div>
        </div>
      )}

      {/* Notes */}
      {lead.notes && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <p className="text-[10px] text-gray-500 italic truncate">{lead.notes}</p>
        </div>
      )}

      {/* Last Activity */}
      <p className="text-[10px] text-gray-400 mt-2">{lead.lastActivity}</p>
    </div>
  )
}
