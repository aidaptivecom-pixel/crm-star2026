import { useState } from 'react'
import { Home, MapPin, Bed, Bath, Square, Eye, Search, Plus, LayoutGrid, List, X, ExternalLink, Send, Loader2 } from 'lucide-react'
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

      {/* Detail Modal */}
      {selectedProperty && (
        <PropertyDetailModal 
          property={selectedProperty} 
          onClose={() => setSelectedProperty(null)}
          onSendLink={handleSendZonaPropLink}
          onOpenZonaProp={openZonaProp}
        />
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

// Property Detail Modal Component
function PropertyDetailModal({ 
  property, 
  onClose, 
  onSendLink, 
  onOpenZonaProp 
}: { 
  property: Property
  onClose: () => void
  onSendLink: (property: Property, e: React.MouseEvent) => void
  onOpenZonaProp: (url: string | null, e: React.MouseEvent) => void
}) {
  const [showFullDescription, setShowFullDescription] = useState(false)
  
  const formatPrice = (precio: number | null, moneda: string | null) => {
    if (!precio) return 'Consultar'
    if (moneda === 'USD') return `USD ${precio.toLocaleString()}`
    return `$ ${precio.toLocaleString()}`
  }

  const getMainPhoto = (p: Property) => {
    if (p.photos && p.photos.length > 0) return p.photos[0]
    return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop'
  }

  const truncateDescription = (text: string | null, maxLength: number = 150) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength).trim() + '...'
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header with Image */}
        <div className="relative h-44 sm:h-52">
          <img src={getMainPhoto(property)} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute top-3 left-3">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_CONFIG[property.status as PropertyStatus]?.bg || 'bg-gray-100'} ${STATUS_CONFIG[property.status as PropertyStatus]?.color || 'text-gray-700'}`}>
              {STATUS_CONFIG[property.status as PropertyStatus]?.label || property.status}
            </span>
          </div>
          {/* Price overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-2xl font-bold text-white">{formatPrice(property.price, property.currency)}</p>
            <div className="flex items-center gap-3 text-white/90 text-sm mt-1">
              {property.expenses && <span>Exp: ${property.expenses.toLocaleString()}</span>}
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {property.neighborhood}, {property.city}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto max-h-[calc(95vh-11rem)] sm:max-h-[calc(90vh-13rem)]">
          {/* Address */}
          <h2 className="text-lg font-bold text-gray-900 mb-4">{property.address}</h2>

          {/* Quick Stats - Compact */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {property.rooms && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-sm">
                <Bed className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{property.rooms}</span> amb
              </span>
            )}
            {property.sqm_total && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-sm">
                <Square className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{property.sqm_total}</span> m²
              </span>
            )}
            {property.bathrooms && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-sm">
                <Bath className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{property.bathrooms}</span> baños
              </span>
            )}
            {property.antiquity !== null && property.antiquity !== undefined && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-sm">
                <span className="font-medium">{property.antiquity}</span> años
              </span>
            )}
            {property.garage && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-sm">
                🚗 Cochera
              </span>
            )}
          </div>

          {/* Features - Inline */}
          {property.features && property.features.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {property.features.map((f) => (
                <span key={f} className="text-xs bg-[#D4A745]/10 text-[#D4A745] px-2 py-1 rounded-full font-medium">{f}</span>
              ))}
            </div>
          )}

          {/* Description - Truncated */}
          {property.description && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                {showFullDescription ? property.description : truncateDescription(property.description)}
              </p>
              {property.description.length > 150 && (
                <button 
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-sm text-[#D4A745] font-medium mt-1 hover:underline"
                >
                  {showFullDescription ? 'Ver menos' : 'Ver más'}
                </button>
              )}
            </div>
          )}

          {/* Photo Gallery - Compact */}
          {property.photos && property.photos.length > 1 && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {property.photos.slice(0, 5).map((photo, idx) => (
                <img 
                  key={idx} 
                  src={photo} 
                  alt={`Foto ${idx + 1}`} 
                  className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 flex-shrink-0"
                  onClick={() => window.open(photo, '_blank')}
                />
              ))}
              {property.photos.length > 5 && (
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-gray-500 font-medium">+{property.photos.length - 5}</span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons - Fixed at bottom */}
          {property.zonaprop_url && (
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={(e) => onSendLink(property, e)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#D4A745] text-white rounded-lg text-sm font-medium hover:bg-[#c49a3d] transition-colors"
              >
                <Send className="w-4 h-4" />
                Copiar Link
              </button>
              <button
                onClick={(e) => onOpenZonaProp(property.zonaprop_url, e)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Ver en ZonaProp
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
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
