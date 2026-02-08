import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  X, ChevronLeft, ChevronRight, Camera, Mic, Calendar, User,
  CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronUp,
  Zap, ClipboardList
} from 'lucide-react'

interface FormalInspectionViewProps {
  appraisal: any
  onProcessFormal: () => void
  onClose: () => void
  onRefetch: () => void
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

function formatValue(value: any): string {
  if (value === true) return 'Sí'
  if (value === false) return 'No'
  if (typeof value === 'number') return String(value)
  return String(value)
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
export default function FormalInspectionView({ appraisal, onProcessFormal, onClose, onRefetch }: FormalInspectionViewProps) {
  const [currentSection, setCurrentSection] = useState(0)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)
  const [showTranscript, setShowTranscript] = useState(false)
  const [saving, setSaving] = useState(false)
  const touchStartX = useRef(0)
  const inputRef = useRef<HTMLInputElement>(null)

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
      if (e.key === 'ArrowLeft') goTo(currentSection - 1)
      if (e.key === 'ArrowRight') goTo(currentSection + 1)
      if (e.key === 'Escape' && lightboxIdx !== null) setLightboxIdx(null)
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

  // Audio duration
  const audioDuration = voiceNotes.length > 0 ? voiceNotes.map((vn: any) => vn.duration || '').filter(Boolean).join(', ') || `${voiceNotes.length} nota(s)` : 'Sin audio'

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <h1 className="text-lg font-bold truncate">
              {appraisal.ref_id || `STR-${appraisal.id?.slice(0, 5)}`} · {appraisal.address || 'Sin dirección'}
            </h1>
            <p className="text-gray-400 text-xs mt-0.5 truncate">
              {appraisal.property_type ? appraisal.property_type.charAt(0).toUpperCase() + appraisal.property_type.slice(1) : 'Propiedad'} · {appraisal.neighborhood || ''}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="bg-[#D4A745] text-gray-900 text-xs font-semibold px-3 py-1 rounded-full">
              ⚡ {appraisal.status === 'completed' ? 'Completada' : appraisal.status === 'pending' ? 'Pendiente' : 'En revisión'}
            </span>
            <button onClick={onClose} className="text-gray-400 hover:text-white p-1"><X className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg text-xs text-gray-300">
            <Calendar className="w-3 h-3" /> {appraisal.created_at ? new Date(appraisal.created_at).toLocaleDateString('es-AR') : '-'}
          </span>
          <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg text-xs text-gray-300">
            <User className="w-3 h-3" /> {appraisal.agent_name || 'Tasador'}
          </span>
          <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg text-xs text-gray-300">
            <Mic className="w-3 h-3" /> {audioDuration}
          </span>
          <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg text-xs text-gray-300">
            <Camera className="w-3 h-3" /> {photos.length} fotos
          </span>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto overscroll-contain bg-[#F8F9FA] pb-24">
        <div className="p-4 flex gap-4">
        
        {/* Left sidebar - context info */}
        <div className="hidden lg:block w-72 flex-shrink-0 space-y-3 sticky top-4 self-start">
          {/* Client info */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">👤 Cliente</h3>
            <div className="space-y-2 text-sm">
              <div><span className="text-gray-400 text-xs">Nombre</span><p className="font-medium text-gray-900">{appraisal.client_name || appraisal.property_data?.client_name || 'Sin asignar'}</p></div>
              <div><span className="text-gray-400 text-xs">Teléfono</span><p className="font-medium text-gray-900">{appraisal.client_phone || appraisal.property_data?.client_phone || '-'}</p></div>
              <div><span className="text-gray-400 text-xs">Email</span><p className="font-medium text-gray-900">{appraisal.client_email || appraisal.property_data?.client_email || '-'}</p></div>
            </div>
          </div>

          {/* Property summary */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">🏠 Propiedad</h3>
            <div className="space-y-2 text-sm">
              <div><span className="text-gray-400 text-xs">Dirección</span><p className="font-medium text-gray-900">{appraisal.address || '-'}</p></div>
              <div><span className="text-gray-400 text-xs">Barrio</span><p className="font-medium text-gray-900">{appraisal.neighborhood || '-'}</p></div>
              <div><span className="text-gray-400 text-xs">Tipo</span><p className="font-medium text-gray-900 capitalize">{appraisal.property_type || '-'}</p></div>
              <div><span className="text-gray-400 text-xs">Superficie total</span><p className="font-medium text-gray-900">{appraisal.size_m2 ? `${appraisal.size_m2} m²` : '-'}</p></div>
              <div><span className="text-gray-400 text-xs">Ambientes</span><p className="font-medium text-gray-900">{appraisal.rooms || '-'}</p></div>
              {appraisal.estimated_value_avg && (
                <div><span className="text-gray-400 text-xs">Valuación web</span><p className="font-bold text-[#D4A745]">USD {Math.round(appraisal.estimated_value_avg).toLocaleString()}</p></div>
              )}
            </div>
          </div>

          {/* Next steps */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">📋 Próximos pasos</h3>
            <div className="space-y-2">
              {[
                { done: voiceNotes.length > 0, label: 'Audio de visita' },
                { done: photos.length > 0, label: 'Fotos de la propiedad' },
                { done: pct >= 80, label: 'Relevamiento >80%' },
                { done: !!appraisal.ai_analysis, label: 'Tasación formal procesada' },
                { done: appraisal.status === 'approved_by_admin', label: 'Aprobada por admin' },
                { done: appraisal.status === 'approved_by_broker', label: 'Firma del martillero' },
                { done: appraisal.status === 'delivered', label: 'PDF enviado al cliente' },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  {step.done ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />}
                  <span className={step.done ? 'text-gray-500 line-through' : 'text-gray-700'}>{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main content - cards */}
        <div className="flex-1 min-w-0 flex flex-col items-center"><div className="w-full max-w-2xl space-y-3">
        {/* Photo strip */}
        {photos.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
            {photos.map((url, idx) => (
              <div
                key={idx}
                onClick={() => setLightboxIdx(idx)}
                className="flex-shrink-0 w-[120px] h-[80px] rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-[#D4A745] transition-all"
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
            className="absolute left-[-44px] top-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-700 disabled:opacity-30 hover:bg-[#F5E6B8] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => goTo(currentSection + 1)}
            disabled={currentSection === SECTION_NAMES.length - 1}
            className="absolute right-[-44px] top-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-700 disabled:opacity-30 hover:bg-[#F5E6B8] transition-colors"
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
          <div onClick={e => e.stopPropagation()} className="max-w-[90vw] max-h-[80vh]">
            <img src={photos[lightboxIdx]} alt="" className="max-w-full max-h-[80vh] rounded-xl object-contain" />
          </div>
          <p className="absolute bottom-8 text-white text-sm">{lightboxIdx + 1}/{photos.length}</p>
        </div>
      )}

      {/* Sticky actions */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <button
          onClick={onProcessFormal}
          className="flex-1 py-3 bg-gradient-to-r from-[#D4A745] to-[#B8912E] text-gray-900 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4" /> Procesar tasación
        </button>
        <button
          onClick={onClose}
          className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
        >
          <ClipboardList className="w-4 h-4" /> Incompleta
        </button>
      </div>
    </div>
  )
}
