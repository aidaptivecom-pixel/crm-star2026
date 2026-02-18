import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  ChevronLeft, ChevronRight,
  CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronUp,
  Zap, ClipboardList
} from 'lucide-react'

interface FormalInspectionViewProps {
  appraisal: any
  onProcessFormal: (config?: any) => void
  onClose: () => void
  onRefetch: () => void
  onGoToTasacion?: () => void
}

type ItemStatus = 'ok' | 'warn' | 'miss'

interface CheckItem {
  label: string
  field: string
  value: any
  status: ItemStatus
  note?: string
}

// ─── Helper: get extraction data from voice notes ───
function getExtraction(appraisal: any) {
  const voiceNotes = appraisal?.property_data?.voice_notes || []
  // Merge all extractions, later ones override
  let merged: any = {}
  for (const vn of voiceNotes) {
    if (vn.extraction) {
      merged = { ...merged, ...vn.extraction, form_fields: { ...(merged.form_fields || {}), ...(vn.extraction.form_fields || {}) } }
    }
  }
  return merged
}

function getFieldValue(appraisal: any, extraction: any, field: string): any {
  // Priority: extraction.form_fields > appraisal.property_data > appraisal root
  const ff = extraction.form_fields || {}
  if (ff[field] != null && ff[field] !== '') return ff[field]
  if (appraisal.property_data?.[field] != null && appraisal.property_data[field] !== '') return appraisal.property_data[field]
  if (appraisal[field] != null && appraisal[field] !== '') return appraisal[field]
  return null
}

function itemStatus(value: any): ItemStatus {
  if (value == null || value === '' || value === undefined) return 'miss'
  return 'ok'
}

