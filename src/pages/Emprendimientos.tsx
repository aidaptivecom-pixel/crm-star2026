import { useState, useRef, useMemo } from 'react'
import { Building2, MapPin, Bed, Square, Eye, Share2, X, ChevronLeft, ChevronRight, LayoutGrid, Table2, Loader2, AlertCircle, Database } from 'lucide-react'
import { useProjects } from '../hooks/useProjects'
import type { Project as DBProject } from '../types/database'

type PropertyStatus = 'en_pozo' | 'en_construccion' | 'entrega_inmediata'
type ViewMode = 'cards' | 'table'

interface Tipologia {
  id: string
  name: string
  ambientes: number
  superficie: string
  precio: string
  disponibles: number
}

interface Property {
  id: string
  name: string
  location: string
  neighborhood: string
  country: 'Argentina' | 'Uruguay'
  status: PropertyStatus
  type: string
  image: string
  description: string
  amenities: string[]
  tipologias: Tipologia[]
  entrega: string
  avance: number
  featured: boolean
  precioM2?: string
}

// Fallback data when Supabase is not configured
const FALLBACK_DATA: Property[] = [
  {
    id: '1',
    name: 'Roccatagliata',
    location: 'Roccatagliata, Belgrano',
    neighborhood: 'Belgrano',
    country: 'Argentina',
    status: 'en_construccion',
    type: 'departamento',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop',
    description: 'Emplazado sobre un terreno de 3.500 m², conjugando la elegancia de la historia Argentina con la sofisticación de un proyecto moderno.',
    amenities: ['Piscina', 'SUM', 'Terraza', 'Gimnasio', 'Jardines'],
    tipologias: [
      { id: '1', name: '2 ambientes', ambientes: 2, superficie: '54-67 m²', precio: 'USD 209.657', disponibles: 8 },
      { id: '2', name: '3 ambientes', ambientes: 3, superficie: '94 m²', precio: 'USD 311.500', disponibles: 12 },
    ],
    entrega: '2026',
    avance: 65,
    featured: true,
    precioM2: 'USD 2.805 - 4.290/m²',
  },
]

