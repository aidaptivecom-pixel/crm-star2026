import { useState } from 'react'
import { Building2, Search, Filter, MapPin, Bed, Square, Eye, Heart, Share2, X } from 'lucide-react'

type PropertyStatus = 'en_pozo' | 'en_construccion' | 'entrega_inmediata'
type PropertyType = 'departamento' | 'local' | 'cochera' | 'lote'

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
  type: PropertyType
  image: string
  description: string
  amenities: string[]
  tipologias: Tipologia[]
  entrega: string
  avance: number
  featured: boolean
  precioM2?: string
}

// Datos actualizados desde brochures oficiales de STAR Real Estate
const PROPERTIES: Property[] = [
  {
    id: '1',
    name: 'Roccatagliata',
    location: 'Roccatagliata, Belgrano',
    neighborhood: 'Belgrano',
    country: 'Argentina',
    status: 'en_construccion',
    type: 'departamento',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop',
    description: 'Emplazado sobre un terreno de 3.500 m², conjugando la elegancia de la historia Argentina con la sofisticación de un proyecto moderno. Ubicación privilegiada frente a un palacio histórico con vistas panorámicas únicas. Full amenities, 180 cocheras en 3 subsuelos.',
    amenities: ['Piscina', 'SUM', 'Terraza', 'Gimnasio', 'Jardines', '180 Cocheras', 'Locales Comerciales PB'],
    tipologias: [
      { id: '1', name: '2 ambientes', ambientes: 2, superficie: '54-67 m² totales', precio: 'USD 209.657', disponibles: 8 },
      { id: '2', name: '3 ambientes', ambientes: 3, superficie: '94 m² totales', precio: 'USD 311.500', disponibles: 12 },
      { id: '3', name: '4 ambientes', ambientes: 4, superficie: '120-153 m² totales', precio: 'USD 374.331', disponibles: 10 },
      { id: '4', name: '4 amb c/Dep', ambientes: 4, superficie: '146-149 m² totales', precio: 'USD 411.839', disponibles: 5 },
    ],
    entrega: '2026',
    avance: 65,
    featured: true,
    precioM2: 'USD 2.805 - 4.290/m²',
  },
  {
    id: '2',
    name: 'Voie Cañitas',
    location: 'Ortega y Gasset 1920 / Baez 454, Cañitas',
    neighborhood: 'Cañitas',
    country: 'Argentina',
    status: 'en_construccion',
    type: 'departamento',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop',
    description: 'Conjunto edilicio de dos frentes sobre las calles Ortega y Gasset y Baez, formado por planta baja, 10 pisos y 3 subsuelos. Exclusivas unidades de viviendas familiares, local comercial, hall de acceso, amenities, cocheras y bauleras.',
    amenities: ['Piscina', 'Jacuzzi', 'Spa', 'Gym', 'Parrilla', 'S.U.M', 'Laundry'],
    tipologias: [
      { id: '1', name: '2 amb c/escritorio', ambientes: 2, superficie: '91-98 m² totales', precio: 'USD 180.000', disponibles: 6 },
      { id: '2', name: '3 ambientes', ambientes: 3, superficie: '102 m² totales', precio: 'USD 220.000', disponibles: 6 },
      { id: '3', name: '4 amb c/Dep', ambientes: 4, superficie: '146 m² totales', precio: 'USD 320.000', disponibles: 6 },
      { id: '4', name: '5 amb c/Dep', ambientes: 5, superficie: '220-251 m² totales', precio: 'USD 450.000', disponibles: 4 },
    ],
    entrega: '2026',
    avance: 45,
    featured: true,
  },
  {
    id: '3',
    name: 'Huergo 475',
    location: 'Paseo del Bajo | Dique 2, Puerto Madero',
    neighborhood: 'Puerto Madero',
    country: 'Argentina',
    status: 'en_construccion',
    type: 'departamento',
    image: 'https://images.unsplash.com/photo-1567684014761-b65e2e59b9eb?w=800&auto=format&fit=crop',
    description: 'Viví 365. Disfrutá 475. Frente al Paseo del Bajo y con vistas únicas de Buenos Aires. A diez cuadras de la Reserva Ecológica. A 750 metros del Puente de la Mujer. Con el Río de la Plata siempre a la vista.',
    amenities: ['Piscina', 'Gym', 'SUM', 'Rooftop', 'Seguridad 24hs'],
    tipologias: [
      { id: '1', name: '2 ambientes', ambientes: 2, superficie: '~80 m² totales', precio: 'USD 285.000', disponibles: 40 },
      { id: '2', name: '3 ambientes', ambientes: 3, superficie: '~110 m² totales', precio: 'USD 450.000', disponibles: 35 },
      { id: '3', name: 'Premium', ambientes: 4, superficie: '~150 m²', precio: 'USD 650.000', disponibles: 10 },
    ],
    entrega: '2027',
    avance: 30,
    featured: false,
  },
  {
    id: '4',
    name: 'Human Abasto Towers',
    location: 'Calle Lavalle / Guardia Vieja, Balvanera',
    neighborhood: 'Balvanera',
    country: 'Argentina',
    status: 'entrega_inmediata',
    type: 'departamento',
    image: 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&auto=format&fit=crop',
    description: 'Un conjunto de residencias con amenities y áreas deportivas pensado para un público heterogéneo, diverso y consciente. Vistas abiertas a la ciudad, balcones aterrazados y luz natural. OFERTA ESPECIAL: 4 unidades Torre Agüero USD 685.000 (antes USD 828.198).',
    amenities: ['Spa', 'Gym', 'Kids Club', 'Cowork Room', 'Laundry', 'Microcine', 'SUM Gourmet', 'Parrillas', 'Solarium', 'Piscina climatizada', 'Canchas deportivas'],
    tipologias: [
      { id: '1', name: '3 ambientes (70m²)', ambientes: 3, superficie: '70 m² totales', precio: 'USD 171.250', disponibles: 2 },
      { id: '2', name: '3 ambientes (77m²)', ambientes: 3, superficie: '77 m² totales', precio: 'USD 207.050', disponibles: 2 },
    ],
    entrega: 'Inmediata',
    avance: 100,
    featured: true,
  },
  {
    id: '5',
    name: 'Joy Patagonia',
    location: 'El Calafate, Santa Cruz',
    neighborhood: 'El Calafate',
    country: 'Argentina',
    status: 'en_construccion',
    type: 'departamento',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop',
    description: 'Tan solo 27 residencias exclusivas de 2 y 3 dormitorios que redefinen el concepto de vivir premium en El Calafate. Vista al Lago Argentino, terreno de 27.440 m². Inspirado en el concepto de "lujo esencial" con madera Lenga y piso radiante.',
    amenities: ['Piscina climatizada', 'Spa', 'Hidromasaje', 'Sauna seco', 'Sauna húmedo', 'SUM con parrilla', 'Gimnasio', 'Restaurante', 'Cava de vinos', 'Terraza Sky Lounge'],
    tipologias: [
      { id: '1', name: 'Residencia Lago (2 dorm)', ambientes: 2, superficie: '123.5 m² totales', precio: 'USD 250.000', disponibles: 12 },
      { id: '2', name: 'Residencia Glaciar (3 dorm)', ambientes: 3, superficie: '168 m² totales', precio: 'USD 380.000', disponibles: 6 },
    ],
    entrega: '2027',
    avance: 25,
    featured: true,
  },
  {
    id: '6',
    name: "B'Twins Norte",
    location: 'Pinamar, Costa Atlántica',
    neighborhood: 'Pinamar',
    country: 'Argentina',
    status: 'en_construccion',
    type: 'departamento',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop',
    description: 'Complejo de departamentos en Pinamar, ideal para inversión y disfrute de temporada en la Costa Atlántica.',
    amenities: ['Piscina', 'Solarium', 'Parrillas', 'Gimnasio'],
    tipologias: [
      { id: '1', name: '1 dormitorio', ambientes: 1, superficie: '~45 m² totales', precio: 'USD 85.000', disponibles: 12 },
      { id: '2', name: '2 dormitorios', ambientes: 2, superficie: '~60 m² totales', precio: 'USD 120.000', disponibles: 10 },
    ],
    entrega: '2026',
    avance: 40,
    featured: false,
  },
  {
    id: '7',
    name: 'Puerto Quetzal',
    location: 'Camino del Cerro Eguzquiza, La Barra',
    neighborhood: 'La Barra',
    country: 'Uruguay',
    status: 'en_pozo',
    type: 'lote',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop',
    description: 'Club de chacras a 5 min de La Barra, 25 min de Jose Ignacio, 2 min del Aeropuerto Fasano, 20 min de Punta del Este. Lotes de 4.000 m² para construir en armonía con la naturaleza. Financiación: 50% en 18 cuotas sin intereses.',
    amenities: ['Club House', 'Seguridad 24hs', 'Entorno natural', 'Barrio privado'],
    tipologias: [
      { id: '1', name: 'Lote estándar', ambientes: 0, superficie: '4.000 m²', precio: 'USD 150.000', disponibles: 10 },
      { id: '2', name: 'Lote premium', ambientes: 0, superficie: '4.000 m²', precio: 'USD 280.000', disponibles: 12 },
      { id: '3', name: 'Lote esquina', ambientes: 0, superficie: '4.000 m²+', precio: 'USD 350.000', disponibles: 4 },
    ],
    entrega: 'Disponible',
    avance: 100,
    featured: true,
  },
]

