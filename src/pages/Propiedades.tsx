import { useState } from 'react'
import { Home, MapPin, Bed, Bath, Square, Eye, Phone, Mail, Heart, Search, Plus, LayoutGrid, List, X, FileCheck, Briefcase, Calendar, User } from 'lucide-react'

type PropertyStatus = 'disponible' | 'reservada' | 'vendida'
type PropertyType = 'departamento' | 'casa' | 'ph' | 'local' | 'oficina' | 'cochera' | 'terreno'
type PropertyOrigin = 'cartera' | 'captacion' // cartera = propiedad propia, captacion = ex-tasación
type ViewMode = 'cards' | 'table'
type TabView = 'cartera' | 'captadas'

interface Inmueble {
  id: string
  titulo: string
  direccion: string
  barrio: string
  ciudad: string
  tipo: PropertyType
  origen: PropertyOrigin
  status: PropertyStatus
  precio: number
  moneda: 'USD' | 'ARS'
  ambientes: number
  dormitorios: number
  banos: number
  superficie: number
  superficieCubierta: number
  antiguedad: number
  expensas?: number
  imagen: string
  caracteristicas: string[]
  propietario: {
    nombre: string
    telefono: string
    email: string
  }
  fechaAlta: string
  destacada: boolean
  // Campos adicionales para propiedades captadas (ex-tasaciones)
  tasacionOriginal?: {
    id: string
    fechaTasacion: string
    valorTasado: number
    agenteCaptador: string
  }
}

// Datos de ejemplo - Propiedades de cartera propia
const INMUEBLES_CARTERA: Inmueble[] = [
  {
    id: '1',
    titulo: 'Departamento 3 amb con balcón',
    direccion: 'Av. Santa Fe 3200, Piso 8',
    barrio: 'Palermo',
    ciudad: 'CABA',
    tipo: 'departamento',
    origen: 'cartera',
    status: 'disponible',
    precio: 185000,
    moneda: 'USD',
    ambientes: 3,
    dormitorios: 2,
    banos: 1,
    superficie: 75,
    superficieCubierta: 70,
    antiguedad: 15,
    expensas: 45000,
    imagen: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop',
    caracteristicas: ['Balcón', 'Luminoso', 'Cocina separada', 'Lavadero'],
    propietario: { nombre: 'María González', telefono: '11-4567-8901', email: 'maria@email.com' },
    fechaAlta: '2025-01-10',
    destacada: true,
  },
  {
    id: '2',
    titulo: 'PH reciclado con terraza',
    direccion: 'Costa Rica 5400',
    barrio: 'Palermo Hollywood',
    ciudad: 'CABA',
    tipo: 'ph',
    origen: 'cartera',
    status: 'disponible',
    precio: 220000,
    moneda: 'USD',
    ambientes: 4,
    dormitorios: 3,
    banos: 2,
    superficie: 120,
    superficieCubierta: 95,
    antiguedad: 40,
    imagen: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop',
    caracteristicas: ['Terraza propia', 'Parrilla', 'Reciclado', 'Sin expensas'],
    propietario: { nombre: 'Carlos Ruiz', telefono: '11-2345-6789', email: 'carlos@email.com' },
    fechaAlta: '2025-01-08',
    destacada: true,
  },
  {
    id: '3',
    titulo: 'Monoambiente divisible a estrenar',
    direccion: 'Arenales 2100, Piso 12',
    barrio: 'Recoleta',
    ciudad: 'CABA',
    tipo: 'departamento',
    origen: 'cartera',
    status: 'reservada',
    precio: 95000,
    moneda: 'USD',
    ambientes: 1,
    dormitorios: 0,
    banos: 1,
    superficie: 38,
    superficieCubierta: 35,
    antiguedad: 0,
    expensas: 25000,
    imagen: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop',
    caracteristicas: ['A estrenar', 'Amenities', 'Divisible', 'Apto profesional'],
    propietario: { nombre: 'Ana López', telefono: '11-3456-7890', email: 'ana@email.com' },
    fechaAlta: '2025-01-05',
    destacada: false,
  },
  {
    id: '4',
    titulo: 'Casa 4 amb con jardín y pileta',
    direccion: 'Los Aromos 450',
    barrio: 'Olivos',
    ciudad: 'Vicente López',
    tipo: 'casa',
    origen: 'cartera',
    status: 'disponible',
    precio: 380000,
    moneda: 'USD',
    ambientes: 4,
    dormitorios: 3,
    banos: 3,
    superficie: 350,
    superficieCubierta: 180,
    antiguedad: 20,
    imagen: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop',
    caracteristicas: ['Pileta', 'Jardín', 'Parrilla', 'Cochera doble', 'Dependencia'],
    propietario: { nombre: 'Roberto Fernández', telefono: '11-5678-9012', email: 'roberto@email.com' },
    fechaAlta: '2025-01-12',
    destacada: true,
  },
  {
    id: '5',
    titulo: 'Oficina premium en torre corporativa',
    direccion: 'Av. Del Libertador 6000, Piso 15',
    barrio: 'Núñez',
    ciudad: 'CABA',
    tipo: 'oficina',
    origen: 'cartera',
    status: 'disponible',
    precio: 285000,
    moneda: 'USD',
    ambientes: 1,
    dormitorios: 0,
    banos: 2,
    superficie: 150,
    superficieCubierta: 150,
    antiguedad: 5,
    expensas: 180000,
    imagen: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop',
    caracteristicas: ['Vista al río', 'Cocheras', 'Seguridad 24hs', 'Sala de reuniones'],
    propietario: { nombre: 'Inversiones SA', telefono: '11-4000-5000', email: 'contacto@inversiones.com' },
    fechaAlta: '2025-01-15',
    destacada: false,
  },
]

