import { useState, useMemo } from 'react'
import { Users, Search, Filter, Download, X, Phone, MessageCircle, Calendar, ChevronDown, ChevronUp } from 'lucide-react'
import { Avatar } from '../components/Avatar'
import { PIPELINE_LEADS, EMPRENDIMIENTOS } from '../constants'
import { PipelineLead, AgentType, PipelineStage } from '../types'

// Get unique projects from emprendimientos
const PROJECTS = Object.values(EMPRENDIMIENTOS).map(e => e.name)

const STAGES: { id: PipelineStage | 'all'; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'nuevo', label: 'Nuevo' },
  { id: 'calificado', label: 'Calificado' },
  { id: 'contactado', label: 'Contactado' },
  { id: 'visita', label: 'Visita' },
  { id: 'cierre', label: 'Cierre' },
]

const AGENT_TYPES: { id: AgentType | 'all'; label: string; color: string }[] = [
  { id: 'all', label: 'Todos', color: 'bg-gray-500' },
  { id: 'emprendimientos', label: 'Emprendimientos', color: 'bg-blue-500' },
  { id: 'inmuebles', label: 'Inmuebles', color: 'bg-purple-500' },
  { id: 'tasaciones', label: 'Tasaciones', color: 'bg-amber-500' },
]

const CHANNELS = ['all', 'whatsapp', 'instagram', 'facebook'] as const

const SCORE_RANGES = [
  { id: 'all', label: 'Todos', min: 0, max: 100 },
  { id: 'hot', label: '🔥 Hot (70+)', min: 70, max: 100 },
  { id: 'warm', label: '🟡 Warm (40-69)', min: 40, max: 69 },
  { id: 'cold', label: '🔵 Cold (<40)', min: 0, max: 39 },
]

const ASSIGNED_AGENTS = ['all', 'Jony', 'María', 'Pablo', 'Sin asignar'] as const

type SortField = 'name' | 'score' | 'budget' | 'createdAt' | 'lastActivity'
type SortDirection = 'asc' | 'desc'

