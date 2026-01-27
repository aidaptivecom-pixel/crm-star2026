import { useState, useMemo } from 'react'
import { Users, Search, Filter, Download, X, Phone, MessageCircle, Calendar, ChevronDown, ChevronUp } from 'lucide-react'
import { Avatar } from '../components/Avatar'
import { LeadDetailModal } from '../components/LeadDetailModal'
import { useLeads, useProjects } from '../hooks'
import { mapLeadToPipelineLead } from '../lib/mappers'
import { PipelineLead, AgentType, PipelineStage } from '../types'

const STAGES: { id: PipelineStage | 'all'; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'nuevo', label: 'Nuevo' },
  { id: 'calificado', label: 'Calificado' },
  { id: 'contactado', label: 'Contactado' },
  { id: 'visita', label: 'Visita' },
  { id: 'cierre', label: 'Cierre' },
]

const AGENT_TYPES: { id: AgentType | 'all'; label: string; color: string }[] = [
  { id: 'all', label: 'Todos', color: 'bg-gray-100 text-gray-600 border-gray-200' },
  { id: 'emprendimientos', label: 'Emp', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'inmuebles', label: 'Inm', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'tasaciones', label: 'Tas', color: 'bg-amber-50 text-amber-700 border-amber-200' },
]

const CHANNELS: { id: 'all' | 'whatsapp' | 'instagram' | 'facebook'; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'facebook', label: 'Facebook' },
]

