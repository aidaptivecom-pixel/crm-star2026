import { useState } from 'react'
import { Home, MapPin, Bed, Bath, Square, Eye, Phone, Mail, Heart, Search, Plus, LayoutGrid, List, X } from 'lucide-react'

type PropertyStatus = 'disponible' | 'reservada' | 'vendida'
type PropertyType = 'departamento' | 'casa' | 'ph' | 'local' | 'oficina' | 'cochera'
type OperationType = 'venta' | 'alquiler'
type ViewMode = 'cards' | 'table'

interface Inmueble {
  id: string
  titulo: string
  direccion: string
  barrio: string
  ciudad: string
  tipo: PropertyType
  operacion: OperationType
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
}

// Datos de ejemplo - Inmuebles usados/reventa
const INMUEBLES: Inmueble[] = [
  {
    id: '1',
    titulo: 'Departamento 3 amb con balcón',
    direccion: 'Av. Santa Fe 3200, Piso 8',
    barrio: 'Palermo',
    ciudad: 'CABA',
    tipo: 'departamento',
    operacion: 'venta',
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
    operacion: 'venta',
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
    operacion: 'venta',
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
    operacion: 'venta',
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
    operacion: 'alquiler',
    status: 'disponible',
    precio: 3500,
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
  {
    id: '6',
    titulo: 'Departamento 2 amb luminoso',
    direccion: 'Güemes 4500, Piso 3',
    barrio: 'Palermo Soho',
    ciudad: 'CABA',
    tipo: 'departamento',
    operacion: 'alquiler',
    status: 'disponible',
    precio: 650000,
    moneda: 'ARS',
    ambientes: 2,
    dormitorios: 1,
    banos: 1,
    superficie: 45,
    superficieCubierta: 42,
    antiguedad: 8,
    expensas: 35000,
    imagen: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop',
    caracteristicas: ['Amoblado', 'Balcón', 'Muy luminoso', 'Excelente ubicación'],
    propietario: { nombre: 'Lucía Martínez', telefono: '11-6789-0123', email: 'lucia@email.com' },
    fechaAlta: '2025-01-18',
    destacada: true,
  },
]

const STATUS_CONFIG: Record<PropertyStatus, { label: string; color: string; bg: string }> = {
  disponible: { label: 'Disponible', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  reservada: { label: 'Reservada', color: 'text-amber-700', bg: 'bg-amber-100' },
  vendida: { label: 'Vendida', color: 'text-gray-700', bg: 'bg-gray-100' },
}

const TIPO_CONFIG: Record<PropertyType, string> = {
  departamento: 'Departamento',
  casa: 'Casa',
  ph: 'PH',
  local: 'Local',
  oficina: 'Oficina',
  cochera: 'Cochera',
}

export const Propiedades = () => {
  const [inmuebles] = useState<Inmueble[]>(INMUEBLES)
  const [viewMode, setViewMode] = useState<ViewMode>('cards')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterOperacion, setFilterOperacion] = useState<OperationType | 'todas'>('todas')
  const [selectedInmueble, setSelectedInmueble] = useState<Inmueble | null>(null)

  const filteredInmuebles = inmuebles.filter(i => {
    const matchesSearch = i.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.barrio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.direccion.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesOperacion = filterOperacion === 'todas' || i.operacion === filterOperacion
    return matchesSearch && matchesOperacion
  })

  const formatPrice = (precio: number, moneda: string) => {
    if (moneda === 'USD') return `USD ${precio.toLocaleString()}`
    return `$ ${precio.toLocaleString()}`
  }

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-[#F8F9FA]">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Home className="w-6 h-6 text-[#D4A745]" />
            <h1 className="text-xl font-bold text-gray-900">Propiedades</h1>
            <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
              {filteredInmuebles.length} inmuebles
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por barrio, dirección..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50 focus:border-[#D4A745]"
              />
            </div>

            {/* Filter by operation */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setFilterOperacion('todas')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filterOperacion === 'todas' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilterOperacion('venta')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filterOperacion === 'venta' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}
              >
                Venta
              </button>
              <button
                onClick={() => setFilterOperacion('alquiler')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filterOperacion === 'alquiler' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}
              >
                Alquiler
              </button>
            </div>

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

            <button className="flex items-center gap-2 px-4 py-2 bg-[#D4A745] text-white rounded-lg text-sm font-medium hover:bg-[#c49a3d]">
              <Plus className="w-4 h-4" />
              Nueva propiedad
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {viewMode === 'cards' ? (
          <div className="grid grid-cols-3 gap-4">
            {filteredInmuebles.map((inmueble) => (
              <div
                key={inmueble.id}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => setSelectedInmueble(inmueble)}
              >
                <div className="relative h-48">
                  <img
                    src={inmueble.imagen}
                    alt={inmueble.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${STATUS_CONFIG[inmueble.status].bg} ${STATUS_CONFIG[inmueble.status].color}`}>
                      {STATUS_CONFIG[inmueble.status].label}
                    </span>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      inmueble.operacion === 'venta' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {inmueble.operacion === 'venta' ? 'Venta' : 'Alquiler'}
                    </span>
                  </div>
                  <button 
                    className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-full text-gray-600 hover:text-red-500 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-lg font-bold text-[#D4A745]">{formatPrice(inmueble.precio, inmueble.moneda)}</p>
                      {inmueble.operacion === 'alquiler' && <span className="text-xs text-gray-500">/mes</span>}
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {TIPO_CONFIG[inmueble.tipo]}
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">{inmueble.titulo}</h3>
                  <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="line-clamp-1">{inmueble.barrio}, {inmueble.ciudad}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {inmueble.ambientes > 0 && (
                      <span className="flex items-center gap-1">
                        <Bed className="w-4 h-4" /> {inmueble.ambientes} amb
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Square className="w-4 h-4" /> {inmueble.superficie} m²
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="w-4 h-4" /> {inmueble.banos}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Propiedad</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Ubicación</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Tipo</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Operación</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Precio</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Superficie</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInmuebles.map((inmueble) => (
                  <tr key={inmueble.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedInmueble(inmueble)}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img src={inmueble.imagen} alt="" className="w-12 h-12 rounded-lg object-cover" />
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">{inmueble.titulo}</p>
                          <p className="text-xs text-gray-500">{inmueble.ambientes} amb • {inmueble.banos} baño(s)</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-900">{inmueble.barrio}</p>
                      <p className="text-xs text-gray-500">{inmueble.ciudad}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-700">{TIPO_CONFIG[inmueble.tipo]}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        inmueble.operacion === 'venta' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {inmueble.operacion === 'venta' ? 'Venta' : 'Alquiler'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-[#D4A745]">{formatPrice(inmueble.precio, inmueble.moneda)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-700">{inmueble.superficie} m²</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${STATUS_CONFIG[inmueble.status].bg} ${STATUS_CONFIG[inmueble.status].color}`}>
                        {STATUS_CONFIG[inmueble.status].label}
                      </span>
                    </td>
                    <td className="py-3 px-4">
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
        )}
      </div>

      {/* Detail Modal */}
      {selectedInmueble && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedInmueble(null)}>
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="relative h-64">
              <img src={selectedInmueble.imagen} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => setSelectedInmueble(null)}
                className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute top-4 left-4 flex gap-2">
                <span className={`text-xs font-medium px-2 py-1 rounded ${STATUS_CONFIG[selectedInmueble.status].bg} ${STATUS_CONFIG[selectedInmueble.status].color}`}>
                  {STATUS_CONFIG[selectedInmueble.status].label}
                </span>
              </div>
              <div className="absolute bottom-4 left-4">
                <p className="text-2xl font-bold text-white">{formatPrice(selectedInmueble.precio, selectedInmueble.moneda)}</p>
              </div>
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedInmueble.titulo}</h2>
              <div className="flex items-center gap-1 text-gray-500 mb-4">
                <MapPin className="w-4 h-4" />
                {selectedInmueble.direccion}, {selectedInmueble.barrio}
              </div>
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-gray-900">{selectedInmueble.ambientes}</p>
                  <p className="text-xs text-gray-500">Ambientes</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-gray-900">{selectedInmueble.superficie} m²</p>
                  <p className="text-xs text-gray-500">Superficie</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-gray-900">{selectedInmueble.banos}</p>
                  <p className="text-xs text-gray-500">Baños</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-gray-900">{selectedInmueble.antiguedad}</p>
                  <p className="text-xs text-gray-500">Antigüedad</p>
                </div>
              </div>
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Características</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedInmueble.caracteristicas.map((c) => (
                    <span key={c} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{c}</span>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Propietario</h3>
                <p className="text-sm text-gray-700">{selectedInmueble.propietario.nombre}</p>
                <div className="flex items-center gap-4 mt-2">
                  <a href={`tel:${selectedInmueble.propietario.telefono}`} className="flex items-center gap-1 text-sm text-[#D4A745]">
                    <Phone className="w-4 h-4" /> {selectedInmueble.propietario.telefono}
                  </a>
                  <a href={`mailto:${selectedInmueble.propietario.email}`} className="flex items-center gap-1 text-sm text-[#D4A745]">
                    <Mail className="w-4 h-4" /> {selectedInmueble.propietario.email}
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