export const Leads = () => {
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [stageFilter, setStageFilter] = useState<PipelineStage | 'all'>('all')
  const [agentTypeFilter, setAgentTypeFilter] = useState<AgentType | 'all'>('all')
  const [projectFilter, setProjectFilter] = useState<string>('all')
  const [channelFilter, setChannelFilter] = useState<typeof CHANNELS[number]>('all')
  const [scoreFilter, setScoreFilter] = useState<string>('all')
  const [assignedFilter, setAssignedFilter] = useState<typeof ASSIGNED_AGENTS[number]>('all')
  const [budgetMin, setBudgetMin] = useState<string>('')
  const [budgetMax, setBudgetMax] = useState<string>('')
  
  // Sorting
  const [sortField, setSortField] = useState<SortField>('score')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  
  // Modal
  const [selectedLead, setSelectedLead] = useState<PipelineLead | null>(null)

  // Filter logic
  const filteredLeads = useMemo(() => {
    return PIPELINE_LEADS.filter(lead => {
      // Search
      const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           lead.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           lead.phone.includes(searchQuery)
      
      // Stage
      const matchesStage = stageFilter === 'all' || lead.stage === stageFilter
      
      // Agent Type
      const matchesAgentType = agentTypeFilter === 'all' || lead.agentType === agentTypeFilter
      
      // Project
      const matchesProject = projectFilter === 'all' || lead.project === projectFilter
      
      // Channel
      const matchesChannel = channelFilter === 'all' || lead.channel === channelFilter
      
      // Score
      const scoreRange = SCORE_RANGES.find(r => r.id === scoreFilter)
      const matchesScore = !scoreRange || scoreFilter === 'all' || 
                          (lead.score >= scoreRange.min && lead.score <= scoreRange.max)
      
      // Assigned
      const matchesAssigned = assignedFilter === 'all' || 
                             (assignedFilter === 'Sin asignar' ? !lead.assignedTo : lead.assignedTo === assignedFilter)
      
      // Budget
      const leadBudget = lead.budget ? parseInt(lead.budget.replace(/,/g, '')) : 0
      const minBudget = budgetMin ? parseInt(budgetMin) * 1000 : 0
      const maxBudget = budgetMax ? parseInt(budgetMax) * 1000 : Infinity
      const matchesBudget = leadBudget >= minBudget && leadBudget <= maxBudget
      
      return matchesSearch && matchesStage && matchesAgentType && matchesProject && 
             matchesChannel && matchesScore && matchesAssigned && matchesBudget
    })
  }, [searchQuery, stageFilter, agentTypeFilter, projectFilter, channelFilter, 
      scoreFilter, assignedFilter, budgetMin, budgetMax])

  // Sort logic
  const sortedLeads = useMemo(() => {
    return [...filteredLeads].sort((a, b) => {
      let comparison = 0
      
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'score':
          comparison = a.score - b.score
          break
        case 'budget':
          const budgetA = a.budget ? parseInt(a.budget.replace(/,/g, '')) : 0
          const budgetB = b.budget ? parseInt(b.budget.replace(/,/g, '')) : 0
          comparison = budgetA - budgetB
          break
        case 'createdAt':
          comparison = a.createdAt.localeCompare(b.createdAt)
          break
        case 'lastActivity':
          comparison = a.lastActivity.localeCompare(b.lastActivity)
          break
      }
      
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [filteredLeads, sortField, sortDirection])

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Nombre', 'Teléfono', 'Email', 'Proyecto', 'Tipo', 'Canal', 'Score', 'Presupuesto', 'Interés', 'Etapa', 'Asignado', 'Última Actividad']
    
    const rows = sortedLeads.map(lead => [
      lead.name,
      lead.phone,
      lead.email || '',
      lead.project,
      lead.agentType,
      lead.channel,
      lead.score,
      lead.budget ? `${lead.budgetCurrency || 'USD'} ${lead.budget}` : '',
      lead.interest,
      lead.stage,
      lead.assignedTo || '',
      lead.lastActivity
    ])
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `leads_star_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('')
    setStageFilter('all')
    setAgentTypeFilter('all')
    setProjectFilter('all')
    setChannelFilter('all')
    setScoreFilter('all')
    setAssignedFilter('all')
    setBudgetMin('')
    setBudgetMax('')
  }

  const hasActiveFilters = stageFilter !== 'all' || agentTypeFilter !== 'all' || 
                          projectFilter !== 'all' || channelFilter !== 'all' || 
                          scoreFilter !== 'all' || assignedFilter !== 'all' ||
                          budgetMin !== '' || budgetMax !== ''

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown className="w-3 h-3 text-gray-300" />
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-3 h-3 text-[#D4A745]" />
      : <ChevronDown className="w-3 h-3 text-[#D4A745]" />
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'bg-emerald-100 text-emerald-700'
    if (score >= 40) return 'bg-amber-100 text-amber-700'
    return 'bg-red-100 text-red-700'
  }

  const getScoreEmoji = (score: number) => {
    if (score >= 70) return '🔥'
    if (score >= 40) return '🟡'
    return '🔵'
  }

  const getAgentBadge = (type: AgentType) => {
    switch (type) {
      case 'emprendimientos':
        return <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
      case 'inmuebles':
        return <span className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0" />
      case 'tasaciones':
        return <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
    }
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

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#F8F9FA]">
      {/* Header */}
      <div className="flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Users className="w-5 sm:w-6 h-5 sm:h-6 text-[#D4A745]" />
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Leads</h1>
            <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
              {sortedLeads.length} de {PIPELINE_LEADS.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                showFilters || hasActiveFilters
                  ? 'bg-[#D4A745]/10 border-[#D4A745] text-[#D4A745]'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filtros</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-[#D4A745]" />
              )}
            </button>

            {/* Export */}
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-3 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, proyecto o teléfono..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50 focus:border-[#D4A745]"
          />
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
            {/* Row 1: Score, Stage, Type */}
            <div className="flex flex-wrap gap-4">
              {/* Score Filter */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 font-medium">Score</label>
                <select
                  value={scoreFilter}
                  onChange={(e) => setScoreFilter(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50"
                >
                  {SCORE_RANGES.map(range => (
                    <option key={range.id} value={range.id}>{range.label}</option>
                  ))}
                </select>
              </div>

              {/* Stage Filter */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 font-medium">Etapa</label>
                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value as PipelineStage | 'all')}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50"
                >
                  {STAGES.map(stage => (
                    <option key={stage.id} value={stage.id}>{stage.label}</option>
                  ))}
                </select>
              </div>

              {/* Agent Type Filter */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 font-medium">Tipo</label>
                <select
                  value={agentTypeFilter}
                  onChange={(e) => setAgentTypeFilter(e.target.value as AgentType | 'all')}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50"
                >
                  {AGENT_TYPES.map(type => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Project Filter */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 font-medium">Proyecto</label>
                <select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50"
                >
                  <option value="all">Todos</option>
                  {PROJECTS.map(project => (
                    <option key={project} value={project}>{project}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Channel, Assigned, Budget */}
            <div className="flex flex-wrap gap-4">
              {/* Channel Filter */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 font-medium">Canal</label>
                <select
                  value={channelFilter}
                  onChange={(e) => setChannelFilter(e.target.value as typeof CHANNELS[number])}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50"
                >
                  <option value="all">Todos</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                </select>
              </div>

              {/* Assigned Filter */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 font-medium">Asignado a</label>
                <select
                  value={assignedFilter}
                  onChange={(e) => setAssignedFilter(e.target.value as typeof ASSIGNED_AGENTS[number])}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50"
                >
                  {ASSIGNED_AGENTS.map(agent => (
                    <option key={agent} value={agent}>{agent === 'all' ? 'Todos' : agent}</option>
                  ))}
                </select>
              </div>

              {/* Budget Range */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 font-medium">Presupuesto (USD miles)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                    className="w-20 px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                    className="w-20 px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50"
                  />
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    <X className="w-4 h-4" />
                    Limpiar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3">
                    <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:text-gray-700">
                      Lead <SortIcon field="name" />
                    </button>
                  </th>
                  <th className="px-4 py-3">Proyecto</th>
                  <th className="px-4 py-3">Etapa</th>
                  <th className="px-4 py-3">
                    <button onClick={() => handleSort('score')} className="flex items-center gap-1 hover:text-gray-700">
                      Score <SortIcon field="score" />
                    </button>
                  </th>
                  <th className="px-4 py-3">
                    <button onClick={() => handleSort('budget')} className="flex items-center gap-1 hover:text-gray-700">
                      Presupuesto <SortIcon field="budget" />
                    </button>
                  </th>
                  <th className="px-4 py-3">Interés</th>
                  <th className="px-4 py-3">Canal</th>
                  <th className="px-4 py-3">Asignado</th>
                  <th className="px-4 py-3">Actividad</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sortedLeads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedLead(lead)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={lead.name} size="sm" />
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">{lead.name}</p>
                          <p className="text-xs text-gray-500 truncate">{lead.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {getAgentBadge(lead.agentType)}
                        <span className="text-sm text-gray-700 truncate max-w-[140px]">{lead.project}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getStageBadge(lead.stage)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded ${getScoreColor(lead.score)}`}>
                        {getScoreEmoji(lead.score)} {lead.score}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {lead.budget ? (
                        <span className="text-sm font-medium text-emerald-600">
                          {lead.budgetCurrency || 'USD'} {lead.budget}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600 truncate max-w-[150px] block">{lead.interest}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-500 capitalize">{lead.channel}</span>
                    </td>
                    <td className="px-4 py-3">
                      {lead.assignedTo ? (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{lead.assignedTo}</span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-500">{lead.lastActivity}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
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
                ))}
              </tbody>
            </table>
          </div>

          {sortedLeads.length === 0 && (
            <div className="px-4 py-12 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No se encontraron leads con los filtros aplicados</p>
              <button
                onClick={clearFilters}
                className="mt-2 text-sm text-[#D4A745] hover:text-[#b8923c] font-medium"
              >
                Limpiar filtros
              </button>
            </div>
          )}

          {/* Mobile hint */}
          <div className="lg:hidden px-4 py-2 text-center border-t border-gray-100">
            <p className="text-xs text-gray-400">← Desliza para ver más →</p>
          </div>
        </div>
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3" onClick={() => setSelectedLead(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-4 mb-6">
              <Avatar name={selectedLead.name} size="lg" />
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900">{selectedLead.name}</h3>
                <p className="text-sm text-gray-500">{selectedLead.project}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${getScoreColor(selectedLead.score)}`}>
                    {getScoreEmoji(selectedLead.score)} Score {selectedLead.score}
                  </span>
                  {getStageBadge(selectedLead.stage)}
                </div>
              </div>
              <button onClick={() => setSelectedLead(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
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
                  <span className="text-gray-900 truncate ml-4">{selectedLead.email}</span>
                </div>
              )}
              {selectedLead.budget && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Presupuesto</span>
                  <span className="text-emerald-600 font-medium">{selectedLead.budgetCurrency || 'USD'} {selectedLead.budget}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Interés</span>
                <span className="text-gray-900 truncate ml-4">{selectedLead.interest}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Canal</span>
                <span className="text-gray-900 capitalize">{selectedLead.channel}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Creado</span>
                <span className="text-gray-900">{selectedLead.createdAt}</span>
              </div>
              {selectedLead.assignedTo && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Asignado a</span>
                  <span className="text-gray-900">{selectedLead.assignedTo}</span>
                </div>
              )}
              {selectedLead.scheduledDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Visita agendada</span>
                  <span className="text-purple-600 font-medium">{selectedLead.scheduledDate}</span>
                </div>
              )}
              {selectedLead.notes && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Notas</p>
                  <p className="text-sm text-amber-700 bg-amber-50 p-2 rounded">{selectedLead.notes}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600">
                <Phone className="w-4 h-4" />
                Llamar
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600">
                <MessageCircle className="w-4 h-4" />
                Mensaje
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600">
                <Calendar className="w-4 h-4" />
                Agendar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
