import { useState } from 'react'
import { Calculator, MapPin, Phone, Mail, Calendar, User, Home, Clock, CheckCircle, XCircle, AlertCircle, Plus, ChevronRight } from 'lucide-react'

type TasacionStatus = 'solicitada' | 'agendada' | 'realizada' | 'captada' | 'rechazada'

interface Tasacion {
  id: string
  propietario: {
    nombre: string
    telefono: string
    email: string
  }
  propiedad: {
    direccion: string
    barrio: string
    ciudad: string
    tipo: string
    superficie: number
    ambientes: number
    antiguedad: number
  }
  status: TasacionStatus
  fechaSolicitud: string
  fechaVisita?: string
  tasador?: string
  valorTasado?: number
  precioSugerido?: number
  notas?: string
  motivoRechazo?: string
}

const TASACIONES: Tasacion[] = [
  {
    id: 'TAS-2025-045',
    propietario: { nombre: 'María García', telefono: '11-4567-8901', email: 'maria@email.com' },
    propiedad: { direccion: 'Av. Cabildo 2500, 5°A', barrio: 'Belgrano', ciudad: 'CABA', tipo: 'Departamento', superficie: 85, ambientes: 3, antiguedad: 20 },
    status: 'agendada',
    fechaSolicitud: '2025-01-18',
    fechaVisita: '2025-01-22',
    tasador: 'Juan Pérez',
  },
  {
    id: 'TAS-2025-038',
    propietario: { nombre: 'Jorge Méndez', telefono: '11-7890-1234', email: 'jorge@email.com' },
    propiedad: { direccion: 'Humboldt 1800', barrio: 'Palermo Viejo', ciudad: 'CABA', tipo: 'PH', superficie: 85, ambientes: 3, antiguedad: 50 },
    status: 'captada',
    fechaSolicitud: '2025-01-02',
    fechaVisita: '2025-01-05',
    tasador: 'Ana Martínez',
    valorTasado: 190000,
    precioSugerido: 195000,
    notas: 'Propietario aceptó. Firmó autorización de venta exclusiva por 90 días.',
  },
  {
    id: 'TAS-2025-042',
    propietario: { nombre: 'Lucía Martínez', telefono: '11-6789-0123', email: 'lucia@email.com' },
    propiedad: { direccion: 'Güemes 4500, Piso 3', barrio: 'Palermo Soho', ciudad: 'CABA', tipo: 'Departamento', superficie: 45, ambientes: 2, antiguedad: 8 },
    status: 'captada',
    fechaSolicitud: '2025-01-08',
    fechaVisita: '2025-01-10',
    tasador: 'Juan Pérez',
    valorTasado: 142000,
    precioSugerido: 145000,
    notas: 'Propietario aceptó. Firmó autorización de venta exclusiva por 90 días.',
  },
  {
    id: 'TAS-2025-035',
    propietario: { nombre: 'Comercial Norte SRL', telefono: '11-8901-2345', email: 'comercial@norte.com' },
    propiedad: { direccion: 'Av. Cabildo 2300', barrio: 'Belgrano', ciudad: 'CABA', tipo: 'Local', superficie: 120, ambientes: 1, antiguedad: 25 },
    status: 'captada',
    fechaSolicitud: '2024-12-15',
    fechaVisita: '2024-12-20',
    tasador: 'Ana Martínez',
    valorTasado: 310000,
    precioSugerido: 320000,
    notas: 'Propietario aceptó. Ideal gastronomía. Firmó exclusiva 60 días.',
  },
  {
    id: 'TAS-2025-046',
    propietario: { nombre: 'Roberto Díaz', telefono: '11-5678-9012', email: 'roberto@email.com' },
    propiedad: { direccion: 'Av. Libertador 4000', barrio: 'Núñez', ciudad: 'CABA', tipo: 'Casa', superficie: 280, ambientes: 5, antiguedad: 40 },
    status: 'solicitada',
    fechaSolicitud: '2025-01-20',
  },
  {
    id: 'TAS-2025-040',
    propietario: { nombre: 'Ana Rodríguez', telefono: '11-6789-0123', email: 'ana@email.com' },
    propiedad: { direccion: 'Thames 2200', barrio: 'Palermo Soho', ciudad: 'CABA', tipo: 'Local', superficie: 50, ambientes: 1, antiguedad: 25 },
    status: 'rechazada',
    fechaSolicitud: '2025-01-12',
    fechaVisita: '2025-01-16',
    tasador: 'Ana Martínez',
    valorTasado: 85000,
    precioSugerido: 95000,
    motivoRechazo: 'Propietario considera el valor muy bajo. Quiere publicar a USD 150.000.',
  },
  {
    id: 'TAS-2025-044',
    propietario: { nombre: 'Carlos López', telefono: '11-2345-6789', email: 'carlos@email.com' },
    propiedad: { direccion: 'Costa Rica 5800', barrio: 'Palermo', ciudad: 'CABA', tipo: 'PH', superficie: 120, ambientes: 4, antiguedad: 35 },
    status: 'realizada',
    fechaSolicitud: '2025-01-15',
    fechaVisita: '2025-01-19',
    tasador: 'Ana Martínez',
    valorTasado: 195000,
    precioSugerido: 210000,
    notas: 'Excelente estado, reciclado. Muy luminoso. Terraza propia. Esperando respuesta del propietario.',
  },
]