// Propiedades captadas (ex-tasaciones convertidas a venta)
const INMUEBLES_CAPTADOS: Inmueble[] = [
  {
    id: 'cap-1',
    titulo: 'Departamento 2 amb luminoso',
    direccion: 'Güemes 4500, Piso 3',
    barrio: 'Palermo Soho',
    ciudad: 'CABA',
    tipo: 'departamento',
    origen: 'captacion',
    status: 'disponible',
    precio: 145000,
    moneda: 'USD',
    ambientes: 2,
    dormitorios: 1,
    banos: 1,
    superficie: 45,
    superficieCubierta: 42,
    antiguedad: 8,
    expensas: 35000,
    imagen: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop',
    caracteristicas: ['Balcón', 'Muy luminoso', 'Excelente ubicación', 'Cocina integrada'],
    propietario: { nombre: 'Lucía Martínez', telefono: '11-6789-0123', email: 'lucia@email.com' },
    fechaAlta: '2025-01-18',
    destacada: true,
    tasacionOriginal: {
      id: 'TAS-2025-042',
      fechaTasacion: '2025-01-10',
      valorTasado: 142000,
      agenteCaptador: 'Agente Tasaciones IA'
    }
  },
  {
    id: 'cap-2',
    titulo: 'PH 3 amb con patio',
    direccion: 'Humboldt 1800',
    barrio: 'Palermo Viejo',
    ciudad: 'CABA',
    tipo: 'ph',
    origen: 'captacion',
    status: 'disponible',
    precio: 195000,
    moneda: 'USD',
    ambientes: 3,
    dormitorios: 2,
    banos: 1,
    superficie: 85,
    superficieCubierta: 75,
    antiguedad: 50,
    imagen: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop',
    caracteristicas: ['Patio propio', 'Sin expensas', 'Reciclado', 'Muy tranquilo'],
    propietario: { nombre: 'Jorge Méndez', telefono: '11-7890-1234', email: 'jorge@email.com' },
    fechaAlta: '2025-01-20',
    destacada: false,
    tasacionOriginal: {
      id: 'TAS-2025-038',
      fechaTasacion: '2025-01-05',
      valorTasado: 190000,
      agenteCaptador: 'Agente Tasaciones IA'
    }
  },
  {
    id: 'cap-3',
    titulo: 'Local comercial sobre avenida',
    direccion: 'Av. Cabildo 2300',
    barrio: 'Belgrano',
    ciudad: 'CABA',
    tipo: 'local',
    origen: 'captacion',
    status: 'reservada',
    precio: 320000,
    moneda: 'USD',
    ambientes: 1,
    dormitorios: 0,
    banos: 1,
    superficie: 120,
    superficieCubierta: 120,
    antiguedad: 25,
    expensas: 45000,
    imagen: 'https://images.unsplash.com/photo-1582037928769-181f2644ecb7?w=800&auto=format&fit=crop',
    caracteristicas: ['Sobre avenida', 'Gran vidriera', 'Sótano', 'Ideal gastronomía'],
    propietario: { nombre: 'Comercial Norte SRL', telefono: '11-8901-2345', email: 'comercial@norte.com' },
    fechaAlta: '2025-01-19',
    destacada: true,
    tasacionOriginal: {
      id: 'TAS-2025-035',
      fechaTasacion: '2024-12-20',
      valorTasado: 310000,
      agenteCaptador: 'Agente Tasaciones IA'
    }
  },
]

