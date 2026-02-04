import { useState } from 'react'
import { Home, MapPin, Bed, Bath, Square, Search, Plus, LayoutGrid, List, X, ExternalLink, Send, Loader2, ArrowLeft, Calendar, Eye } from 'lucide-react'
import { useProperties, Property, PropertyInput } from '../hooks/useProperties'

type PropertyStatus = 'disponible' | 'reservada' | 'vendida'
type PropertyType = 'departamento' | 'casa' | 'ph' | 'local' | 'oficina' | 'cochera' | 'terreno'
type ViewMode = 'cards' | 'table'

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

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop'

export const Propiedades = () => {
  const { properties, loading, error, createProperty, stats } = useProperties()
  const [viewMode, setViewMode] = useState<ViewMode>('cards')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [sendingLink, setSendingLink] = useState<string | null>(null)

  // If a property is selected, show detail view
  if (selectedProperty) {
    return (
      <PropertyDetailView 
        property={selectedProperty}
        onBack={() => setSelectedProperty(null)}
      />
    )
  }

  const filteredProperties = properties.filter(p => {
    const matchesSearch = 
      p.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.neighborhood?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const formatPrice = (precio: number | null, moneda: string | null) => {
    if (!precio) return 'Consultar'
    if (moneda === 'USD') return `USD ${precio.toLocaleString()}`
    return `$ ${precio.toLocaleString()}`
  }

  const getMainPhoto = (property: Property) => {
    if (property.photos && property.photos.length > 0) {
      return property.photos[0]
    }
    return DEFAULT_IMAGE
  }

  const handleSendZonaPropLink = async (property: Property, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!property.zonaprop_url) {
      alert('Esta propiedad no tiene link de ZonaProp')
      return
    }
    
    setSendingLink(property.id)
    
    // Copiar al clipboard
    try {
      await navigator.clipboard.writeText(property.zonaprop_url)
      alert(`Link copiado al clipboard:\n${property.zonaprop_url}`)
    } catch (err) {
      // Fallback: abrir en nueva pestaña
      window.open(property.zonaprop_url, '_blank')
    }
    
    setSendingLink(null)
  }

  const openZonaProp = (url: string | null, e: React.MouseEvent) => {
    e.stopPropagation()
    if (url) {
      window.open(url, '_blank')
    }
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
              {filteredProperties.length} inmuebles
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

            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-[#D4A745] text-white rounded-lg text-sm font-medium hover:bg-[#c49a3d]"
            >
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

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-500">
            <span className="font-medium text-emerald-600">{stats.disponible}</span> disponibles
          </span>
          <span className="text-gray-500">
            <span className="font-medium text-amber-600">{stats.reservada}</span> reservadas
          </span>
          <span className="text-gray-500">
            <span className="font-medium text-gray-600">{stats.vendida}</span> vendidas
          </span>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#D4A745]" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mx-4 sm:mx-6 mt-4 p-4 bg-red-50 border border-red-100 rounded-lg">
          <p className="text-sm text-red-800">Error: {error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredProperties.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <Home className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay propiedades</h3>
          <p className="text-gray-500 text-center mb-4">
            {searchQuery ? 'No se encontraron propiedades con esa búsqueda' : 'Agregá tu primera propiedad'}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#D4A745] text-white rounded-lg text-sm font-medium hover:bg-[#c49a3d]"
          >
            <Plus className="w-4 h-4" />
            Nueva Propiedad
          </button>
        </div>
      )}

      {/* Content */}
      {!loading && !error && filteredProperties.length > 0 && (
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProperties.map((property) => (
                <div
                  key={property.id}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => setSelectedProperty(property)}
                >
                  <div className="relative h-40 sm:h-48">
                    <img
                      src={getMainPhoto(property)}
                      alt={property.address}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.currentTarget.src = DEFAULT_IMAGE }}
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${STATUS_CONFIG[property.status as PropertyStatus]?.bg || 'bg-gray-100'} ${STATUS_CONFIG[property.status as PropertyStatus]?.color || 'text-gray-700'}`}>
                        {STATUS_CONFIG[property.status as PropertyStatus]?.label || property.status}
                      </span>
                    </div>
                    {property.zonaprop_url && (
                      <div className="absolute top-3 right-3 flex gap-1">
                        <button 
                          onClick={(e) => handleSendZonaPropLink(property, e)}
                          className="p-2 bg-white/90 hover:bg-white rounded-full text-gray-600 hover:text-[#D4A745] transition-colors"
                          title="Copiar link ZonaProp"
                        >
                          {sendingLink === property.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </button>
                        <button 
                          onClick={(e) => openZonaProp(property.zonaprop_url, e)}
                          className="p-2 bg-white/90 hover:bg-white rounded-full text-gray-600 hover:text-blue-600 transition-colors"
                          title="Ver en ZonaProp"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="p-3 sm:p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-base sm:text-lg font-bold text-[#D4A745]">{formatPrice(property.price, property.currency)}</p>
                        {property.expenses && (
                          <p className="text-xs text-gray-500">Exp: ${property.expenses.toLocaleString()}</p>
                        )}
                      </div>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {TIPO_CONFIG[property.type as PropertyType] || property.type}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1 line-clamp-1 text-sm sm:text-base">{property.address}</h3>
                    <div className="flex items-center gap-1 text-gray-500 text-xs sm:text-sm mb-3">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="line-clamp-1">{property.neighborhood}, {property.city}</span>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                      {property.rooms && property.rooms > 0 && (
                        <span className="flex items-center gap-1">
                          <Bed className="w-4 h-4" /> {property.rooms}
                        </span>
                      )}
                      {property.sqm_total && (
                        <span className="flex items-center gap-1">
                          <Square className="w-4 h-4" /> {property.sqm_total}m²
                        </span>
                      )}
                      {property.bathrooms && (
                        <span className="flex items-center gap-1">
                          <Bath className="w-4 h-4" /> {property.bathrooms}
                        </span>
                      )}
                    </div>
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
                    {filteredProperties.map((property) => (
                      <tr key={property.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedProperty(property)}>
                        <td className="py-3 px-3 sm:px-4">
                          <div className="flex items-center gap-3">
                            <img src={getMainPhoto(property)} alt="" className="w-10 sm:w-12 h-10 sm:h-12 rounded-lg object-cover flex-shrink-0" onError={(e) => { e.currentTarget.src = DEFAULT_IMAGE }} />
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate">{property.address}</p>
                              <p className="text-xs text-gray-500">{property.rooms} amb • {TIPO_CONFIG[property.type as PropertyType] || property.type}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 sm:px-4">
                          <p className="text-sm text-gray-900">{property.neighborhood}</p>
                          <p className="text-xs text-gray-500">{property.city}</p>
                        </td>
                        <td className="py-3 px-3 sm:px-4">
                          <span className="font-bold text-[#D4A745] text-sm">{formatPrice(property.price, property.currency)}</span>
                        </td>
                        <td className="py-3 px-3 sm:px-4">
                          <span className="text-sm text-gray-700">{property.sqm_total || '-'}</span>
                        </td>
                        <td className="py-3 px-3 sm:px-4">
                          <span className={`text-xs font-medium px-2 py-1 rounded ${STATUS_CONFIG[property.status as PropertyStatus]?.bg || 'bg-gray-100'} ${STATUS_CONFIG[property.status as PropertyStatus]?.color || 'text-gray-700'}`}>
                            {STATUS_CONFIG[property.status as PropertyStatus]?.label || property.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 sm:px-4">
                          <div className="flex items-center justify-center gap-1">
                            <button 
                              onClick={(e) => { e.stopPropagation(); setSelectedProperty(property) }}
                              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#D4A745]"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {property.zonaprop_url && (
                              <>
                                <button 
                                  onClick={(e) => handleSendZonaPropLink(property, e)}
                                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#D4A745]"
                                  title="Copiar link"
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={(e) => openZonaProp(property.zonaprop_url, e)}
                                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600"
                                  title="Ver en ZonaProp"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreatePropertyModal 
          onClose={() => setShowCreateModal(false)}
          onCreate={async (data) => {
            const result = await createProperty(data)
            if (result) {
              setShowCreateModal(false)
            }
          }}
        />
      )}
    </main>
  )
}

// Property Detail View Component (Full Page)
function PropertyDetailView({ 
  property, 
  onBack 
}: { 
  property: Property
  onBack: () => void
}) {
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [activePhotoIndex, setActivePhotoIndex] = useState(0)
  const [linkCopied, setLinkCopied] = useState(false)
  
  const formatPrice = (precio: number | null, moneda: string | null) => {
    if (!precio) return 'Consultar'
    if (moneda === 'USD') return `USD ${precio.toLocaleString()}`
    return `$ ${precio.toLocaleString()}`
  }

  const getPhotos = (p: Property) => {
    if (p.photos && p.photos.length > 0) return p.photos
    return ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop']
  }

  const handleCopyLink = async () => {
    if (!property.zonaprop_url) return
    try {
      await navigator.clipboard.writeText(property.zonaprop_url)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch (err) {
      window.open(property.zonaprop_url, '_blank')
    }
  }

  const photos = getPhotos(property)

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-[#F8F9FA]">
      {/* Header */}
      <div className="flex-shrink-0 px-4 sm:px-6 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 truncate">{property.address}</h1>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {property.neighborhood}, {property.city}
            </p>
          </div>
          <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${STATUS_CONFIG[property.status as PropertyStatus]?.bg || 'bg-gray-100'} ${STATUS_CONFIG[property.status as PropertyStatus]?.color || 'text-gray-700'}`}>
            {STATUS_CONFIG[property.status as PropertyStatus]?.label || property.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 sm:p-6">
          {/* Photo Gallery - Full Width Carousel */}
          <div className="mb-6">
            <div className="relative aspect-[21/9] rounded-xl overflow-hidden bg-gray-100 mb-3">
              <img 
                src={photos[activePhotoIndex]} 
                alt={property.address}
                className="w-full h-full object-cover"
              />
              {photos.length > 1 && (
                <>
                  <button 
                    onClick={() => setActivePhotoIndex(i => i > 0 ? i - 1 : photos.length - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-transform hover:scale-105"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={() => setActivePhotoIndex(i => i < photos.length - 1 ? i + 1 : 0)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg rotate-180 transition-transform hover:scale-105"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/70 rounded-full text-white text-sm font-medium">
                    {activePhotoIndex + 1} / {photos.length}
                  </div>
                </>
              )}
            </div>
            {/* Thumbnails */}
            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 px-1">
                {photos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIndex(idx)}
                    className={`flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === activePhotoIndex ? 'border-[#D4A745] ring-2 ring-[#D4A745]/30' : 'border-transparent hover:border-gray-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Price & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 p-4 bg-white rounded-xl border border-gray-100">
            <div>
              <p className="text-3xl font-bold text-[#D4A745]">{formatPrice(property.price, property.currency)}</p>
              {property.expenses && (
                <p className="text-sm text-gray-500 mt-1">Expensas: ${property.expenses.toLocaleString()}</p>
              )}
            </div>
            {property.zonaprop_url && (
              <div className="flex gap-2">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#D4A745] text-white rounded-lg text-sm font-medium hover:bg-[#c49a3d] transition-colors"
                >
                  <Send className="w-4 h-4" />
                  {linkCopied ? '¡Copiado!' : 'Copiar Link'}
                </button>
                <button
                  onClick={() => window.open(property.zonaprop_url!, '_blank')}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Ver en ZonaProp
                </button>
              </div>
            )}
          </div>

          {/* Key Info Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {property.rooms && (
              <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                <Bed className="w-6 h-6 text-[#D4A745] mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{property.rooms}</p>
                <p className="text-xs text-gray-500">Ambientes</p>
              </div>
            )}
            {property.sqm_total && (
              <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                <Square className="w-6 h-6 text-[#D4A745] mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{property.sqm_total}</p>
                <p className="text-xs text-gray-500">m² totales</p>
              </div>
            )}
            {property.bathrooms && (
              <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                <Bath className="w-6 h-6 text-[#D4A745] mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{property.bathrooms}</p>
                <p className="text-xs text-gray-500">Baños</p>
              </div>
            )}
            {property.antiquity !== null && property.antiquity !== undefined && (
              <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                <Calendar className="w-6 h-6 text-[#D4A745] mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{property.antiquity}</p>
                <p className="text-xs text-gray-500">Años</p>
              </div>
            )}
          </div>

          {/* Additional Info - 3 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Details */}
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3">Detalles</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tipo</span>
                  <span className="font-medium">{TIPO_CONFIG[property.type as PropertyType] || property.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Operación</span>
                  <span className="font-medium capitalize">{property.operation}</span>
                </div>
                {property.sqm_covered && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">m² cubiertos</span>
                    <span className="font-medium">{property.sqm_covered}</span>
                  </div>
                )}
                {property.floor && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Piso</span>
                    <span className="font-medium">{property.floor}</span>
                  </div>
                )}
                {property.orientation && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Orientación</span>
                    <span className="font-medium">{property.orientation}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Cochera</span>
                  <span className="font-medium">{property.garage ? 'Sí' : 'No'}</span>
                </div>
              </div>
            </div>

            {/* Características */}
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3">Características</h3>
              <div className="space-y-2 text-sm">
                {property.antiquity !== null && property.antiquity !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Antigüedad</span>
                    <span className="font-medium">{property.antiquity} años</span>
                  </div>
                )}
                {property.floor && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cantidad plantas</span>
                    <span className="font-medium">{property.floor}</span>
                  </div>
                )}
                {property.garage && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cobertura cochera</span>
                    <span className="font-medium">Cubierta</span>
                  </div>
                )}
                {property.sqm_covered && property.sqm_total && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Sup. semicubierta</span>
                    <span className="font-medium">{Math.max(0, property.sqm_total - property.sqm_covered)} m²</span>
                  </div>
                )}
                {property.storage && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Baulera</span>
                    <span className="font-medium">Sí</span>
                  </div>
                )}
              </div>
              {/* Feature tags */}
              {property.features && property.features.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-100">
                  {property.features.map((f) => (
                    <span key={f} className="text-xs bg-[#D4A745]/10 text-[#D4A745] px-2 py-1 rounded-full font-medium">{f}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Map */}
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3">Ubicación</h3>
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <iframe
                  title="Ubicación"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(
                    `${property.address}, ${property.neighborhood || ''}, ${property.city || 'Buenos Aires'}, Argentina`
                  )}&zoom=15`}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {property.address}
              </p>
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div className="bg-white rounded-xl p-4 border border-gray-100 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Descripción</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {showFullDescription || property.description.length <= 300 
                  ? property.description 
                  : property.description.substring(0, 300) + '...'}
              </p>
              {property.description.length > 300 && (
                <button 
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-sm text-[#D4A745] font-medium mt-2 hover:underline"
                >
                  {showFullDescription ? 'Ver menos' : 'Ver más'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

// Create Property Modal Component  
function CreatePropertyModal({ 
  onClose, 
  onCreate 
}: { 
  onClose: () => void
  onCreate: (data: PropertyInput) => Promise<void>
}) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<PropertyInput>({
    address: '',
    type: 'departamento',
    operation: 'venta',
    status: 'disponible',
    currency: 'USD'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await onCreate(formData)
    setLoading(false)
  }

  const updateField = (field: keyof PropertyInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">Nueva Propiedad</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-8rem)]">
          {/* ZonaProp URL - Destacado */}
          <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <label className="block text-sm font-medium text-blue-900 mb-2">
              🔗 Link de ZonaProp (opcional)
            </label>
            <input
              type="url"
              value={formData.zonaprop_url || ''}
              onChange={(e) => updateField('zonaprop_url', e.target.value)}
              placeholder="https://www.zonaprop.com.ar/propiedades/..."
              className="w-full bg-white border border-blue-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-blue-600 mt-1">Pegá el link de ZonaProp para poder enviarlo a leads</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Dirección */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección *</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder="Av. Santa Fe 3200, Piso 8"
                className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]"
              />
            </div>

            {/* Barrio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Barrio</label>
              <input
                type="text"
                value={formData.neighborhood || ''}
                onChange={(e) => updateField('neighborhood', e.target.value)}
                placeholder="Palermo"
                className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]"
              />
            </div>

            {/* Ciudad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
              <input
                type="text"
                value={formData.city || ''}
                onChange={(e) => updateField('city', e.target.value)}
                placeholder="CABA"
                className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]"
              />
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
              <select
                value={formData.type}
                onChange={(e) => updateField('type', e.target.value)}
                className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]"
              >
                <option value="departamento">Departamento</option>
                <option value="casa">Casa</option>
                <option value="ph">PH</option>
                <option value="local">Local</option>
                <option value="oficina">Oficina</option>
                <option value="cochera">Cochera</option>
                <option value="terreno">Terreno</option>
              </select>
            </div>

            {/* Operación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Operación *</label>
              <select
                value={formData.operation}
                onChange={(e) => updateField('operation', e.target.value)}
                className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]"
              >
                <option value="venta">Venta</option>
                <option value="alquiler">Alquiler</option>
                <option value="alquiler_temporal">Alquiler Temporal</option>
              </select>
            </div>

            {/* Precio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
              <div className="flex gap-2">
                <select
                  value={formData.currency || 'USD'}
                  onChange={(e) => updateField('currency', e.target.value)}
                  className="w-20 border border-gray-200 rounded-lg py-2 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]"
                >
                  <option value="USD">USD</option>
                  <option value="ARS">ARS</option>
                </select>
                <input
                  type="number"
                  value={formData.price || ''}
                  onChange={(e) => updateField('price', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="185000"
                  className="flex-1 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]"
                />
              </div>
            </div>

            {/* Expensas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expensas</label>
              <input
                type="number"
                value={formData.expenses || ''}
                onChange={(e) => updateField('expenses', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="45000"
                className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]"
              />
            </div>

            {/* Ambientes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ambientes</label>
              <input
                type="number"
                value={formData.rooms || ''}
                onChange={(e) => updateField('rooms', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="3"
                className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]"
              />
            </div>

            {/* Baños */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Baños</label>
              <input
                type="number"
                value={formData.bathrooms || ''}
                onChange={(e) => updateField('bathrooms', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="2"
                className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]"
              />
            </div>

            {/* Superficie Total */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">m² Totales</label>
              <input
                type="number"
                value={formData.sqm_total || ''}
                onChange={(e) => updateField('sqm_total', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="75"
                className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]"
              />
            </div>

            {/* Superficie Cubierta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">m² Cubiertos</label>
              <input
                type="number"
                value={formData.sqm_covered || ''}
                onChange={(e) => updateField('sqm_covered', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="70"
                className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]"
              />
            </div>

            {/* Antigüedad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Antigüedad (años)</label>
              <input
                type="number"
                value={formData.antiquity || ''}
                onChange={(e) => updateField('antiquity', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="15"
                className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]"
              />
            </div>

            {/* Descripción */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Hermoso departamento luminoso..."
                rows={3}
                className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !formData.address}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-[#D4A745] text-white rounded-lg text-sm font-medium hover:bg-[#c49a3d] disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Crear Propiedad
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