const STATUS_CONFIG: Record<TasacionStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  solicitada: { label: 'Solicitada', color: 'text-blue-700', bg: 'bg-blue-100', icon: Clock },
  agendada: { label: 'Agendada', color: 'text-purple-700', bg: 'bg-purple-100', icon: Calendar },
  realizada: { label: 'Realizada', color: 'text-amber-700', bg: 'bg-amber-100', icon: CheckCircle },
  captada: { label: 'Captada', color: 'text-emerald-700', bg: 'bg-emerald-100', icon: CheckCircle },
  rechazada: { label: 'Rechazada', color: 'text-red-700', bg: 'bg-red-100', icon: XCircle },
}

export const Tasaciones = () => {
  const [tasaciones] = useState<Tasacion[]>(TASACIONES)
  const [selectedTasacion, setSelectedTasacion] = useState<Tasacion | null>(null)
  const [filterStatus, setFilterStatus] = useState<TasacionStatus | 'todas'>('todas')

  const filteredTasaciones = filterStatus === 'todas' 
    ? tasaciones 
    : tasaciones.filter(t => t.status === filterStatus)

  const stats = {
    total: tasaciones.length,
    solicitadas: tasaciones.filter(t => t.status === 'solicitada').length,
    agendadas: tasaciones.filter(t => t.status === 'agendada').length,
    captadas: tasaciones.filter(t => t.status === 'captada').length,
    tasaConversion: Math.round((tasaciones.filter(t => t.status === 'captada').length / tasaciones.length) * 100),
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
              {tasaciones.length} solicitudes
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
            <p className="text-xl sm:text-2xl font-bold text-blue-700">{stats.solicitadas}</p>
            <p className="text-xs sm:text-sm text-blue-600">Por agendar</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-3 sm:p-4">
            <p className="text-xl sm:text-2xl font-bold text-purple-700">{stats.agendadas}</p>
            <p className="text-xs sm:text-sm text-purple-600">Agendadas</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3 sm:p-4">
            <p className="text-xl sm:text-2xl font-bold text-emerald-700">{stats.captadas}</p>
            <p className="text-xs sm:text-sm text-emerald-600">Captadas</p>
          </div>
          <div className="bg-[#D4A745]/10 rounded-xl p-3 sm:p-4 col-span-2 sm:col-span-1">
            <p className="text-xl sm:text-2xl font-bold text-[#D4A745]">{stats.tasaConversion}%</p>
            <p className="text-xs sm:text-sm text-[#c49a3d]">Conversión</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex-shrink-0 px-4 sm:px-6 py-3 bg-white border-b border-gray-200 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          <span className="text-sm text-gray-500 mr-1 sm:mr-2 hidden sm:inline">Filtrar:</span>
          {(['todas', 'solicitada', 'agendada', 'realizada', 'captada', 'rechazada'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                filterStatus === status
                  ? 'bg-[#D4A745] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status === 'todas' ? 'Todas' : STATUS_CONFIG[status].label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="space-y-3">
          {filteredTasaciones.map((tasacion) => {
            const StatusIcon = STATUS_CONFIG[tasacion.status].icon
            return (
              <div
                key={tasacion.id}
                className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedTasacion(tasacion)}
              >
                {/* Mobile layout */}
                <div className="lg:hidden">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${STATUS_CONFIG[tasacion.status].bg}`}>
                      <StatusIcon className={`w-5 h-5 ${STATUS_CONFIG[tasacion.status].color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 text-sm">{tasacion.propietario.nombre}</h3>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${STATUS_CONFIG[tasacion.status].bg} ${STATUS_CONFIG[tasacion.status].color}`}>
                          {STATUS_CONFIG[tasacion.status].label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{tasacion.propiedad.barrio}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 pl-[52px]">
                    <span>{tasacion.propiedad.tipo} • {tasacion.propiedad.superficie}m²</span>
                    {tasacion.valorTasado && (
                      <span className="font-bold text-[#D4A745] text-sm">USD {tasacion.valorTasado.toLocaleString()}</span>
                    )}
                  </div>
                </div>

                {/* Desktop layout */}
                <div className="hidden lg:flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${STATUS_CONFIG[tasacion.status].bg}`}>
                      <StatusIcon className={`w-5 h-5 ${STATUS_CONFIG[tasacion.status].color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{tasacion.propietario.nombre}</h3>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${STATUS_CONFIG[tasacion.status].bg} ${STATUS_CONFIG[tasacion.status].color}`}>
                          {STATUS_CONFIG[tasacion.status].label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="w-3.5 h-3.5" />
                        {tasacion.propiedad.direccion}, {tasacion.propiedad.barrio}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{tasacion.propiedad.tipo}</p>
                      <p className="text-sm font-medium text-gray-700">{tasacion.propiedad.superficie} m² • {tasacion.propiedad.ambientes} amb</p>
                    </div>

                    {tasacion.valorTasado && (
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Valor tasado</p>
                        <p className="text-lg font-bold text-[#D4A745]">USD {tasacion.valorTasado.toLocaleString()}</p>
                      </div>
                    )}

                    {tasacion.fechaVisita && (
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Visita</p>
                        <p className="text-sm font-medium text-gray-700">{new Date(tasacion.fechaVisita).toLocaleDateString('es-AR')}</p>
                      </div>
                    )}

                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedTasacion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => setSelectedTasacion(null)}>
          <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 sm:w-12 h-10 sm:h-12 rounded-full flex items-center justify-center ${STATUS_CONFIG[selectedTasacion.status].bg}`}>
                    {(() => { const Icon = STATUS_CONFIG[selectedTasacion.status].icon; return <Icon className={`w-5 sm:w-6 h-5 sm:h-6 ${STATUS_CONFIG[selectedTasacion.status].color}`} />; })()}
                  </div>
                  <div>
                    <h2 className="text-base sm:text-xl font-bold text-gray-900">{selectedTasacion.id}</h2>
                    <span className={`text-xs sm:text-sm font-medium ${STATUS_CONFIG[selectedTasacion.status].color}`}>
                      {STATUS_CONFIG[selectedTasacion.status].label}
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelectedTasacion(null)} className="text-gray-400 hover:text-gray-600 p-1">
                  <XCircle className="w-5 sm:w-6 h-5 sm:h-6" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Propietario */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <User className="w-4 h-4" /> Propietario
                </h3>
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <p className="font-medium text-gray-900 text-sm sm:text-base">{selectedTasacion.propietario.nombre}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                    <a href={`tel:${selectedTasacion.propietario.telefono}`} className="flex items-center gap-1 text-sm text-[#D4A745]">
                      <Phone className="w-4 h-4" /> {selectedTasacion.propietario.telefono}
                    </a>
                    <a href={`mailto:${selectedTasacion.propietario.email}`} className="flex items-center gap-1 text-sm text-[#D4A745] truncate">
                      <Mail className="w-4 h-4 flex-shrink-0" /> {selectedTasacion.propietario.email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Propiedad */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <Home className="w-4 h-4" /> Propiedad
                </h3>
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <p className="font-medium text-gray-900 text-sm sm:text-base">{selectedTasacion.propiedad.direccion}</p>
                  <p className="text-xs sm:text-sm text-gray-500">{selectedTasacion.propiedad.barrio}, {selectedTasacion.propiedad.ciudad}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-4">
                    <div>
                      <p className="text-base sm:text-lg font-bold text-gray-900">{selectedTasacion.propiedad.tipo}</p>
                      <p className="text-xs text-gray-500">Tipo</p>
                    </div>
                    <div>
                      <p className="text-base sm:text-lg font-bold text-gray-900">{selectedTasacion.propiedad.superficie}m²</p>
                      <p className="text-xs text-gray-500">Superficie</p>
                    </div>
                    <div>
                      <p className="text-base sm:text-lg font-bold text-gray-900">{selectedTasacion.propiedad.ambientes}</p>
                      <p className="text-xs text-gray-500">Ambientes</p>
                    </div>
                    <div>
                      <p className="text-base sm:text-lg font-bold text-gray-900">{selectedTasacion.propiedad.antiguedad}a</p>
                      <p className="text-xs text-gray-500">Antigüedad</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Valuación */}
              {selectedTasacion.valorTasado && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                    <Calculator className="w-4 h-4" /> Valuación
                  </h3>
                  <div className="bg-[#D4A745]/10 rounded-xl p-3 sm:p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xl sm:text-2xl font-bold text-[#D4A745]">USD {selectedTasacion.valorTasado.toLocaleString()}</p>
                        <p className="text-xs sm:text-sm text-gray-600">Valor tasado</p>
                      </div>
                      {selectedTasacion.precioSugerido && (
                        <div>
                          <p className="text-xl sm:text-2xl font-bold text-gray-900">USD {selectedTasacion.precioSugerido.toLocaleString()}</p>
                          <p className="text-xs sm:text-sm text-gray-600">Precio sugerido</p>
                        </div>
                      )}
                    </div>
                    {selectedTasacion.notas && (
                      <p className="mt-4 text-xs sm:text-sm text-gray-600 border-t border-[#D4A745]/20 pt-4">
                        <strong>Notas:</strong> {selectedTasacion.notas}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Motivo rechazo */}
              {selectedTasacion.motivoRechazo && (
                <div className="bg-red-50 rounded-xl p-3 sm:p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-red-700 text-sm sm:text-base">Motivo del rechazo</p>
                      <p className="text-xs sm:text-sm text-red-600">{selectedTasacion.motivoRechazo}</p>
                    </div>
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
                      <p className="text-xs sm:text-sm"><span className="font-medium">Solicitud:</span> {new Date(selectedTasacion.fechaSolicitud).toLocaleDateString('es-AR')}</p>
                    </div>
                    {selectedTasacion.fechaVisita && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                        <p className="text-xs sm:text-sm"><span className="font-medium">Visita:</span> {new Date(selectedTasacion.fechaVisita).toLocaleDateString('es-AR')} {selectedTasacion.tasador && `- ${selectedTasacion.tasador}`}</p>
                      </div>
                    )}
                  </div>
                </div>
                <a 
                  href={`tel:${selectedTasacion.propietario.telefono}`}
                  className="p-2 sm:p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Phone className="w-4 sm:w-5 h-4 sm:h-5" />
                </a>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 sm:p-6 border-t border-gray-200 flex flex-col sm:flex-row gap-2 sm:gap-3">
              {selectedTasacion.status === 'solicitada' && (
                <button className="flex-1 py-2.5 bg-[#D4A745] text-white rounded-lg font-medium hover:bg-[#c49a3d] text-sm sm:text-base">
                  Agendar visita
                </button>
              )}
              {selectedTasacion.status === 'agendada' && (
                <button className="flex-1 py-2.5 bg-[#D4A745] text-white rounded-lg font-medium hover:bg-[#c49a3d] text-sm sm:text-base">
                  Registrar tasación
                </button>
              )}
              {selectedTasacion.status === 'realizada' && (
                <>
                  <button className="flex-1 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 text-sm sm:text-base">
                    Marcar captada
                  </button>
                  <button className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 text-sm sm:text-base">
                    Marcar rechazada
                  </button>
                </>
              )}
              {selectedTasacion.status === 'captada' && (
                <button className="flex-1 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 text-sm sm:text-base">
                  Ver en Propiedades
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
