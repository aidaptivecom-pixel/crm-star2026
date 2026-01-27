import { useState, useEffect } from 'react'
import { Trello, Search, Plus, GripVertical } from 'lucide-react'
import { Avatar } from '../components/Avatar'
import { LeadDetailModal } from '../components/LeadDetailModal'
import { useLeads, useProjects } from '../hooks'
import { mapLeadToPipelineLead } from '../lib/mappers'
import { PipelineLead, PipelineStage } from '../types'

const STAGES: { id: PipelineStage; title: string; color: string }[] = [
  { id: 'nuevo', title: 'Nuevo', color: 'bg-gray-500' },
  { id: 'calificado', title: 'Calificado', color: 'bg-blue-500' },
  { id: 'contactado', title: 'Contactado', color: 'bg-purple-500' },
  { id: 'visita', title: 'Visita', color: 'bg-amber-500' },
  { id: 'cierre', title: 'Cierre', color: 'bg-emerald-500' },
]

export const Pipeline = () => {
  const { leads: dbLeads, loading } = useLeads()
  const { projects } = useProjects()

  const [leads, setLeads] = useState<PipelineLead[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [draggedLead, setDraggedLead] = useState<PipelineLead | null>(null)
  const [selectedLead, setSelectedLead] = useState<PipelineLead | null>(null)

  // Sync from Supabase when data loads
  useEffect(() => {
    setLeads(dbLeads.map(l => mapLeadToPipelineLead(l, projects)))
  }, [dbLeads, projects])

  // Filter leads by search
  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.project.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Group leads by stage
  const getLeadsByStage = (stage: PipelineStage) =>
    filteredLeads.filter(lead => lead.stage === stage)

  // Drag handlers
  const handleDragStart = (lead: PipelineLead) => {
    setDraggedLead(lead)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (stage: PipelineStage) => {
    if (draggedLead && draggedLead.stage !== stage) {
      setLeads(prev =>
        prev.map(lead =>
          lead.id === draggedLead.id ? { ...lead, stage } : lead
        )
      )
    }
    setDraggedLead(null)
  }

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

  const getAgentBadge = (type: PipelineLead['agentType']) => {
    switch (type) {
      case 'emprendimientos':
        return <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
      case 'inmuebles':
        return <span className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0" />
      case 'tasaciones':
        return <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
    }
  }

  // Calculate totals
  const totalValue = filteredLeads
    .filter(l => l.budget)
    .reduce((sum, l) => sum + parseInt(l.budget?.replace(/,/g, '') || '0'), 0)

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center bg-[#F8F9FA]">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#D4A745] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Cargando pipeline...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-[#F8F9FA]">
      {/* Header */}
      <div className="flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-white">
        {/* Top Row */}
        <div className="flex items-center justify-between gap-3 mb-3 sm:mb-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <Trello className="w-5 sm:w-6 h-5 sm:h-6 text-[#D4A745]" />
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Pipeline</h1>
            <span className="hidden sm:inline bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
              {filteredLeads.length} leads
            </span>
            {totalValue > 0 && (
              <span className="hidden md:inline bg-emerald-50 text-emerald-700 text-xs font-medium px-2 py-1 rounded-full">
                USD {(totalValue / 1000000).toFixed(1)}M
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Add Lead */}
            <button className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-[#D4A745] text-white rounded-lg text-sm font-medium hover:bg-[#c49a3d] transition-colors">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo Lead</span>
            </button>
          </div>
        </div>

        {/* Search Row - Full width on mobile */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar lead..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 lg:w-80 bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50 focus:border-[#D4A745]"
            />
          </div>
          
          {/* Mobile stats */}
          <div className="flex sm:hidden items-center gap-2">
            <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
              {filteredLeads.length}
            </span>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-3 sm:p-4">
        {leads.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Trello className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-lg font-medium mb-1">No hay leads aún</p>
              <p className="text-gray-400 text-sm">Los leads aparecerán aquí cuando se carguen</p>
            </div>
          </div>
        ) : (
          <div className="flex lg:grid lg:grid-cols-5 gap-3 h-full min-w-max lg:min-w-0">
            {STAGES.map((stage) => {
              const stageLeads = getLeadsByStage(stage.id)
              const stageValue = stageLeads
                .filter(l => l.budget)
                .reduce((sum, l) => sum + parseInt(l.budget?.replace(/,/g, '') || '0'), 0)
              
              return (
                <div
                  key={stage.id}
                  className="flex flex-col bg-gray-100 rounded-xl w-[280px] sm:w-[300px] lg:w-auto flex-shrink-0 lg:flex-shrink overflow-hidden"
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(stage.id)}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between px-3 py-2.5 flex-shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2.5 h-2.5 rounded-full ${stage.color} flex-shrink-0`} />
                      <h3 className="font-semibold text-sm text-gray-700 truncate">{stage.title}</h3>
                      <span className="bg-white text-gray-500 text-xs font-medium px-1.5 py-0.5 rounded-full flex-shrink-0">
                        {stageLeads.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {stageValue > 0 && (
                        <span className="text-[10px] text-emerald-600 font-medium">
                          ${(stageValue / 1000).toFixed(0)}k
                        </span>
                      )}
                      <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded flex-shrink-0">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Cards */}
                  <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2">
                    {stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={() => handleDragStart(lead)}
                        onClick={() => setSelectedLead(lead)}
                        className={`bg-white rounded-lg p-2.5 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-gray-200 transition-all ${
                          draggedLead?.id === lead.id ? 'opacity-50 scale-95' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className="cursor-grab text-gray-300 hover:text-gray-400 flex-shrink-0 hidden sm:block">
                            <GripVertical className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            {/* Name & Score */}
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <Avatar name={lead.name} size="sm" />
                                <span className="font-medium text-xs text-gray-900 truncate">
                                  {lead.name}
                                </span>
                              </div>
                              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${getScoreColor(lead.score)}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${getScoreDot(lead.score)}`} />
                                {lead.score}
                              </span>
                            </div>

                            {/* Project */}
                            <div className="flex items-center gap-1 mb-1.5">
                              {getAgentBadge(lead.agentType)}
                              <span className="text-[11px] text-gray-500 truncate">{lead.project}</span>
                            </div>

                            {/* Budget */}
                            {lead.budget && (
                              <p className="text-[11px] font-semibold text-emerald-600 mb-0.5">
                                {lead.budgetCurrency || 'USD'} {lead.budget}
                              </p>
                            )}

                            {/* Interest */}
                            <p className="text-[11px] text-gray-500 truncate">{lead.interest}</p>

                            {/* Notes */}
                            {lead.notes && (
                              <p className="text-[10px] text-amber-600 mt-1 truncate bg-amber-50 px-1.5 py-0.5 rounded">
                                {lead.notes}
                              </p>
                            )}

                            {/* Footer */}
                            <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-gray-50">
                              <span className="text-[10px] text-gray-400">{lead.lastActivity}</span>
                              {lead.assignedTo && (
                                <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                                  {lead.assignedTo}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Empty state */}
                    {stageLeads.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <p className="text-xs">Sin leads</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          currentPage="pipeline"
        />
      )}
    </main>
  )
}
