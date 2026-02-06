import { useState, useMemo } from 'react'
import { Calculator, MapPin, Phone, Mail, User, Home, Clock, XCircle, AlertCircle, Plus, Loader2, MessageSquare, TrendingUp, Building, ArrowUpRight } from 'lucide-react'
import { useAppraisals, updateAppraisalStatus, scheduleVisit, APPRAISAL_STATUS_CONFIG } from '../hooks/useAppraisals'
import type { AppraisalStatus } from '../hooks/useAppraisals'
import type { Appraisal } from '../types/database'

// Ubicaciones premium para scoring
const PREMIUM_LOCATIONS = ['Belgrano', 'Recoleta', 'Palermo', 'Puerto Madero', 'Núñez', 'Cañitas']

// Calcular score de propiedad (0-100)
function calculatePropertyScore(appraisal: Appraisal): { score: number; factors: string[] } {
  let score = 0
  const factors: string[] = []

  // Valor estimado
  const maxValue = appraisal.estimated_value_max || appraisal.estimated_value_min || 0
  if (maxValue > 500000) {
    score += 30
    factors.push('Valor > 500k')
  } else if (maxValue > 200000) {
    score += 20
    factors.push('Valor > 200k')
  } else if (maxValue > 100000) {
    score += 10
  }

  // Ubicación premium
  const neighborhood = appraisal.neighborhood || ''
  const isPremium = PREMIUM_LOCATIONS.some(loc => 
    neighborhood.toLowerCase().includes(loc.toLowerCase())
  )
  if (isPremium) {
    score += 25
    factors.push('Zona premium')
  }

  // Superficie
  const size = appraisal.size_m2 || 0
  if (size > 150) {
    score += 25
    factors.push('> 150m²')
  } else if (size > 100) {
    score += 15
    factors.push('> 100m²')
  } else if (size > 80) {
    score += 10
  }

  // Condición: A reciclar = oportunidad
  const condition = (appraisal.condition || '').toLowerCase()
  if (condition.includes('reciclar') || condition.includes('refacc')) {
    score += 10
    factors.push('A reciclar')
    // Combo: a reciclar + premium = oportunidad
    if (isPremium) {
      score += 30
      factors.push('⭐ Oportunidad')
      if (size > 80) {
        score += 20
        factors.push('⭐⭐ Oportunidad Premium')
      }
    }
  }

  // Cochera
  if (appraisal.has_garage) {
    score += 10
  }

  return { score: Math.min(score, 100), factors }
}