const STATUS_LABELS: Record<PropertyStatus, { label: string; color: string; bgColor: string }> = {
  en_pozo: { label: 'En pozo', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  en_construccion: { label: 'En construcción', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  entrega_inmediata: { label: 'Entrega inmediata', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
}

// Transform Supabase data to component format
function transformDBProject(dbProject: DBProject): Property {
  const tipologias: Tipologia[] = Array.isArray(dbProject.tipologias) 
    ? (dbProject.tipologias as any[]).map((t, i) => ({
        id: String(i + 1),
        name: t.nombre || t.name || `Tipo ${i + 1}`,
        ambientes: t.ambientes || 0,
        superficie: t.superficie || t.m2 || '-',
        precio: t.precio || `USD ${dbProject.price_min?.toLocaleString() || '-'}`,
        disponibles: t.disponibles || t.unidades || 0,
      }))
    : [{ 
        id: '1', 
        name: 'Consultar', 
        ambientes: 0, 
        superficie: '-', 
        precio: `USD ${dbProject.price_min?.toLocaleString() || '-'}`, 
        disponibles: dbProject.units_available || 0 
      }]

  const amenities: string[] = Array.isArray(dbProject.amenities) 
    ? (dbProject.amenities as string[])
    : []

  // Determine country from location
  const isUruguay = dbProject.location?.toLowerCase().includes('uruguay') || 
                    dbProject.slug === 'puerto-quetzal'

  // Map estado to PropertyStatus
  let status: PropertyStatus = 'en_construccion'
  if (dbProject.estado === 'entrega_inmediata' || dbProject.estado === 'disponible') {
    status = 'entrega_inmediata'
  } else if (dbProject.estado === 'preventa') {
    status = 'en_pozo'
  }

  // Calculate avance based on estado
  let avance = 50
  if (dbProject.estado === 'entrega_inmediata' || dbProject.estado === 'disponible') {
    avance = 100
  } else if (dbProject.estado === 'preventa') {
    avance = 15
  }

  return {
    id: dbProject.id,
    name: dbProject.name,
    location: dbProject.direccion || dbProject.location || '',
    neighborhood: dbProject.location?.split(',')[0] || '',
    country: isUruguay ? 'Uruguay' : 'Argentina',
    status,
    type: 'departamento',
    image: Array.isArray(dbProject.images) && dbProject.images.length > 0 
      ? (dbProject.images as string[])[0] 
      : 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop',
    description: dbProject.description || '',
    amenities,
    tipologias,
    entrega: dbProject.entrega || 'Consultar',
    avance,
    featured: dbProject.units_available ? dbProject.units_available > 10 : false,
    precioM2: dbProject.precio_m2_min 
      ? `USD ${dbProject.precio_m2_min.toLocaleString()} - ${dbProject.precio_m2_max?.toLocaleString() || '-'}/m²`
      : undefined,
  }
}

export const Emprendimientos = () => {
  const { projects: dbProjects, loading, error, isConfigured } = useProjects()
  
  // Transform DB projects to component format, or use fallback
  const properties = useMemo(() => {
    if (!isConfigured || dbProjects.length === 0) {
      return FALLBACK_DATA
    }
    return dbProjects.map(transformDBProject)
  }, [dbProjects, isConfigured])

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('cards')
  const [activeIndex, setActiveIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

  const scrollToIndex = (index: number) => {
    if (index < 0) index = properties.length - 1
    if (index >= properties.length) index = 0
    setActiveIndex(index)
    
    if (carouselRef.current) {
      const scrollAmount = index * 200
      carouselRef.current.scrollTo({ left: scrollAmount - 100, behavior: 'smooth' })
    }
  }

  const totalUnidades = properties.reduce((acc, p) => acc + p.tipologias.reduce((a, t) => a + t.disponibles, 0), 0)

  // Loading state
  if (loading) {
    return (
      <main className="flex-1 h-full min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#F8F9FA]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#D4A745] mx-auto mb-3" />
          <p className="text-gray-600">Cargando emprendimientos...</p>
        </div>
      </main>
    )
  }

  // Error state
  if (error) {
    return (
      <main className="flex-1 flex items-center justify-center bg-[#F8F9FA]">
        <div className="text-center max-w-md px-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar datos</h2>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#D4A745] text-white rounded-lg hover:bg-[#c49a3d]"
          >
            Reintentar
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-[#F8F9FA]">
      {/* Header */}
      <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 sm:w-6 h-5 sm:h-6 text-[#D4A745]" />
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Emprendimientos</h1>
            <span className="hidden sm:inline bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
              {properties.length} proyectos • {totalUnidades} unidades
            </span>
            {isConfigured && (
              <span className="hidden sm:inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-1 rounded-full">
                <Database className="w-3 h-3" />
                Supabase
              </span>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg self-start sm:self-auto">
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'cards' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Table2 className="w-4 h-4" />
              <span className="hidden sm:inline">Tabla</span>
            </button>
          </div>
        </div>
      </div>

      {/* Carousel Navigation */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={() => scrollToIndex(activeIndex - 1)}
            className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex-shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div 
            ref={carouselRef}
            className="flex-1 flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {properties.map((property, index) => (
              <button
                key={property.id}
                onClick={() => {
                  setActiveIndex(index)
                  if (viewMode === 'cards') setSelectedProperty(property)
                }}
                className={`flex-shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border transition-all ${
                  activeIndex === index
                    ? 'bg-[#D4A745] text-white border-[#D4A745]'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#D4A745] hover:text-[#D4A745]'
                }`}
              >
                <span className="font-medium text-xs sm:text-sm whitespace-nowrap">{property.name}</span>
                <span className={`hidden sm:inline text-xs px-1.5 py-0.5 rounded ${
                  activeIndex === index ? 'bg-white/20' : 'bg-gray-100'
                }`}>
                  {property.neighborhood}
                </span>
              </button>
            ))}
          </div>

          <button 
            onClick={() => scrollToIndex(activeIndex + 1)}
            className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex-shrink-0"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        {viewMode === 'cards' ? (
          /* Cards View - Responsive Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {properties.map((property, index) => (
              <div
                key={property.id}
                className={`bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-all cursor-pointer group ${
                  activeIndex === index ? 'border-[#D4A745] ring-2 ring-[#D4A745]/20' : 'border-gray-100'
                }`}
                onClick={() => {
                  setActiveIndex(index)
                  setSelectedProperty(property)
                }}
              >
                <div className="relative h-40 sm:h-44">
                  <img
                    src={property.image}
                    alt={property.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${STATUS_LABELS[property.status].bgColor} ${STATUS_LABELS[property.status].color}`}>
                      {STATUS_LABELS[property.status].label}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-base sm:text-lg font-bold text-white mb-0.5">{property.name}</h3>
                    <div className="flex items-center gap-1 text-white/90 text-xs">
                      <MapPin className="w-3 h-3" />
                      {property.neighborhood}, {property.country}
                    </div>
                  </div>
                </div>
                <div className="p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Desde</p>
                      <p className="text-base sm:text-lg font-bold text-[#D4A745]">{property.tipologias[0]?.precio || '-'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Entrega</p>
                      <p className="text-sm font-medium text-gray-900">{property.entrega}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{property.tipologias.length} tipologías</span>
                    <span>{property.tipologias.reduce((a, t) => a + t.disponibles, 0)} unidades disp.</span>
                  </div>
                  {property.avance > 0 && property.avance < 100 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Avance</span>
                        <span>{property.avance}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#D4A745] rounded-full" style={{ width: `${property.avance}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Proyecto</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Ubicación</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Precio desde</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Entrega</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Unidades</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {properties.map((property, index) => (
                    <tr 
                      key={property.id} 
                      className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                        activeIndex === index ? 'bg-[#D4A745]/5' : ''
                      }`}
                      onClick={() => setActiveIndex(index)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-[#D4A745]" />
                          <span className="font-semibold text-gray-900 text-sm">{property.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-600">{property.neighborhood}</div>
                        <div className="text-xs text-gray-400">{property.country}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-medium px-2 py-1 rounded ${STATUS_LABELS[property.status].bgColor} ${STATUS_LABELS[property.status].color}`}>
                          {STATUS_LABELS[property.status].label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-[#D4A745] text-sm">{property.tipologias[0]?.precio || '-'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-700">{property.entrega}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium text-gray-700">
                          {property.tipologias.reduce((a, t) => a + t.disponibles, 0)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedProperty(property); }}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#D4A745]"
                            title="Ver detalle"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#D4A745]"
                            title="Compartir"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile hint for scroll */}
            <div className="lg:hidden px-4 py-2 text-center border-t border-gray-100">
              <p className="text-xs text-gray-400">← Desliza para ver más →</p>
            </div>
          </div>
        )}
      </div>

      {/* Property Detail Modal - Responsive */}
      {selectedProperty && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => setSelectedProperty(null)}>
          <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Modal Header Image */}
            <div className="relative h-48 sm:h-64">
              <img
                src={selectedProperty.image}
                alt={selectedProperty.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <button
                onClick={() => setSelectedProperty(null)}
                className="absolute top-3 sm:top-4 right-3 sm:right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex gap-2">
                <span className={`text-xs font-medium px-2 py-1 rounded ${STATUS_LABELS[selectedProperty.status].bgColor} ${STATUS_LABELS[selectedProperty.status].color}`}>
                  {STATUS_LABELS[selectedProperty.status].label}
                </span>
              </div>
              <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">{selectedProperty.name}</h2>
                <div className="flex items-center gap-1 text-white/90 text-sm">
                  <MapPin className="w-4 h-4" />
                  {selectedProperty.location}
                </div>
              </div>
            </div>

            {/* Modal Content - Responsive */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-192px)] sm:max-h-[calc(90vh-256px)]">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2">
                  <p className="text-sm sm:text-base text-gray-600 mb-4">{selectedProperty.description}</p>

                  {/* Amenities */}
                  {selectedProperty.amenities.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Amenities</h3>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {selectedProperty.amenities.map((amenity) => (
                          <span key={amenity} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tipologias */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Tipologías disponibles</h3>
                    <div className="space-y-2">
                      {selectedProperty.tipologias.map((tipo) => (
                        <div key={tipo.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-2">
                          <div className="flex items-center gap-3 sm:gap-4">
                            {tipo.ambientes > 0 && (
                              <div className="flex items-center gap-1 text-gray-600">
                                <Bed className="w-4 h-4" />
                                <span className="text-sm">{tipo.ambientes} amb</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1 text-gray-600">
                              <Square className="w-4 h-4" />
                              <span className="text-sm">{tipo.superficie}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 sm:gap-4">
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
                              {tipo.disponibles} disponibles
                            </span>
                            <span className="font-bold text-[#D4A745]">{tipo.precio}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Entrega</span>
                        <span className="text-sm font-medium text-gray-900">{selectedProperty.entrega}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">País</span>
                        <span className="text-sm font-medium text-gray-900">{selectedProperty.country}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Barrio</span>
                        <span className="text-sm font-medium text-gray-900">{selectedProperty.neighborhood}</span>
                      </div>
                      {selectedProperty.precioM2 && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Precio m²</span>
                          <span className="text-sm font-medium text-gray-900">{selectedProperty.precioM2}</span>
                        </div>
                      )}
                      {selectedProperty.avance > 0 && selectedProperty.avance < 100 && (
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500">Avance de obra</span>
                            <span className="font-medium text-gray-900">{selectedProperty.avance}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#D4A745] rounded-full"
                              style={{ width: `${selectedProperty.avance}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#D4A745] text-white rounded-lg font-medium hover:bg-[#c49a3d] text-sm sm:text-base">
                      <Eye className="w-4 h-4" />
                      Solicitar información
                    </button>
                    <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 text-sm sm:text-base">
                      <Share2 className="w-4 h-4" />
                      Compartir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