const STATUS_LABELS: Record<PropertyStatus, { label: string; color: string }> = {
  en_pozo: { label: 'En pozo', color: 'bg-blue-100 text-blue-700' },
  en_construccion: { label: 'En construcción', color: 'bg-amber-100 text-amber-700' },
  entrega_inmediata: { label: 'Entrega inmediata', color: 'bg-emerald-100 text-emerald-700' },
}

export const Propiedades = () => {
  const [properties] = useState<Property[]>(PROPERTIES)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | 'all'>('all')
  const [countryFilter, setCountryFilter] = useState<'all' | 'Argentina' | 'Uruguay'>('all')
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  const filteredProperties = properties.filter(prop => {
    const matchesSearch = prop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.neighborhood.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || prop.status === statusFilter
    const matchesCountry = countryFilter === 'all' || prop.country === countryFilter
    return matchesSearch && matchesStatus && matchesCountry
  })

  const featuredProperties = filteredProperties.filter(p => p.featured)
  const otherProperties = filteredProperties.filter(p => !p.featured)

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-[#F8F9FA]">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-[#D4A745]" />
            <h1 className="text-xl font-bold text-gray-900">Propiedades</h1>
            <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
              {filteredProperties.length} emprendimientos
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar proyecto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50 focus:border-[#D4A745]"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PropertyStatus | 'all')}
              className="bg-white border border-gray-200 rounded-lg py-2 px-3 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50"
            >
              <option value="all">Todos los estados</option>
              <option value="en_pozo">En pozo</option>
              <option value="en_construccion">En construcción</option>
              <option value="entrega_inmediata">Entrega inmediata</option>
            </select>

            {/* Country Filter */}
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value as 'all' | 'Argentina' | 'Uruguay')}
              className="bg-white border border-gray-200 rounded-lg py-2 px-3 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50"
            >
              <option value="all">Todos los países</option>
              <option value="Argentina">Argentina</option>
              <option value="Uruguay">Uruguay</option>
            </select>

            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              Más filtros
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Featured Projects */}
        {featuredProperties.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Proyectos destacados</h2>
            <div className="grid grid-cols-2 gap-6">
              {featuredProperties.slice(0, 2).map((property) => (
                <div
                  key={property.id}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => setSelectedProperty(property)}
                >
                  <div className="relative h-56">
                    <img
                      src={property.image}
                      alt={property.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${STATUS_LABELS[property.status].color}`}>
                        {STATUS_LABELS[property.status].label}
                      </span>
                      {property.featured && (
                        <span className="text-xs font-medium px-2 py-1 rounded bg-[#D4A745] text-white">
                          Destacado
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-xl font-bold text-white mb-1">{property.name}</h3>
                      <div className="flex items-center gap-1 text-white/90 text-sm">
                        <MapPin className="w-4 h-4" />
                        {property.location}
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{property.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Desde</p>
                        <p className="text-lg font-bold text-[#D4A745]">{property.tipologias[0].precio}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Entrega</p>
                        <p className="text-sm font-medium text-gray-900">{property.entrega}</p>
                      </div>
                    </div>
                    {property.avance > 0 && property.avance < 100 && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Avance de obra</span>
                          <span>{property.avance}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#D4A745] rounded-full"
                            style={{ width: `${property.avance}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Projects Grid */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Todos los proyectos</h2>
          <div className="grid grid-cols-3 gap-4">
            {(featuredProperties.length > 0 ? otherProperties : filteredProperties).map((property) => (
              <div
                key={property.id}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => setSelectedProperty(property)}
              >
                <div className="relative h-40">
                  <img
                    src={property.image}
                    alt={property.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${STATUS_LABELS[property.status].color}`}>
                      {STATUS_LABELS[property.status].label}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button className="p-1.5 bg-white/90 rounded-full hover:bg-white">
                      <Heart className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-gray-900 mb-1">{property.name}</h3>
                  <div className="flex items-center gap-1 text-gray-500 text-xs mb-2">
                    <MapPin className="w-3 h-3" />
                    {property.neighborhood}, {property.country}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-[#D4A745]">{property.tipologias[0].precio}</p>
                    <span className="text-xs text-gray-500">{property.tipologias.length} tipologías</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Property Detail Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedProperty(null)}>
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Modal Header Image */}
            <div className="relative h-64">
              <img
                src={selectedProperty.image}
                alt={selectedProperty.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <button
                onClick={() => setSelectedProperty(null)}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute top-4 left-4 flex gap-2">
                <span className={`text-xs font-medium px-2 py-1 rounded ${STATUS_LABELS[selectedProperty.status].color}`}>
                  {STATUS_LABELS[selectedProperty.status].label}
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-2xl font-bold text-white mb-1">{selectedProperty.name}</h2>
                <div className="flex items-center gap-1 text-white/90">
                  <MapPin className="w-4 h-4" />
                  {selectedProperty.location}
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-256px)]">
              <div className="grid grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="col-span-2">
                  <p className="text-gray-600 mb-4">{selectedProperty.description}</p>

                  {/* Amenities */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProperty.amenities.map((amenity) => (
                        <span key={amenity} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tipologias */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Tipologías disponibles</h3>
                    <div className="space-y-2">
                      {selectedProperty.tipologias.map((tipo) => (
                        <div key={tipo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-4">
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
                          <div className="flex items-center gap-4">
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
                    <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#D4A745] text-white rounded-lg font-medium hover:bg-[#c49a3d]">
                      <Eye className="w-4 h-4" />
                      Solicitar información
                    </button>
                    <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50">
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
