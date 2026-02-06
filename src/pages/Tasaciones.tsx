import { useState } from 'react'
import { Calculator, MapPin, Phone, Mail, Calendar, User, Home, Clock, CheckCircle, XCircle, AlertCircle, Plus, ChevronRight, FileText, Loader2 } from 'lucide-react'
import { useAppraisals, updateAppraisalStatus, scheduleVisit, APPRAISAL_STATUS_CONFIG } from '../hooks/useAppraisals'
import type { AppraisalStatus } from '../hooks/useAppraisals'

const STATUS_ICONS: Record<AppraisalStatus, React.ElementType> = {
  web_estimate: Clock,
  visit_scheduled: Calendar,
  visit_completed: CheckCircle,
  processing: Loader2,
  draft: FileText,
  pending_review: AlertCircle,
  approved_by_admin: CheckCircle,
  signed: CheckCircle,
  delivered: CheckCircle,
  cancelled: XCircle,
}

// Tabs principales para el pipeline
const PIPELINE_TABS: { status: AppraisalStatus | 'todas'; label: string }[] = [
  { status: 'todas', label: 'Todas' },
  { status: 'web_estimate', label: 'Web' },
  { status: 'visit_scheduled', label: 'Agendadas' },
  { status: 'visit_completed', label: 'Visitadas' },
  { status: 'processing', label: 'En Proceso' },
  { status: 'pending_review', label: 'Por Revisar' },
  { status: 'delivered', label: 'Entregadas' },
]

