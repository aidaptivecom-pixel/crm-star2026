import { useState, useRef, useMemo, useCallback } from 'react'
import {
  Building2, MapPin, Bed, Square, Eye, Share2, X, ChevronLeft, ChevronRight,
  LayoutGrid, Table2, Loader2, AlertCircle, Database, Plus, Pencil, Trash2,
  Upload, FileText, Sparkles, Check, AlertTriangle, XCircle, ImagePlus
} from 'lucide-react'
import { useProjects, ProjectInput } from '../hooks/useProjects'
import { ProjectImageManager } from '../components/ProjectImageManager'
import type { Project as DBProject } from '../types/database'
import { processBrochure } from '../lib/brochureExtractor'

// ─── Types ────────────────────────────────────────────────────────────────────

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
  allImages: string[]
  description: string
  amenities: string[]
  tipologias: Tipologia[]
  entrega: string
  avance: number
  featured: boolean
  precioM2?: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FALLBACK_DATA: Property[] = []

const STATUS_LABELS: Record<PropertyStatus, { label: string; color: string; bgColor: string }> = {
  en_pozo: { label: 'En pozo', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  en_construccion: { label: 'En construcción', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  entrega_inmediata: { label: 'Entrega inmediata', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
}

const ESTADO_OPTIONS = [
  { value: 'preventa', label: 'Preventa' },
  { value: 'en_construccion', label: 'En construcción' },
  { value: 'entrega_inmediata', label: 'Entrega inmediata' },
  { value: 'disponible', label: 'Disponible' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function transformDBProject(dbProject: DBProject): Property {
  const tipologias: Tipologia[] = Array.isArray(dbProject.tipologias) && (dbProject.tipologias as any[]).length > 0
    ? (dbProject.tipologias as any[]).map((t, i) => ({
        id: String(i + 1),
        name: t.nombre || t.name || `Tipo ${i + 1}`,
        ambientes: t.ambientes || 0,
        superficie: t.superficie || t.m2 || '-',
        precio: t.precio || (t.precio_desde ? `USD ${Number(t.precio_desde).toLocaleString()}` : 'Consultar'),
        disponibles: t.disponibles || t.unidades || 0,
      }))
    : [{
        id: '1',
        name: dbProject.tipologias_texto || 'Consultar',
        ambientes: 0,
        superficie: '-',
        precio: `USD ${dbProject.price_min?.toLocaleString() || '-'}`,
        disponibles: dbProject.units_available || 0,
      }]

  const amenities: string[] = Array.isArray(dbProject.amenities)
    ? (dbProject.amenities as string[])
    : []

  const isUruguay = dbProject.location?.toLowerCase().includes('uruguay') ||
    dbProject.slug === 'puerto-quetzal'

  let status: PropertyStatus = 'en_construccion'
  if (dbProject.estado === 'entrega_inmediata' || dbProject.estado === 'disponible') {
    status = 'entrega_inmediata'
  } else if (dbProject.estado === 'preventa') {
    status = 'en_pozo'
  }

  let avance = 50
  if (dbProject.estado === 'entrega_inmediata' || dbProject.estado === 'disponible') avance = 100
  else if (dbProject.estado === 'preventa') avance = 15

  return {
    id: dbProject.id,
    name: dbProject.name,
    location: dbProject.direccion || dbProject.location || '',
    neighborhood: dbProject.location?.split(',')[0] || '',
    country: isUruguay ? 'Uruguay' : 'Argentina',
    status,
    type: 'departamento',
    image: Array.isArray(dbProject.images) && (dbProject.images as string[]).length > 0
      ? (dbProject.images as string[])[0]
      : 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop',
    allImages: Array.isArray(dbProject.images) && (dbProject.images as string[]).length > 0
      ? (dbProject.images as string[])
      : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop'],
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

// ─── Main Component ───────────────────────────────────────────────────────────

export const Emprendimientos = () => {
  const {
    projects: dbProjects, loading, error, isConfigured,
    createProject, updateProject, deleteProject, refetch
  } = useProjects()

  const properties = useMemo(() => {
    if (!isConfigured || dbProjects.length === 0) return FALLBACK_DATA
    return dbProjects.map(transformDBProject)
  }, [dbProjects, isConfigured])

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('cards')
  const [activeIndex, setActiveIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

  // CRUD state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingProject, setEditingProject] = useState<DBProject | null>(null)
  const [deletingProject, setDeletingProject] = useState<DBProject | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const scrollToIndex = (index: number) => {
    if (index < 0) index = properties.length - 1
    if (index >= properties.length) index = 0
    setActiveIndex(index)
    if (carouselRef.current) {
      const scrollAmount = index * 200
      carouselRef.current.scrollTo({ left: scrollAmount - 100, behavior: 'smooth' })
    }
  }

  const totalUnidades = properties.reduce(
    (acc, p) => acc + p.tipologias.reduce((a, t) => a + t.disponibles, 0), 0
  )

  const findDBProject = useCallback((id: string) => {
    return dbProjects.find(p => p.id === id) || null
  }, [dbProjects])

  const handleEdit = (propertyId: string) => {
    const dbP = findDBProject(propertyId)
    if (dbP) {
      setSelectedProperty(null)
      setEditingProject(dbP)
    }
  }

  const handleDelete = (propertyId: string) => {
    const dbP = findDBProject(propertyId)
    if (dbP) {
      setSelectedProperty(null)
      setDeletingProject(dbP)
    }
  }

  const confirmDelete = async () => {
    if (!deletingProject) return
    setDeleteLoading(true)
    const success = await deleteProject(deletingProject.id)
    setDeleteLoading(false)
    if (success) {
      setDeletingProject(null)
      refetch()
    }
  }

  const handleCreateOrUpdate = async (data: ProjectInput, id?: string) => {
    if (id) {
      const result = await updateProject(id, data)
      if (result) {
        setEditingProject(null)
        refetch()
      }
      return !!result
    } else {
      const result = await createProject(data)
      if (result) {
        setShowCreateModal(false)
        refetch()
      }
      return !!result
    }
  }

  // ─── Loading ──────────────────────────────────────────────────────────────

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

  // ─── Error ────────────────────────────────────────────────────────────────

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

  // ─── Render ───────────────────────────────────────────────────────────────

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

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
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

            {/* Create Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-[#D4A745] text-white rounded-lg text-sm font-medium hover:bg-[#c49a3d] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Carousel Navigation */}
      {properties.length > 0 && (
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
      )}

      {/* Empty State */}
      {properties.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <Building2 className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay emprendimientos</h3>
          <p className="text-gray-500 text-center mb-4">Agregá tu primer emprendimiento</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#D4A745] text-white rounded-lg text-sm font-medium hover:bg-[#c49a3d]"
          >
            <Plus className="w-4 h-4" />
            Nuevo Emprendimiento
          </button>
        </div>
      )}

      {/* Content */}
      {properties.length > 0 && (
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          {viewMode === 'cards' ? (
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
                    {/* Quick action buttons on card hover */}
                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(property.id) }}
                        className="p-1.5 bg-white/90 hover:bg-white rounded-full text-gray-600 hover:text-[#D4A745]"
                        title="Editar"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(property.id) }}
                        className="p-1.5 bg-white/90 hover:bg-white rounded-full text-gray-600 hover:text-red-500"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
                              onClick={(e) => { e.stopPropagation(); setSelectedProperty(property) }}
                              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#D4A745]"
                              title="Ver detalle"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleEdit(property.id) }}
                              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#D4A745]"
                              title="Editar"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(property.id) }}
                              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-500"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="lg:hidden px-4 py-2 text-center border-t border-gray-100">
                <p className="text-xs text-gray-400">← Desliza para ver más →</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Detail Modal ──────────────────────────────────────────────────── */}
      {selectedProperty && (
        <DetailModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onEdit={() => handleEdit(selectedProperty.id)}
          onDelete={() => handleDelete(selectedProperty.id)}
        />
      )}

      {/* ─── Create/Edit Modal ─────────────────────────────────────────────── */}
      {(showCreateModal || editingProject) && (
        <ProjectFormModal
          project={editingProject}
          onClose={() => { setShowCreateModal(false); setEditingProject(null) }}
          onSave={handleCreateOrUpdate}
        />
      )}

      {/* ─── Delete Confirmation ───────────────────────────────────────────── */}
      {deletingProject && (
        <DeleteConfirmDialog
          projectName={deletingProject.name}
          loading={deleteLoading}
          onConfirm={confirmDelete}
          onCancel={() => setDeletingProject(null)}
        />
      )}
    </main>
  )
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetailModal({
  property,
  onClose,
  onEdit,
  onDelete,
}: {
  property: Property
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const [currentImage, setCurrentImage] = useState(0)
  const images = property.allImages
  const hasMultiple = images.length > 1

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Modal Header Image Carousel */}
        <div className="relative h-40 sm:h-64">
          <img src={images[currentImage]} alt={property.name} className="w-full h-full object-cover transition-opacity duration-300" />
          {hasMultiple && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setCurrentImage(prev => prev === 0 ? images.length - 1 : prev - 1) }}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/40 hover:bg-black/60 rounded-full text-white z-10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setCurrentImage(prev => prev === images.length - 1 ? 0 : prev + 1) }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/40 hover:bg-black/60 rounded-full text-white z-10"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-12 sm:bottom-14 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); setCurrentImage(idx) }}
                    className={`w-2 h-2 rounded-full transition-colors ${idx === currentImage ? 'bg-white' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            </>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
          <button onClick={onClose} className="absolute top-3 sm:top-4 right-3 sm:right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white">
            <X className="w-5 h-5" />
          </button>
          <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex gap-2">
            <span className={`text-xs font-medium px-2 py-1 rounded ${STATUS_LABELS[property.status].bgColor} ${STATUS_LABELS[property.status].color}`}>
              {STATUS_LABELS[property.status].label}
            </span>
          </div>
          <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">{property.name}</h2>
            <div className="flex items-center gap-1 text-white/90 text-sm">
              <MapPin className="w-4 h-4" />
              {property.location}
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-192px)] sm:max-h-[calc(90vh-256px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2">
              <p className="text-sm sm:text-base text-gray-600 mb-4">{property.description}</p>

              {property.amenities.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Amenities</h3>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {property.amenities.map((amenity) => (
                      <span key={amenity} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{amenity}</span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Tipologías disponibles</h3>
                <div className="space-y-2">
                  {property.tipologias.map((tipo) => (
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
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">{tipo.disponibles} disponibles</span>
                        <span className="font-bold text-[#D4A745]">{tipo.precio}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Entrega</span>
                    <span className="text-sm font-medium text-gray-900">{property.entrega}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">País</span>
                    <span className="text-sm font-medium text-gray-900">{property.country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Barrio</span>
                    <span className="text-sm font-medium text-gray-900">{property.neighborhood}</span>
                  </div>
                  {property.precioM2 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Precio m²</span>
                      <span className="text-sm font-medium text-gray-900">{property.precioM2}</span>
                    </div>
                  )}
                  {property.avance > 0 && property.avance < 100 && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">Avance de obra</span>
                        <span className="font-medium text-gray-900">{property.avance}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#D4A745] rounded-full" style={{ width: `${property.avance}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={onEdit}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#D4A745] text-white rounded-lg font-medium hover:bg-[#c49a3d] text-sm sm:text-base"
                >
                  <Pencil className="w-4 h-4" />
                  Editar emprendimiento
                </button>
                <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 text-sm sm:text-base">
                  <Share2 className="w-4 h-4" />
                  Compartir
                </button>
                <button
                  onClick={onDelete}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 text-sm sm:text-base"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Project Form Modal (Create / Edit) ───────────────────────────────────────

interface ProjectFormData {
  name: string
  slug: string
  location: string
  direccion: string
  description: string
  estado: string
  entrega: string
  tipologias_texto: string
  tipologias_array: any[]
  images: string[]
  units_available: string
  total_units: string
  price_min: string
  price_max: string
  price_currency: string
  financiacion: string
  amenities: string[]
  features: string[]
  brochure_url: string
  contact_phone: string
  website: string
}

function emptyFormData(): ProjectFormData {
  return {
    name: '', slug: '', location: '', direccion: '', description: '',
    estado: 'en_construccion', entrega: '', tipologias_texto: '', tipologias_array: [], images: [],
    units_available: '', total_units: '', price_min: '', price_max: '',
    price_currency: 'USD', financiacion: '', amenities: [], features: [],
    brochure_url: '', contact_phone: '', website: '',
  }
}

function dbProjectToFormData(p: DBProject): ProjectFormData {
  return {
    name: p.name || '',
    slug: p.slug || '',
    location: p.location || '',
    direccion: p.direccion || '',
    description: p.description || '',
    estado: p.estado || 'en_construccion',
    entrega: p.entrega || '',
    tipologias_texto: p.tipologias_texto || '',
    tipologias_array: Array.isArray(p.tipologias) ? p.tipologias as any[] : [],
    images: Array.isArray(p.images) ? p.images as string[] : [],
    units_available: p.units_available != null ? String(p.units_available) : '',
    total_units: p.total_units != null ? String(p.total_units) : '',
    price_min: p.price_min != null ? String(p.price_min) : '',
    price_max: p.price_max != null ? String(p.price_max) : '',
    price_currency: p.price_currency || 'USD',
    financiacion: p.financiacion || '',
    amenities: Array.isArray(p.amenities) ? (p.amenities as string[]) : [],
    features: Array.isArray(p.features) ? (p.features as string[]) : [],
    brochure_url: p.brochure_url || '',
    contact_phone: p.contact_phone || '',
    website: p.website || '',
  }
}

function formDataToInput(f: ProjectFormData): ProjectInput {
  return {
    name: f.name,
    slug: f.slug || generateSlug(f.name),
    location: f.location || null,
    direccion: f.direccion || null,
    description: f.description || null,
    estado: (f.estado as any) || null,
    entrega: f.entrega || null,
    tipologias_texto: f.tipologias_texto || null,
    tipologias: f.tipologias_array.length > 0 ? f.tipologias_array : null,
    units_available: f.units_available ? Number(f.units_available) : null,
    total_units: f.total_units ? Number(f.total_units) : null,
    price_min: f.price_min ? Number(f.price_min) : null,
    price_max: f.price_max ? Number(f.price_max) : null,
    price_currency: f.price_currency || 'USD',
    financiacion: f.financiacion || null,
    amenities: f.amenities.length > 0 ? f.amenities : null,
    features: f.features.length > 0 ? f.features : null,
    images: f.images.length > 0 ? f.images : null,
    brochure_url: f.brochure_url || null,
    contact_phone: f.contact_phone || null,
    website: f.website || null,
  }
}

function ProjectFormModal({
  project,
  onClose,
  onSave,
}: {
  project: DBProject | null
  onClose: () => void
  onSave: (data: ProjectInput, id?: string) => Promise<boolean>
}) {
  const isEditing = !!project
  const [activeTab, setActiveTab] = useState<'form' | 'brochure'>(isEditing ? 'form' : 'form')
  const [formData, setFormData] = useState<ProjectFormData>(
    project ? dbProjectToFormData(project) : emptyFormData()
  )
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Brochure upload state
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [brochureProgress, setBrochureProgress] = useState<string | null>(null)
  const [brochureError, setBrochureError] = useState<string | null>(null)
  const [brochureExtracted, setBrochureExtracted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Amenity/Feature tag input
  const [newAmenity, setNewAmenity] = useState('')
  const [newFeature, setNewFeature] = useState('')

  const updateField = (field: keyof ProjectFormData, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value }
      // Auto-generate slug from name (only when creating)
      if (field === 'name' && !isEditing) {
        updated.slug = generateSlug(value)
      }
      return updated
    })
  }

  const addAmenity = () => {
    const val = newAmenity.trim()
    if (val && !formData.amenities.includes(val)) {
      updateField('amenities', [...formData.amenities, val])
      setNewAmenity('')
    }
  }

  const removeAmenity = (a: string) => {
    updateField('amenities', formData.amenities.filter(x => x !== a))
  }

  const addFeature = () => {
    const val = newFeature.trim()
    if (val && !formData.features.includes(val)) {
      updateField('features', [...formData.features, val])
      setNewFeature('')
    }
  }

  const removeFeature = (f: string) => {
    updateField('features', formData.features.filter(x => x !== f))
  }

  // ─── Brochure Upload ───────────────────────────────────────────────────

  const handleBrochureUpload = async () => {
    if (!pdfFile) return
    setBrochureError(null)
    setBrochureProgress('Iniciando...')

    try {
      const { data, brochureUrl, imageUrls } = await processBrochure(pdfFile, (step) => {
        setBrochureProgress(step)
      })

      // Pre-fill form with extracted data
      setFormData(prev => ({
        ...prev,
        name: data.name || prev.name,
        slug: data.name ? generateSlug(data.name) : prev.slug,
        location: data.location || prev.location,
        direccion: data.direccion || prev.direccion,
        description: data.description || prev.description,
        estado: data.estado || prev.estado,
        entrega: data.entrega || prev.entrega,
        tipologias_texto: data.tipologias_texto || prev.tipologias_texto,
        units_available: data.units_available != null ? String(data.units_available) : prev.units_available,
        total_units: data.total_units != null ? String(data.total_units) : prev.total_units,
        price_min: data.price_min != null ? String(data.price_min) : prev.price_min,
        price_max: data.price_max != null ? String(data.price_max) : prev.price_max,
        price_currency: data.price_currency || prev.price_currency,
        financiacion: data.financiacion || prev.financiacion,
        amenities: data.amenities || prev.amenities,
        features: data.features || prev.features,
        tipologias_array: data.tipologias || prev.tipologias_array,
        images: imageUrls.length > 0 ? imageUrls : prev.images,
        contact_phone: data.contact_phone || prev.contact_phone,
        website: data.website || prev.website,
        brochure_url: brochureUrl,
      }))

      setBrochureExtracted(true)
      setBrochureProgress(null)
      // Switch to form tab to review
      setActiveTab('form')
    } catch (err) {
      console.error('Brochure processing error:', err)
      setBrochureError(err instanceof Error ? err.message : 'Error procesando brochure')
      setBrochureProgress(null)
    }
  }

  // ─── Submit ─────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setSaving(true)
    setSaveError(null)

    const input = formDataToInput(formData)
    
    // If creating, try with slug, and if duplicate, add suffix
    if (!isEditing) {
      const success = await onSave(input, undefined)
      if (!success) {
        // Retry with timestamp suffix (likely duplicate slug)
        const slugSuffix = `-${Date.now().toString(36).slice(-4)}`
        input.slug = (input.slug || '') + slugSuffix
        const retrySuccess = await onSave(input, undefined)
        if (!retrySuccess) {
          setSaveError('Error al guardar. Es posible que este emprendimiento ya exista.')
        }
      }
    } else {
      const success = await onSave(input, project?.id)
      if (!success) {
        setSaveError('Error al guardar. Revisá los datos e intentá de nuevo.')
      }
    }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 sm:p-4" onClick={onClose}>
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-3xl max-h-[95vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isEditing ? 'Editar Emprendimiento' : 'Nuevo Emprendimiento'}
            </h2>
            {brochureExtracted && (
              <p className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5">
                <Sparkles className="w-3 h-3" />
                Datos extraídos del brochure — revisá y confirmá
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs (only for create) */}
        {!isEditing && (
          <div className="flex border-b flex-shrink-0">
            <button
              onClick={() => setActiveTab('form')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'form'
                  ? 'border-[#D4A745] text-[#D4A745]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Pencil className="w-4 h-4" />
              Formulario Manual
            </button>
            <button
              onClick={() => setActiveTab('brochure')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'brochure'
                  ? 'border-[#D4A745] text-[#D4A745]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Upload className="w-4 h-4" />
              Subir Brochure PDF
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'brochure' && !isEditing ? (
            /* ─── Brochure Upload Tab ─────────────────────────────────── */
            <div className="p-4 sm:p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-[#D4A745]/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-8 h-8 text-[#D4A745]" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Subí el brochure del emprendimiento</h3>
                <p className="text-sm text-gray-500">
                  La IA va a extraer automáticamente los datos del PDF para que solo tengas que revisar y confirmar.
                </p>
              </div>

              {/* File Input */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  pdfFile ? 'border-[#D4A745] bg-[#D4A745]/5' : 'border-gray-300 hover:border-[#D4A745] hover:bg-gray-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setPdfFile(file)
                      setBrochureError(null)
                      setBrochureExtracted(false)
                    }
                  }}
                />
                {pdfFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="w-10 h-10 text-[#D4A745]" />
                    <p className="font-medium text-gray-900">{pdfFile.name}</p>
                    <p className="text-xs text-gray-500">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    <p className="text-xs text-[#D4A745]">Click para cambiar archivo</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-10 h-10 text-gray-400" />
                    <p className="font-medium text-gray-700">Hacé click o arrastrá un PDF</p>
                    <p className="text-xs text-gray-500">PDF hasta 20MB</p>
                  </div>
                )}
              </div>

              {/* Progress */}
              {brochureProgress && (
                <div className="mt-4 p-4 bg-blue-50 rounded-xl flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">{brochureProgress}</p>
                    <p className="text-xs text-blue-600">Esto puede tardar unos segundos...</p>
                  </div>
                </div>
              )}

              {/* Error */}
              {brochureError && (
                <div className="mt-4 p-4 bg-red-50 rounded-xl flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Error al procesar brochure</p>
                    <p className="text-xs text-red-600 mt-1">{brochureError}</p>
                  </div>
                </div>
              )}

              {/* Process Button */}
              <button
                onClick={handleBrochureUpload}
                disabled={!pdfFile || !!brochureProgress}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-[#D4A745] text-white rounded-xl font-medium hover:bg-[#c49a3d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {brochureProgress ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
                {brochureProgress ? 'Procesando...' : 'Extraer datos con IA'}
              </button>
            </div>
          ) : (
            /* ─── Manual Form Tab ─────────────────────────────────────── */
            <form onSubmit={handleSubmit} className="p-4 sm:p-6">
              {/* Brochure URL info (if extracted) */}
              {formData.brochure_url && (
                <div className="mb-4 p-3 bg-emerald-50 rounded-lg flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="text-emerald-700 truncate">Brochure: {formData.brochure_url}</span>
                </div>
              )}

              {/* Section: Datos Básicos */}
              <fieldset className="mb-6">
                <legend className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#D4A745]" />
                  Datos Básicos
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      placeholder="Ej: Torres del Parque"
                      className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745] focus:border-[#D4A745]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => updateField('slug', e.target.value)}
                      placeholder="torres-del-parque"
                      className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745] bg-gray-50"
                    />
                    <p className="text-xs text-gray-400 mt-1">Se genera automáticamente del nombre</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación (zona)</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => updateField('location', e.target.value)}
                      placeholder="Belgrano, CABA"
                      className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                    <input
                      type="text"
                      value={formData.direccion}
                      onChange={(e) => updateField('direccion', e.target.value)}
                      placeholder="Av. del Libertador 3200"
                      className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => updateField('description', e.target.value)}
                      placeholder="Descripción del emprendimiento..."
                      rows={3}
                      className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]"
                    />
                  </div>
                </div>
              </fieldset>

              {/* Section: Estado y Entrega */}
              <fieldset className="mb-6">
                <legend className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#D4A745]" />
                  Estado y Entrega
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <select
                      value={formData.estado}
                      onChange={(e) => updateField('estado', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]"
                    >
                      {ESTADO_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Entrega</label>
                    <input
                      type="text"
                      value={formData.entrega}
                      onChange={(e) => updateField('entrega', e.target.value)}
                      placeholder="Ej: Diciembre 2026"
                      className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipologías</label>
                    <input
                      type="text"
                      value={formData.tipologias_texto}
                      onChange={(e) => updateField('tipologias_texto', e.target.value)}
                      placeholder="Ej: 1, 2 y 3 ambientes desde 40m² a 120m²"
                      className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]"
                    />
                  </div>
                </div>
              </fieldset>

              {/* Section: Unidades y Precios */}
              <fieldset className="mb-6">
                <legend className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Square className="w-4 h-4 text-[#D4A745]" />
                  Unidades y Precios
                </legend>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Disponibles</label>
                    <input
                      type="number"
                      value={formData.units_available}
                      onChange={(e) => updateField('units_available', e.target.value)}
                      placeholder="0"
                      className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                    <input
                      type="number"
                      value={formData.total_units}
                      onChange={(e) => updateField('total_units', e.target.value)}
                      placeholder="0"
                      className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio mín</label>
                    <input
                      type="number"
                      value={formData.price_min}
                      onChange={(e) => updateField('price_min', e.target.value)}
                      placeholder="100000"
                      className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio máx</label>
                    <input
                      type="number"
                      value={formData.price_max}
                      onChange={(e) => updateField('price_max', e.target.value)}
                      placeholder="300000"
                      className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
                  <select
                    value={formData.price_currency}
                    onChange={(e) => updateField('price_currency', e.target.value)}
                    className="w-32 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]"
                  >
                    <option value="USD">USD</option>
                    <option value="ARS">ARS</option>
                  </select>
                </div>
              </fieldset>

              {/* Section: Financiación */}
              <fieldset className="mb-6">
                <legend className="text-sm font-semibold text-gray-900 mb-3">Financiación</legend>
                <textarea
                  value={formData.financiacion}
                  onChange={(e) => updateField('financiacion', e.target.value)}
                  placeholder="Ej: 30% anticipo + 70% en 36 cuotas en pesos..."
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]"
                />
              </fieldset>

              {/* Section: Amenities (Tags) */}
              <fieldset className="mb-6">
                <legend className="text-sm font-semibold text-gray-900 mb-3">Amenities</legend>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.amenities.map((a) => (
                    <span key={a} className="inline-flex items-center gap-1 bg-[#D4A745]/10 text-[#D4A745] text-xs font-medium px-2.5 py-1 rounded-full">
                      {a}
                      <button type="button" onClick={() => removeAmenity(a)} className="hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAmenity() } }}
                    placeholder="Ej: Piscina, SUM, Gym..."
                    className="flex-1 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]"
                  />
                  <button
                    type="button"
                    onClick={addAmenity}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </fieldset>

              {/* Section: Features (Tags) */}
              <fieldset className="mb-6">
                <legend className="text-sm font-semibold text-gray-900 mb-3">Características</legend>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.features.map((f) => (
                    <span key={f} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                      {f}
                      <button type="button" onClick={() => removeFeature(f)} className="hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFeature() } }}
                    placeholder="Ej: Doble vidrio, Piso radiante..."
                    className="flex-1 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]"
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </fieldset>

              {/* Section: Fotos */}
              <fieldset className="mb-6">
                <legend className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <ImagePlus className="w-4 h-4 text-[#D4A745]" />
                  Fotos del emprendimiento
                </legend>
                <ProjectImageManager
                  projectId={project?.id || ''}
                  projectSlug={formData.slug || generateSlug(formData.name) || 'nuevo'}
                  images={formData.images}
                  onImagesChange={(imgs) => updateField('images', imgs)}
                />
                {formData.images.length > 0 && (
                  <p className="text-xs text-gray-400 mt-2">
                    La primera foto es la principal. Arrastrá para reordenar.
                  </p>
                )}
              </fieldset>

              {/* Section: Brochure */}
              <fieldset className="mb-6">
                <legend className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#D4A745]" />
                  Brochure PDF
                </legend>
                {formData.brochure_url ? (
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                    <FileText className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-emerald-700 truncate">{formData.brochure_url.split('/').pop()}</p>
                      <a href={formData.brochure_url} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 hover:underline">
                        Ver PDF ↗
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        updateField('brochure_url', '')
                        setPdfFile(null)
                      }}
                      className="p-1.5 hover:bg-emerald-100 rounded text-emerald-600"
                      title="Quitar brochure"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                        pdfFile ? 'border-[#D4A745] bg-[#D4A745]/5' : 'border-gray-300 hover:border-[#D4A745] hover:bg-gray-50'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setPdfFile(file)
                            setBrochureError(null)
                          }
                        }}
                      />
                      {pdfFile ? (
                        <div className="flex flex-col items-center gap-1">
                          <FileText className="w-8 h-8 text-[#D4A745]" />
                          <p className="font-medium text-sm text-gray-900">{pdfFile.name}</p>
                          <p className="text-xs text-gray-500">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <Upload className="w-8 h-8 text-gray-400" />
                          <p className="text-sm font-medium text-gray-700">Click para subir brochure PDF</p>
                        </div>
                      )}
                    </div>
                    {pdfFile && !formData.brochure_url && (
                      <button
                        type="button"
                        onClick={async () => {
                          setBrochureError(null)
                          setBrochureProgress('Subiendo PDF...')
                          try {
                            const { supabase } = await import('../lib/supabase')
                            if (!supabase) throw new Error('Supabase not configured')
                            
                            const slug = formData.slug || generateSlug(formData.name)
                            const fileName = `${slug}.pdf`
                            
                            // Direct fetch to bypass SDK not sending auth token
                            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
                            const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
                            const { data: { session } } = await supabase.auth.getSession()
                            const token = session?.access_token || supabaseAnonKey
                            
                            const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/brochures/${fileName}`, {
                              method: 'POST',
                              headers: {
                                'apikey': supabaseAnonKey,
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/pdf',
                                'x-upsert': 'true',
                              },
                              body: pdfFile,
                            })
                            if (!uploadRes.ok) {
                              const errBody = await uploadRes.json().catch(() => ({}))
                              throw new Error(errBody.message || errBody.error || uploadRes.statusText)
                            }
                            
                            const publicUrl = `${supabaseUrl}/storage/v1/object/public/brochures/${fileName}`
                            updateField('brochure_url', publicUrl)
                            setBrochureProgress(null)
                          } catch (err) {
                            setBrochureError(err instanceof Error ? err.message : 'Error subiendo PDF')
                            setBrochureProgress(null)
                          }
                        }}
                        disabled={!!brochureProgress}
                        className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 bg-[#D4A745] text-white rounded-lg text-sm font-medium hover:bg-[#c49a3d] disabled:opacity-50"
                      >
                        {brochureProgress ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> {brochureProgress}</>
                        ) : (
                          <><Upload className="w-4 h-4" /> Subir PDF</>
                        )}
                      </button>
                    )}
                    {brochureError && (
                      <p className="text-xs text-red-600 mt-2">{brochureError}</p>
                    )}
                  </div>
                )}
              </fieldset>

              {/* Section: Contacto */}
              <fieldset className="mb-6">
                <legend className="text-sm font-semibold text-gray-900 mb-3">Contacto</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input
                      type="text"
                      value={formData.contact_phone}
                      onChange={(e) => updateField('contact_phone', e.target.value)}
                      placeholder="+54 11 1234-5678"
                      className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sitio web</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => updateField('website', e.target.value)}
                      placeholder="https://..."
                      className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]"
                    />
                  </div>
                </div>
              </fieldset>

              {/* Error */}
              {saveError && (
                <div className="mb-4 p-3 bg-red-50 rounded-lg flex items-center gap-2 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {saveError}
                </div>
              )}

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || !formData.name.trim()}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-[#D4A745] text-white rounded-lg text-sm font-medium hover:bg-[#c49a3d] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {isEditing ? 'Guardar cambios' : 'Crear emprendimiento'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Delete Confirmation Dialog ───────────────────────────────────────────────

function DeleteConfirmDialog({
  projectName,
  loading,
  onConfirm,
  onCancel,
}: {
  projectName: string
  loading: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={onCancel}>
      <div className="bg-white rounded-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-7 h-7 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Eliminar emprendimiento</h3>
          <p className="text-sm text-gray-600 mb-6">
            ¿Estás seguro de que querés eliminar <span className="font-semibold">"{projectName}"</span>?
            Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-3 w-full">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 py-2.5 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