// Clasificación por score
function getScoreClassification(score: number): { emoji: string; label: string; color: string; bgColor: string } {
  if (score >= 80) return { emoji: '🔴', label: 'Muy Caliente', color: 'text-red-600', bgColor: 'bg-red-100' }
  if (score >= 60) return { emoji: '🟠', label: 'Caliente', color: 'text-orange-600', bgColor: 'bg-orange-100' }
  if (score >= 30) return { emoji: '🟡', label: 'Tibio', color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
  return { emoji: '🔵', label: 'Frío', color: 'text-blue-600', bgColor: 'bg-blue-100' }
}

// Kanban: 5 columnas agrupando los 10 estados
type KanbanColumn = 'nuevas' | 'visitas' | 'proceso' | 'aprobadas' | 'cerradas'

const KANBAN_COLUMNS: { id: KanbanColumn; label: string; icon: string; statuses: AppraisalStatus[] }[] = [
  { id: 'nuevas', label: 'Nuevas', icon: '📥', statuses: ['web_estimate'] },
  { id: 'visitas', label: 'Visitas', icon: '📅', statuses: ['visit_scheduled', 'visit_completed'] },
  { id: 'proceso', label: 'En Proceso', icon: '🔄', statuses: ['processing', 'draft', 'pending_review'] },
  { id: 'aprobadas', label: 'Aprobadas', icon: '✅', statuses: ['approved_by_admin', 'signed'] },
  { id: 'cerradas', label: 'Cerradas', icon: '📤', statuses: ['delivered', 'cancelled'] },
]

export const Tasaciones = () => {
  const { appraisals, loading, error, refetch } = useAppraisals()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filterColumn, setFilterColumn] = useState<KanbanColumn | 'todas'>('todas')
  const [filterType, setFilterType] = useState<'todas' | 'market_valuation' | 'formal_appraisal'>('todas')
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Filtrar tasaciones
  const filteredAppraisals = useMemo(() => {
    let result = appraisals

    // Filtro por columna Kanban
    if (filterColumn !== 'todas') {
      const column = KANBAN_COLUMNS.find(c => c.id === filterColumn)
      if (column) {
        result = result.filter(a => column.statuses.includes(a.status as AppraisalStatus))
      }
    }

    // Filtro por tipo
    if (filterType !== 'todas') {
      result = result.filter(a => a.type === filterType)
    }

    // Búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(a => 
        (a.client_name || '').toLowerCase().includes(query) ||
        (a.address || '').toLowerCase().includes(query) ||
        (a.neighborhood || '').toLowerCase().includes(query) ||
        (a.client_phone || '').includes(query)
      )
    }

    return result
  }, [appraisals, filterColumn, filterType, searchQuery])

  // Calcular stats por columna
  const columnStats = useMemo(() => {
    const stats: Record<KanbanColumn, number> = {
      nuevas: 0,
      visitas: 0,
      proceso: 0,
      aprobadas: 0,
      cerradas: 0,
    }
    appraisals.forEach(a => {
      const column = KANBAN_COLUMNS.find(c => c.statuses.includes(a.status as AppraisalStatus))
      if (column) stats[column.id]++
    })
    return stats
  }, [appraisals])

  const selectedAppraisal = appraisals.find(a => a.id === selectedId)

  const handleScheduleVisit = async () => {
    if (!selectedId || !scheduleDate) return
    try {
      await scheduleVisit(selectedId, scheduleDate)
      setShowScheduleModal(false)
      setScheduleDate('')
      refetch()
    } catch (err) {
      console.error('Error scheduling visit:', err)
    }
  }

  const handleStatusChange = async (id: string, newStatus: AppraisalStatus) => {
    try {
      await updateAppraisalStatus(id, newStatus)
      refetch()
    } catch (err) {
      console.error('Error updating status:', err)
    }
  }

  // Capitalizar y limpiar texto (departamento → Departamento, muy-bueno → Muy Bueno)
  const formatText = (text?: string | null) => {
    if (!text) return null
    return text
      .replace(/-/g, ' ')  // guiones a espacios
      .replace(/_/g, ' ')  // underscores a espacios
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  const formatPrice = (min?: number | null, max?: number | null) => {
    if (min && max && min !== max) return `USD ${(min/1000).toFixed(0)}k - ${(max/1000).toFixed(0)}k`
    if (max) return `USD ${max.toLocaleString()}`
    if (min) return `USD ${min.toLocaleString()}`
    return null
  }

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString('es-AR', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeAgo = (dateStr?: string | null) => {
    if (!dateStr) return null
    const diff = Date.now() - new Date(dateStr).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours < 1) return 'Hace menos de 1h'
    if (hours < 24) return `Hace ${hours}h`
    const days = Math.floor(hours / 24)
    return `Hace ${days}d`
  }

  const openWhatsApp = (phone: string) => {
    const clean = phone.replace(/\D/g, '')
    window.open(`https://wa.me/${clean}`, '_blank')
  }

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center bg-[#F8F9FA]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#D4A745] mx-auto mb-2" />
          <p className="text-gray-500">Cargando tasaciones...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex-1 flex items-center justify-center bg-[#F8F9FA]">
        <div className="text-center text-red-500">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p>Error: {error}</p>
          <button onClick={refetch} className="mt-2 text-[#D4A745] underline">Reintentar</button>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-[#F8F9FA]">
      {/* Header */}
      <div className="flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Calculator className="w-5 sm:w-6 h-5 sm:h-6 text-[#D4A745]" />
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Tasaciones</h1>
            <span className="hidden sm:inline bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
              {appraisals.length} total
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Búsqueda */}
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="hidden sm:block w-48 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A745]/50"
            />
            <button className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-[#D4A745] text-white rounded-lg text-sm font-medium hover:bg-[#c49a3d]">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nueva</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats por columna Kanban */}
      <div className="flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 bg-white border-b border-gray-200">
        <div className="grid grid-cols-5 gap-2 sm:gap-4">
          {KANBAN_COLUMNS.map((col) => (
            <button
              key={col.id}
              onClick={() => setFilterColumn(filterColumn === col.id ? 'todas' : col.id)}
              className={`rounded-xl p-2 sm:p-4 text-center transition-all ${
                filterColumn === col.id 
                  ? 'bg-[#D4A745] text-white ring-2 ring-[#D4A745] ring-offset-2' 
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <p className="text-lg sm:text-2xl font-bold">{columnStats[col.id]}</p>
              <p className={`text-xs sm:text-sm ${filterColumn === col.id ? 'text-white/80' : 'text-gray-500'}`}>
                {col.icon} {col.label}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Filtros secundarios */}
      <div className="flex-shrink-0 px-4 sm:px-6 py-2 sm:py-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filtro por tipo */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setFilterType('todas')}
              className={`px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                filterType === 'todas' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilterType('market_valuation')}
              className={`px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                filterType === 'market_valuation' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🌐 Web
            </button>
            <button
              onClick={() => setFilterType('formal_appraisal')}
              className={`px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                filterType === 'formal_appraisal' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📋 Formal
            </button>
          </div>

          {/* Mostrar filtro activo */}
          {filterColumn !== 'todas' && (
            <button
              onClick={() => setFilterColumn('todas')}
              className="flex items-center gap-1 px-2 py-1 bg-[#D4A745]/10 text-[#D4A745] rounded-lg text-xs font-medium"
            >
              {KANBAN_COLUMNS.find(c => c.id === filterColumn)?.icon} {KANBAN_COLUMNS.find(c => c.id === filterColumn)?.label}
              <XCircle className="w-3 h-3" />
            </button>
          )}

          <span className="text-xs text-gray-400 ml-auto">
            {filteredAppraisals.length} resultados
          </span>
        </div>
      </div>

      {/* Content - Cards */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        {filteredAppraisals.length === 0 ? (
          <div className="text-center py-12">
            <Calculator className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No hay tasaciones con estos filtros</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredAppraisals.map((appraisal) => {
              const status = appraisal.status as AppraisalStatus
              const config = APPRAISAL_STATUS_CONFIG[status] || APPRAISAL_STATUS_CONFIG.web_estimate
              const priceRange = formatPrice(appraisal.estimated_value_min, appraisal.estimated_value_max)
              const { score } = calculatePropertyScore(appraisal)
              const scoreClass = getScoreClassification(score)
              const isWeb = appraisal.type === 'market_valuation'
              
              return (
                <div
                  key={appraisal.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => setSelectedId(appraisal.id)}
                >
                  {/* Header con dirección y badges */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate group-hover:text-[#D4A745] transition-colors">
                          {appraisal.address || appraisal.neighborhood || 'Sin dirección'}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{appraisal.neighborhood || appraisal.city || 'CABA'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${isWeb ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                          {isWeb ? '🌐 Web' : '📋 Formal'}
                        </span>
                        {config.label !== 'Web' && (
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${config.bgColor} ${config.color}`}>
                            {config.label}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Tipo + características */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span>{formatText(appraisal.property_type) || 'Propiedad'}</span>
                      <span>·</span>
                      <span>{appraisal.ambientes || '?'} amb</span>
                      <span>·</span>
                      <span>{appraisal.size_m2 || '?'}m²</span>
                      {appraisal.condition && (
                        <>
                          <span>·</span>
                          <span className={appraisal.condition.toLowerCase().includes('reciclar') ? 'text-orange-600 font-medium' : ''}>
                            {formatText(appraisal.condition)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Precio y Score */}
                  <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
                    <div>
                      {priceRange ? (
                        <>
                          <p className="text-lg font-bold text-[#D4A745]">{priceRange}</p>
                          {appraisal.price_per_m2 && (
                            <p className="text-xs text-gray-500">USD {appraisal.price_per_m2.toLocaleString()}/m²</p>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-gray-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Pendiente de valuación
                        </p>
                      )}
                    </div>
                    {score > 0 && (
                      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${scoreClass.bgColor}`}>
                        <TrendingUp className={`w-4 h-4 ${scoreClass.color}`} />
                        <span className={`text-sm font-bold ${scoreClass.color}`}>{score}</span>
                        <span className="text-base">{scoreClass.emoji}</span>
                      </div>
                    )}
                  </div>

                  {/* Cliente */}
                  <div className="px-4 py-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {appraisal.client_name || (appraisal.client_phone ? appraisal.client_phone : 'Lead anónimo')}
                          </p>
                          <p className="text-xs text-gray-500">{getTimeAgo(appraisal.created_at)}</p>
                        </div>
                      </div>
                      {appraisal.visit_scheduled_at && (
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Visita</p>
                          <p className="text-xs font-medium text-[#D4A745]">{formatDate(appraisal.visit_scheduled_at)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-2">
                    {status === 'web_estimate' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedId(appraisal.id)
                          setShowScheduleModal(true)
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm text-white bg-[#D4A745] hover:bg-[#c49a3d] rounded-lg transition-colors font-medium"
                      >
                        📅 Agendar
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        // TODO: Abrir historial de conversación
                        alert('Historial de conversación - próximamente')
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm text-gray-600 hover:text-[#D4A745] hover:bg-[#D4A745]/5 rounded-lg transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Historial</span>
                    </button>
                    {appraisal.client_phone && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          openWhatsApp(appraisal.client_phone!)
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        <span>WhatsApp</span>
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedId(appraisal.id)
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm text-gray-600 hover:text-[#D4A745] hover:bg-[#D4A745]/5 rounded-lg transition-colors"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      <span>Ver más</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedAppraisal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => setSelectedId(null)}>
          <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            {(() => {
              const status = selectedAppraisal.status as AppraisalStatus
              const config = APPRAISAL_STATUS_CONFIG[status] || APPRAISAL_STATUS_CONFIG.web_estimate
              const priceRange = formatPrice(selectedAppraisal.estimated_value_min, selectedAppraisal.estimated_value_max)
              const { score, factors } = calculatePropertyScore(selectedAppraisal)
              const scoreClass = getScoreClassification(score)
              const isWeb = selectedAppraisal.type === 'market_valuation'

              return (
                <>
                  {/* Modal Header */}
                  <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${isWeb ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                            {isWeb ? '🌐 Web' : '📋 Formal'}
                          </span>
                          {config.label !== 'Web' && (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded ${config.bgColor} ${config.color}`}>
                              {config.label}
                            </span>
                          )}
                          {score > 0 && (
                            <span className={`text-xs font-medium px-2 py-1 rounded-lg ${scoreClass.bgColor} ${scoreClass.color}`}>
                              {scoreClass.emoji} Score: {score}
                            </span>
                          )}
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                          {selectedAppraisal.address || selectedAppraisal.neighborhood || 'Tasación'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                          {selectedAppraisal.neighborhood}, {selectedAppraisal.city || 'CABA'}
                        </p>
                      </div>
                      <button onClick={() => setSelectedId(null)} className="text-gray-400 hover:text-gray-600 p-1">
                        <XCircle className="w-6 h-6" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 space-y-5">
                    {/* Score breakdown */}
                    {factors.length > 0 && (
                      <div className={`p-3 rounded-xl ${scoreClass.bgColor}`}>
                        <p className={`text-sm font-medium ${scoreClass.color} mb-1`}>
                          {scoreClass.emoji} {scoreClass.label} — {score} puntos
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {factors.map((f, i) => (
                            <span key={i} className={`text-xs px-2 py-0.5 rounded-full bg-white/50 ${scoreClass.color}`}>
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Cliente */}
                    {(selectedAppraisal.client_name || selectedAppraisal.client_phone) && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <User className="w-4 h-4" /> Cliente
                        </h3>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="font-medium text-gray-900">{selectedAppraisal.client_name || 'Sin nombre'}</p>
                          <div className="flex flex-wrap items-center gap-3 mt-2">
                            {selectedAppraisal.client_phone && (
                              <button
                                onClick={() => openWhatsApp(selectedAppraisal.client_phone!)}
                                className="flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700"
                              >
                                <Phone className="w-4 h-4" />
                                {selectedAppraisal.client_phone}
                              </button>
                            )}
                            {selectedAppraisal.client_email && (
                              <a href={`mailto:${selectedAppraisal.client_email}`} className="flex items-center gap-1.5 text-sm text-[#D4A745]">
                                <Mail className="w-4 h-4" />
                                {selectedAppraisal.client_email}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Propiedad */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Home className="w-4 h-4" /> Propiedad
                      </h3>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div>
                            <p className="text-lg font-bold text-gray-900">{formatText(selectedAppraisal.property_type) || '-'}</p>
                            <p className="text-xs text-gray-500">Tipo</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-gray-900">{selectedAppraisal.size_m2 || '-'}m²</p>
                            <p className="text-xs text-gray-500">Superficie</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-gray-900">{selectedAppraisal.ambientes || '-'}</p>
                            <p className="text-xs text-gray-500">Ambientes</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-gray-900">{selectedAppraisal.building_age || '-'}a</p>
                            <p className="text-xs text-gray-500">Antigüedad</p>
                          </div>
                        </div>
                        {selectedAppraisal.condition && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <span className={`text-sm px-2 py-1 rounded ${
                              selectedAppraisal.condition.toLowerCase().includes('reciclar') 
                                ? 'bg-orange-100 text-orange-700' 
                                : 'bg-gray-200 text-gray-700'
                            }`}>
                              Estado: {formatText(selectedAppraisal.condition)}
                            </span>
                            {selectedAppraisal.has_garage && (
                              <span className="ml-2 text-sm px-2 py-1 rounded bg-blue-100 text-blue-700">
                                🚗 Cochera
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Valuación */}
                    {priceRange && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Calculator className="w-4 h-4" /> Valuación
                        </h3>
                        <div className="bg-[#D4A745]/10 rounded-xl p-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-2xl font-bold text-[#D4A745]">{priceRange}</p>
                              <p className="text-sm text-gray-600">Valor estimado</p>
                            </div>
                            {selectedAppraisal.price_per_m2 && (
                              <div>
                                <p className="text-2xl font-bold text-gray-900">
                                  USD {selectedAppraisal.price_per_m2.toLocaleString()}/m²
                                </p>
                                <p className="text-sm text-gray-600">Precio por m²</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Timeline */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Timeline
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          <p className="text-sm">
                            <span className="font-medium">Solicitud:</span> {formatDate(selectedAppraisal.created_at)}
                          </p>
                        </div>
                        {selectedAppraisal.visit_scheduled_at && (
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-yellow-500" />
                            <p className="text-sm">
                              <span className="font-medium">Visita agendada:</span> {formatDate(selectedAppraisal.visit_scheduled_at)}
                            </p>
                          </div>
                        )}
                        {selectedAppraisal.visited_at && (
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-orange-500" />
                            <p className="text-sm">
                              <span className="font-medium">Visitado:</span> {formatDate(selectedAppraisal.visited_at)}
                            </p>
                          </div>
                        )}
                        {selectedAppraisal.completed_at && (
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <p className="text-sm">
                              <span className="font-medium">Completado:</span> {formatDate(selectedAppraisal.completed_at)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 sm:p-6 border-t border-gray-200 flex flex-col sm:flex-row gap-2">
                    {/* Botón historial */}
                    <button
                      onClick={() => alert('Historial de conversación - próximamente')}
                      className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      💬 Historial
                    </button>

                    {/* Acciones según estado */}
                    {status === 'web_estimate' && (
                      <button 
                        onClick={() => setShowScheduleModal(true)}
                        className="flex-1 py-2.5 bg-[#D4A745] text-white rounded-lg font-medium hover:bg-[#c49a3d]"
                      >
                        📅 Agendar visita
                      </button>
                    )}
                    {status === 'visit_scheduled' && (
                      <button 
                        onClick={() => handleStatusChange(selectedAppraisal.id, 'visit_completed')}
                        className="flex-1 py-2.5 bg-[#D4A745] text-white rounded-lg font-medium hover:bg-[#c49a3d]"
                      >
                        ✅ Marcar visitada
                      </button>
                    )}
                    {status === 'visit_completed' && (
                      <button 
                        onClick={() => handleStatusChange(selectedAppraisal.id, 'processing')}
                        className="flex-1 py-2.5 bg-[#D4A745] text-white rounded-lg font-medium hover:bg-[#c49a3d]"
                      >
                        🔄 Procesar tasación
                      </button>
                    )}
                    {status === 'processing' && (
                      <button 
                        onClick={() => handleStatusChange(selectedAppraisal.id, 'draft')}
                        className="flex-1 py-2.5 bg-[#D4A745] text-white rounded-lg font-medium hover:bg-[#c49a3d]"
                      >
                        📝 Generar borrador
                      </button>
                    )}
                    {status === 'draft' && (
                      <button 
                        onClick={() => handleStatusChange(selectedAppraisal.id, 'pending_review')}
                        className="flex-1 py-2.5 bg-[#D4A745] text-white rounded-lg font-medium hover:bg-[#c49a3d]"
                      >
                        📤 Enviar a revisión
                      </button>
                    )}
                    {status === 'pending_review' && (
                      <button 
                        onClick={() => handleStatusChange(selectedAppraisal.id, 'approved_by_admin')}
                        className="flex-1 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
                      >
                        ✅ Aprobar
                      </button>
                    )}
                    {status === 'approved_by_admin' && (
                      <button 
                        onClick={() => handleStatusChange(selectedAppraisal.id, 'signed')}
                        className="flex-1 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
                      >
                        ✍️ Marcar firmada
                      </button>
                    )}
                    {status === 'signed' && (
                      <button 
                        onClick={() => handleStatusChange(selectedAppraisal.id, 'delivered')}
                        className="flex-1 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
                      >
                        📨 Marcar entregada
                      </button>
                    )}
                    {selectedAppraisal.pdf_url && (
                      <a 
                        href={selectedAppraisal.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 text-center"
                      >
                        📄 Ver PDF
                      </a>
                    )}
                    {status !== 'cancelled' && status !== 'delivered' && (
                      <button 
                        onClick={() => handleStatusChange(selectedAppraisal.id, 'cancelled')}
                        className="py-2.5 px-4 bg-white border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50"
                      >
                        ❌
                      </button>
                    )}
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}

      {/* Schedule Visit Modal */}
      {showScheduleModal && selectedAppraisal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={() => setShowScheduleModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">📅 Agendar Visita</h3>
            <p className="text-sm text-gray-500 mb-4">{selectedAppraisal.address || selectedAppraisal.neighborhood}</p>
            <input
              type="datetime-local"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg mb-4"
            />
            <div className="flex gap-3">
              <button 
                onClick={() => setShowScheduleModal(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium"
              >
                Cancelar
              </button>
              <button 
                onClick={handleScheduleVisit}
                disabled={!scheduleDate}
                className="flex-1 py-2.5 bg-[#D4A745] text-white rounded-lg font-medium hover:bg-[#c49a3d] disabled:opacity-50"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