export const Tasaciones = () => {
  const { appraisals, loading, error, stats, refetch } = useAppraisals()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<AppraisalStatus | 'todas'>('todas')
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')

  const filteredAppraisals = filterStatus === 'todas' 
    ? appraisals 
    : appraisals.filter(a => a.status === filterStatus)

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

  const formatPrice = (min?: number | null, max?: number | null) => {
    if (min && max) return `USD ${min.toLocaleString()} - ${max.toLocaleString()}`
    if (min) return `USD ${min.toLocaleString()}`
    if (max) return `USD ${max.toLocaleString()}`
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
    if (hours < 1) return 'hace menos de 1 hora'
    if (hours < 24) return `hace ${hours} horas`
    const days = Math.floor(hours / 24)
    return `hace ${days} días`
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
              {stats.total} solicitudes
            </span>
          </div>

          <button className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-[#D4A745] text-white rounded-lg text-sm font-medium hover:bg-[#c49a3d]">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nueva</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 bg-white border-b border-gray-200">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs sm:text-sm text-gray-500">Total</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 sm:p-4">
            <p className="text-xl sm:text-2xl font-bold text-blue-700">{stats.web_estimate}</p>
            <p className="text-xs sm:text-sm text-blue-600">Web</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-3 sm:p-4">
            <p className="text-xl sm:text-2xl font-bold text-yellow-700">{stats.visit_scheduled}</p>
            <p className="text-xs sm:text-sm text-yellow-600">Agendadas</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-3 sm:p-4">
            <p className="text-xl sm:text-2xl font-bold text-orange-700">{stats.visit_completed}</p>
            <p className="text-xs sm:text-sm text-orange-600">Visitadas</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3 sm:p-4 col-span-2 sm:col-span-1">
            <p className="text-xl sm:text-2xl font-bold text-emerald-700">{stats.delivered}</p>
            <p className="text-xs sm:text-sm text-emerald-600">Entregadas</p>
          </div>
        </div>
      </div>

      {/* Filters / Tabs */}
      <div className="flex-shrink-0 px-4 sm:px-6 py-3 bg-white border-b border-gray-200 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {PIPELINE_TABS.map((tab) => {
            const count = tab.status === 'todas' ? stats.total : stats[tab.status] || 0
            return (
              <button
                key={tab.status}
                onClick={() => setFilterStatus(tab.status)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  filterStatus === tab.status
                    ? 'bg-[#D4A745] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        {filteredAppraisals.length === 0 ? (
          <div className="text-center py-12">
            <Calculator className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No hay tasaciones en este estado</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAppraisals.map((appraisal) => {
              const status = appraisal.status as AppraisalStatus
              const config = APPRAISAL_STATUS_CONFIG[status] || APPRAISAL_STATUS_CONFIG.web_estimate
              const StatusIcon = STATUS_ICONS[status] || Clock
              const priceRange = formatPrice(appraisal.estimated_value_min, appraisal.estimated_value_max)
              
              return (
                <div
                  key={appraisal.id}
                  className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedId(appraisal.id)}
                >
                  {/* Mobile layout */}
                  <div className="lg:hidden">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${config.bgColor}`}>
                        <StatusIcon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">
                            {appraisal.client_name || appraisal.address || 'Sin dirección'}
                          </h3>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${config.bgColor} ${config.color}`}>
                            {config.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{appraisal.neighborhood || appraisal.city || 'Sin ubicación'}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 pl-[52px]">
                      <span>{appraisal.property_type || 'Propiedad'} • {appraisal.size_m2 || '?'}m²</span>
                      {priceRange && (
                        <span className="font-bold text-[#D4A745] text-sm">{priceRange}</span>
                      )}
                    </div>
                  </div>

                  {/* Desktop layout */}
                  <div className="hidden lg:flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.bgColor}`}>
                        <StatusIcon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {appraisal.address || 'Sin dirección'}
                          </h3>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${config.bgColor} ${config.color}`}>
                            {config.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="w-3.5 h-3.5" />
                          {appraisal.neighborhood}, {appraisal.city || 'CABA'}
                          {appraisal.client_name && (
                            <span className="ml-2">• {appraisal.client_name}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{appraisal.property_type || 'Propiedad'}</p>
                        <p className="text-sm font-medium text-gray-700">
                          {appraisal.size_m2 || '?'} m² • {appraisal.ambientes || '?'} amb
                        </p>
                      </div>

                      {priceRange && (
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Estimado</p>
                          <p className="text-lg font-bold text-[#D4A745]">{priceRange}</p>
                        </div>
                      )}

                      {appraisal.visit_scheduled_at && (
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Visita</p>
                          <p className="text-sm font-medium text-gray-700">
                            {formatDate(appraisal.visit_scheduled_at)}
                          </p>
                        </div>
                      )}

                      <div className="text-right text-xs text-gray-400">
                        {getTimeAgo(appraisal.created_at)}
                      </div>

                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
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
              const StatusIcon = STATUS_ICONS[status] || Clock
              const priceRange = formatPrice(selectedAppraisal.estimated_value_min, selectedAppraisal.estimated_value_max)

              return (
                <>
                  <div className="p-4 sm:p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 sm:w-12 h-10 sm:h-12 rounded-full flex items-center justify-center ${config.bgColor}`}>
                          <StatusIcon className={`w-5 sm:w-6 h-5 sm:h-6 ${config.color}`} />
                        </div>
                        <div>
                          <h2 className="text-base sm:text-xl font-bold text-gray-900">
                            {selectedAppraisal.address || 'Tasación'}
                          </h2>
                          <span className={`text-xs sm:text-sm font-medium ${config.color}`}>
                            {config.label}
                          </span>
                        </div>
                      </div>
                      <button onClick={() => setSelectedId(null)} className="text-gray-400 hover:text-gray-600 p-1">
                        <XCircle className="w-5 sm:w-6 h-5 sm:h-6" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    {/* Cliente */}
                    {(selectedAppraisal.client_name || selectedAppraisal.client_phone || selectedAppraisal.client_email) && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                          <User className="w-4 h-4" /> Cliente
                        </h3>
                        <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                          <p className="font-medium text-gray-900 text-sm sm:text-base">
                            {selectedAppraisal.client_name || 'Sin nombre'}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                            {selectedAppraisal.client_phone && (
                              <a href={`tel:${selectedAppraisal.client_phone}`} className="flex items-center gap-1 text-sm text-[#D4A745]">
                                <Phone className="w-4 h-4" /> {selectedAppraisal.client_phone}
                              </a>
                            )}
                            {selectedAppraisal.client_email && (
                              <a href={`mailto:${selectedAppraisal.client_email}`} className="flex items-center gap-1 text-sm text-[#D4A745] truncate">
                                <Mail className="w-4 h-4 flex-shrink-0" /> {selectedAppraisal.client_email}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Propiedad */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                        <Home className="w-4 h-4" /> Propiedad
                      </h3>
                      <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                        <p className="font-medium text-gray-900 text-sm sm:text-base">
                          {selectedAppraisal.address || 'Sin dirección'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {selectedAppraisal.neighborhood}, {selectedAppraisal.city || 'CABA'}
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-4">
                          <div>
                            <p className="text-base sm:text-lg font-bold text-gray-900">
                              {selectedAppraisal.property_type || '-'}
                            </p>
                            <p className="text-xs text-gray-500">Tipo</p>
                          </div>
                          <div>
                            <p className="text-base sm:text-lg font-bold text-gray-900">
                              {selectedAppraisal.size_m2 || '-'}m²
                            </p>
                            <p className="text-xs text-gray-500">Superficie</p>
                          </div>
                          <div>
                            <p className="text-base sm:text-lg font-bold text-gray-900">
                              {selectedAppraisal.ambientes || '-'}
                            </p>
                            <p className="text-xs text-gray-500">Ambientes</p>
                          </div>
                          <div>
                            <p className="text-base sm:text-lg font-bold text-gray-900">
                              {selectedAppraisal.building_age || '-'}a
                            </p>
                            <p className="text-xs text-gray-500">Antigüedad</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Valuación */}
                    {(priceRange || selectedAppraisal.price_per_m2) && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                          <Calculator className="w-4 h-4" /> Valuación
                        </h3>
                        <div className="bg-[#D4A745]/10 rounded-xl p-3 sm:p-4">
                          <div className="grid grid-cols-2 gap-4">
                            {priceRange && (
                              <div>
                                <p className="text-xl sm:text-2xl font-bold text-[#D4A745]">{priceRange}</p>
                                <p className="text-xs sm:text-sm text-gray-600">Valor estimado</p>
                              </div>
                            )}
                            {selectedAppraisal.price_per_m2 && (
                              <div>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                                  USD {selectedAppraisal.price_per_m2.toLocaleString()}/m²
                                </p>
                                <p className="text-xs sm:text-sm text-gray-600">Precio por m²</p>
                              </div>
                            )}
                          </div>
                          {selectedAppraisal.zone_average_price && (
                            <p className="mt-2 text-sm text-gray-500">
                              Promedio zona: USD {selectedAppraisal.zone_average_price.toLocaleString()}/m²
                            </p>
                          )}
                          {selectedAppraisal.notes && (
                            <p className="mt-4 text-xs sm:text-sm text-gray-600 border-t border-[#D4A745]/20 pt-4">
                              <strong>Notas:</strong> {selectedAppraisal.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Timeline */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                          <Clock className="w-4 h-4" /> Timeline
                        </h3>
                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <p className="text-xs sm:text-sm">
                              <span className="font-medium">Solicitud:</span> {formatDate(selectedAppraisal.created_at)}
                            </p>
                          </div>
                          {selectedAppraisal.visit_scheduled_at && (
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-yellow-500" />
                              <p className="text-xs sm:text-sm">
                                <span className="font-medium">Visita agendada:</span> {formatDate(selectedAppraisal.visit_scheduled_at)}
                              </p>
                            </div>
                          )}
                          {selectedAppraisal.visited_at && (
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-orange-500" />
                              <p className="text-xs sm:text-sm">
                                <span className="font-medium">Visitado:</span> {formatDate(selectedAppraisal.visited_at)}
                              </p>
                            </div>
                          )}
                          {selectedAppraisal.completed_at && (
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-green-500" />
                              <p className="text-xs sm:text-sm">
                                <span className="font-medium">Completado:</span> {formatDate(selectedAppraisal.completed_at)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      {selectedAppraisal.client_phone && (
                        <a 
                          href={`tel:${selectedAppraisal.client_phone}`}
                          className="p-2 sm:p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex-shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Phone className="w-4 sm:w-5 h-4 sm:h-5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 sm:p-6 border-t border-gray-200 flex flex-col sm:flex-row gap-2 sm:gap-3">
                    {status === 'web_estimate' && (
                      <button 
                        onClick={() => setShowScheduleModal(true)}
                        className="flex-1 py-2.5 bg-[#D4A745] text-white rounded-lg font-medium hover:bg-[#c49a3d] text-sm sm:text-base"
                      >
                        📅 Agendar visita
                      </button>
                    )}
                    {status === 'visit_scheduled' && (
                      <button 
                        onClick={() => handleStatusChange(selectedAppraisal.id, 'visit_completed')}
                        className="flex-1 py-2.5 bg-[#D4A745] text-white rounded-lg font-medium hover:bg-[#c49a3d] text-sm sm:text-base"
                      >
                        ✅ Marcar visitada
                      </button>
                    )}
                    {status === 'visit_completed' && (
                      <button 
                        onClick={() => handleStatusChange(selectedAppraisal.id, 'processing')}
                        className="flex-1 py-2.5 bg-[#D4A745] text-white rounded-lg font-medium hover:bg-[#c49a3d] text-sm sm:text-base"
                      >
                        📝 Comenzar tasación
                      </button>
                    )}
                    {status === 'draft' && (
                      <button 
                        onClick={() => handleStatusChange(selectedAppraisal.id, 'pending_review')}
                        className="flex-1 py-2.5 bg-[#D4A745] text-white rounded-lg font-medium hover:bg-[#c49a3d] text-sm sm:text-base"
                      >
                        📤 Enviar a revisión
                      </button>
                    )}
                    {status === 'pending_review' && (
                      <button 
                        onClick={() => handleStatusChange(selectedAppraisal.id, 'approved_by_admin')}
                        className="flex-1 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 text-sm sm:text-base"
                      >
                        ✅ Aprobar
                      </button>
                    )}
                    {selectedAppraisal.pdf_url && (
                      <a 
                        href={selectedAppraisal.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 text-sm sm:text-base text-center"
                      >
                        📄 Ver PDF
                      </a>
                    )}
                    <button 
                      onClick={() => handleStatusChange(selectedAppraisal.id, 'cancelled')}
                      className="py-2.5 px-4 bg-white border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 text-sm sm:text-base"
                    >
                      ❌ Cancelar
                    </button>
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
            <h3 className="text-lg font-bold text-gray-900 mb-4">Agendar Visita</h3>
            <p className="text-sm text-gray-500 mb-4">{selectedAppraisal.address}</p>
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