function capitalize(s: string): string {
  if (!s) return s
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function formatValue(value: any): string {
  if (value === true) return 'Sí'
  if (value === false) return 'No'
  if (typeof value === 'number') return String(value)
  const str = String(value).replace(/_/g, ' ')
  return capitalize(str)
}

// ─── Section definitions ───
const SECTION_NAMES = ['Datos Generales', 'Ambientes', 'Instalaciones', 'Amenities', 'Estado General', 'Observaciones']
const SECTION_ICONS = ['🏠', '🚪', '⚙️', '🏊', '📋', '🏙️']

function buildGeneralItems(appraisal: any, extraction: any): CheckItem[] {
  const fields = [
    { label: 'Dirección completa', field: 'address' },
    { label: 'Superficie cubierta (m²)', field: 'covered_area_m2' },
    { label: 'Superficie semicubierta (m²)', field: 'semi_covered_area_m2' },
    { label: 'Superficie descubierta (m²)', field: 'uncovered_area_m2' },
    { label: 'Pisos del edificio', field: 'floors' },
    { label: 'Piso del depto', field: 'floor_number' },
    { label: 'Antigüedad (años)', field: 'building_age' },
    { label: 'Orientación', field: 'orientation' },
    { label: 'Cocheras', field: 'garage_count' },
    { label: 'Baños', field: 'bathrooms' },
    { label: 'Expensas', field: 'expensas' },
  ]
  return fields.map(f => {
    const val = getFieldValue(appraisal, extraction, f.field)
    return { label: f.label, field: f.field, value: val, status: itemStatus(val) }
  })
}

function buildInstallationItems(appraisal: any, extraction: any): CheckItem[] {
  const fields = [
    { label: 'Gas natural', field: 'has_gas' },
    { label: 'Calefacción', field: 'heating_type' },
    { label: 'Aire acondicionado', field: 'has_ac' },
    { label: 'Ascensor', field: 'has_elevator' },
    { label: 'Baulera', field: 'has_storage' },
  ]
  return fields.map(f => {
    const val = getFieldValue(appraisal, extraction, f.field)
    return { label: f.label, field: f.field, value: val, status: itemStatus(val) }
  })
}

function buildAmenityItems(appraisal: any, _extraction: any): CheckItem[] {
  const amenityList = ['pileta', 'gimnasio', 'sum', 'seguridad 24hs', 'laundry', 'parrilla', 'solarium', 'bicicletero']
  const current = (appraisal.amenities || []).map((a: string) => a.toLowerCase())
  // If amenities array exists and has items, all are "ok"; otherwise miss
  if (current.length > 0) {
    return amenityList.map(a => ({
      label: a.charAt(0).toUpperCase() + a.slice(1),
      field: `amenity_${a}`,
      value: current.includes(a) ? 'Sí' : 'No',
      status: 'ok' as ItemStatus
    }))
  }
  return amenityList.map(a => ({
    label: a.charAt(0).toUpperCase() + a.slice(1),
    field: `amenity_${a}`,
    value: null,
    status: 'miss' as ItemStatus
  }))
}

function buildConditionItems(appraisal: any, extraction: any): CheckItem[] {
  const fields = [
    { label: 'Condición general', field: 'condition_detected', fallback: 'condition' },
    { label: 'Humedad', field: 'humidity_detected' },
    { label: 'Ventilación', field: 'ventilation' },
    { label: 'Luminosidad', field: 'natural_light' },
    { label: 'Ruido exterior', field: 'noise_level' },
    { label: 'Vista', field: 'view' },
  ]
  return fields.map(f => {
    let val = extraction[f.field] ?? null
    if (val == null && f.fallback) val = appraisal[f.fallback] ?? null
    return { label: f.label, field: f.field, value: val, status: itemStatus(val) }
  })
}

function buildObservationItems(_appraisal: any, extraction: any): CheckItem[] {
  const fields = [
    { label: 'Barrio / Zona', field: 'neighborhood_notes' },
    { label: 'Distribución funcional', field: 'functional_distribution' },
    { label: 'Tipo de construcción', field: 'construction_type' },
    { label: 'Renovaciones', field: 'renovations' },
    { label: 'Resumen IA', field: 'summary' },
  ]
  return fields.map(f => {
    const val = extraction[f.field] ?? null
    return { label: f.label, field: f.field, value: val, status: itemStatus(val) }
  })
}

// ─── Component ───
export default function FormalInspectionView({ appraisal, onProcessFormal, onClose, onRefetch, onGoToTasacion }: FormalInspectionViewProps) {
  const [currentSection, setCurrentSection] = useState(0)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)
  const [showTranscript, setShowTranscript] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showProcessModal, setShowProcessModal] = useState(false)
  const [processConfig, setProcessConfig] = useState({
    mode: 'auto' as 'auto' | 'semi',
    maxComparables: 10,
    searchRadius: 1000, // meters
    areaRange: 30, // ±%
    ageRange: 10, // ±years
    sameTypeOnly: true,
    includeSold: false,
    manualComparables: [] as string[], // DEPRECATED
    selectedComparables: [] as any[], // Pre-selected from search
  })
  // const [newComparableUrl, setNewComparableUrl] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState('')
  const touchStartX = useRef(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const SCRAPER_URL = '/api'

  const handleSearchComparables = async () => {
    setSearchLoading(true)
    setSearchError('')
    setSearchResults([])
    try {
      const pd = appraisal?.property_data || {}
      const resp = await fetch(`${SCRAPER_URL}/search-comparables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          neighborhood: appraisal?.neighborhood || pd.neighborhood || pd.barrio || '',
          operation: pd.operation_type || 'venta',
          property_type: pd.property_type === 'casa' ? 'casas' : 'departamentos',
          pages: 2,
        }),
      })
      const data = await resp.json()
      if (data.success && data.comparables) {
        setSearchResults(data.comparables)
      } else {
        setSearchError(data.error || 'No se encontraron propiedades')
      }
    } catch (err: any) {
      setSearchError(err.message || 'Error de conexión')
    } finally {
      setSearchLoading(false)
    }
  }

  const toggleComparable = (comp: any) => {
    setProcessConfig(c => {
      const exists = c.selectedComparables.find((s: any) => s.source_id === comp.source_id)
      if (exists) {
        return { ...c, selectedComparables: c.selectedComparables.filter((s: any) => s.source_id !== comp.source_id) }
      } else {
        return { ...c, selectedComparables: [...c.selectedComparables, comp] }
      }
    })
  }

  const extraction = getExtraction(appraisal)
  const photos: string[] = appraisal?.property_data?.target_photos || []
  const voiceNotes: any[] = appraisal?.property_data?.voice_notes || []
  const rooms: any[] = extraction.rooms || []
  const transcription = voiceNotes.map((vn: any) => vn.transcription).filter(Boolean).join('\n\n')

  // Build all sections
  const sections = [
    buildGeneralItems(appraisal, extraction),
    [], // Ambientes handled separately
    buildInstallationItems(appraisal, extraction),
    buildAmenityItems(appraisal, extraction),
    buildConditionItems(appraisal, extraction),
    buildObservationItems(appraisal, extraction),
  ]

  // Completeness
  const allItems = [...sections[0], ...sections[2], ...sections[3], ...sections[4], ...sections[5]]
  const roomItems = rooms.length
  const totalItems = allItems.length + roomItems
  const okCount = allItems.filter(i => i.status === 'ok').length + rooms.filter((r: any) => r.condition).length
  const warnCount = allItems.filter(i => i.status === 'warn').length
  const missCount = totalItems - okCount - warnCount
  const pct = totalItems > 0 ? Math.round((okCount / totalItems) * 100) : 0

  // Navigation
  const goTo = useCallback((idx: number) => {
    if (idx >= 0 && idx < SECTION_NAMES.length) setCurrentSection(idx)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (editingField) return
      if (lightboxIdx !== null) {
        if (e.key === 'Escape') setLightboxIdx(null)
        if (e.key === 'ArrowLeft' && lightboxIdx > 0) setLightboxIdx(lightboxIdx - 1)
        if (e.key === 'ArrowRight' && lightboxIdx < photos.length - 1) setLightboxIdx(lightboxIdx + 1)
        return
      }
      if (e.key === 'ArrowLeft') goTo(currentSection - 1)
      if (e.key === 'ArrowRight') goTo(currentSection + 1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [currentSection, goTo, editingField, lightboxIdx])

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.changedTouches[0].screenX }
  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].screenX
    if (Math.abs(diff) > 50) goTo(currentSection + (diff > 0 ? 1 : -1))
  }

  // Edit & save
  const startEdit = (field: string, currentValue: any) => {
    setEditingField(field)
    setEditValue(currentValue != null ? String(currentValue) : '')
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const saveEdit = async () => {
    if (!editingField) return
    setSaving(true)
    try {
      const { supabase } = await import('../lib/supabase')
      if (!supabase) throw new Error('Supabase not configured')

      // Determine where to save
      const rootFields = ['address', 'condition', 'building_age']
      const propertyDataFields = ['covered_area_m2', 'semi_covered_area_m2', 'uncovered_area_m2', 'garage_count', 'bathrooms', 'floors', 'floor_number', 'has_gas', 'has_ac', 'has_storage', 'heating_type', 'orientation', 'expensas', 'has_elevator', 'has_private_terrace', 'has_private_garden']

      let parsedValue: any = editValue
      // Parse numbers
      if (['covered_area_m2', 'semi_covered_area_m2', 'uncovered_area_m2', 'garage_count', 'bathrooms', 'floors', 'floor_number', 'building_age', 'expensas'].includes(editingField)) {
        parsedValue = editValue ? parseFloat(editValue) : null
      }
      // Parse booleans
      if (['has_gas', 'has_ac', 'has_storage', 'has_elevator', 'has_private_terrace', 'has_private_garden'].includes(editingField)) {
        parsedValue = editValue.toLowerCase() === 'sí' || editValue.toLowerCase() === 'si' || editValue === 'true' || editValue === '1'
      }

      if (rootFields.includes(editingField)) {
        await (supabase as any).from('appraisals').update({ [editingField]: parsedValue }).eq('id', appraisal.id)
      } else if (propertyDataFields.includes(editingField)) {
        const newPD = { ...(appraisal.property_data || {}), [editingField]: parsedValue }
        await (supabase as any).from('appraisals').update({ property_data: newPD }).eq('id', appraisal.id)
      }
      // For extraction fields, save into property_data as well for persistence
      else {
        const newPD = { ...(appraisal.property_data || {}), [editingField]: parsedValue }
        await (supabase as any).from('appraisals').update({ property_data: newPD }).eq('id', appraisal.id)
      }

      setEditingField(null)
      onRefetch()
    } catch (err) {
      console.error('Error saving field:', err)
      alert('Error al guardar: ' + (err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const cancelEdit = () => { setEditingField(null) }

  // ─── Render helpers ───
  const StatusIcon = ({ status }: { status: ItemStatus }) => {
    if (status === 'ok') return <div className="w-7 h-7 rounded-lg bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0"><CheckCircle2 className="w-4 h-4" /></div>
    if (status === 'warn') return <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0"><AlertTriangle className="w-4 h-4" /></div>
    return <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0"><XCircle className="w-4 h-4" /></div>
  }

  const renderCheckItem = (item: CheckItem) => {
    const isEditing = editingField === item.field
    return (
      <div
        key={item.field}
        className={`flex items-start gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors ${isEditing ? 'bg-amber-50' : 'hover:bg-gray-50'}`}
        onClick={() => !isEditing && startEdit(item.field, item.value)}
      >
        <StatusIcon status={item.status} />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500">{item.label}</p>
          {isEditing ? (
            <div className="flex gap-2 mt-1">
              <input
                ref={inputRef}
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit() }}
                className="flex-1 px-3 py-1.5 border-2 border-[#D4A745] rounded-lg text-sm outline-none"
                placeholder={`Ingresá ${item.label.toLowerCase()}`}
              />
              <button onClick={(e) => { e.stopPropagation(); saveEdit() }} disabled={saving} className="px-3 py-1.5 bg-[#D4A745] text-gray-900 rounded-lg text-sm font-semibold">
                {saving ? '...' : '✓'}
              </button>
              <button onClick={(e) => { e.stopPropagation(); cancelEdit() }} className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg text-sm">✕</button>
            </div>
          ) : (
            <p className={`text-sm font-medium ${item.status === 'miss' ? 'text-red-500 italic font-normal' : item.status === 'warn' ? 'text-amber-600' : 'text-gray-900'}`}>
              {item.status === 'miss' ? 'No mencionado en el audio' : formatValue(item.value)}
            </p>
          )}
          {item.note && !isEditing && <p className="text-xs text-gray-400 italic mt-0.5">{item.note}</p>}
        </div>
      </div>
    )
  }

  const renderRooms = () => (
    <div>
      {rooms.length === 0 ? (
        <div className="px-4 py-8 text-center text-gray-400 text-sm">No se detectaron ambientes del audio</div>
      ) : rooms.map((room: any, idx: number) => (
        <div key={idx} className="px-4 py-3 border-b border-gray-100 last:border-b-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="font-semibold text-sm text-gray-900">{room.name}</span>
            </div>
            {room.condition && (
              <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                room.condition.toLowerCase().includes('bueno') || room.condition.toLowerCase().includes('muy')
                  ? 'bg-green-50 text-green-700'
                  : room.condition.toLowerCase().includes('regular')
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-gray-100 text-gray-600'
              }`}>
                {room.condition}
              </span>
            )}
          </div>
          {room.notes && <p className="text-xs text-gray-500 mt-1 ml-6">{room.notes}</p>}
        </div>
      ))}
    </div>
  )

  const renderSectionContent = (idx: number) => {
    if (idx === 1) return renderRooms()
    const items = sections[idx]
    return <div>{items.map(renderCheckItem)}</div>
  }

  return (
    <div className="flex flex-col h-full bg-[#F8F9FA] min-h-0">
      {/* Fixed header */}
      <div className="flex-shrink-0 p-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white h-[60px] flex flex-col justify-center overflow-hidden">
        <h3 className="text-sm font-bold text-gray-900">3. Borrador de tasación</h3>
      </div>
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-scroll bg-[#F8F9FA] pb-24" style={{ minHeight: 0 }}>
        <div className="p-4 flex gap-4 items-start">
        
        {/* Left sidebar removed — info already in Col 1 */}

        {/* Main content - cards */}
        <div className="flex-1 min-w-0 flex flex-col items-center"><div className="w-full max-w-2xl space-y-3 flex flex-col">
        {/* Photo strip */}
        {photos.length > 0 && (
          <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${Math.min(photos.length, 5)}, 1fr)` }}>
            {photos.slice(0, 5).map((url, idx) => (
              <div
                key={idx}
                onClick={() => setLightboxIdx(idx)}
                className="aspect-[3/2] rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-[#D4A745] transition-all"
              >
                <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {/* Progress bar */}
        <div className="bg-white rounded-xl shadow-sm p-3.5">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-gray-800">Completitud del relevamiento</h3>
            <span className="text-sm font-bold text-[#B8912E]">{pct}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#D4A745] to-[#B8912E] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> {okCount} ✅</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> {warnCount} ⚠️</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> {missCount} ❌</span>
          </div>
        </div>

        {/* Card navigator */}
        <div className="relative">
          {/* Label + dots */}
          <p className="text-center text-xs text-gray-500 font-medium mb-1.5">
            {currentSection + 1} de {SECTION_NAMES.length} · {SECTION_NAMES[currentSection]}
          </p>
          <div className="flex justify-center gap-1.5 mb-2.5">
            {SECTION_NAMES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all ${i === currentSection ? 'w-5 bg-[#D4A745]' : 'w-2 bg-gray-200'}`}
              />
            ))}
          </div>

          {/* Arrows */}
          <button
            onClick={() => goTo(currentSection - 1)}
            disabled={currentSection === 0}
            className="absolute left-[-54px] top-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-700 disabled:opacity-30 hover:bg-[#F5E6B8] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => goTo(currentSection + 1)}
            disabled={currentSection === SECTION_NAMES.length - 1}
            className="absolute right-[-54px] top-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-700 disabled:opacity-30 hover:bg-[#F5E6B8] transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Card viewport */}
          <div className="overflow-hidden rounded-xl" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <div
              className="flex transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${currentSection * 100}%)` }}
            >
              {SECTION_NAMES.map((name, idx) => (
                <div key={idx} className="min-w-full bg-white shadow-sm rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                    <span>{SECTION_ICONS[idx]}</span>
                    <span className="font-semibold text-sm text-gray-900">{name}</span>
                    <span className="text-xs bg-[#F5E6B8] text-[#B8912E] px-2 py-0.5 rounded-full font-semibold ml-auto">
                      {idx === 1 ? `${rooms.length} detectados` : `${sections[idx].length} ítems`}
                    </span>
                  </div>
                  {renderSectionContent(idx)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Transcription */}
        {transcription && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="w-full px-4 py-3 flex items-center gap-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
            >
              {showTranscript ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              📝 Transcripción del audio
            </button>
            {showTranscript && (
              <div className="px-4 pb-4">
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 leading-relaxed max-h-[350px] overflow-y-auto whitespace-pre-wrap">
                  {transcription}
                </div>
              </div>
            )}
          </div>
        )}
        </div>
        </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div className="fixed inset-0 bg-black/85 z-[100] flex items-center justify-center" onClick={() => setLightboxIdx(null)}>
          <button className="absolute top-4 right-4 text-white text-3xl z-[101]" onClick={() => setLightboxIdx(null)}>×</button>
          <div className="flex items-center gap-5" onClick={e => e.stopPropagation()}>
            {/* Prev */}
            <button
              className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white text-2xl backdrop-blur-sm transition-colors disabled:opacity-30 flex-shrink-0"
              disabled={lightboxIdx === 0}
              onClick={() => setLightboxIdx(Math.max(0, lightboxIdx - 1))}
            >‹</button>
            <div className="max-w-[80vw] max-h-[80vh]">
              <img src={photos[lightboxIdx]} alt="" className="max-w-full max-h-[80vh] rounded-xl object-contain" />
            </div>
            {/* Next */}
            <button
              className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white text-2xl backdrop-blur-sm transition-colors disabled:opacity-30 flex-shrink-0"
              disabled={lightboxIdx === photos.length - 1}
              onClick={() => setLightboxIdx(Math.min(photos.length - 1, lightboxIdx + 1))}
            >›</button>
          </div>
          <p className="absolute bottom-8 text-white text-sm">{lightboxIdx + 1}/{photos.length}</p>
        </div>
      )}

      {/* Sticky actions */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-gray-200 bg-white flex gap-3 h-[56px] items-center">
        <button
          onClick={() => setShowProcessModal(true)}
          className="flex-1 py-2 bg-[#D4A745] text-white rounded-xl text-sm font-semibold hover:bg-[#c49a3d] transition-colors flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4" /> Procesar tasación
        </button>
        <button
          onClick={onGoToTasacion || onClose}
          className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
        >
          <ClipboardList className="w-4 h-4" /> Continuar a tasación
        </button>
      </div>

      {/* Process config modal */}
      {showProcessModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={() => setShowProcessModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Modal header */}
            <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-[#D4A745]/10 to-white">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#D4A745]" /> Procesar tasación
              </h3>
              {/* Mode tabs */}
              <div className="flex gap-2 mt-3">
                <button onClick={() => setProcessConfig(c => ({ ...c, mode: 'auto' }))}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${processConfig.mode === 'auto' ? 'bg-[#D4A745] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  🤖 Automática
                </button>
                <button onClick={() => setProcessConfig(c => ({ ...c, mode: 'semi' }))}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${processConfig.mode === 'semi' ? 'bg-[#D4A745] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  👤 Semi-automática
                </button>
              </div>
            </div>

            {/* Modal body */}
            <div className="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto">

              {/* AUTO MODE: filters */}
              {processConfig.mode === 'auto' && (
                <>
                  <p className="text-xs text-gray-500">El sistema busca comparables automáticamente según estos filtros.</p>
                  
                  {/* Cantidad de comparables */}
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-2 block">🏘️ Cantidad de comparables</label>
                    <div className="flex gap-2">
                      {[5, 10, 15, 20].map(n => (
                        <button key={n} onClick={() => setProcessConfig(c => ({ ...c, maxComparables: n }))}
                          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${processConfig.maxComparables === n ? 'bg-[#D4A745] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Radio de búsqueda */}
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-2 block">📍 Radio de búsqueda</label>
                    <div className="flex gap-2">
                      {[
                        { label: '500m', value: 500 },
                        { label: '1km', value: 1000 },
                        { label: '2km', value: 2000 },
                        { label: 'Toda la zona', value: 0 },
                      ].map(opt => (
                        <button key={opt.value} onClick={() => setProcessConfig(c => ({ ...c, searchRadius: opt.value }))}
                          className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${processConfig.searchRadius === opt.value ? 'bg-[#D4A745] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rango de superficie */}
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-2 block">📏 Rango de superficie</label>
                    <div className="flex gap-2">
                      {[
                        { label: '±10%', value: 10 },
                        { label: '±20%', value: 20 },
                        { label: '±30%', value: 30 },
                        { label: 'Cualquiera', value: 0 },
                      ].map(opt => (
                        <button key={opt.value} onClick={() => setProcessConfig(c => ({ ...c, areaRange: opt.value }))}
                          className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${processConfig.areaRange === opt.value ? 'bg-[#D4A745] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Antigüedad similar */}
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-2 block">🏗️ Antigüedad similar</label>
                    <div className="flex gap-2">
                      {[
                        { label: '±5 años', value: 5 },
                        { label: '±10 años', value: 10 },
                        { label: '±20 años', value: 20 },
                        { label: 'Cualquiera', value: 0 },
                      ].map(opt => (
                        <button key={opt.value} onClick={() => setProcessConfig(c => ({ ...c, ageRange: opt.value }))}
                          className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${processConfig.ageRange === opt.value ? 'bg-[#D4A745] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="space-y-3 pt-1">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <span className="text-sm font-medium text-gray-700">🏠 Solo mismo tipo de propiedad</span>
                        <p className="text-xs text-gray-400">Filtrar por depto, casa, PH, etc.</p>
                      </div>
                      <button onClick={() => setProcessConfig(c => ({ ...c, sameTypeOnly: !c.sameTypeOnly }))}
                        className={`w-11 h-6 rounded-full transition-colors relative ${processConfig.sameTypeOnly ? 'bg-[#D4A745]' : 'bg-gray-300'}`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${processConfig.sameTypeOnly ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                      </button>
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <span className="text-sm font-medium text-gray-700">📊 Incluir vendidos</span>
                        <p className="text-xs text-gray-400">Agregar propiedades vendidas como referencia</p>
                      </div>
                      <button onClick={() => setProcessConfig(c => ({ ...c, includeSold: !c.includeSold }))}
                        className={`w-11 h-6 rounded-full transition-colors relative ${processConfig.includeSold ? 'bg-[#D4A745]' : 'bg-gray-300'}`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${processConfig.includeSold ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                      </button>
                    </label>
                  </div>
                </>
              )}

              {/* SEMI-AUTO MODE: search & select comparables */}
              {processConfig.mode === 'semi' && (
                <>
                  <p className="text-xs text-gray-500">Buscá propiedades del barrio y elegí cuáles usar como comparables.</p>
                  
                  {/* Search button */}
                  {searchResults.length === 0 && !searchLoading && (
                    <button onClick={handleSearchComparables}
                      className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
                      🔍 Buscar propiedades en la zona
                    </button>
                  )}

                  {/* Loading */}
                  {searchLoading && (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-3 border-[#D4A745] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-sm text-gray-500">Buscando propiedades...</p>
                      <p className="text-xs text-gray-400 mt-1">Esto puede tardar 15-30 segundos</p>
                    </div>
                  )}

                  {/* Error */}
                  {searchError && (
                    <div className="text-center py-4 bg-red-50 rounded-xl">
                      <p className="text-sm text-red-500">{searchError}</p>
                      <button onClick={handleSearchComparables} className="text-xs text-red-400 underline mt-2">Reintentar</button>
                    </div>
                  )}

                  {/* Results grid */}
                  {searchResults.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">{searchResults.length} propiedades encontradas</p>
                        <button onClick={handleSearchComparables} className="text-xs text-blue-500 hover:underline">🔄 Buscar de nuevo</button>
                      </div>
                      <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                        {searchResults.map((comp: any, idx: number) => {
                          const isSelected = processConfig.selectedComparables.some((s: any) => s.source_id === comp.source_id)
                          return (
                            <div key={comp.source_id || idx} 
                              onClick={() => toggleComparable(comp)}
                              className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all border-2 ${isSelected ? 'border-[#D4A745] bg-amber-50' : 'border-transparent bg-gray-50 hover:bg-gray-100'}`}>
                              {/* Checkbox */}
                              <div className={`w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center ${isSelected ? 'bg-[#D4A745]' : 'border-2 border-gray-300'}`}>
                                {isSelected && <span className="text-white text-xs font-bold">✓</span>}
                              </div>
                              {/* Photo */}
                              {comp.photos?.[0] ? (
                                <img src={comp.photos[0]} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                              ) : (
                                <div className="w-14 h-14 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                                  <span className="text-gray-400 text-lg">🏠</span>
                                </div>
                              )}
                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-800 truncate">{comp.address || 'Sin dirección'}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs font-bold text-green-600">USD {comp.price_usd?.toLocaleString()}</span>
                                  <span className="text-xs text-gray-400">|</span>
                                  <span className="text-xs text-gray-600">{comp.total_area_m2}m²</span>
                                  {comp.rooms && <><span className="text-xs text-gray-400">|</span><span className="text-xs text-gray-600">{comp.rooms} amb</span></>}
                                </div>
                                <p className="text-[10px] text-gray-400 mt-0.5">USD {comp.price_per_m2?.toLocaleString()}/m²</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Selection count */}
                  {processConfig.selectedComparables.length > 0 && (
                    <p className="text-xs text-green-600 font-medium">✅ {processConfig.selectedComparables.length} propiedad{processConfig.selectedComparables.length > 1 ? 'es' : ''} seleccionada{processConfig.selectedComparables.length > 1 ? 's' : ''}</p>
                  )}
                </>
              )}
            </div>

            {/* Modal footer */}
            <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowProcessModal(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
                Cancelar
              </button>
              <button onClick={() => { setShowProcessModal(false); onProcessFormal(processConfig) }}
                className="flex-1 py-2.5 bg-[#D4A745] text-white rounded-xl text-sm font-semibold hover:bg-[#c49a3d] transition-colors flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" /> Procesar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