const STATUS_CONFIG: Record<PropertyStatus, { label: string; color: string; bg: string }> = {
  disponible: { label: 'Disponible', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  reservada: { label: 'Reservada', color: 'text-amber-700', bg: 'bg-amber-100' },
  vendida: { label: 'Vendida', color: 'text-gray-700', bg: 'bg-gray-100' },
}

const TIPO_CONFIG: Record<PropertyType, string> = {
  departamento: 'Depto',
  casa: 'Casa',
  ph: 'PH',
  local: 'Local',
  oficina: 'Oficina',
  cochera: 'Cochera',
  terreno: 'Terreno',
}

export const Propiedades = () => {
  const [activeTab, setActiveTab] = useState<TabView>('cartera')
  const [viewMode, setViewMode] = useState<ViewMode>('cards')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedInmueble, setSelectedInmueble] = useState<Inmueble | null>(null)

  const currentInmuebles = activeTab === 'cartera' ? INMUEBLES_CARTERA : INMUEBLES_CAPTADOS

  const filteredInmuebles = currentInmuebles.filter(i => {
    const matchesSearch = i.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.barrio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.direccion.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const formatPrice = (precio: number, moneda: string) => {
    if (moneda === 'USD') return `USD ${precio.toLocaleString()}`
    return `$ ${precio.toLocaleString()}`
  }

  // Estadísticas rápidas
  const statsCartera = {
    total: INMUEBLES_CARTERA.length,
    disponibles: INMUEBLES_CARTERA.filter(i => i.status === 'disponible').length,
    reservadas: INMUEBLES_CARTERA.filter(i => i.status === 'reservada').length,
  }
  
  const statsCaptadas = {
    total: INMUEBLES_CAPTADOS.length,
    disponibles: INMUEBLES_CAPTADOS.filter(i => i.status === 'disponible').length,
    reservadas: INMUEBLES_CAPTADOS.filter(i => i.status === 'reservada').length,
  }

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-[#F8F9FA]">
      {/* Header */}
      <div className="flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-white">
        {/* Top row */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Home className="w-5 sm:w-6 h-5 sm:h-6 text-[#D4A745]" />
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Propiedades</h1>
            <span className="hidden sm:inline bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
              {filteredInmuebles.length} inmuebles
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'cards' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <button className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-[#D4A745] text-white rounded-lg text-sm font-medium hover:bg-[#c49a3d]">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nueva</span>
            </button>
          </div>
        </div>

        {/* Search row */}
        <div className="mb-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por barrio, dirección..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50 focus:border-[#D4A745]"
            />
          </div>
        </div>

        {/* Tabs: Cartera vs Captadas */}
        <div className="flex items-center gap-4 sm:gap-6 border-b border-gray-100 -mb-3 sm:-mb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('cartera')}
            className={`flex items-center gap-2 pb-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'cartera' 
                ? 'border-[#D4A745] text-[#D4A745]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span className="font-medium text-sm sm:text-base">Cartera</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              activeTab === 'cartera' ? 'bg-[#D4A745]/10 text-[#D4A745]' : 'bg-gray-100 text-gray-500'
            }`}>
              {statsCartera.total}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('captadas')}
            className={`flex items-center gap-2 pb-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'captadas' 
                ? 'border-[#D4A745] text-[#D4A745]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span className="font-medium text-sm sm:text-base">Captadas</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              activeTab === 'captadas' ? 'bg-[#D4A745]/10 text-[#D4A745]' : 'bg-gray-100 text-gray-500'
            }`}>
              {statsCaptadas.total}
            </span>
          </button>
        </div>
      </div>

      {/* Info banner para captadas */}
      {activeTab === 'captadas' && (
        <div className="mx-4 sm:mx-6 mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start sm:items-center gap-3">
          <FileCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-xs sm:text-sm text-blue-800">
            <span className="font-medium">Propiedades Captadas:</span> Provienen de tasaciones donde el propietario decidió vender con STAR.
          </p>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredInmuebles.map((inmueble) => (
              <div
                key={inmueble.id}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => setSelectedInmueble(inmueble)}
              >
                <div className="relative h-40 sm:h-48">
                  <img
                    src={inmueble.imagen}
                    alt={inmueble.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${STATUS_CONFIG[inmueble.status].bg} ${STATUS_CONFIG[inmueble.status].color}`}>
                      {STATUS_CONFIG[inmueble.status].label}
                    </span>
                    {inmueble.origen === 'captacion' && (
                      <span className="text-xs font-medium px-2 py-1 rounded bg-blue-100 text-blue-700">
                        Captada
                      </span>
                    )}
                  </div>
                  <button 
                    className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-full text-gray-600 hover:text-red-500 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-3 sm:p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-base sm:text-lg font-bold text-[#D4A745]">{formatPrice(inmueble.precio, inmueble.moneda)}</p>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {TIPO_CONFIG[inmueble.tipo]}
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1 line-clamp-1 text-sm sm:text-base">{inmueble.titulo}</h3>
                  <div className="flex items-center gap-1 text-gray-500 text-xs sm:text-sm mb-3">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="line-clamp-1">{inmueble.barrio}, {inmueble.ciudad}</span>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                    {inmueble.ambientes > 0 && (
                      <span className="flex items-center gap-1">
                        <Bed className="w-4 h-4" /> {inmueble.ambientes}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Square className="w-4 h-4" /> {inmueble.superficie}m²
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="w-4 h-4" /> {inmueble.banos}
                    </span>
                  </div>
                  {/* Info de captación */}
                  {inmueble.tasacionOriginal && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Captada: {new Date(inmueble.tasacionOriginal.fechaTasacion).toLocaleDateString('es-AR')}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 px-3 sm:px-4 text-xs font-semibold text-gray-500 uppercase">Propiedad</th>
                    <th className="text-left py-3 px-3 sm:px-4 text-xs font-semibold text-gray-500 uppercase">Ubicación</th>
                    <th className="text-left py-3 px-3 sm:px-4 text-xs font-semibold text-gray-500 uppercase">Precio</th>
                    <th className="text-left py-3 px-3 sm:px-4 text-xs font-semibold text-gray-500 uppercase">m²</th>
                    <th className="text-left py-3 px-3 sm:px-4 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                    <th className="text-center py-3 px-3 sm:px-4 text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredInmuebles.map((inmueble) => (
                    <tr key={inmueble.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedInmueble(inmueble)}>
                      <td className="py-3 px-3 sm:px-4">
                        <div className="flex items-center gap-3">
                          <img src={inmueble.imagen} alt="" className="w-10 sm:w-12 h-10 sm:h-12 rounded-lg object-cover flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">{inmueble.titulo}</p>
                            <p className="text-xs text-gray-500">{inmueble.ambientes} amb • {TIPO_CONFIG[inmueble.tipo]}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 sm:px-4">
                        <p className="text-sm text-gray-900">{inmueble.barrio}</p>
                        <p className="text-xs text-gray-500">{inmueble.ciudad}</p>
                      </td>
                      <td className="py-3 px-3 sm:px-4">
                        <span className="font-bold text-[#D4A745] text-sm">{formatPrice(inmueble.precio, inmueble.moneda)}</span>
                      </td>
                      <td className="py-3 px-3 sm:px-4">
                        <span className="text-sm text-gray-700">{inmueble.superficie}</span>
                      </td>
                      <td className="py-3 px-3 sm:px-4">
                        <span className={`text-xs font-medium px-2 py-1 rounded ${STATUS_CONFIG[inmueble.status].bg} ${STATUS_CONFIG[inmueble.status].color}`}>
                          {STATUS_CONFIG[inmueble.status].label}
                        </span>
                      </td>
                      <td className="py-3 px-3 sm:px-4">
                        <div className="flex items-center justify-center gap-1">
                          <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#D4A745]">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#D4A745]">
                            <Phone className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Mobile hint */}
            <div className="lg:hidden px-4 py-2 text-center border-t border-gray-100">
              <p className="text-xs text-gray-400">← Desliza para ver más →</p>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedInmueble && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => setSelectedInmueble(null)}>
          <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="relative h-48 sm:h-64">
              <img src={selectedInmueble.imagen} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => setSelectedInmueble(null)}
                className="absolute top-3 sm:top-4 right-3 sm:right-4 p-2 bg-white/80 hover:bg-white rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex gap-2">
                <span className={`text-xs font-medium px-2 py-1 rounded ${STATUS_CONFIG[selectedInmueble.status].bg} ${STATUS_CONFIG[selectedInmueble.status].color}`}>
                  {STATUS_CONFIG[selectedInmueble.status].label}
                </span>
                {selectedInmueble.origen === 'captacion' && (
                  <span className="text-xs font-medium px-2 py-1 rounded bg-blue-100 text-blue-700">
                    Captada
                  </span>
                )}
              </div>
              <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4">
                <p className="text-xl sm:text-2xl font-bold text-white">{formatPrice(selectedInmueble.precio, selectedInmueble.moneda)}</p>
              </div>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-12rem)] sm:max-h-[calc(90vh-16rem)]">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{selectedInmueble.titulo}</h2>
              <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{selectedInmueble.direccion}, {selectedInmueble.barrio}</span>
              </div>

              {/* Info de tasación original (si es captada) */}
              {selectedInmueble.tasacionOriginal && (
                <div className="mb-6 p-3 sm:p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
                    <FileCheck className="w-4 h-4" />
                    Información de Captación
                  </h3>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div>
                      <p className="text-blue-600">ID Tasación</p>
                      <p className="font-medium text-blue-900">{selectedInmueble.tasacionOriginal.id}</p>
                    </div>
                    <div>
                      <p className="text-blue-600">Fecha</p>
                      <p className="font-medium text-blue-900">{new Date(selectedInmueble.tasacionOriginal.fechaTasacion).toLocaleDateString('es-AR')}</p>
                    </div>
                    <div>
                      <p className="text-blue-600">Valor Tasado</p>
                      <p className="font-medium text-blue-900">{formatPrice(selectedInmueble.tasacionOriginal.valorTasado, selectedInmueble.moneda)}</p>
                    </div>
                    <div>
                      <p className="text-blue-600">Agente</p>
                      <p className="font-medium text-blue-900 truncate">{selectedInmueble.tasacionOriginal.agenteCaptador}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-base sm:text-lg font-bold text-gray-900">{selectedInmueble.ambientes}</p>
                  <p className="text-xs text-gray-500">Ambientes</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-base sm:text-lg font-bold text-gray-900">{selectedInmueble.superficie}m²</p>
                  <p className="text-xs text-gray-500">Superficie</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-base sm:text-lg font-bold text-gray-900">{selectedInmueble.banos}</p>
                  <p className="text-xs text-gray-500">Baños</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-base sm:text-lg font-bold text-gray-900">{selectedInmueble.antiguedad}</p>
                  <p className="text-xs text-gray-500">Antigüedad</p>
                </div>
              </div>
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Características</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedInmueble.caracteristicas.map((c) => (
                    <span key={c} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{c}</span>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
                  <User className="w-4 h-4" />
                  Propietario
                </h3>
                <p className="text-sm text-gray-700">{selectedInmueble.propietario.nombre}</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                  <a href={`tel:${selectedInmueble.propietario.telefono}`} className="flex items-center gap-1 text-sm text-[#D4A745]">
                    <Phone className="w-4 h-4" /> {selectedInmueble.propietario.telefono}
                  </a>
                  <a href={`mailto:${selectedInmueble.propietario.email}`} className="flex items-center gap-1 text-sm text-[#D4A745] truncate">
                    <Mail className="w-4 h-4 flex-shrink-0" /> {selectedInmueble.propietario.email}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
