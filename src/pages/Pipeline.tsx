import { useState } from 'react'
import { Trello, Search, Filter, LayoutGrid, List, Plus, GripVertical, MessageCircle, Phone, Calendar } from 'lucide-react'
import { Avatar } from '../components/Avatar'
import { PIPELINE_LEADS } from '../constants'
import { PipelineLead, PipelineStage } from '../types'

const STAGES: { id: PipelineStage; title: string; color: string }[] = [
  { id: 'nuevo', title: 'Nuevo', color: 'bg-gray-500' },
  { id: 'calificado', title: 'Calificado', color: 'bg-blue-500' },
  { id: 'contactado', title: 'Contactado', color: 'bg-purple-500' },
  { id: 'visita', title: 'Visita', color: 'bg-amber-500' },
  { id: 'cierre', title: 'Cierre', color: 'bg-emerald-500' },
]

export const Pipeline = () => {
  const [leads, setLeads] = useState<PipelineLead[]>(PIPELINE_LEADS)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban')
  const [draggedLead, setDraggedLead] = useState<PipelineLead | null>(null)
  const [selectedLead, setSelectedLead] = useState<PipelineLead | null>(null)

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
    if (score >= 80) return 'bg-emerald-100 text-emerald-700'
    if (score >= 60) return 'bg-amber-100 text-amber-700'
    return 'bg-red-100 text-red-700'
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

  const getChannelIcon = (channel: PipelineLead['channel']) => {
    switch (channel) {
      case 'whatsapp': return '💬'
      case 'instagram': return '📷'
      case 'facebook': return '👤'
    }
  }

  // Calculate totals
  const totalValue = filteredLeads
    .filter(l => l.budget)
    .reduce((sum, l) => sum + parseInt(l.budget?.replace(/,/g, '') || '0'), 0)

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-[#F8F9FA]">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trello className="w-6 h-6 text-[#D4A745]" />
            <h1 className="text-xl font-bold text-gray-900">Pipeline</h1>
            <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
              {filteredLeads.length} leads
            </span>
            <span className="bg-emerald-50 text-emerald-700 text-xs font-medium px-2 py-1 rounded-full">
              USD {(totalValue / 1000000).toFixed(1)}M potencial
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar lead..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50 focus:border-[#D4A745]"
              />
            </div>

            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'kanban' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'table' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Filter */}
            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              Filtros
            </button>

            {/* Add Lead */}
            <button className="flex items-center gap-2 px-4 py-2 bg-[#D4A745] text-white rounded-lg text-sm font-medium hover:bg-[#c49a3d] transition-colors">
              <Plus className="w-4 h-4" />
              Nuevo Lead
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'kanban' ? (
        <div className="flex-1 overflow-hidden p-4">
          <div className="grid grid-cols-5 gap-3 h-full">
            {STAGES.map((stage) => {
              const stageLeads = getLeadsByStage(stage.id)
              return (
                <div
                  key={stage.id}
                  className="flex flex-col bg-gray-100 rounded-xl min-w-0 overflow-hidden"
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
                    <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded flex-shrink-0">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Cards */}
                  <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2">
                    {stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={() => handleDragStart(lead)}
                        onClick={() => setSelectedLead(lead)}
                        className={`bg-white rounded-lg p-2.5 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all ${
                          draggedLead?.id === lead.id ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className="cursor-grab text-gray-300 hover:text-gray-400 flex-shrink-0">
                            <GripVertical className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <Avatar name={lead.name} size="sm" />
                                <span className="font-medium text-xs text-gray-900 truncate">
                                  {lead.name}
                                </span>
                              </div>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${getScoreColor(lead.score)}`}>
                                {lead.score}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 mb-1.5">
                              {getAgentBadge(lead.agentType)}
                              <span className="text-[11px] text-gray-500 truncate">{lead.project}</span>
                              <span className="text-[10px] flex-shrink-0">{getChannelIcon(lead.channel)}</span>
                            </div>

                            {lead.budget && (
                              <p className="text-[11px] font-medium text-emerald-600 mb-0.5">
                                {lead.budgetCurrency} {lead.budget}
                              </p>
                            )}

                            <p className="text-[11px] text-gray-500 truncate">{lead.interest}</p>

                            {lead.notes && (
                              <p className="text-[10px] text-amber-600 mt-1 truncate">📝 {lead.notes}</p>
                            )}

                            <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-gray-50">
                              <span className="text-[10px] text-gray-400">{lead.lastActivity}</span>
                              {lead.assignedTo && (
                                <span className="text-[10px] bg-gray-100 text-gray-500 px-1 py-0.5 rounded">
                                  {lead.assignedTo}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-white rounded-xl border border-gray-100">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <th className="px-4 py-3">Lead</th>
                  <th className="px-4 py-3">Proyecto</th>
                  <th className="px-4 py-3">Etapa</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Presupuesto</th>
                  <th className="px-4 py-3">Asignado</th>
                  <th className="px-4 py-3">Última actividad</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredLeads.map((lead) => {
                  const stage = STAGES.find(s => s.id === lead.stage)
                  return (
                    <tr key={lead.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedLead(lead)}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={lead.name} size="sm" />
                          <div>
                            <p className="font-medium text-sm text-gray-900">{lead.name}</p>
                            <p className="text-xs text-gray-500">{lead.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {getAgentBadge(lead.agentType)}
                          <span className="text-sm text-gray-700">{lead.project}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${stage?.color} text-white`}>
                          {stage?.title}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${getScoreColor(lead.score)}`}>
                          {lead.score}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {lead.budget ? (
                          <span className="text-sm font-medium text-emerald-600">
                            {lead.budgetCurrency} {lead.budget}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {lead.assignedTo ? (
                          <span className="text-sm text-gray-600">{lead.assignedTo}</span>
                        ) : (
                          <span className="text-sm text-gray-400">Sin asignar</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-500">{lead.lastActivity}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors">
                            <Phone className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                            <MessageCircle className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors">
                            <Calendar className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedLead(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 m-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-4 mb-6">
              <Avatar name={selectedLead.name} size="lg" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">{selectedLead.name}</h3>
                <p className="text-sm text-gray-500">{selectedLead.project}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${getScoreColor(selectedLead.score)}`}>
                    Score {selectedLead.score}
                  </span>
                  {selectedLead.budget && (
                    <span className="text-xs font-medium text-emerald-600">
                      {selectedLead.budgetCurrency} {selectedLead.budget}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => setSelectedLead(null)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Teléfono</span>
                <span className="text-gray-900">{selectedLead.phone}</span>
              </div>
              {selectedLead.email && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Email</span>
                  <span className="text-gray-900">{selectedLead.email}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Interés</span>
                <span className="text-gray-900">{selectedLead.interest}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Canal</span>
                <span className="text-gray-900">{getChannelIcon(selectedLead.channel)} {selectedLead.channel}</span>
              </div>
              {selectedLead.assignedTo && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Asignado a</span>
                  <span className="text-gray-900">{selectedLead.assignedTo}</span>
                </div>
              )}
              {selectedLead.notes && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Notas</p>
                  <p className="text-sm text-amber-700 bg-amber-50 p-2 rounded">{selectedLead.notes}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600">
                <Phone className="w-4 h-4" />
                Llamar
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600">
                <MessageCircle className="w-4 h-4" />
                Mensaje
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600">
                <Calendar className="w-4 h-4" />
                Agendar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