// Score ranges with traffic light colors
const SCORE_RANGES: { id: string; label: string; min: number; max: number; dotColor: string; bgColor: string; textColor: string; borderColor: string }[] = [
  { id: 'all', label: 'Todos', min: 0, max: 100, dotColor: 'bg-gray-400', bgColor: 'bg-gray-100', textColor: 'text-gray-600', borderColor: 'border-gray-200' },
  { id: 'high', label: 'Alto', min: 70, max: 100, dotColor: 'bg-emerald-500', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', borderColor: 'border-emerald-200' },
  { id: 'medium', label: 'Medio', min: 40, max: 69, dotColor: 'bg-amber-500', bgColor: 'bg-amber-50', textColor: 'text-amber-700', borderColor: 'border-amber-200' },
  { id: 'low', label: 'Bajo', min: 0, max: 39, dotColor: 'bg-red-500', bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200' },
]

const ASSIGNED_AGENTS = ['all', 'Jony', 'María', 'Pablo', 'Sin asignar'] as const

type SortField = 'name' | 'score' | 'budget' | 'createdAt' | 'lastActivity'
type SortDirection = 'asc' | 'desc'

export const Leads = () => {
  // Data from Supabase
  const { leads: dbLeads, loading: leadsLoading } = useLeads()
  const { projects, loading: projectsLoading } = useProjects()

  const loading = leadsLoading || projectsLoading

  // Map DB leads to UI PipelineLeads
  const allLeads = useMemo(
    () => dbLeads.map(l => mapLeadToPipelineLead(l, projects)),
    [dbLeads, projects],
  )

  // Get unique project names from Supabase projects
  const projectNames = useMemo(() => projects.map(p => p.name), [projects])

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [stageFilter, setStageFilter] = useState<PipelineStage | 'all'>('all')
  const [agentTypeFilter, setAgentTypeFilter] = useState<AgentType | 'all'>('all')
  const [projectFilter, setProjectFilter] = useState<string>('all')
  const [channelFilter, setChannelFilter] = useState<'all' | 'whatsapp' | 'instagram' | 'facebook'>('all')
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
    return allLeads.filter(lead => {
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
      scoreFilter, assignedFilter, budgetMin, budgetMax, allLeads])

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

  const getScoreDot = (score: number) => {
    if (score >= 70) return 'bg-emerald-500'
    if (score >= 40) return 'bg-amber-500'
    return 'bg-red-500'
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

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#F8F9FA]">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#D4A745] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Cargando leads...</p>
        </div>
      </div>
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
              {sortedLeads.length} de {allLeads.length}
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

        {/* Filters Panel - Redesigned */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap gap-x-6 gap-y-4">
              
              {/* Score Filter - Chip buttons */}
              <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Score</label>
                <div className="flex gap-1.5">
                  {SCORE_RANGES.map(range => (
                    <button
                      key={range.id}
                      onClick={() => setScoreFilter(range.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        scoreFilter === range.id
                          ? `${range.bgColor} ${range.textColor} ${range.borderColor} ring-1 ring-offset-1 ring-current`
                          : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${range.dotColor}`} />
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tipo Filter - Chip buttons */}
              <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Tipo</label>
                <div className="flex gap-1.5">
                  {AGENT_TYPES.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setAgentTypeFilter(type.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        agentTypeFilter === type.id
                          ? `${type.color} ring-1 ring-offset-1 ring-current`
                          : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Etapa Filter - Dropdown styled */}
              <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Etapa</label>
                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value as PipelineStage | 'all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer appearance-none pr-8 bg-no-repeat bg-right ${
                    stageFilter !== 'all'
                      ? 'bg-gray-800 text-white border-gray-800'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='${stageFilter !== 'all' ? 'white' : '%236B7280'}'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundSize: '16px', backgroundPosition: 'right 8px center' }}
                >
                  {STAGES.map(stage => (
                    <option key={stage.id} value={stage.id}>{stage.label}</option>
                  ))}
                </select>
              </div>

              {/* Proyecto Filter - Dropdown styled */}
              <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Proyecto</label>
                <select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer appearance-none pr-8 bg-no-repeat bg-right ${
                    projectFilter !== 'all'
                      ? 'bg-gray-800 text-white border-gray-800'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='${projectFilter !== 'all' ? 'white' : '%236B7280'}'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundSize: '16px', backgroundPosition: 'right 8px center' }}
                >
                  <option value="all">Todos</option>
                  {projectNames.map(project => (
                    <option key={project} value={project}>{project}</option>
                  ))}
                </select>
              </div>

              {/* Canal Filter - Dropdown styled */}
              <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Canal</label>
                <select
                  value={channelFilter}
                  onChange={(e) => setChannelFilter(e.target.value as 'all' | 'whatsapp' | 'instagram' | 'facebook')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer appearance-none pr-8 bg-no-repeat bg-right ${
                    channelFilter !== 'all'
                      ? 'bg-gray-800 text-white border-gray-800'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='${channelFilter !== 'all' ? 'white' : '%236B7280'}'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundSize: '16px', backgroundPosition: 'right 8px center' }}
                >
                  {CHANNELS.map(ch => (
                    <option key={ch.id} value={ch.id}>{ch.label}</option>
                  ))}
                </select>
              </div>

              {/* Asignado Filter - Dropdown styled */}
              <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Asignado</label>
                <select
                  value={assignedFilter}
                  onChange={(e) => setAssignedFilter(e.target.value as typeof ASSIGNED_AGENTS[number])}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer appearance-none pr-8 bg-no-repeat bg-right ${
                    assignedFilter !== 'all'
                      ? 'bg-gray-800 text-white border-gray-800'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='${assignedFilter !== 'all' ? 'white' : '%236B7280'}'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundSize: '16px', backgroundPosition: 'right 8px center' }}
                >
                  {ASSIGNED_AGENTS.map(agent => (
                    <option key={agent} value={agent}>{agent === 'all' ? 'Todos' : agent}</option>
                  ))}
                </select>
              </div>

              {/* Budget Range */}
              <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Ticket USD (miles)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                    className="w-20 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50 focus:border-[#D4A745]"
                  />
                  <span className="text-gray-300">—</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                    className="w-20 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50 focus:border-[#D4A745]"
                  />
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 hover:text-red-700 font-medium hover:bg-red-50 rounded-full transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Limpiar filtros
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
                      Ticket <SortIcon field="budget" />
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
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${getScoreColor(lead.score)}`}>
                        <span className={`w-2 h-2 rounded-full ${getScoreDot(lead.score)}`} />
                        {lead.score}
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
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{lead.assignedTo}</span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-500">{lead.lastActivity}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <button className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors">
                          <Phone className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors">
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
              {allLeads.length === 0 ? (
                <>
                  <p className="text-gray-500">No hay leads aún</p>
                  <p className="text-gray-400 text-sm mt-1">Los leads aparecerán aquí cuando se carguen</p>
                </>
              ) : (
                <>
                  <p className="text-gray-500">No se encontraron leads con los filtros aplicados</p>
                  <button
                    onClick={clearFilters}
                    className="mt-2 text-sm text-[#D4A745] hover:text-[#b8923c] font-medium"
                  >
                    Limpiar filtros
                  </button>
                </>
              )}
            </div>
          )}

          {/* Mobile hint */}
          <div className="lg:hidden px-4 py-2 text-center border-t border-gray-100">
            <p className="text-xs text-gray-400">← Desliza para ver más →</p>
          </div>
        </div>
      </div>

      {/* Lead Detail Modal - Shared Component */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          currentPage="leads"
        />
      )}
    </div>
  )
}
