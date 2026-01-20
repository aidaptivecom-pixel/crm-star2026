import { useState } from 'react'
import { Trello, List, Filter, Plus, DollarSign } from 'lucide-react'
import { KanbanBoard } from '../components/pipeline/KanbanBoard'
import { PipelineTable } from '../components/pipeline/PipelineTable'
import { PIPELINE_LEADS, PIPELINE_COLUMNS } from '../constants'
import { PipelineLead, PipelineStage, AgentType } from '../types'

export const Pipeline = () => {
  const [view, setView] = useState<'kanban' | 'table'>('kanban')
  const [leads, setLeads] = useState<PipelineLead[]>(PIPELINE_LEADS)
  const [showFilters, setShowFilters] = useState(false)
  const [agentFilter, setAgentFilter] = useState<AgentType | 'all'>('all')
  const [projectFilter, setProjectFilter] = useState<string>('all')

  // Get unique projects
  const projects = [...new Set(PIPELINE_LEADS.map(l => l.project))]

  // Filter leads
  const filteredLeads = leads.filter(lead => {
    const matchesAgent = agentFilter === 'all' || lead.agentType === agentFilter
    const matchesProject = projectFilter === 'all' || lead.project === projectFilter
    return matchesAgent && matchesProject
  })

  // Group leads by stage
  const leadsByStage = PIPELINE_COLUMNS.reduce((acc, col) => {
    acc[col.id] = filteredLeads.filter(l => l.stage === col.id)
    return acc
  }, {} as Record<PipelineStage, PipelineLead[]>)

  // Calculate totals
  const totalValue = filteredLeads
    .filter(l => l.budget && l.stage !== 'perdido')
    .reduce((sum, l) => {
      const value = parseInt(l.budget?.replace(/,/g, '') || '0')
      return sum + value
    }, 0)

  const handleMoveLead = (leadId: string, newStage: PipelineStage) => {
    setLeads(prev => prev.map(lead => 
      lead.id === leadId ? { ...lead, stage: newStage, updatedAt: new Date().toLocaleDateString('es-AR') } : lead
    ))
  }

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-[#F8F9FA]">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trello className="w-6 h-6 text-[#D4A745]" />
            <h1 className="text-xl font-bold text-gray-900">Pipeline</h1>
            <span className="text-sm text-gray-500">
              {filteredLeads.length} leads
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Total Value */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-700">
                USD {totalValue.toLocaleString()}
              </span>
            </div>

            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setView('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  view === 'kanban'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Trello className="w-4 h-4" />
                Kanban
              </button>
              <button
                onClick={() => setView('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  view === 'table'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-4 h-4" />
                Tabla
              </button>
            </div>
            
            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                showFilters || agentFilter !== 'all' || projectFilter !== 'all'
                  ? 'bg-[#D4A745]/10 border-[#D4A745] text-[#D4A745]'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
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

        {/* Filters Row */}
        {showFilters && (
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
            {/* Agent Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">Agente:</span>
              <div className="flex gap-1">
                {[
                  { value: 'all', label: 'Todos' },
                  { value: 'emprendimientos', label: '🔵 Emp' },
                  { value: 'inmuebles', label: '🟣 Inm' },
                  { value: 'tasaciones', label: '🟡 Tas' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setAgentFilter(opt.value as AgentType | 'all')}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      agentFilter === opt.value
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Project Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">Proyecto:</span>
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 border-0 focus:ring-1 focus:ring-[#D4A745]"
              >
                <option value="all">Todos</option>
                {projects.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            {(agentFilter !== 'all' || projectFilter !== 'all') && (
              <button
                onClick={() => {
                  setAgentFilter('all')
                  setProjectFilter('all')
                }}
                className="text-xs text-[#D4A745] hover:text-[#b8923c] font-medium"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {view === 'kanban' ? (
          <KanbanBoard
            columns={PIPELINE_COLUMNS}
            leadsByStage={leadsByStage}
            onMoveLead={handleMoveLead}
          />
        ) : (
          <PipelineTable leads={filteredLeads} />
        )}
      </div>
    </main>
  )
}
