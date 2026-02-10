import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { Calculator, MapPin, Phone, Mail, User, Home, Clock, XCircle, AlertCircle, Plus, Loader2, MessageSquare, TrendingUp, Building, ArrowUpRight, Camera, Upload, Trash2, Eye, Mic, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ArrowLeft, Zap, FileText } from 'lucide-react'
import FormalInspectionView from '../components/FormalInspectionView'
import { useAppraisals, updateAppraisalStatus, scheduleVisit, APPRAISAL_STATUS_CONFIG } from '../hooks/useAppraisals'
import type { AppraisalStatus } from '../hooks/useAppraisals'
import type { Appraisal } from '../types/database'

const BARRIOS_CABA = [
  'Agronomía','Almagro','Balvanera','Barracas','Barrio Norte','Belgrano','Boedo',
  'Caballito','Chacarita','Coghlan','Colegiales','Constitución','Devoto','Flores',
  'La Boca','Liniers','Mataderos','Monte Castro','Monserrat','Núñez','Palermo',
  'Parque Avellaneda','Parque Chacabuco','Parque Chas','Parque Patricios','Paternal',
  'Pompeya','Puerto Madero','Recoleta','Retiro','Saavedra','San Cristóbal','San Telmo',
  'Vélez Sársfield','Versalles','Villa Crespo','Villa del Parque','Villa General Mitre',
  'Villa Lugano','Villa Luro','Villa Ortúzar','Villa Pueyrredón','Villa Riachuelo',
  'Villa Santa Rita','Villa Soldati','Villa Urquiza'
]

function BarrioSearchSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = BARRIOS_CABA.filter(b => b.toLowerCase().includes(search.toLowerCase()))

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => { setOpen(!open); setTimeout(() => inputRef.current?.focus(), 50) }}
        className="w-full p-2.5 border border-gray-200 rounded-lg text-sm text-left flex items-center justify-between hover:border-gray-300 transition-colors"
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>{value || 'Seleccionar barrio'}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar barrio..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-400"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-400">Sin resultados</div>
            )}
            {filtered.map(b => (
              <button
                key={b}
                type="button"
                onClick={() => { onChange(b); setOpen(false); setSearch('') }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${value === b ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Collapsible Section Component
function CollapsibleSection({ title, icon, defaultOpen = false, badge, children }: {
  title: string
  icon?: React.ReactNode
  defaultOpen?: boolean
  badge?: React.ReactNode
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3 bg-white hover:bg-gray-50 transition-colors min-h-[44px]"
      >
        <div className="flex items-center gap-2 min-w-0">
          {icon}
          <span className="font-semibold text-gray-900 text-sm">{title}</span>
          {badge}
        </div>
        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-90' : ''}`} />
      </button>
      <div className={`transition-all duration-200 ease-in-out ${open ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="p-3 pt-0 bg-white">
          {children}
        </div>
      </div>
    </div>
  )
}

// Ubicaciones premium para scoring
const PREMIUM_LOCATIONS = ['Belgrano', 'Recoleta', 'Palermo', 'Puerto Madero', 'Núñez', 'Cañitas']

function calculatePropertyScore(appraisal: Appraisal): { score: number; factors: string[] } {
  let score = 0
  const factors: string[] = []
  const maxValue = appraisal.estimated_value_max || appraisal.estimated_value_min || 0
  if (maxValue > 500000) { score += 30; factors.push('Valor > 500k') }
  else if (maxValue > 200000) { score += 20; factors.push('Valor > 200k') }
  else if (maxValue > 100000) { score += 10 }
  const neighborhood = appraisal.neighborhood || ''
  const isPremium = PREMIUM_LOCATIONS.some(loc => neighborhood.toLowerCase().includes(loc.toLowerCase()))
  if (isPremium) { score += 25; factors.push('Zona premium') }
  const size = appraisal.size_m2 || 0
  if (size > 150) { score += 25; factors.push('> 150m²') }
  else if (size > 100) { score += 15; factors.push('> 100m²') }
  else if (size > 80) { score += 10 }
  const condition = (appraisal.condition || '').toLowerCase()
  if (condition.includes('reciclar') || condition.includes('refacc')) {
    score += 10; factors.push('A reciclar')
    if (isPremium) { score += 30; factors.push('⭐ Oportunidad'); if (size > 80) { score += 20; factors.push('⭐⭐ Oportunidad Premium') } }
  }
  if (appraisal.has_garage) { score += 10 }
  return { score: Math.min(score, 100), factors }
}

function getScoreClassification(score: number): { emoji: string; label: string; color: string; bgColor: string } {
  if (score >= 80) return { emoji: '🔴', label: 'Muy Caliente', color: 'text-red-600', bgColor: 'bg-red-100' }
  if (score >= 60) return { emoji: '🟠', label: 'Caliente', color: 'text-orange-600', bgColor: 'bg-orange-100' }
  if (score >= 30) return { emoji: '🟡', label: 'Tibio', color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
  return { emoji: '🔵', label: 'Frío', color: 'text-blue-600', bgColor: 'bg-blue-100' }
}

type KanbanColumn = 'nuevas' | 'visitas' | 'proceso' | 'aprobadas' | 'cerradas'

const KANBAN_COLUMNS: { id: KanbanColumn; label: string; icon: string; statuses: AppraisalStatus[] }[] = [
  { id: 'nuevas', label: 'Nuevas', icon: '📥', statuses: ['web_estimate'] },
  { id: 'visitas', label: 'Visitas', icon: '📅', statuses: ['visit_scheduled', 'visit_completed'] },
  { id: 'proceso', label: 'En Proceso', icon: '🔄', statuses: ['processing', 'draft', 'pending_review'] },
  { id: 'aprobadas', label: 'Aprobadas', icon: '✅', statuses: ['approved_by_admin', 'signed'] },
  { id: 'cerradas', label: 'Cerradas', icon: '📤', statuses: ['delivered', 'cancelled'] },
]

export const Tasaciones = () => {
  const { appraisals, loading, error, refetch } = useAppraisals()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filterColumn, setFilterColumn] = useState<KanbanColumn | 'todas'>('todas')
  const [filterType, setFilterType] = useState<'todas' | 'market_valuation' | 'formal_appraisal'>('todas')
  const [filterDays, setFilterDays] = useState<number | null>(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [notesExpanded, setNotesExpanded] = useState(false)
  const [showClientMsgOptions, setShowClientMsgOptions] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewModal, setShowNewModal] = useState(false)
  const [estimating, setEstimating] = useState(false)
  const [estimateType, setEstimateType] = useState<'express' | 'formal'>('express')
  const [_convertingToFormal, setConvertingToFormal] = useState(false)
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [analyzingTarget, setAnalyzingTarget] = useState(false)
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null)
  const [uploadingAudio, setUploadingAudio] = useState(false)
  const [reprocessingAudio, setReprocessingAudio] = useState(false)
  const [expandedVoiceNote, setExpandedVoiceNote] = useState<number | null>(null)
  const [showFormalForm, setShowFormalForm] = useState(false)
  const [showScorePopover, setShowScorePopover] = useState(false)
  const [_formalFormData, setFormalFormData] = useState({
    address: '',
    covered_area_m2: '',
    semi_covered_area_m2: '',
    uncovered_area_m2: '',
    garage_count: '',
    condition: '',
    building_age: '',
    bathrooms: '',
    floors: '1',
    has_gas: true,
    has_private_terrace: false,
    has_private_garden: false,
    amenities: [] as string[],
  })
  // Mobile tab for 3-column view
  const [mobileTab, setMobileTab] = useState<'list' | 'detail' | 'action'>('detail')
  const [pipelinePage, setPipelinePage] = useState<1 | 2>(1)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const [newForm, setNewForm] = useState({
    neighborhood: '',
    property_type: 'departamentos',
    total_area_m2: '',
    covered_area_m2: '',
    semi_covered_area_m2: '',
    uncovered_area_m2: '',
    rooms: '',
    has_garage: false,
    garage_count: '',
    condition: '',
    building_age: '',
    amenities: [] as string[],
    bathrooms: '',
    floors: '1',
    has_gas: true,
    has_private_terrace: false,
    has_private_garden: false,
    has_private_elevator: false,
    comparables_count: '',
    address: '',
    client_name: '',
    client_phone: '',
    client_email: '',
  })

  const SCRAPER_URL = 'https://scraper-star.135.181.24.249.sslip.io'

  // === All handlers (unchanged) ===

  const handleNewEstimate = async () => {
    const totalArea = newForm.total_area_m2 || newForm.covered_area_m2
    if (!newForm.neighborhood || !totalArea) return
    setEstimating(true)
    try {
      const { supabase } = await import('../lib/supabase')
      if (!supabase) throw new Error('Supabase not configured')
      const insertData = {
        neighborhood: newForm.neighborhood,
        property_type: newForm.property_type === 'departamentos' ? 'departamento' : newForm.property_type.replace(/s$/, ''),
        address: newForm.address || `${newForm.neighborhood}, CABA`,
        size_m2: parseInt(totalArea),
        rooms: newForm.rooms ? parseInt(newForm.rooms) : null,
        has_garage: newForm.has_garage,
        condition: newForm.condition || null,
        building_age: newForm.building_age ? parseInt(newForm.building_age) : null,
        amenities: newForm.amenities.length > 0 ? newForm.amenities : null,
        property_data: {
          covered_area_m2: newForm.covered_area_m2 ? parseFloat(newForm.covered_area_m2) : null,
          semi_covered_area_m2: newForm.semi_covered_area_m2 ? parseFloat(newForm.semi_covered_area_m2) : null,
          uncovered_area_m2: newForm.uncovered_area_m2 ? parseFloat(newForm.uncovered_area_m2) : null,
          garage_count: newForm.garage_count ? parseInt(newForm.garage_count) : 0,
          bathrooms: newForm.bathrooms ? parseInt(newForm.bathrooms) : null,
          floors: newForm.floors ? parseInt(newForm.floors) : 1,
          has_gas: newForm.has_gas,
          has_private_terrace: newForm.has_private_terrace,
          has_private_garden: newForm.has_private_garden,
          has_private_elevator: newForm.has_private_elevator,
        },
        client_name: newForm.client_name || null,
        client_phone: newForm.client_phone || null,
        client_email: newForm.client_email || null,
        status: 'web_estimate' as const,
        type: estimateType === 'formal' ? 'formal_appraisal' as const : 'market_valuation' as const,
        city: 'CABA',
      }
      const { data: appraisal, error: insertError } = await supabase
        .from('appraisals')
        .insert(insertData as any)
        .select()
        .single()
      if (insertError) throw insertError
      const appraisalId = (appraisal as any)?.id
      const endpoint = estimateType === 'formal' ? '/estimate-formal' : '/estimate'
      const resp = await fetch(`${SCRAPER_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          neighborhood: newForm.neighborhood,
          property_type: newForm.property_type,
          total_area_m2: parseInt(totalArea),
          rooms: newForm.rooms ? parseInt(newForm.rooms) : undefined,
          covered_area_m2: newForm.covered_area_m2 ? parseFloat(newForm.covered_area_m2) : undefined,
          semi_covered_area_m2: newForm.semi_covered_area_m2 ? parseFloat(newForm.semi_covered_area_m2) : undefined,
          uncovered_area_m2: newForm.uncovered_area_m2 ? parseFloat(newForm.uncovered_area_m2) : undefined,
          has_garage: newForm.has_garage,
          garage_count: newForm.garage_count ? parseInt(newForm.garage_count) : 0,
          condition: newForm.condition || undefined,
          building_age: newForm.building_age ? parseInt(newForm.building_age) : undefined,
          amenities: newForm.amenities.length > 0 ? newForm.amenities : undefined,
          bathrooms: newForm.bathrooms ? parseInt(newForm.bathrooms) : undefined,
          floors: newForm.floors ? parseInt(newForm.floors) : undefined,
          has_gas: newForm.has_gas,
          has_private_terrace: newForm.has_private_terrace,
          has_private_garden: newForm.has_private_garden,
          has_private_elevator: newForm.has_private_elevator,
          comparables_count: newForm.comparables_count ? parseInt(newForm.comparables_count) : undefined,
          max_comparables_to_analyze: newForm.comparables_count ? parseInt(newForm.comparables_count) : undefined,
          appraisal_id: appraisalId,
        }),
      })
      const result = await resp.json()
      if (result.success && appraisalId) {
        const updateData: any = {
          estimated_value_min: result.estimation.min,
          estimated_value_max: result.estimation.max,
          estimated_value: result.estimation.value,
          price_per_m2: result.estimation.price_per_m2,
          zone_average_price: result.estimation.price_per_m2_base || result.estimation.price_per_m2,
          comparables_used: result.comparables_used || result.ai_analysis?.details,
        }
        if (result.ai_analysis) {
          updateData.ai_analysis = result.ai_analysis
          updateData.status = 'processing'
        }
        await (supabase as any).from('appraisals').update(updateData).eq('id', appraisalId)
      }
      refetch()
      setShowNewModal(false)
      setNewForm({
        neighborhood: '', property_type: 'departamentos', total_area_m2: '',
        covered_area_m2: '', semi_covered_area_m2: '', uncovered_area_m2: '',
        rooms: '', has_garage: false, garage_count: '', condition: '',
        building_age: '', amenities: [], bathrooms: '', floors: '1', has_gas: true,
        has_private_terrace: false, has_private_garden: false, has_private_elevator: false,
        comparables_count: '', address: '', client_name: '',
        client_phone: '', client_email: '',
      })
    } catch (err) {
      console.error('Error creating estimate:', err)
      alert('Error al crear tasación: ' + (err as Error).message)
    } finally {
      setEstimating(false)
    }
  }

  const handleConvertToFormal = async (appraisal: Appraisal) => {
    if (!confirm('¿Convertir esta tasación express a formal? Se analizarán fotos de comparables con IA (~15 seg).')) return
    setConvertingToFormal(true)
    try {
      const resp = await fetch(`${SCRAPER_URL}/estimate-formal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          neighborhood: appraisal.neighborhood,
          property_type: appraisal.property_type,
          total_area_m2: appraisal.size_m2,
          rooms: appraisal.rooms || (appraisal as any).ambientes,
          covered_area_m2: (appraisal as any).property_data?.covered_area_m2,
          semi_covered_area_m2: (appraisal as any).property_data?.semi_covered_area_m2,
          uncovered_area_m2: (appraisal as any).property_data?.uncovered_area_m2,
          has_garage: appraisal.has_garage,
          garage_count: (appraisal as any).property_data?.garage_count,
          condition: appraisal.condition,
          building_age: appraisal.building_age,
          amenities: appraisal.amenities,
          appraisal_id: appraisal.id,
          max_comparables_to_analyze: 10,
        }),
      })
      const result = await resp.json()
      if (result.success) {
        const { supabase } = await import('../lib/supabase')
        await (supabase as any).from('appraisals').update({
          type: 'formal_appraisal',
          estimated_value_min: result.valuation?.min || result.min,
          estimated_value_max: result.valuation?.max || result.max,
          estimated_value_avg: result.valuation?.avg || result.avg,
          price_per_m2: result.valuation?.price_per_m2 || result.price_per_m2,
          ai_analysis: result.ai_analysis,
          comparables_used: result.comparables_used || result.ai_analysis?.details,
        }).eq('id', appraisal.id)
        refetch()
        alert('✅ Tasación convertida a formal exitosamente')
      } else {
        throw new Error(result.error || 'Error en tasación formal')
      }
    } catch (err) {
      console.error('Error converting to formal:', err)
      alert('Error: ' + (err as Error).message)
    } finally {
      setConvertingToFormal(false)
    }
  }

  const selectedAppraisal = appraisals.find(a => a.id === selectedId)

  const handlePhotoUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0 || !selectedAppraisal) return
    setUploadingPhotos(true)
    try {
      const { supabase } = await import('../lib/supabase')
      if (!supabase) throw new Error('Supabase not configured')
      const existingPhotos: string[] = (selectedAppraisal as any).property_data?.target_photos || []
      const newUrls: string[] = []
      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop() || 'jpg'
        const fileName = `${selectedAppraisal.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
        const formData = new FormData()
        formData.append('file', file)
        formData.append('fileName', fileName)
        const uploadResp = await fetch(`${SCRAPER_URL}/upload-evidence-form`, { method: 'POST', body: formData })
        const uploadResult = await uploadResp.json()
        if (!uploadResult.success) throw new Error(uploadResult.error || 'Upload failed')
        newUrls.push(uploadResult.url)
      }
      const allPhotos = [...existingPhotos, ...newUrls]
      const currentData = (selectedAppraisal as any).property_data || {}
      await (supabase as any).from('appraisals').update({ property_data: { ...currentData, target_photos: allPhotos } }).eq('id', selectedAppraisal.id)
      refetch()
    } catch (err) {
      console.error('Error uploading photos:', err)
      alert('Error al subir fotos: ' + (err as Error).message)
    } finally {
      setUploadingPhotos(false)
    }
  }, [selectedAppraisal, refetch])

  const handleDeletePhoto = useCallback(async (photoUrl: string) => {
    if (!selectedAppraisal || !confirm('¿Eliminar esta foto?')) return
    try {
      const { supabase } = await import('../lib/supabase')
      if (!supabase) throw new Error('Supabase not configured')
      const currentPhotos: string[] = (selectedAppraisal as any).property_data?.target_photos || []
      const filtered = currentPhotos.filter(u => u !== photoUrl)
      const currentData = (selectedAppraisal as any).property_data || {}
      await (supabase as any).from('appraisals').update({ property_data: { ...currentData, target_photos: filtered } }).eq('id', selectedAppraisal.id)
      const path = photoUrl.split('/appraisal-evidence/')[1]
      if (path) await supabase.storage.from('appraisal-evidence').remove([decodeURIComponent(path)])
      refetch()
    } catch (err) {
      console.error('Error deleting photo:', err)
    }
  }, [selectedAppraisal, refetch])

  const handleAnalyzeTarget = useCallback(async () => {
    if (!selectedAppraisal) return
    const photos: string[] = (selectedAppraisal as any).property_data?.target_photos || []
    if (photos.length === 0) return alert('Subí fotos primero')
    setAnalyzingTarget(true)
    try {
      const resp = await fetch(`${SCRAPER_URL}/analyze-target`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appraisal_id: selectedAppraisal.id,
          photo_urls: photos,
          property_info: {
            address: selectedAppraisal.address || selectedAppraisal.neighborhood,
            rooms: selectedAppraisal.rooms || (selectedAppraisal as any).ambientes,
            total_area_m2: selectedAppraisal.size_m2,
            condition_declared: selectedAppraisal.condition || null,
          },
        }),
      })
      const result = await resp.json()
      if (result.success) { refetch(); alert('✅ Análisis completado') }
      else { throw new Error(result.error || 'Error en análisis') }
    } catch (err) {
      console.error('Error analyzing target:', err)
      alert('Error: ' + (err as Error).message)
    } finally {
      setAnalyzingTarget(false)
    }
  }, [selectedAppraisal, refetch])

  const handleAudioUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0 || !selectedAppraisal) return
    setUploadingAudio(true)
    try {
      const file = files[0]
      const reader = new FileReader()
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => { const result = reader.result as string; resolve(result.split(',')[1]) }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      const resp = await fetch(`${SCRAPER_URL}/transcribe-audio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio_base64: base64, appraisal_id: selectedAppraisal.id, filename: file.name, mime_type: file.type }),
      })
      const result = await resp.json()
      if (result.success) {
        const { supabase } = await import('../lib/supabase')
        if (!supabase) throw new Error('Supabase not configured')
        const currentData = (selectedAppraisal as any).property_data || {}
        const existingNotes: any[] = currentData.voice_notes || []
        const newNote = {
          filename: file.name, timestamp: new Date().toISOString(),
          transcription: result.transcription, extraction: result.extraction,
          tokens_used: result.tokens_used, cost_usd: result.cost_usd,
        }
        const ff = result.extraction?.form_fields || {}
        const autoFillData: Record<string, any> = {}
        const fieldMap: Record<string, string> = {
          covered_area_m2: 'covered_area_m2', semi_covered_area_m2: 'semi_covered_area_m2',
          uncovered_area_m2: 'uncovered_area_m2', garage_count: 'garage_count',
          building_age: 'building_age', bathrooms: 'bathrooms', floors: 'floors',
          floor_number: 'floor_number', orientation: 'orientation', has_gas: 'has_gas',
          has_private_terrace: 'has_private_terrace', has_private_garden: 'has_private_garden',
          has_balcony: 'has_balcony', has_street_view: 'has_street_view',
          has_luminosity: 'has_luminosity', has_storage: 'has_storage', has_ac: 'has_ac',
          heating_type: 'heating_type', condition: 'condition', expensas: 'expensas', amenities: 'amenities',
        }
        for (const [extractKey, dataKey] of Object.entries(fieldMap)) {
          if (ff[extractKey] != null) autoFillData[dataKey] = ff[extractKey]
        }
        const updatedPropertyData = { ...currentData, ...autoFillData, voice_notes: [...existingNotes, newNote] }
        const topLevelUpdate: Record<string, any> = { property_data: updatedPropertyData }
        if (ff.address && !selectedAppraisal.address) topLevelUpdate.address = ff.address
        if (ff.condition) topLevelUpdate.condition = ff.condition
        if (ff.building_age != null) topLevelUpdate.building_age = ff.building_age
        await (supabase as any).from('appraisals').update(topLevelUpdate).eq('id', selectedAppraisal.id)
        if (showFormalForm) {
          setFormalFormData(prev => {
            const updated = { ...prev }
            if (ff.address && !prev.address) updated.address = ff.address
            if (ff.covered_area_m2 != null && !prev.covered_area_m2) updated.covered_area_m2 = String(ff.covered_area_m2)
            if (ff.semi_covered_area_m2 != null && !prev.semi_covered_area_m2) updated.semi_covered_area_m2 = String(ff.semi_covered_area_m2)
            if (ff.uncovered_area_m2 != null && !prev.uncovered_area_m2) updated.uncovered_area_m2 = String(ff.uncovered_area_m2)
            if (ff.garage_count != null && !prev.garage_count) updated.garage_count = String(ff.garage_count)
            if (ff.building_age != null && !(prev as any).building_age) (updated as any).building_age = String(ff.building_age)
            if (ff.bathrooms != null && !prev.bathrooms) updated.bathrooms = String(ff.bathrooms)
            if (ff.floors != null) updated.floors = String(ff.floors)
            if (ff.has_gas != null) updated.has_gas = ff.has_gas
            if (ff.has_private_terrace != null) updated.has_private_terrace = ff.has_private_terrace
            if (ff.has_private_garden != null) updated.has_private_garden = ff.has_private_garden
            if (ff.condition) updated.condition = ff.condition
            if (ff.amenities?.length) updated.amenities = [...new Set([...prev.amenities, ...ff.amenities.map((a: string) => a.toLowerCase())])]
            if (ff.floor_number != null) (updated as any).floor_number = String(ff.floor_number)
            if (ff.expensas != null) (updated as any).expensas = String(ff.expensas)
            if (ff.orientation) (updated as any).orientacion = ff.orientation
            if (ff.has_storage != null) (updated as any).baulera = ff.has_storage ? 'si' : 'no'
            if (ff.has_ac != null) (updated as any).aire_acondicionado = ff.has_ac ? 'si' : 'no'
            if (ff.heating_type) (updated as any).calefaccion = ff.heating_type
            return updated
          })
        }
        refetch()
      } else {
        throw new Error(result.error || 'Error en transcripción')
      }
    } catch (err) {
      console.error('Error uploading audio:', err)
      alert('Error al transcribir audio: ' + (err as Error).message)
    } finally {
      setUploadingAudio(false)
    }
  }, [selectedAppraisal, refetch, showFormalForm])

  // Filtrar tasaciones
  const filteredAppraisals = useMemo(() => {
    let result = appraisals
    if (filterColumn !== 'todas') {
      const column = KANBAN_COLUMNS.find(c => c.id === filterColumn)
      if (column) result = result.filter(a => column.statuses.includes(a.status as AppraisalStatus))
    }
    if (filterType !== 'todas') result = result.filter(a => a.type === filterType)
    if (filterDays) {
      const cutoff = Date.now() - filterDays * 24 * 60 * 60 * 1000
      result = result.filter(a => a.created_at && new Date(a.created_at).getTime() >= cutoff)
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(a =>
        (a.client_name || '').toLowerCase().includes(query) ||
        (a.address || '').toLowerCase().includes(query) ||
        (a.neighborhood || '').toLowerCase().includes(query) ||
        (a.client_phone || '').includes(query)
      )
    }
    return result
  }, [appraisals, filterColumn, filterType, filterDays, searchQuery])

  const columnStats = useMemo(() => {
    const stats: Record<KanbanColumn, number> = { nuevas: 0, visitas: 0, proceso: 0, aprobadas: 0, cerradas: 0 }
    appraisals.forEach(a => {
      const column = KANBAN_COLUMNS.find(c => c.statuses.includes(a.status as AppraisalStatus))
      if (column) stats[column.id]++
    })
    return stats
  }, [appraisals])

  const handleScheduleVisit = async () => {
    if (!selectedId || !scheduleDate) return
    try {
      const notesEl = document.getElementById('schedule-visit-notes') as HTMLTextAreaElement | null
      const visitNotes = notesEl?.value?.trim() || undefined
      await scheduleVisit(selectedId, scheduleDate, visitNotes)
      setShowScheduleModal(false)
      setScheduleDate('')
      refetch()
    } catch (err) { console.error('Error scheduling visit:', err) }
  }

  const handleStatusChange = async (id: string, newStatus: AppraisalStatus) => {
    try { await updateAppraisalStatus(id, newStatus); refetch() }
    catch (err) { console.error('Error updating status:', err) }
  }

  const formatText = (text?: string | null) => {
    if (!text) return null
    return text.replace(/-/g, ' ').replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
  }

  const formatPrice = (min?: number | null, max?: number | null) => {
    if (min && max && min !== max) return `USD ${(min/1000).toFixed(0)}k - ${(max/1000).toFixed(0)}k`
    if (max) return `USD ${max.toLocaleString()}`
    if (min) return `USD ${min.toLocaleString()}`
    return null
  }

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  const getTimeAgo = (dateStr?: string | null) => {
    if (!dateStr) return null
    const diff = Date.now() - new Date(dateStr).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours < 1) return 'Hace menos de 1h'
    if (hours < 24) return `Hace ${hours}h`
    const days = Math.floor(hours / 24)
    return `Hace ${days}d`
  }

  const openWhatsApp = (phone: string) => {
    const clean = phone.replace(/\D/g, '')
    window.open(`https://wa.me/${clean}`, '_blank')
  }

  // Helper to prepare formal form data from appraisal
  const prepareFormalFormData = (appraisal: Appraisal) => {
    const pd = (appraisal as any).property_data || {}
    const voiceNotes: any[] = pd.voice_notes || []
    const merged: Record<string, any> = {}
    for (const note of voiceNotes) {
      const ff = note.extraction?.form_fields
      if (!ff) continue
      for (const [k, v] of Object.entries(ff)) {
        if (v != null && k !== 'amenities') merged[k] = v
        if (k === 'amenities' && Array.isArray(v) && (v as any[]).length > 0) {
          merged.amenities = [...new Set([...(merged.amenities || []), ...(v as string[])])]
        }
      }
    }
    setFormalFormData({
      address: appraisal.address || merged.address || '',
      covered_area_m2: pd.covered_area_m2?.toString() || merged.covered_area_m2?.toString() || '',
      semi_covered_area_m2: pd.semi_covered_area_m2?.toString() || merged.semi_covered_area_m2?.toString() || '',
      uncovered_area_m2: pd.uncovered_area_m2?.toString() || merged.uncovered_area_m2?.toString() || '',
      garage_count: pd.garage_count?.toString() || merged.garage_count?.toString() || '',
      condition: appraisal.condition || merged.condition || '',
      building_age: appraisal.building_age?.toString() || merged.building_age?.toString() || '',
      bathrooms: pd.bathrooms?.toString() || merged.bathrooms?.toString() || '',
      floors: pd.floors?.toString() || merged.floors?.toString() || '1',
      has_gas: pd.has_gas ?? merged.has_gas ?? true,
      has_private_terrace: pd.has_private_terrace ?? merged.has_private_terrace ?? false,
      has_private_garden: pd.has_private_garden ?? merged.has_private_garden ?? false,
      amenities: [...new Set([...(appraisal.amenities as string[] || []), ...(merged.amenities || []).map((a: string) => a.toLowerCase())])],
      ...(merged.floor_number != null ? { floor_number: String(merged.floor_number) } : {}),
      ...(merged.expensas != null ? { expensas: String(merged.expensas) } : {}),
      ...(merged.orientation ? { orientacion: merged.orientation } : {}),
      ...(merged.has_storage != null ? { baulera: merged.has_storage ? 'si' : 'no' } : {}),
      ...(merged.has_ac != null ? { aire_acondicionado: merged.has_ac ? 'si' : 'no' } : {}),
      ...(merged.heating_type ? { calefaccion: merged.heating_type } : {}),
    } as any)
  }

  // Auto-refresh while inspection is in progress (every 15s)
  const inspActive = !!(selectedAppraisal && (selectedAppraisal as any)?.property_data?.inspection_state?.status === 'in_progress')
  useEffect(() => {
    if (!inspActive) return
    const interval = setInterval(() => { try { refetch({ silent: true }) } catch(_){} }, 15000)
    return () => clearInterval(interval)
  }, [inspActive, refetch])

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center bg-[#F8F9FA]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#D4A745] mx-auto mb-2" />
          <p className="text-gray-500">Cargando tasaciones...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex-1 flex items-center justify-center bg-[#F8F9FA]">
        <div className="text-center text-red-500">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p>Error: {error}</p>
          <button onClick={() => refetch()} className="mt-2 text-[#D4A745] underline">Reintentar</button>
        </div>
      </main>
    )
  }

  // ============================================================
  // RENDER: 3-column detail view (when an appraisal is selected)
  // ============================================================
  if (selectedAppraisal) {
    const status = selectedAppraisal.status as AppraisalStatus
    const config = APPRAISAL_STATUS_CONFIG[status] || APPRAISAL_STATUS_CONFIG.web_estimate
    const priceRange = formatPrice((selectedAppraisal as any).estimated_value_min, (selectedAppraisal as any).estimated_value_max)
    const { score, factors } = calculatePropertyScore(selectedAppraisal)
    const scoreClass = getScoreClassification(score)
    const isWeb = selectedAppraisal.type === 'market_valuation'

    // Column 1 (compact list) removed — detail is now Col 1

    // Col 3 always visible for formal appraisals
    const showCol3 = selectedAppraisal.type === 'formal_appraisal'

    // Auto-show formal inspection when inspection completed or has voice notes with extractions
    const hasInspectionData = !!(
      (selectedAppraisal as any).property_data?.inspection_state?.status === 'completed' ||
      ((selectedAppraisal as any).property_data?.voice_notes || []).some((vn: any) => vn.extraction?.form_fields)
    )

    // ----- Column 4: Draft/Formal -----
    const renderColumn4 = () => {
      if (!selectedAppraisal) return <div />
      
      if (showFormalForm || hasInspectionData) {
        return (
          <div className="flex flex-col h-full bg-white overflow-hidden">
            <FormalInspectionView
              appraisal={selectedAppraisal}
              onProcessFormal={() => { setShowFormalForm(false); handleConvertToFormal(selectedAppraisal) }}
              onClose={() => setShowFormalForm(false)}
              onRefetch={() => refetch({ silent: true })}
            />
          </div>
        )
      }

      if ((selectedAppraisal as any).ai_analysis) {
        const analysis = (selectedAppraisal as any).ai_analysis
        return (
          <div className="flex flex-col h-full bg-white overflow-y-auto p-4 space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">📄 Borrador de tasación</h3>
            <div className="bg-[#D4A745]/10 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Valor estimado</p>
              {analysis.recalculated ? (
                <p className="text-xl font-bold text-[#D4A745]">USD {(analysis.recalculated.min / 1000).toFixed(0)}k - {(analysis.recalculated.max / 1000).toFixed(0)}k</p>
              ) : (
                <p className="text-sm text-gray-500">Procesando...</p>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">Comparables analizados</p>
              {(analysis.details || []).map((det: any, idx: number) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{det.address}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${det.ai_score >= 8 ? 'bg-green-100 text-green-700' : det.ai_score >= 6 ? 'bg-blue-100 text-blue-700' : det.ai_score >= 4 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {(det.ai_condition || '').replace(/_/g, ' ')} ({det.ai_score}/10)
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>USD {det.price_usd?.toLocaleString()}</span>
                    <span>{det.total_area_m2}m²</span>
                    <span>USD {det.original_price_per_m2?.toLocaleString()}/m²</span>
                  </div>
                </div>
              ))}
            </div>
            {status === 'draft' && (
              <button className="w-full py-3 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 flex items-center justify-center gap-2">
                ✅ Aprobar tasación
              </button>
            )}
          </div>
        )
      }

      return (
        <div className="flex flex-col h-full bg-white items-center justify-center p-8 text-center">
          <div className="bg-gray-100 rounded-full p-4 mb-4">
            <Calculator className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-700 mb-2">Borrador de tasación</h3>
          <p className="text-sm text-gray-400 mb-4">
            {status === 'visit_scheduled' ? 'Se generará después de completar la visita' :
             status === 'visit_completed' ? 'Listo para generar borrador formal' :
             'Pendiente de procesamiento'}
          </p>
          {(status === 'visit_completed' || status === 'processing') && (
            <button onClick={() => { prepareFormalFormData(selectedAppraisal); setShowFormalForm(true) }}
              className="py-2.5 px-6 bg-[#D4A745] text-white rounded-lg text-sm font-medium hover:bg-[#c49a3d]">
              📝 Generar borrador
            </button>
          )}
        </div>
      )
    }

    // ----- Column 2: Detail -----
    const renderColumn2 = () => (
      <div className="flex flex-col h-full bg-white border-r border-gray-200">
        {/* Header */}
        <div className="flex-shrink-0 p-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white h-[60px] flex items-center overflow-hidden">
          <p className="text-sm font-bold text-gray-900">1. Detalle de propiedad</p>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Status badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${isWeb ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
              {isWeb ? '🌐 Web' : '📋 Formal'}
            </span>
            {config.label !== 'Web' && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${config.bgColor} ${config.color}`}>{config.label}</span>
            )}
            {score > 0 && (
              <button
                onClick={() => setShowScorePopover(prev => !prev)}
                className={`text-xs font-medium px-2 py-1 rounded-lg ${scoreClass.bgColor} ${scoreClass.color} hover:opacity-80 transition-opacity`}
              >
                {scoreClass.emoji} {score}
              </button>
            )}
          </div>
          {/* Score popover */}
          {showScorePopover && factors.length > 0 && (
            <div className={`p-3 rounded-xl ${scoreClass.bgColor} relative`}>
              <button onClick={() => setShowScorePopover(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
                <XCircle className="w-4 h-4" />
              </button>
              <p className={`text-sm font-medium ${scoreClass.color} mb-1`}>{scoreClass.emoji} {scoreClass.label} — {score} puntos</p>
              <div className="flex flex-wrap gap-1">
                {factors.map((f, i) => <span key={i} className={`text-xs px-2 py-0.5 rounded-full bg-white/50 ${scoreClass.color}`}>{f}</span>)}
              </div>
            </div>
          )}

          {/* Propiedad */}
          <CollapsibleSection title="Propiedad" icon={<Home className="w-4 h-4 text-gray-500" />} defaultOpen={true}>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-start gap-2 mb-3 pb-3 border-b border-gray-200">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{selectedAppraisal.address || selectedAppraisal.neighborhood || 'Sin dirección'}</p>
                  <p className="text-xs text-gray-500">{selectedAppraisal.neighborhood}, {selectedAppraisal.city || 'CABA'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-base font-bold text-gray-900">{formatText(selectedAppraisal.property_type) || '-'}</p>
                  <p className="text-xs text-gray-500">Tipo</p>
                </div>
                <div>
                  <p className="text-base font-bold text-gray-900">{selectedAppraisal.size_m2 || '-'}m²</p>
                  <p className="text-xs text-gray-500">Superficie</p>
                </div>
                <div>
                  <p className="text-base font-bold text-gray-900">{selectedAppraisal.rooms || selectedAppraisal.ambientes || '-'}</p>
                  <p className="text-xs text-gray-500">Ambientes</p>
                </div>
                <div>
                  <p className="text-base font-bold text-gray-900">{selectedAppraisal.building_age ? `${selectedAppraisal.building_age} años` : '-'}</p>
                  <p className="text-xs text-gray-500">Antigüedad</p>
                </div>
              </div>
              {(selectedAppraisal.condition || selectedAppraisal.has_garage) && (
                <div className="mt-2 pt-2 border-t border-gray-200 flex flex-wrap gap-1">
                  {selectedAppraisal.condition && (
                    <span className={`text-xs px-2 py-1 rounded ${selectedAppraisal.condition.toLowerCase().includes('reciclar') ? 'bg-orange-100 text-orange-700' : 'bg-gray-200 text-gray-700'}`}>
                      {formatText(selectedAppraisal.condition)}
                    </span>
                  )}
                  {selectedAppraisal.has_garage && <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">🚗 Cochera</span>}
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* Cliente */}
          {(selectedAppraisal.client_name || selectedAppraisal.client_phone) && (
            <CollapsibleSection title="Cliente" icon={<User className="w-4 h-4 text-gray-500" />} defaultOpen={true}>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="font-medium text-gray-900 text-sm">{selectedAppraisal.client_name || 'Sin nombre'}</p>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  {selectedAppraisal.client_phone && (
                    <button onClick={() => openWhatsApp(selectedAppraisal.client_phone!)} className="flex items-center gap-1.5 text-xs text-green-600 hover:text-green-700">
                      <Phone className="w-3.5 h-3.5" />{selectedAppraisal.client_phone}
                    </button>
                  )}
                  {selectedAppraisal.client_email && (
                    <a href={`mailto:${selectedAppraisal.client_email}`} className="flex items-center gap-1.5 text-xs text-[#D4A745]">
                      <Mail className="w-3.5 h-3.5" />{selectedAppraisal.client_email}
                    </a>
                  )}
                </div>
              </div>
            </CollapsibleSection>
          )}

          {/* Valuación */}
          {priceRange && (
            <CollapsibleSection title="Valuación" icon={<Calculator className="w-4 h-4 text-[#D4A745]" />} defaultOpen={true}
              badge={<span className="text-sm font-bold text-[#D4A745] ml-2">{priceRange}</span>}>
              <div className="bg-[#D4A745]/10 rounded-xl p-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-lg font-bold text-[#D4A745]">{priceRange}</p>
                    <p className="text-xs text-gray-600">Valor estimado</p>
                  </div>
                  {selectedAppraisal.price_per_m2 && (
                    <div>
                      <p className="text-lg font-bold text-gray-900">USD {selectedAppraisal.price_per_m2.toLocaleString()}/m²</p>
                      <p className="text-xs text-gray-600">Precio por m²</p>
                    </div>
                  )}
                </div>
              </div>
            </CollapsibleSection>
          )}

          {/* Timeline */}
          <CollapsibleSection title="Timeline" icon={<Clock className="w-4 h-4 text-gray-500" />} defaultOpen={true}>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Tasación web creada</p>
                  <p className="text-xs text-gray-500">{formatDate(selectedAppraisal.created_at)}</p>
                </div>
              </div>
              {(selectedAppraisal.visit_scheduled_at || status === 'visit_scheduled' || status === 'visit_completed') && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Visita agendada</p>
                    <p className="text-xs text-gray-500">
                      {selectedAppraisal.visit_scheduled_at 
                        ? formatDate(selectedAppraisal.visit_scheduled_at)
                        : (selectedAppraisal as any).visit_data?.scheduled_date 
                          ? `${(selectedAppraisal as any).visit_data.scheduled_date}`
                          : formatDate(selectedAppraisal.updated_at)}
                    </p>
                    {((selectedAppraisal as any).visit_data?.scheduled_time || (selectedAppraisal as any).visit_data?.time) && (
                      <p className="text-xs text-gray-500 mt-0.5">🕐 {(selectedAppraisal as any).visit_data?.scheduled_time || (selectedAppraisal as any).visit_data?.time}</p>
                    )}
                    {((selectedAppraisal as any).assigned_agent_id || (selectedAppraisal as any).visitor_id || (selectedAppraisal as any).visit_data?.agent_name) && (
                      <p className="text-xs text-gray-500 mt-0.5">👤 {(selectedAppraisal as any).visit_data?.agent_name || (selectedAppraisal as any).assigned_agent_name || 'Agente asignado'}</p>
                    )}
                  </div>
                </div>
              )}
              {selectedAppraisal.visited_at && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Visita completada</p>
                    <p className="text-xs text-gray-500">{formatDate(selectedAppraisal.visited_at)}</p>
                  </div>
                </div>
              )}
              {selectedAppraisal.completed_at && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Tasación completada</p>
                    <p className="text-xs text-gray-500">{formatDate(selectedAppraisal.completed_at)}</p>
                  </div>
                </div>
              )}
            </div>
          </CollapsibleSection>
        </div>

        {/* Action buttons - sticky bottom */}
        <div className="flex-shrink-0 px-4 py-3 border-t border-gray-200 bg-white flex gap-3 h-[56px] items-center">
          {status === 'web_estimate' && (
            <button onClick={() => setShowScheduleModal(true)} className="flex-1 py-2 bg-[#D4A745] text-white rounded-xl text-sm font-semibold hover:bg-[#c49a3d] transition-colors">
              📅 Agendar visita
            </button>
          )}
          {status !== 'web_estimate' && status !== 'cancelled' && status !== 'delivered' && (
            <div className="flex-1 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-semibold text-center border border-emerald-200">
              ✅ Visita agendada
            </div>
          )}
          {selectedAppraisal.pdf_url && (
            <a href={selectedAppraisal.pdf_url} target="_blank" rel="noopener noreferrer" className="py-2 px-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors text-center">
              📄 PDF
            </a>
          )}
          {status !== 'cancelled' && status !== 'delivered' && (
            <button onClick={() => handleStatusChange(selectedAppraisal.id, 'cancelled')} className="py-2 px-3 bg-gray-100 text-red-500 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors">
              ❌
            </button>
          )}
        </div>
      </div>
    )

    // ----- Column 3: Active step -----
    const renderColumn3 = () => {
      // Visit preparation — show for ALL visit-related statuses (always visible)
      const visitStatuses: AppraisalStatus[] = ['visit_scheduled', 'visit_completed', 'processing', 'draft', 'pending_review', 'approved_by_admin', 'signed', 'delivered']
      if (visitStatuses.includes(status) && selectedAppraisal.type === 'formal_appraisal') {
        const visitData = (selectedAppraisal as any).visit_data || {}
        const visitNotes = (selectedAppraisal as any).property_data?.visit_notes || ''
        const inspectionState = (selectedAppraisal as any).property_data?.inspection_state
        const completedItems: string[] = inspectionState?.completed_items || []
        const inspectionResponses = inspectionState?.responses || {}
        const address = selectedAppraisal.address || selectedAppraisal.neighborhood || ''
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address + ', ' + (selectedAppraisal.neighborhood || '') + ', Buenos Aires')}`
        
        const checklistGroups = [
          { title: '📸 Fotos obligatorias', items: [
            { id: 'foto_frente', label: 'Frente del edificio y entrada' },
            { id: 'foto_ambientes', label: 'Cada ambiente (general)' },
            { id: 'foto_cocina', label: 'Cocina (mesada, griferías, bajo-mesada)' },
            { id: 'foto_bano', label: 'Baño/s (sanitarios, revestimientos)' },
            { id: 'foto_vista', label: 'Vista desde ventana principal' },
          ]},
          { title: '📏 Verificaciones', items: [
            { id: 'superficie', label: 'Superficie real vs declarada' },
            { id: 'estado_pisos', label: 'Estado: pisos, paredes, techos' },
            { id: 'instalaciones', label: 'Instalaciones (eléctrica, gas, agua)' },
            { id: 'carpinterias', label: 'Carpinterías (ventanas, puertas)' },
            { id: 'climatizacion', label: 'Calefacción / AC (tipo)' },
          ]},
          { title: '🏢 Edificio', items: [
            { id: 'partes_comunes', label: 'Partes comunes (palier, ascensor)' },
            { id: 'seguridad', label: 'Seguridad (portero, cámaras)' },
            { id: 'amenities', label: 'Amenities (pileta, gym, SUM, etc.)' },
            { id: 'cochera_check', label: 'Cochera (verificar existencia)' },
          ]},
          { title: '📍 Entorno', items: [
            { id: 'orientacion', label: 'Orientación (N/S/E/O)' },
            { id: 'ruido', label: 'Nivel de ruido de la calle' },
            { id: 'entorno', label: 'Comercios, transporte, accesos' },
          ]},
          { title: '🎤 Observaciones', items: [
            { id: 'nota_voz', label: 'Grabar nota de voz con observaciones generales' },
          ]},
        ]
        
        return (
          <div className="flex flex-col h-full bg-white">
            {/* Fixed header */}
            <div className="flex-shrink-0 p-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white h-[60px] flex flex-col justify-center overflow-hidden">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                {inspectionState?.status === 'in_progress' ? '2. Recorrido en curso' : inspectionState?.status === 'completed' ? '2. Recorrido completado' : '2. Preparación de visita'}
              </h3>
            </div>
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {inspectionState?.status === 'in_progress' && (
              <div className="bg-blue-50 rounded-lg p-3 flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-blue-700 mb-1">
                    <span>Progreso del recorrido</span>
                    <span>{completedItems.length + Object.keys(inspectionResponses).length}/{checklistGroups.reduce((s, g) => s + g.items.length, 0)}</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${Math.min(100, ((completedItems.length + Object.keys(inspectionResponses).length) / checklistGroups.reduce((s, g) => s + g.items.length, 0)) * 100)}%` }} />
                  </div>
                </div>
                <span className="text-lg">📱</span>
              </div>
            )}

            {/* Visit info */}
            <div className="bg-[#D4A745]/10 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">📅 Datos de la visita</p>
              <div className="space-y-2">
                {selectedAppraisal.visit_scheduled_at && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#D4A745]" />
                    <p className="text-sm text-gray-900 font-medium">
                      {new Date(selectedAppraisal.visit_scheduled_at).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })} a las {(visitData.scheduled_time || new Date(selectedAppraisal.visit_scheduled_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }))}hs
                    </p>
                  </div>
                )}
                {visitData.agent_name && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#D4A745]" />
                    <p className="text-sm text-gray-900">{visitData.agent_name}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Address with Maps link */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">📍 Dirección</p>
              <p className="text-sm text-gray-900 mb-2">{address}{selectedAppraisal.neighborhood ? `, ${selectedAppraisal.neighborhood}` : ''}</p>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
                <MapPin className="w-4 h-4" /> Abrir en Google Maps
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Notes */}
            {visitNotes && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">📝 Notas previas</p>
                <p className={`text-sm text-gray-600 ${!notesExpanded && visitNotes.length > 80 ? 'line-clamp-2' : ''}`}>{visitNotes}</p>
                {visitNotes.length > 80 && (
                  <button onClick={() => setNotesExpanded(!notesExpanded)} className="text-xs text-[#D4A745] font-medium mt-1 hover:underline">
                    {notesExpanded ? 'Ver menos' : 'Ver más'}
                  </button>
                )}
              </div>
            )}

            {/* Checklist */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">✅ Checklist de visita</p>
              <div className="space-y-4">
                {checklistGroups.map(group => (
                  <div key={group.title}>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{group.title}</p>
                    <div className="space-y-1">
                      {group.items.map(item => (
                        <label key={item.id} className={`flex items-center gap-3 py-1.5 px-2 rounded-lg transition-colors ${completedItems.includes(item.id) || inspectionResponses[item.id] ? 'bg-green-50' : 'hover:bg-white cursor-pointer'}`}>
                          <input type="checkbox" checked={completedItems.includes(item.id) || !!inspectionResponses[item.id]} readOnly className="w-4 h-4 rounded border-gray-300 text-[#D4A745] focus:ring-[#D4A745]" />
                          <span className={`text-sm ${completedItems.includes(item.id) || inspectionResponses[item.id] ? 'text-green-700 line-through' : 'text-gray-700'}`}>{item.label}</span>
                          {inspectionResponses[item.id] && (
                            <span className="text-xs text-green-600 ml-auto">{inspectionResponses[item.id].filter((r: any) => r.type === 'photo').length > 0 ? `📸 ${inspectionResponses[item.id].filter((r: any) => r.type === 'photo').length}` : '✅'}</span>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="space-y-2">
              {selectedAppraisal.client_phone && status === 'visit_scheduled' && !showClientMsgOptions && (
                <button onClick={() => setShowClientMsgOptions(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600">
                  <Phone className="w-4 h-4" /> Informar al cliente
                </button>
              )}
              {selectedAppraisal.client_phone && showClientMsgOptions && (() => {
                const clientPhone = selectedAppraisal.client_phone!.replace(/[^0-9]/g, '')
                const clientName = selectedAppraisal.client_name || 'cliente'
                const visitTime = selectedAppraisal.visit_scheduled_at 
                  ? new Date(selectedAppraisal.visit_scheduled_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
                  : ''
                const msgs = [
                  { emoji: '🟢', label: 'Llego a horario', text: `Hola ${clientName}, te aviso que estoy en camino para la visita${visitTime ? ` de las ${visitTime}` : ''}. Llego a horario. ¡Nos vemos!` },
                  { emoji: '🟡', label: 'Retraso ~10 min', text: `Hola ${clientName}, estoy en camino pero voy a tener un pequeño retraso de unos 10 minutos. Disculpá las molestias, ¡ya llego!` },
                  { emoji: '💬', label: 'Escribir mensaje', text: '' },
                ]
                return (
                  <div className="w-full space-y-1.5 bg-green-50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-green-800">Informar al cliente</p>
                      <button onClick={() => setShowClientMsgOptions(false)} className="text-xs text-green-600 hover:underline">✕ Cerrar</button>
                    </div>
                    {msgs.map((m, i) => (
                      <button key={i} onClick={() => {
                        window.open(`https://wa.me/${clientPhone}${m.text ? `?text=${encodeURIComponent(m.text)}` : ''}`, '_blank')
                        setShowClientMsgOptions(false)
                      }}
                        className="w-full flex items-center gap-2 py-2 px-3 bg-white rounded-lg text-sm text-gray-700 hover:bg-green-100 transition-colors text-left">
                        <span>{m.emoji}</span> {m.label}
                      </button>
                    ))}
                  </div>
                )
              })()}
            </div>
            </div>{/* close scrollable */}

            {/* Footer - Visit scheduled: recorrido + marcar visitada */}
            {status === 'visit_scheduled' && inspectionState?.status !== 'completed' && inspectionState?.status !== 'in_progress' && (
              <div className="flex-shrink-0 px-4 py-3 border-t border-gray-200 bg-white flex gap-3 h-[56px] items-center">
                <button onClick={async () => {
                  try {
                    await fetch('https://star.igreen.com.ar/webhook/start-inspection', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ appraisal_id: selectedAppraisal.id, current_property_data: (selectedAppraisal as any).property_data || {} }),
                    })
                    const starPhone = '5491135565132'
                    const msg = encodeURIComponent(`Iniciar recorrido #T-${selectedAppraisal.id.slice(0, 8)}`)
                    window.open(`https://wa.me/${starPhone}?text=${msg}`, '_blank')
                    refetch()
                  } catch (err) { console.error('Error starting inspection:', err) }
                }} className="flex-1 py-2 bg-[#D4A745] text-white rounded-xl text-sm font-semibold hover:bg-[#c49a3d] transition-colors flex items-center justify-center gap-2">
                  📋 Iniciar recorrido
                </button>
                <button onClick={() => handleStatusChange(selectedAppraisal.id, 'visit_completed')} className="flex-1 py-2 bg-[#D4A745] text-white rounded-xl text-sm font-semibold hover:bg-[#c49a3d] transition-colors flex items-center justify-center gap-2">
                  ✅ Marcar visitada
                </button>
              </div>
            )}
            {status === 'visit_scheduled' && inspectionState?.status === 'in_progress' && (
              <div className="flex-shrink-0 px-4 py-3 border-t border-gray-200 bg-white flex gap-3 h-[56px] items-center">
                <div className="flex-1 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-semibold text-center border border-blue-200 flex items-center justify-center gap-2">
                  🔄 Recorrido en proceso
                </div>
                <button onClick={() => handleStatusChange(selectedAppraisal.id, 'visit_completed')} className="flex-1 py-2 bg-[#D4A745] text-white rounded-xl text-sm font-semibold hover:bg-[#c49a3d] transition-colors flex items-center justify-center gap-2">
                  ✅ Marcar visitada
                </button>
              </div>
            )}

            {/* Footer - Audio actions */}
            {(inspectionState?.status === 'completed' || status !== 'visit_scheduled') && (
              <div className="flex-shrink-0 px-4 py-3 border-t border-gray-200 bg-white flex gap-3 h-[56px] items-center">
                <input ref={audioInputRef} type="file" accept="audio/*" className="hidden" onChange={(e) => handleAudioUpload(e.target.files)} />
                <button onClick={() => audioInputRef.current?.click()} disabled={uploadingAudio}
                  className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                  {uploadingAudio ? <><Loader2 className="w-4 h-4 animate-spin" /> Subiendo...</> : '🎙️ Subir audio'}
                </button>
                <button onClick={async () => {
                  setReprocessingAudio(true)
                  try {
                    const resp = await fetch(`${SCRAPER_URL}/reprocess-audio`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ appraisal_id: selectedAppraisal.id }),
                    })
                    const result = await resp.json()
                    if (result.success) {
                      refetch()
                      alert(`✅ ${result.processed} audios re-procesados`)
                    } else {
                      throw new Error(result.error || 'Error')
                    }
                  } catch (err) {
                    alert('Error: ' + (err as Error).message)
                  } finally {
                    setReprocessingAudio(false)
                  }
                }} disabled={reprocessingAudio}
                  className="flex-1 py-2 bg-[#D4A745] text-white rounded-xl text-sm font-semibold hover:bg-[#c49a3d] transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                  {reprocessingAudio ? <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</> : '🔄 Re-procesar audios'}
                </button>
              </div>
            )}
          </div>
        )
      }

      // Visit evidence (visit_completed)
      if (status === 'visit_completed' || (status === 'processing' && !isWeb)) {
        const targetPhotos: string[] = (selectedAppraisal as any).property_data?.target_photos || []
        const voiceNotes: any[] = (selectedAppraisal as any).property_data?.voice_notes || []
        return (
          <div className="flex flex-col h-full bg-white overflow-y-auto p-4 space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#D4A745]" /> Evidencia de visita
            </h3>

            {/* Photos */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">📸 Fotos ({targetPhotos.length})</p>
              {targetPhotos.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {targetPhotos.map((url, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-200">
                      <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover cursor-pointer" onClick={() => setPreviewPhoto(url)} />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                        <button onClick={() => setPreviewPhoto(url)} className="p-1 bg-white/90 rounded-full"><Eye className="w-3.5 h-3.5 text-gray-700" /></button>
                        <button onClick={() => handleDeletePhoto(url)} className="p-1 bg-white/90 rounded-full"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input ref={photoInputRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e.target.files)} />
                <button onClick={() => photoInputRef.current?.click()} disabled={uploadingPhotos}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-[#D4A745] hover:text-[#D4A745] transition-colors disabled:opacity-50">
                  {uploadingPhotos ? <><Loader2 className="w-4 h-4 animate-spin" /> Subiendo...</> : <><Upload className="w-4 h-4" /> Subir fotos</>}
                </button>
                {targetPhotos.length > 0 && !(selectedAppraisal as any).property_data?.target_analysis && (
                  <button onClick={handleAnalyzeTarget} disabled={analyzingTarget}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50">
                    {analyzingTarget ? <><Loader2 className="w-4 h-4 animate-spin" /> Analizando...</> : '🔍 Analizar con IA'}
                  </button>
                )}
              </div>
            </div>

            {/* Target Analysis Results */}
            {(selectedAppraisal as any).property_data?.target_analysis && (() => {
              const ta = (selectedAppraisal as any).property_data.target_analysis
              const disc = ta.discrepancy
              const hasDiscrepancy = disc && disc.difference_pct && Math.abs(disc.difference_pct) > 10
              return (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">🏠 Análisis IA</p>
                  {hasDiscrepancy && (
                    <div className="bg-amber-50 border border-amber-300 rounded-lg p-2.5 mb-2">
                      <p className="text-xs font-medium text-amber-800">
                        ⚠️ Cliente declaró <span className="font-bold">{disc.declared?.replace(/_/g, ' ') || '—'}</span>, IA detectó <span className="font-bold">{disc.detected?.replace(/_/g, ' ')}</span> ({disc.difference_pct > 0 ? '+' : ''}{disc.difference_pct}%)
                      </p>
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-sm font-medium px-3 py-1.5 rounded-lg ${(ta.condition_score || 0) >= 7 ? 'bg-green-100 text-green-700' : (ta.condition_score || 0) >= 4 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {(ta.condition_detected || ta.condition || '').replace(/_/g, ' ')} — {ta.condition_score}/10
                    </span>
                    {ta.estimated_renovation_cost_usd && <span className="text-xs text-gray-500">Renov.: USD {ta.estimated_renovation_cost_usd.toLocaleString()}</span>}
                  </div>
                  {ta.details && (
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      {Object.entries(ta.details).map(([key, val]) => (
                        <div key={key} className="bg-white rounded-lg p-2 text-center">
                          <p className="text-xs text-gray-500 capitalize">{key}</p>
                          <p className={`text-sm font-medium ${String(val).match(/malo|baja/) ? 'text-red-600' : String(val).match(/regular|media/) ? 'text-yellow-600' : 'text-green-600'}`}>{String(val).replace(/_/g, ' ')}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {ta.highlights?.length > 0 && <p className="text-xs text-green-600 mb-1">✅ {ta.highlights.join(' · ')}</p>}
                  {ta.issues?.length > 0 && <p className="text-xs text-orange-600 mb-1">⚠️ {ta.issues.join(' · ')}</p>}
                  {ta.recalculated && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-700 mb-1">📊 Valor recalculado:</p>
                      <p className="text-base font-bold text-[#D4A745]">USD {(ta.recalculated.min / 1000).toFixed(0)}k - {(ta.recalculated.max / 1000).toFixed(0)}k</p>
                      <p className="text-xs text-gray-500">USD {ta.recalculated.price_per_m2?.toLocaleString()}/m²</p>
                    </div>
                  )}
                </div>
              )
            })()}

            {/* Voice notes */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">🎤 Notas de voz ({voiceNotes.length})</p>
              {voiceNotes.length > 0 && (
                <div className="space-y-2 mb-3">
                  {voiceNotes.map((note: any, idx: number) => {
                    const isExpanded = expandedVoiceNote === idx
                    const ext = note.extraction || {}
                    return (
                      <div key={idx} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <button onClick={() => setExpandedVoiceNote(isExpanded ? null : idx)}
                          className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Mic className="w-3.5 h-3.5 text-[#D4A745] flex-shrink-0" />
                              <span className="text-xs text-gray-500">
                                {note.timestamp ? new Date(note.timestamp).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : `Nota ${idx + 1}`}
                              </span>
                              {ext.condition_detected && (
                                <span className={`text-xs font-medium px-2 py-0.5 rounded ${(ext.condition_score || 0) >= 7 ? 'bg-green-100 text-green-700' : (ext.condition_score || 0) >= 4 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                  {ext.condition_detected.replace(/_/g, ' ')} {ext.condition_score}/10
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 truncate">{note.transcription ? note.transcription.slice(0, 80) + (note.transcription.length > 80 ? '...' : '') : 'Sin transcripción'}</p>
                          </div>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                        </button>
                        {isExpanded && (
                          <div className="px-3 pb-3 space-y-2 border-t border-gray-100 pt-2">
                            <div className="bg-gray-50 rounded-lg p-2 text-sm text-gray-700 whitespace-pre-wrap">{note.transcription || 'Sin transcripción'}</div>
                            {ext.condition_detected && (
                              <div>
                                {(() => {
                                  const declared = selectedAppraisal.condition
                                  const detected = ext.condition_detected
                                  const hasDisc = declared && detected && declared.toLowerCase().replace(/_/g, ' ') !== detected.toLowerCase().replace(/_/g, ' ')
                                  return hasDisc ? (
                                    <div className="bg-amber-50 border border-amber-300 rounded-lg p-2 mb-2">
                                      <p className="text-xs font-medium text-amber-800">⚠️ Declarado: {declared?.replace(/_/g, ' ')}, Audio: {detected.replace(/_/g, ' ')}</p>
                                    </div>
                                  ) : null
                                })()}
                                <div className="flex flex-wrap gap-1.5 mb-1">
                                  {ext.noise_level && <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">🔊 {ext.noise_level}</span>}
                                  {ext.natural_light && <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">☀️ {ext.natural_light}</span>}
                                  {ext.view && <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">👁️ {ext.view}</span>}
                                </div>
                                {ext.rooms && ext.rooms.length > 0 && (
                                  <div className="grid grid-cols-2 gap-1 mb-1">
                                    {ext.rooms.map((room: any, ri: number) => (
                                      <div key={ri} className="bg-white border border-gray-200 rounded-lg p-2">
                                        <span className="text-xs font-medium text-gray-900">{room.name || `Amb ${ri + 1}`}</span>
                                        {room.condition && <span className={`ml-1 text-xs px-1 py-0.5 rounded ${String(room.condition).match(/buen|excelent/i) ? 'bg-green-100 text-green-700' : String(room.condition).match(/regular|medio/i) ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{room.condition}</span>}
                                        {room.notes && <p className="text-xs text-gray-500 mt-0.5">{room.notes}</p>}
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {ext.highlights?.length > 0 && <p className="text-xs text-green-600">✅ {ext.highlights.join(' · ')}</p>}
                                {ext.issues?.length > 0 && <p className="text-xs text-orange-600">⚠️ {ext.issues.join(' · ')}</p>}
                                {ext.neighborhood_notes && <p className="text-xs text-gray-500 mt-1">🏘️ {ext.neighborhood_notes}</p>}
                              </div>
                            )}
                            {note.cost_usd && <p className="text-xs text-gray-400 text-right">USD {note.cost_usd.toFixed(4)}</p>}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
              <input ref={audioInputRef} type="file" accept=".mp3,.m4a,.wav,.ogg,.webm,audio/*" className="hidden" onChange={(e) => handleAudioUpload(e.target.files)} />
              <button onClick={() => audioInputRef.current?.click()} disabled={uploadingAudio}
                className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-[#D4A745] hover:text-[#D4A745] transition-colors disabled:opacity-50">
                {uploadingAudio ? <><Loader2 className="w-5 h-5 animate-spin" /> Transcribiendo...</> : <><Mic className="w-5 h-5" /> Subir nota de voz</>}
              </button>
            </div>

            {/* Generate draft button */}
            {(status === 'visit_completed' || status === 'processing') && (
              <button onClick={() => { prepareFormalFormData(selectedAppraisal); setShowFormalForm(true) }}
                className="w-full py-3 bg-[#D4A745] text-white rounded-xl text-sm font-bold hover:bg-[#c49a3d] flex items-center justify-center gap-2">
                📝 Generar borrador formal
              </button>
            )}
          </div>
        )
      }

      // Default: web_estimate with no action yet
      return (
        <div className="flex flex-col h-full bg-white items-center justify-center p-8 text-center">
          <div className="bg-[#D4A745]/10 rounded-full p-4 mb-4">
            <Calculator className="w-8 h-8 text-[#D4A745]" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Siguiente paso</h3>
          {status === 'web_estimate' && (
            <>
              <p className="text-sm text-gray-500 mb-4">Esta tasación es una estimación web. Podés agendar una visita o convertirla a formal.</p>
              <div className="flex flex-col gap-2 w-full max-w-xs">
                <button onClick={() => setShowScheduleModal(true)} className="py-2.5 bg-[#D4A745] text-white rounded-lg text-sm font-medium hover:bg-[#c49a3d]">
                  📅 Agendar visita
                </button>
                <button onClick={() => { prepareFormalFormData(selectedAppraisal); setShowFormalForm(true) }} className="py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
                  🔍 Convertir a Formal
                </button>
              </div>
            </>
          )}
          {(status === 'approved_by_admin' || status === 'signed' || status === 'delivered') && (
            <p className="text-sm text-gray-500">Tasación {status === 'delivered' ? 'entregada' : status === 'signed' ? 'firmada' : 'aprobada'}. {selectedAppraisal.pdf_url ? '📄 PDF disponible.' : ''}</p>
          )}
          {status === 'cancelled' && (
            <p className="text-sm text-gray-400">Esta tasación fue cancelada.</p>
          )}
        </div>
      )
    }

    // ─── Page 2 Column Renderers ───

    // Col 4: Resultado de tasación
    const renderResultColumn = () => {
      const aiAnalysis = (selectedAppraisal as any)?.ai_analysis
      return (
        <div className="flex flex-col h-full bg-white">
          <div className="flex-shrink-0 p-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white h-[60px] flex flex-col justify-center overflow-hidden">
            <h3 className="text-sm font-bold text-gray-900">📊 Resultado de tasación</h3>
            <p className="text-xs text-gray-500 mt-0.5">{aiAnalysis ? 'Procesada' : 'Pendiente de procesamiento'}</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!aiAnalysis ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Zap className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-sm text-gray-500 mb-2">Tasación no procesada aún</p>
                <p className="text-xs text-gray-400 mb-4">Volvé a la página de Relevamiento y hacé clic en "Procesar tasación"</p>
                <button onClick={() => setPipelinePage(1)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
                  ← Volver a Relevamiento
                </button>
              </div>
            ) : (
              <>
                {/* Valuation card with positioning bar */}
                <div className="bg-gradient-to-r from-[#D4A745]/10 to-[#D4A745]/5 rounded-xl p-5 border border-[#D4A745]/20">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-900">⚡ Valuación</h3>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700">✅ Procesada</span>
                  </div>
                  {(() => {
                    const v = aiAnalysis.recalculated || aiAnalysis.valuation || aiAnalysis
                    const estimation = aiAnalysis.estimation || {}
                    const min = v.min || (selectedAppraisal as any).estimated_value_min || 0
                    const max = v.max || (selectedAppraisal as any).estimated_value_max || 0
                    const value = estimation.value || v.value || (selectedAppraisal as any).estimated_value || ((min + max) / 2)
                    const position = max > min ? ((value - min) / (max - min)) * 100 : 50
                    const reasoning = estimation.positioning_reasoning || aiAnalysis.positioning_reasoning || null
                    
                    return (
                      <div className="space-y-4">
                        {/* Main value */}
                        <div className="text-center bg-white rounded-xl p-4">
                          <p className="text-xs text-gray-400 mb-1">Valor de tasación</p>
                          <p className="text-3xl font-bold text-[#D4A745]">USD {(value / 1000).toFixed(0)}k</p>
                          {(selectedAppraisal as any).price_per_m2 && (
                            <p className="text-sm text-gray-400 mt-1">USD {(selectedAppraisal as any).price_per_m2?.toLocaleString()}/m²</p>
                          )}
                        </div>

                        {/* Positioning bar */}
                        <div className="bg-white rounded-xl p-4">
                          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                            <span>USD {(min / 1000).toFixed(0)}k</span>
                            <span className="font-medium text-gray-600">Rango de mercado</span>
                            <span>USD {(max / 1000).toFixed(0)}k</span>
                          </div>
                          {/* Bar */}
                          <div className="relative h-3 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-full">
                            {/* Comparable dots */}
                            {(aiAnalysis.details || []).map((det: any, idx: number) => {
                              const detValue = det.price_usd || 0
                              const detPos = max > min ? ((detValue - min) / (max - min)) * 100 : 50
                              return (
                                <div key={idx} className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-400 rounded-full border border-white"
                                  style={{ left: `${Math.max(2, Math.min(98, detPos))}%` }}
                                  title={`${det.address}: USD ${det.price_usd?.toLocaleString()}`} />
                              )
                            })}
                            {/* Target value marker */}
                            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                              style={{ left: `${Math.max(5, Math.min(95, position))}%` }}>
                              <div className="w-5 h-5 bg-[#D4A745] rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full" />
                              </div>
                            </div>
                          </div>
                          {/* Position label */}
                          <div className="mt-2 text-center">
                            <span className="text-xs font-medium text-[#D4A745]">
                              {position < 30 ? '📉 Por debajo del mercado' : position < 45 ? '↙️ Debajo del promedio' : position < 55 ? '⚖️ En el promedio' : position < 70 ? '↗️ Por encima del promedio' : '📈 Segmento premium'}
                            </span>
                          </div>
                        </div>

                        {/* AI Reasoning */}
                        {reasoning && (
                          <div className="bg-white rounded-xl p-4">
                            <p className="text-xs font-semibold text-gray-700 mb-1">🧠 Análisis</p>
                            <p className="text-xs text-gray-600 leading-relaxed">{reasoning}</p>
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </div>

                {/* Comparables */}
                <div className="bg-white rounded-xl border border-gray-200">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900">🏘️ Comparables analizados ({(aiAnalysis.details || []).length})</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {(aiAnalysis.details || []).map((det: any, idx: number) => (
                      <div key={idx} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="text-sm font-medium text-gray-900 truncate">{det.address || `Comparable ${idx + 1}`}</span>
                            {det.source_url && (
                              <a href={det.source_url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 text-xs text-blue-500 hover:text-blue-700 hover:underline">
                                🔗 ZonaProp
                              </a>
                            )}
                          </div>
                          <span className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded ${det.ai_score >= 8 ? 'bg-green-100 text-green-700' : det.ai_score >= 6 ? 'bg-blue-100 text-blue-700' : det.ai_score >= 4 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                            {det.ai_score ? `${det.ai_score}/10` : '—'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                          <span className="font-medium text-gray-700">USD {det.price_usd?.toLocaleString()}</span>
                          <span>{det.total_area_m2}m²</span>
                          <span>USD {det.original_price_per_m2?.toLocaleString()}/m²</span>
                          {det.ai_condition && <span className={`capitalize font-medium ${det.ai_condition === 'bueno' || det.ai_condition === 'muy_bueno' || det.ai_condition === 'excelente' ? 'text-green-600' : det.ai_condition === 'regular' ? 'text-yellow-600' : 'text-red-600'}`}>{det.ai_condition.replace(/_/g, ' ')}</span>}
                        </div>
                        {/* Highlights & Issues */}
                        {((det.highlights && det.highlights.length > 0) || (det.issues && det.issues.length > 0)) && (
                          <div className="mt-1.5 space-y-1">
                            {(det.highlights || []).map((h: string, i: number) => (
                              <p key={`h${i}`} className="text-xs text-green-600 flex items-start gap-1.5">
                                <span className="flex-shrink-0">✅</span> {h}
                              </p>
                            ))}
                            {(det.issues || []).map((issue: string, i: number) => (
                              <p key={`i${i}`} className="text-xs text-orange-500 flex items-start gap-1.5">
                                <span className="flex-shrink-0">⚠️</span> {issue}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          {aiAnalysis && (
            <div className="flex-shrink-0 px-4 py-3 border-t border-gray-200 bg-white flex gap-3 h-[56px] items-center">
              <button onClick={() => handleConvertToFormal(selectedAppraisal)} className="flex-1 py-2 bg-[#D4A745] text-white rounded-xl text-sm font-semibold hover:bg-[#c49a3d] transition-colors flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" /> Re-procesar
              </button>
            </div>
          )}
        </div>
      )
    }

    // Col 5: Informe / PDF preview
    const generateReportHTML = () => {
      const a = selectedAppraisal as any
      const ai = a.ai_analysis || {}
      const pd = a.property_data || {}
      const details = ai.details || []
      const estimation = ai.estimation || {}
      const min = a.estimated_value_min || 0
      const max = a.estimated_value_max || 0
      const value = a.estimated_value || ((min + max) / 2)
      const position = max > min ? ((value - min) / (max - min)) * 100 : 50
      const photos: string[] = pd.target_photos || []
      const date = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
      const shortId = a.id?.slice(0, 8) || '0000'

      return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Informe de Tasación — ${a.address || ''}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter',sans-serif;color:#1a1a1a;background:#f5f5f5}
.page{width:210mm;min-height:297mm;margin:20px auto;background:white;box-shadow:0 4px 24px rgba(0,0,0,.1);overflow:hidden}
.cover{min-height:297mm;display:flex;flex-direction:column;position:relative;background:linear-gradient(135deg,#1a1a1a,#2d2d2d);color:white;padding:60px}
.cover-accent{position:absolute;right:0;top:0;width:8px;height:100%;background:#D4A745}
.cover-logo{font-size:14px;letter-spacing:8px;text-transform:uppercase;color:#D4A745;font-weight:700;margin-bottom:auto}
.cover-star{font-size:48px;margin-bottom:8px}.cover-title{font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#999;margin-bottom:60px}
.cover-address{font-size:42px;font-weight:800;line-height:1.1;margin-bottom:16px}
.cover-neighborhood{font-size:22px;font-weight:300;color:#D4A745;margin-bottom:60px}
.cover-value{margin-top:auto}.cover-value-label{font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#888;margin-bottom:8px}
.cover-value-number{font-size:56px;font-weight:800;color:#D4A745}.cover-value-m2{font-size:18px;color:#888;margin-top:4px}
.cover-footer{margin-top:40px;display:flex;justify-content:space-between;font-size:12px;color:#666}
.cover-footer span{display:block}
.content{padding:50px 60px}
.page-header{display:flex;justify-content:space-between;align-items:center;padding-bottom:20px;border-bottom:2px solid #D4A745;margin-bottom:30px}
.page-header-logo{font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#D4A745;font-weight:700}
.page-header-title{font-size:11px;color:#999}
h2{font-size:20px;font-weight:700;color:#1a1a1a;margin-bottom:20px;padding-bottom:8px;border-bottom:1px solid #eee}
h2 .sn{color:#D4A745;margin-right:8px}h3{font-size:14px;font-weight:600;color:#333;margin:16px 0 8px}
.summary-box{background:linear-gradient(135deg,#faf6eb,#f5f0e0);border:1px solid #D4A745;border-radius:12px;padding:30px;margin-bottom:30px}
.summary-value{font-size:40px;font-weight:800;color:#D4A745;text-align:center}
.summary-label{font-size:12px;color:#888;text-align:center;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px}
.summary-m2{font-size:16px;color:#666;text-align:center;margin-top:4px}
.summary-range{display:flex;justify-content:space-between;margin-top:20px;padding-top:16px;border-top:1px solid #D4A74540}
.summary-range-item{text-align:center}.summary-range-item .val{font-size:18px;font-weight:700;color:#333}
.summary-range-item .lbl{font-size:10px;color:#999;text-transform:uppercase;letter-spacing:1px}
.position-bar{height:12px;background:linear-gradient(90deg,#ef4444 0%,#eab308 35%,#22c55e 100%);border-radius:6px;position:relative;margin:20px 0}
.position-marker{position:absolute;top:50%;transform:translate(-50%,-50%);width:20px;height:20px;background:#D4A745;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.3)}
.position-labels{display:flex;justify-content:space-between;font-size:10px;color:#999}
.data-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0}
.data-item{background:#f8f8f8;padding:12px 16px;border-radius:8px}
.data-item .label{font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:#999;margin-bottom:4px}
.data-item .value{font-size:14px;font-weight:600;color:#333}
.photo-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:16px 0}
.photo-grid img{width:100%;height:140px;object-fit:cover;border-radius:8px;background:#eee}
.comp-card{background:#f8f8f8;border-radius:10px;padding:16px;margin-bottom:10px}
.comp-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.comp-name{font-weight:600;font-size:13px}.comp-score{background:#D4A745;color:white;padding:2px 10px;border-radius:12px;font-size:11px;font-weight:700}
.comp-details{display:flex;gap:16px;font-size:12px;color:#666;margin-bottom:8px}
.comp-notes{font-size:11px;color:#888}.comp-notes .positive{color:#16a34a}.comp-notes .negative{color:#ea580c}
table{width:100%;border-collapse:collapse;margin:16px 0;font-size:13px}
table th{background:#f8f8f8;text-align:left;padding:10px 12px;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:#666;border-bottom:2px solid #eee}
table td{padding:10px 12px;border-bottom:1px solid #f0f0f0}
.methodology{background:#f8f9fa;border-radius:12px;padding:24px;margin:16px 0;font-size:13px;line-height:1.7;color:#555}
.conclusion{background:linear-gradient(135deg,#faf6eb,#f5f0e0);border:1px solid #D4A745;border-radius:12px;padding:24px;margin:16px 0}
.conclusion p{font-size:14px;line-height:1.8;color:#333}
.signature-line{margin-top:60px;display:flex;gap:60px}.signature-box{flex:1;text-align:center}
.signature-box .line{border-top:1px solid #333;margin-bottom:8px}
.signature-box .name{font-size:12px;font-weight:600;color:#333}.signature-box .role{font-size:10px;color:#888}
.disclaimer{margin-top:30px;padding:16px;background:#f8f8f8;border-radius:8px;font-size:10px;color:#999;line-height:1.6}
.footer{margin-top:40px;padding-top:20px;border-top:2px solid #eee;display:flex;justify-content:space-between;font-size:11px;color:#999}
@media print{body{background:white}.page{box-shadow:none;margin:0;page-break-after:always}}
</style></head><body>

<!-- COVER -->
<div class="page"><div class="cover"><div class="cover-accent"></div>
<div><div class="cover-star">⭐</div><div class="cover-logo">Star Inmobiliaria</div><div class="cover-title">Informe de Tasación</div></div>
<div><div class="cover-address">${a.address || 'Dirección'}</div><div class="cover-neighborhood">${a.neighborhood || ''}, Capital Federal</div></div>
<div class="cover-value"><div class="cover-value-label">Valor de Tasación</div>
<div class="cover-value-number">USD ${(value/1000).toFixed(0)}.000</div>
<div class="cover-value-m2">USD ${a.price_per_m2?.toLocaleString() || '—'} /m²</div></div>
<div class="cover-footer"><div><span>Fecha: ${date}</span><span>Informe Nº: ST-2026-${shortId}</span></div>
<div style="text-align:right"><span>Tasador: Jonathan Rodríguez</span><span>Matrícula: CMCPSI Nº XXXX</span></div></div></div></div>

<!-- RESUMEN + DATOS -->
<div class="page"><div class="content">
<div class="page-header"><div class="page-header-logo">⭐ Star Inmobiliaria</div><div class="page-header-title">${a.address} — ${a.neighborhood} | ST-2026-${shortId}</div></div>
<h2><span class="sn">01</span> Resumen Ejecutivo</h2>
<div class="summary-box">
<div class="summary-label">Valor de Tasación</div><div class="summary-value">USD ${(value/1000).toFixed(0)}.000</div>
<div class="summary-m2">USD ${a.price_per_m2?.toLocaleString() || '—'} /m²</div>
<div class="position-bar"><div class="position-marker" style="left:${Math.max(5,Math.min(95,position))}%"></div></div>
<div class="position-labels"><span>USD ${(min/1000).toFixed(0)}k (piso)</span><span>USD ${(max/1000).toFixed(0)}k (techo)</span></div>
<div class="summary-range">
<div class="summary-range-item"><div class="lbl">Mínimo</div><div class="val">USD ${min.toLocaleString()}</div></div>
<div class="summary-range-item"><div class="lbl">Valor Tasación</div><div class="val" style="color:#D4A745">USD ${value.toLocaleString()}</div></div>
<div class="summary-range-item"><div class="lbl">Máximo</div><div class="val">USD ${max.toLocaleString()}</div></div>
</div></div>
<h2><span class="sn">02</span> Descripción del Inmueble</h2>
<div class="data-grid">
<div class="data-item"><div class="label">Dirección</div><div class="value">${a.address}, ${a.neighborhood}</div></div>
<div class="data-item"><div class="label">Tipo</div><div class="value">${a.property_type === 'departamento' ? 'Departamento' : a.property_type || '—'}</div></div>
<div class="data-item"><div class="label">Superficie Total</div><div class="value">${a.size_m2 || '—'} m²</div></div>
<div class="data-item"><div class="label">Ambientes</div><div class="value">${a.rooms || '—'}</div></div>
<div class="data-item"><div class="label">Baños</div><div class="value">${pd.bathrooms || '—'}</div></div>
<div class="data-item"><div class="label">Pisos</div><div class="value">${pd.floors || '—'}</div></div>
<div class="data-item"><div class="label">Antigüedad</div><div class="value">${a.building_age ? a.building_age + ' años' : '—'}</div></div>
<div class="data-item"><div class="label">Estado</div><div class="value">${(a.condition || '—').replace(/_/g,' ')}</div></div>
<div class="data-item"><div class="label">Cochera</div><div class="value">${a.has_garage ? 'Sí (' + (pd.garage_count||1) + ')' : 'No'}</div></div>
<div class="data-item"><div class="label">Gas Natural</div><div class="value">${pd.has_gas ? 'Sí' : 'No'}</div></div>
</div></div></div>

<!-- FOTOS + COMPARABLES -->
<div class="page"><div class="content">
<div class="page-header"><div class="page-header-logo">⭐ Star Inmobiliaria</div><div class="page-header-title">${a.address} — ${a.neighborhood} | ST-2026-${shortId}</div></div>
<h2><span class="sn">03</span> Registro Fotográfico</h2>
<div class="photo-grid">${photos.length > 0 ? photos.map((url: string) => `<img src="${url}" alt="Foto" />`).join('') : '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#ccc">📸 Sin fotografías cargadas</div>'}</div>
<h2 style="margin-top:30px"><span class="sn">04</span> Análisis de Mercado</h2>
<p style="font-size:13px;color:#555;margin-bottom:16px">Se analizaron propiedades en la zona de ${a.neighborhood}, de las cuales se seleccionaron ${details.length} comparables con características similares al inmueble tasado.</p>
${details.map((det: any, idx: number) => `<div class="comp-card">
<div class="comp-header"><span class="comp-name">Comparable ${idx+1} — ${det.address || a.neighborhood}</span>
<span class="comp-score" ${det.ai_score < 6 ? 'style="background:#eab308"' : ''}>${det.ai_score || '—'}/10</span></div>
<div class="comp-details"><span><strong>USD ${det.price_usd?.toLocaleString()}</strong></span><span>${det.total_area_m2}m²</span><span>USD ${det.original_price_per_m2?.toLocaleString()}/m²</span><span>Estado: ${(det.ai_condition||'—').replace(/_/g,' ')}</span></div>
<div class="comp-notes">${(det.highlights||[]).length ? '<span class="positive">✅ '+(det.highlights||[]).join(', ')+'</span><br>' : ''}${(det.issues||[]).length ? '<span class="negative">⚠️ '+(det.issues||[]).join(', ')+'</span>' : ''}</div>
</div>`).join('')}
</div></div>

<!-- TABLA + METODOLOGÍA + CONCLUSIÓN -->
<div class="page"><div class="content">
<div class="page-header"><div class="page-header-logo">⭐ Star Inmobiliaria</div><div class="page-header-title">${a.address} — ${a.neighborhood} | ST-2026-${shortId}</div></div>
<h2><span class="sn">05</span> Tabla Comparativa</h2>
<table><thead><tr><th>Comparable</th><th>Precio</th><th>Sup.</th><th>USD/m²</th><th>Estado</th><th>Score</th></tr></thead><tbody>
${details.map((det: any, idx: number) => `<tr><td>Comp. ${idx+1}</td><td><strong>USD ${det.price_usd?.toLocaleString()}</strong></td><td>${det.total_area_m2}m²</td><td>USD ${det.original_price_per_m2?.toLocaleString()}</td><td>${(det.ai_condition||'—').replace(/_/g,' ')}</td><td>${det.ai_score||'—'}/10</td></tr>`).join('')}
<tr style="background:#faf6eb;font-weight:600"><td>📍 ${a.address}</td><td style="color:#D4A745"><strong>USD ${value.toLocaleString()}</strong></td><td>${a.size_m2}m²</td><td style="color:#D4A745">USD ${a.price_per_m2?.toLocaleString()}</td><td>${(a.condition||'—').replace(/_/g,' ')}</td><td>—</td></tr>
</tbody></table>
<h2><span class="sn">06</span> Metodología</h2>
<div class="methodology"><p><strong>Método:</strong> Comparativo directo de mercado con ajustes por condición.</p>
<p style="margin-top:8px">Se relevaron propiedades en venta en ${a.neighborhood} con características comparables. Cada comparable fue evaluado mediante inspección fotográfica asistida por inteligencia artificial para determinar su estado de conservación real.</p>
<p style="margin-top:8px">Los precios fueron normalizados y se aplicaron coeficientes de ajuste correspondientes a las características del inmueble tasado. El valor final fue posicionado dentro del rango de mercado considerando la calidad relativa del inmueble respecto a los comparables.</p></div>
<h2><span class="sn">07</span> Conclusión</h2>
<div class="conclusion"><p>En base al análisis comparativo realizado, considerando las características del inmueble ubicado en <strong>${a.address}, ${a.neighborhood}</strong>, su estado de conservación <strong>${(a.condition||'').replace(/_/g,' ')}</strong>${a.has_garage ? ', la inclusión de cochera,' : ''} y su ubicación, se determina:</p>
<div style="text-align:center;margin:20px 0"><div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:2px">Valor de Tasación</div>
<div style="font-size:36px;font-weight:800;color:#D4A745">USD ${value.toLocaleString()}</div></div>
${estimation.positioning_reasoning ? '<p style="font-size:13px;color:#555;margin-top:12px">'+estimation.positioning_reasoning+'</p>' : ''}
</div></div></div>

<!-- LEGAL + FIRMAS -->
<div class="page"><div class="content">
<div class="page-header"><div class="page-header-logo">⭐ Star Inmobiliaria</div><div class="page-header-title">${a.address} — ${a.neighborhood} | ST-2026-${shortId}</div></div>
<h2><span class="sn">08</span> Datos Legales y Firmas</h2>
<div class="data-grid">
<div class="data-item"><div class="label">Solicitante</div><div class="value">${a.client_name || '—'}</div></div>
<div class="data-item"><div class="label">Contacto</div><div class="value">${a.client_phone || '—'}</div></div>
<div class="data-item"><div class="label">Fecha de Emisión</div><div class="value">${date}</div></div>
<div class="data-item"><div class="label">Nº de Informe</div><div class="value">ST-2026-${shortId}</div></div>
<div class="data-item"><div class="label">Vigencia</div><div class="value">90 días desde emisión</div></div>
</div>
<div class="signature-line"><div class="signature-box"><div style="height:80px"></div><div class="line"></div><div class="name">Jonathan Rodríguez</div><div class="role">Tasador — Matrícula CMCPSI Nº XXXX</div></div>
<div class="signature-box"><div style="height:80px"></div><div class="line"></div><div class="name">Star Inmobiliaria</div><div class="role">Sello de la empresa</div></div></div>
<div class="disclaimer"><strong>Aviso Legal:</strong> El presente informe ha sido elaborado en base a la información proporcionada y la inspección realizada. Los valores reflejan las condiciones del mercado al momento de la tasación y pueden variar. Vigencia: 90 días corridos. La tasación sigue los lineamientos del Tribunal de Tasaciones de la Nación.</div>
<div class="footer"><span>⭐ Star Inmobiliaria — Buenos Aires, Argentina</span><span>Informe generado el ${date}</span></div>
</div></div>
</body></html>`
    }

    const openReportFullscreen = () => {
      const html = generateReportHTML()
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
    }

    const renderReportColumn = () => {
      const aiAnalysis = (selectedAppraisal as any).ai_analysis
      const hasReport = !!aiAnalysis
      return (
        <div className="flex flex-col h-full bg-white">
          <div className="flex-shrink-0 p-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white h-[60px] flex flex-col justify-center overflow-hidden">
            <h3 className="text-sm font-bold text-gray-900">📄 Informe</h3>
            <p className="text-xs text-gray-500 mt-0.5">{hasReport ? 'Vista previa disponible' : 'Pendiente de procesamiento'}</p>
          </div>
          <div className="flex-1 overflow-hidden">
            {hasReport ? (
              <iframe
                srcDoc={generateReportHTML()}
                className="w-full h-full border-0"
                title="Informe Preview"
                sandbox="allow-same-origin"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-sm text-gray-500 mb-2">Informe no disponible</p>
                <p className="text-xs text-gray-400">Procesá la tasación primero para generar el informe</p>
              </div>
            )}
          </div>
          <div className="flex-shrink-0 px-4 py-3 border-t border-gray-200 bg-white flex gap-3 h-[56px] items-center">
            {hasReport && (
              <>
                <button onClick={openReportFullscreen}
                  className="flex-1 py-2 bg-[#D4A745] text-white rounded-xl text-sm font-semibold hover:bg-[#c49a3d] transition-colors flex items-center justify-center gap-2">
                  ↗ Ver pantalla completa
                </button>
                <button onClick={() => { openReportFullscreen() }}
                  className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                  🖨️ Imprimir / PDF
                </button>
              </>
            )}
            {!hasReport && (
              <button onClick={() => setPipelinePage(1)}
                className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                ← Volver a Relevamiento
              </button>
            )}
          </div>
        </div>
      )
    }

    // Col 6: Entrega
    const renderDeliveryColumn = () => {
      const status = selectedAppraisal.status as AppraisalStatus
      const isApproved = ['approved_by_admin', 'signed', 'delivered'].includes(status)
      const isSigned = ['signed', 'delivered'].includes(status)
      const isDelivered = status === 'delivered'
      return (
        <div className="flex flex-col h-full bg-white">
          <div className="flex-shrink-0 p-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white h-[60px] flex flex-col justify-center overflow-hidden">
            <h3 className="text-sm font-bold text-gray-900">📨 Entrega</h3>
            <p className="text-xs text-gray-500 mt-0.5">{isDelivered ? 'Entregada' : isSigned ? 'Firmada' : isApproved ? 'Aprobada' : 'Pendiente'}</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Pipeline steps */}
            <div className="space-y-3">
              {[
                { label: 'Revisión admin', done: isApproved || isSigned || isDelivered, status: status === 'pending_review' ? 'current' : '' },
                { label: 'Aprobación', done: isApproved || isSigned || isDelivered, status: status === 'approved_by_admin' ? 'current' : '' },
                { label: 'Firma', done: isSigned || isDelivered, status: isSigned && !isDelivered ? 'current' : '' },
                { label: 'Entrega al cliente', done: isDelivered, status: isDelivered ? 'current' : '' },
              ].map((step, idx) => (
                <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl ${step.done ? 'bg-green-50 border border-green-200' : step.status === 'current' ? 'bg-[#D4A745]/10 border border-[#D4A745]/30' : 'bg-gray-50 border border-gray-200'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step.done ? 'bg-green-500 text-white' : step.status === 'current' ? 'bg-[#D4A745] text-white' : 'bg-gray-200 text-gray-400'}`}>
                    {step.done ? '✓' : idx + 1}
                  </div>
                  <span className={`text-sm font-medium ${step.done ? 'text-green-700' : step.status === 'current' ? 'text-[#D4A745]' : 'text-gray-400'}`}>{step.label}</span>
                </div>
              ))}
            </div>

            {/* Client info */}
            {selectedAppraisal.client_name && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-xs font-medium text-gray-400 mb-2">CLIENTE</p>
                <p className="text-sm font-medium text-gray-900">{selectedAppraisal.client_name}</p>
                {selectedAppraisal.client_phone && <p className="text-xs text-gray-500 mt-1">{selectedAppraisal.client_phone}</p>}
                {selectedAppraisal.client_email && <p className="text-xs text-gray-500">{selectedAppraisal.client_email}</p>}
              </div>
            )}
          </div>
          <div className="flex-shrink-0 px-4 py-3 border-t border-gray-200 bg-white flex gap-3 h-[56px] items-center">
            {status === 'draft' && (
              <button onClick={() => handleStatusChange(selectedAppraisal.id, 'pending_review')} className="flex-1 py-2 bg-[#D4A745] text-white rounded-xl text-sm font-semibold hover:bg-[#c49a3d] transition-colors">
                📤 Enviar a revisión
              </button>
            )}
            {status === 'pending_review' && (
              <button onClick={() => handleStatusChange(selectedAppraisal.id, 'approved_by_admin')} className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors">
                ✅ Aprobar
              </button>
            )}
            {status === 'approved_by_admin' && (
              <button onClick={() => handleStatusChange(selectedAppraisal.id, 'signed')} className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors">
                ✍️ Firmar
              </button>
            )}
            {status === 'signed' && (
              <button onClick={() => handleStatusChange(selectedAppraisal.id, 'delivered')} className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors">
                📨 Marcar entregada
              </button>
            )}
            {isDelivered && (
              <p className="flex-1 text-center text-sm font-medium text-green-600">✅ Tasación entregada</p>
            )}
          </div>
        </div>
      )
    }

    return (
      <main className="flex-1 flex flex-col overflow-hidden bg-[#F8F9FA] h-[calc(100vh-56px)] lg:h-[calc(100vh-32px)]">
        {/* Header */}
        <div className="flex-shrink-0 px-4 sm:px-6 py-3 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {selectedAppraisal && (
                <button onClick={() => { setSelectedId(null); setShowFormalForm(false) }} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700">
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <Calculator className="w-5 h-5 text-[#D4A745]" />
              <h1 className="text-lg font-bold text-gray-900">Tasaciones</h1>
            </div>
            <div className="flex items-center gap-2">
              <input type="text" placeholder="Buscar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="hidden sm:block w-48 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A745]/50" />
              <button onClick={() => setShowNewModal(true)} className="flex items-center gap-1 px-3 py-2 bg-[#D4A745] text-white rounded-lg text-sm font-medium hover:bg-[#c49a3d]">
                <Plus className="w-4 h-4" /><span className="hidden sm:inline">Nueva</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pipeline page tabs (desktop) */}
        {showCol3 && (
          <div className="flex-shrink-0 hidden lg:flex border-b border-gray-200 bg-white px-4">
            {([
              { page: 1 as const, label: '📋 Relevamiento', icon: '1' },
              { page: 2 as const, label: '📊 Tasación', icon: '2' },
            ]).map(({ page, label }) => (
              <button key={page} onClick={() => setPipelinePage(page)}
                className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${pipelinePage === page ? 'text-[#D4A745] border-[#D4A745]' : 'text-gray-400 border-transparent hover:text-gray-600'}`}>
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Mobile tabs */}
        <div className="flex-shrink-0 lg:hidden flex border-b border-gray-200 bg-white">
          {(['detail', 'action'] as const).map(tab => (
            <button key={tab} onClick={() => setMobileTab(tab)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${mobileTab === tab ? 'text-[#D4A745] border-b-2 border-[#D4A745]' : 'text-gray-500'}`}>
              {tab === 'detail' ? 'Detalle' : 'Acción'}
            </button>
          ))}
        </div>

        {/* PAGE 1: Relevamiento — detail + inspection + borrador */}
        {pipelinePage === 1 && (
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Col 1 - detail */}
          <div className={`${mobileTab === 'detail' || mobileTab === 'list' ? 'flex' : 'hidden'} lg:flex w-full lg:w-[420px] lg:min-w-[380px] flex-shrink-0 flex-col overflow-hidden`}>
            {renderColumn2()}
          </div>
          {/* Col 2 - action/preparation */}
          <div className={`${mobileTab === 'action' ? 'flex' : 'hidden'} lg:flex lg:w-[420px] lg:min-w-[380px] flex-shrink-0 flex-col min-w-0 overflow-hidden border-r border-gray-200`}>
            {renderColumn3()}
          </div>
          {/* Col 3 - draft/formal checklist */}
          {showCol3 && (
            <div className={`hidden lg:flex flex-1 flex-col min-w-0 overflow-hidden`}>
              {renderColumn4()}
            </div>
          )}
        </div>
        )}

        {/* PAGE 2: Tasación — resultado + informe + entrega */}
        {pipelinePage === 2 && (
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Col 4 - Resultado tasación */}
          <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
            {renderResultColumn()}
          </div>
          {/* Col 5 - Informe / PDF */}
          <div className="flex flex-1 flex-col min-w-0 overflow-hidden border-l border-gray-200">
            {renderReportColumn()}
          </div>
          {/* Col 6 - Entrega */}
          <div className="flex flex-1 flex-col min-w-0 overflow-hidden border-l border-gray-200">
            {renderDeliveryColumn()}
          </div>
        </div>
        )}

        {/* Schedule Visit Modal */}
        {showScheduleModal && (() => {
          const today = new Date()
          const [selYear, selMonth] = scheduleDate ? [new Date(scheduleDate).getFullYear(), new Date(scheduleDate).getMonth()] : [today.getFullYear(), today.getMonth()]
          const selectedDay = scheduleDate ? new Date(scheduleDate).toISOString().split('T')[0] : ''
          const selectedTime = scheduleDate && scheduleDate.includes('T') ? scheduleDate.split('T')[1]?.slice(0, 5) : ''
          
          const calMonth = new Date(selYear, selMonth, 1)
          const daysInMonth = new Date(selYear, selMonth + 1, 0).getDate()
          const startDay = (calMonth.getDay() + 6) % 7 // Monday-based
          const monthName = calMonth.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
          
          const timeSlots = Array.from({ length: 21 }, (_, i) => {
            const h = Math.floor(i / 2) + 9
            const m = (i % 2) * 30
            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
          })
          
          const setDay = (day: number) => {
            const d = `${selYear}-${(selMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
            setScheduleDate(selectedTime ? `${d}T${selectedTime}` : d)
          }
          const setTime = (time: string) => {
            if (selectedDay) setScheduleDate(`${selectedDay}T${time}`)
          }
          const changeMonth = (_delta: number) => {
            setScheduleDate('')
          }
          const todayStr = today.toISOString().split('T')[0]
          
          return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={() => setShowScheduleModal(false)}>
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-gray-900 mb-1">📅 Agendar Visita</h3>
              <p className="text-sm text-gray-500 mb-5">{selectedAppraisal.address || selectedAppraisal.neighborhood}</p>
              
              {/* Calendar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700 capitalize">{monthName}</span>
                  <div className="flex gap-1">
                    <button onClick={() => changeMonth(-1)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={() => changeMonth(1)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map(d => (
                    <span key={d} className="text-xs font-medium text-gray-400 py-1">{d}</span>
                  ))}
                  {Array.from({ length: startDay }, (_, i) => <span key={`e${i}`} />)}
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1
                    const dateStr = `${selYear}-${(selMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
                    const isToday = dateStr === todayStr
                    const isSelected = dateStr === selectedDay
                    const isPast = dateStr < todayStr
                    return (
                      <button key={day} onClick={() => !isPast && setDay(day)} disabled={isPast}
                        className={`text-sm py-1.5 rounded-lg transition-all ${isSelected ? 'bg-[#D4A745] text-white font-bold' : isToday ? 'bg-[#D4A745]/15 text-[#D4A745] font-semibold' : isPast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}>
                        {day}
                      </button>
                    )
                  })}
                </div>
              </div>
              
              {/* Time slots */}
              {selectedDay && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Horario</p>
                  <div className="grid grid-cols-4 gap-1.5 max-h-36 overflow-y-auto">
                    {timeSlots.map(t => (
                      <button key={t} onClick={() => setTime(t)}
                        className={`text-sm py-2 rounded-lg transition-all ${selectedTime === t ? 'bg-[#D4A745] text-white font-bold' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Visit notes */}
              {selectedDay && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">📝 Notas para la visita</p>
                  <textarea
                    id="schedule-visit-notes"
                    placeholder="Ej: llamar al portero, piso 4 sin ascensor, llevar metro láser..."
                    className="w-full p-3 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#D4A745]/30 focus:border-[#D4A745]"
                    rows={3}
                  />
                </div>
              )}

              {/* Selected summary */}
              {scheduleDate && scheduleDate.includes('T') && (
                <div className="bg-[#D4A745]/10 rounded-lg p-3 mb-4 text-center">
                  <p className="text-sm font-semibold text-[#D4A745]">
                    {new Date(scheduleDate).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })} a las {selectedTime}hs
                  </p>
                </div>
              )}
              
              <div className="flex gap-3">
                <button onClick={() => setShowScheduleModal(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium">Cancelar</button>
                <button onClick={handleScheduleVisit} disabled={!scheduleDate || !scheduleDate.includes('T')} className="flex-1 py-2.5 bg-[#D4A745] text-white rounded-lg font-medium hover:bg-[#c49a3d] disabled:opacity-50">Confirmar</button>
              </div>
            </div>
          </div>
          )
        })()}

        {/* Photo Preview */}
        {previewPhoto && (
          <div className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4" onClick={() => setPreviewPhoto(null)}>
            <img src={previewPhoto} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg" />
            <button onClick={() => setPreviewPhoto(null)} className="absolute top-4 right-4 text-white/80 hover:text-white"><XCircle className="w-8 h-8" /></button>
          </div>
        )}

        {/* New Modal - rendered below */}
        {renderNewModal()}
      </main>
    )
  }

  // ============================================================
  // RENDER: Main grid view (no selection)
  // ============================================================

  // Extracted new modal to a function so it can be used in both views
  function renderNewModal() {
    if (!showNewModal) return null
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-bold text-gray-900 mb-3">📋 Nueva Tasación</h3>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 mb-4">
            <button type="button" onClick={() => setEstimateType('express')}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${estimateType === 'express' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>
              ⚡ Express
            </button>
            <button type="button" onClick={() => setEstimateType('formal')}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${estimateType === 'formal' ? 'bg-[#D4A745] text-white shadow' : 'text-gray-600 hover:text-gray-900'}`}>
              🔍 Formal (IA)
            </button>
          </div>
          {estimateType === 'formal' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-xs text-amber-800">
              <p className="font-medium">🔍 Tasación Formal</p>
              <p className="mt-1">Analiza fotos de comparables para detectar estado real. ~15 seg.</p>
            </div>
          )}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Barrio *</label>
              <BarrioSearchSelect value={newForm.neighborhood} onChange={(v) => setNewForm(f => ({ ...f, neighborhood: v }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de propiedad</label>
              <select value={newForm.property_type} onChange={(e) => setNewForm(f => ({ ...f, property_type: e.target.value }))} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm">
                <option value="departamentos">Departamento</option>
                <option value="casas">Casa</option>
                <option value="ph">PH</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <input type="text" value={newForm.address} onChange={(e) => setNewForm(f => ({ ...f, address: e.target.value }))} placeholder="Av. Libertador 1234, 5°B" className="w-full p-2.5 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ambientes *</label>
                <input type="number" value={newForm.rooms} onChange={(e) => setNewForm(f => ({ ...f, rooms: e.target.value }))} placeholder="3" className="w-full p-2.5 border border-gray-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Antigüedad (años)</label>
                <input type="number" value={newForm.building_age} onChange={(e) => setNewForm(f => ({ ...f, building_age: e.target.value }))} placeholder="15" className="w-full p-2.5 border border-gray-200 rounded-lg text-sm" />
              </div>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-1">Superficies</p>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Cubierta m² *</label>
                <input type="number" value={newForm.covered_area_m2 || newForm.total_area_m2}
                  onChange={(e) => { const val = e.target.value; setNewForm(f => ({ ...f, covered_area_m2: val, total_area_m2: val || f.total_area_m2 })) }}
                  placeholder="65" className="w-full p-2 border border-gray-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Semi-cub. m²</label>
                <input type="number" value={newForm.semi_covered_area_m2} onChange={(e) => setNewForm(f => ({ ...f, semi_covered_area_m2: e.target.value }))} placeholder="10" className="w-full p-2 border border-gray-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Descub. m²</label>
                <input type="number" value={newForm.uncovered_area_m2} onChange={(e) => setNewForm(f => ({ ...f, uncovered_area_m2: e.target.value }))} placeholder="5" className="w-full p-2 border border-gray-200 rounded-lg text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select value={newForm.condition} onChange={(e) => setNewForm(f => ({ ...f, condition: e.target.value }))} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm">
                <option value="">Sin especificar</option>
                <option value="malo">Malo</option>
                <option value="regular">Regular</option>
                <option value="bueno">Bueno</option>
                <option value="muy_bueno">Muy bueno</option>
                <option value="a_estrenar">A estrenar</option>
                <option value="reciclado">Reciclado</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={newForm.has_garage} onChange={(e) => setNewForm(f => ({ ...f, has_garage: e.target.checked, garage_count: e.target.checked ? (f.garage_count || '1') : '' }))} className="w-4 h-4 rounded border-gray-300 text-[#D4A745] focus:ring-[#D4A745]" />
                <span className="text-sm font-medium text-gray-700">Cochera</span>
              </label>
              {newForm.has_garage && (
                <input type="number" value={newForm.garage_count} onChange={(e) => setNewForm(f => ({ ...f, garage_count: e.target.value }))} placeholder="1" min="1" max="5" className="w-16 p-2 border border-gray-200 rounded-lg text-sm" />
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Baños</label>
                <select value={newForm.bathrooms} onChange={(e) => setNewForm(f => ({ ...f, bathrooms: e.target.value }))} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm">
                  <option value="">-</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pisos/Niveles</label>
                <select value={newForm.floors} onChange={(e) => setNewForm(f => ({ ...f, floors: e.target.value }))} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm">
                  <option value="1">1 (Simple)</option><option value="2">2 (Dúplex)</option><option value="3">3 (Tríplex)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Características de la unidad</label>
              <div className="flex flex-wrap gap-2">
                {[{ key: 'has_gas', label: 'Gas natural' }, { key: 'has_private_terrace', label: 'Terraza propia' }, { key: 'has_private_garden', label: 'Espacio verde propio' }, { key: 'has_private_elevator', label: 'Ascensor privado' }].map(feat => (
                  <button key={feat.key} type="button" onClick={() => setNewForm(f => ({ ...f, [feat.key]: !(f as any)[feat.key] }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${(newForm as any)[feat.key] ? 'bg-[#D4A745] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {feat.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amenities del edificio</label>
              <div className="flex flex-wrap gap-2">
                {['Pileta', 'Gimnasio', 'SUM', 'Parrilla', 'Laundry', 'Seguridad 24hs', 'Balcón'].map(amenity => (
                  <button key={amenity} type="button" onClick={() => setNewForm(f => ({ ...f, amenities: f.amenities.includes(amenity) ? f.amenities.filter(a => a !== amenity) : [...f.amenities, amenity] }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${newForm.amenities.includes(amenity) ? 'bg-[#D4A745] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {amenity}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comparables a analizar</label>
              <select value={newForm.comparables_count} onChange={(e) => setNewForm(f => ({ ...f, comparables_count: e.target.value }))} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm">
                <option value="">Auto ({estimateType === 'formal' ? '8' : '15'})</option>
                <option value="5">5</option><option value="8">8</option><option value="10">10</option><option value="15">15</option><option value="20">20</option>
              </select>
            </div>
            <hr className="my-2" />
            <p className="text-xs text-gray-500 font-medium">Datos del cliente (opcional)</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input type="text" value={newForm.client_name} onChange={(e) => setNewForm(f => ({ ...f, client_name: e.target.value }))} placeholder="Juan Pérez" className="w-full p-2.5 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input type="tel" value={newForm.client_phone} onChange={(e) => setNewForm(f => ({ ...f, client_phone: e.target.value }))} placeholder="+54 11..." className="w-full p-2.5 border border-gray-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={newForm.client_email} onChange={(e) => setNewForm(f => ({ ...f, client_email: e.target.value }))} placeholder="juan@email.com" className="w-full p-2.5 border border-gray-200 rounded-lg text-sm" />
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowNewModal(false)} disabled={estimating} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium">Cancelar</button>
            <button onClick={handleNewEstimate} disabled={estimating || !newForm.neighborhood || !(newForm.total_area_m2 || newForm.covered_area_m2)}
              className="flex-1 py-2.5 bg-[#D4A745] text-white rounded-lg font-medium hover:bg-[#c49a3d] disabled:opacity-50 flex items-center justify-center gap-2">
              {estimating ? <><Loader2 className="w-4 h-4 animate-spin" /> Estimando...</> : <><Calculator className="w-4 h-4" /> Tasar</>}
            </button>
          </div>
          {estimating && <p className="text-xs text-center text-gray-500 mt-3">{estimateType === 'formal' ? '🔍 Analizando fotos... ~15 seg.' : 'Buscando comparables... hasta 30 seg.'}</p>}
        </div>
      </div>
    )
  }

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-[#F8F9FA]">
      {/* Header */}
      <div className="flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Calculator className="w-5 sm:w-6 h-5 sm:h-6 text-[#D4A745]" />
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Tasaciones</h1>
            <span className="hidden sm:inline bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">{appraisals.length} total</span>
          </div>
          <div className="flex items-center gap-2">
            <input type="text" placeholder="Buscar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="hidden sm:block w-48 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A745]/50" />
            <button onClick={() => setShowNewModal(true)} className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-[#D4A745] text-white rounded-lg text-sm font-medium hover:bg-[#c49a3d]">
              <Plus className="w-4 h-4" /><span className="hidden sm:inline">Nueva</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 bg-white border-b border-gray-200">
        <div className="grid grid-cols-5 gap-2 sm:gap-4">
          {KANBAN_COLUMNS.map((col) => (
            <button key={col.id} onClick={() => setFilterColumn(filterColumn === col.id ? 'todas' : col.id)}
              className={`rounded-xl p-2 sm:p-4 text-center transition-all ${filterColumn === col.id ? 'bg-[#D4A745] text-white ring-2 ring-[#D4A745] ring-offset-2' : 'bg-gray-50 hover:bg-gray-100'}`}>
              <p className="text-lg sm:text-2xl font-bold">{columnStats[col.id]}</p>
              <p className={`text-xs sm:text-sm ${filterColumn === col.id ? 'text-white/80' : 'text-gray-500'}`}>{col.icon} {col.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex-shrink-0 px-4 sm:px-6 py-2 sm:py-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Type filter */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {[{ v: 'todas' as const, l: 'Todas' }, { v: 'market_valuation' as const, l: '🌐 Web' }, { v: 'formal_appraisal' as const, l: '📋 Formal' }].map(f => (
              <button key={f.v} onClick={() => setFilterType(f.v)}
                className={`px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-colors ${filterType === f.v ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>
                {f.l}
              </button>
            ))}
          </div>

          {/* Time filter */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {[{ v: null, l: 'Todas' }, { v: 7, l: '7d' }, { v: 30, l: '30d' }, { v: 90, l: '90d' }].map(f => (
              <button key={f.v ?? 'all'} onClick={() => setFilterDays(f.v)}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${filterDays === f.v ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>
                {f.l}
              </button>
            ))}
          </div>

          {filterColumn !== 'todas' && (
            <button onClick={() => setFilterColumn('todas')} className="flex items-center gap-1 px-2 py-1 bg-[#D4A745]/10 text-[#D4A745] rounded-lg text-xs font-medium">
              {KANBAN_COLUMNS.find(c => c.id === filterColumn)?.icon} {KANBAN_COLUMNS.find(c => c.id === filterColumn)?.label}
              <XCircle className="w-3 h-3" />
            </button>
          )}
          <span className="text-xs text-gray-400 ml-auto">{filteredAppraisals.length} resultados</span>
        </div>
      </div>

      {/* Cards grid */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        {filteredAppraisals.length === 0 ? (
          <div className="text-center py-12">
            <Calculator className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No hay tasaciones con estos filtros</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredAppraisals.map((appraisal) => {
              const cardStatus = appraisal.status as AppraisalStatus
              const cardConfig = APPRAISAL_STATUS_CONFIG[cardStatus] || APPRAISAL_STATUS_CONFIG.web_estimate
              const cardPrice = formatPrice(appraisal.estimated_value_min, appraisal.estimated_value_max)
              const { score: cardScore } = calculatePropertyScore(appraisal)
              const cardScoreClass = getScoreClassification(cardScore)
              const cardIsWeb = appraisal.type === 'market_valuation'
              const photoCount = ((appraisal as any).property_data?.target_photos || []).length
              const audioCount = ((appraisal as any).property_data?.voice_notes || []).length
              const hasEvidence = photoCount > 0 || audioCount > 0

              return (
                <div key={appraisal.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => { setSelectedId(appraisal.id); setShowFormalForm(false); setMobileTab('detail') }}>
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate group-hover:text-[#D4A745] transition-colors">{appraisal.address || appraisal.neighborhood || 'Sin dirección'}</h3>
                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{appraisal.neighborhood || appraisal.city || 'CABA'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${cardIsWeb ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                          {cardIsWeb ? '🌐 Web' : '📋 Formal'}
                        </span>
                        {cardConfig.label !== 'Web' && (
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${cardConfig.bgColor} ${cardConfig.color}`}>{cardConfig.label}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span>{formatText(appraisal.property_type) || 'Propiedad'}</span>
                      <span>·</span>
                      <span>{appraisal.rooms || appraisal.ambientes || '?'} amb</span>
                      <span>·</span>
                      <span>{appraisal.size_m2 || '?'}m²</span>
                      {appraisal.condition && (<><span>·</span><span className={appraisal.condition.toLowerCase().includes('reciclar') ? 'text-orange-600 font-medium' : ''}>{formatText(appraisal.condition)}</span></>)}
                    </div>
                  </div>
                  <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
                    <div>
                      {cardPrice ? (
                        <>
                          <p className="text-lg font-bold text-[#D4A745]">{cardPrice}</p>
                          {appraisal.price_per_m2 && <p className="text-xs text-gray-500">USD {appraisal.price_per_m2.toLocaleString()}/m²</p>}
                        </>
                      ) : (
                        <p className="text-sm text-gray-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Pendiente</p>
                      )}
                    </div>
                    {cardScore > 0 && (
                      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${cardScoreClass.bgColor}`}>
                        <TrendingUp className={`w-4 h-4 ${cardScoreClass.color}`} />
                        <span className={`text-sm font-bold ${cardScoreClass.color}`}>{cardScore}</span>
                        <span className="text-base">{cardScoreClass.emoji}</span>
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"><User className="w-4 h-4 text-gray-500" /></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{appraisal.client_name || (appraisal.client_phone ? appraisal.client_phone : 'Lead anónimo')}</p>
                          <p className="text-xs text-gray-500">{getTimeAgo(appraisal.created_at)}</p>
                        </div>
                      </div>
                      {appraisal.visit_scheduled_at && (
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Visita</p>
                          <p className="text-xs font-medium text-[#D4A745]">{formatDate(appraisal.visit_scheduled_at)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  {!cardIsWeb && hasEvidence && (
                    <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-2">
                      {photoCount > 0 && <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-600">📸 {photoCount}</span>}
                      {audioCount > 0 && <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-purple-50 text-purple-600">🎤 {audioCount}</span>}
                    </div>
                  )}
                  <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-2">
                    {cardStatus === 'web_estimate' && (
                      <button onClick={(e) => { e.stopPropagation(); setSelectedId(appraisal.id); setShowScheduleModal(true) }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm text-white bg-[#D4A745] hover:bg-[#c49a3d] rounded-lg transition-colors font-medium">
                        📅 Agendar
                      </button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); alert('Historial - próximamente') }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm text-gray-600 hover:text-[#D4A745] hover:bg-[#D4A745]/5 rounded-lg transition-colors">
                      <MessageSquare className="w-4 h-4" /><span>Historial</span>
                    </button>
                    {appraisal.client_phone && (
                      <button onClick={(e) => { e.stopPropagation(); openWhatsApp(appraisal.client_phone!) }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        <Phone className="w-4 h-4" /><span>WhatsApp</span>
                      </button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); setSelectedId(appraisal.id); setMobileTab('detail') }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm text-gray-600 hover:text-[#D4A745] hover:bg-[#D4A745]/5 rounded-lg transition-colors">
                      <ArrowUpRight className="w-4 h-4" /><span>Ver más</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Schedule modal (from grid view) */}
      {showScheduleModal && selectedId && (() => {
        const sa = appraisals.find(a => a.id === selectedId)
        if (!sa) return null
        const today = new Date()
        const [selYear, selMonth] = scheduleDate ? [new Date(scheduleDate).getFullYear(), new Date(scheduleDate).getMonth()] : [today.getFullYear(), today.getMonth()]
        const selectedDay = scheduleDate ? new Date(scheduleDate).toISOString().split('T')[0] : ''
        const selectedTime = scheduleDate && scheduleDate.includes('T') ? scheduleDate.split('T')[1]?.slice(0, 5) : ''
        const calMonth = new Date(selYear, selMonth, 1)
        const daysInMonth = new Date(selYear, selMonth + 1, 0).getDate()
        const startDay = (calMonth.getDay() + 6) % 7
        const monthName = calMonth.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
        const timeSlots = Array.from({ length: 21 }, (_, i) => { const h = Math.floor(i / 2) + 9; const m = (i % 2) * 30; return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}` })
        const setDay = (day: number) => { const d = `${selYear}-${(selMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`; setScheduleDate(selectedTime ? `${d}T${selectedTime}` : d) }
        const setTime = (time: string) => { if (selectedDay) setScheduleDate(`${selectedDay}T${time}`) }
        const todayStr = today.toISOString().split('T')[0]
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={() => setShowScheduleModal(false)}>
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-gray-900 mb-1">📅 Agendar Visita</h3>
              <p className="text-sm text-gray-500 mb-5">{sa.address || sa.neighborhood}</p>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700 capitalize">{monthName}</span>
                  <div className="flex gap-1">
                    <button onClick={() => setScheduleDate('')} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"><ChevronLeft className="w-4 h-4" /></button>
                    <button onClick={() => setScheduleDate('')} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map(d => <span key={d} className="text-xs font-medium text-gray-400 py-1">{d}</span>)}
                  {Array.from({ length: startDay }, (_, i) => <span key={`e${i}`} />)}
                  {Array.from({ length: daysInMonth }, (_, i) => { const day = i + 1; const dateStr = `${selYear}-${(selMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`; const isToday = dateStr === todayStr; const isSelected = dateStr === selectedDay; const isPast = dateStr < todayStr; return (<button key={day} onClick={() => !isPast && setDay(day)} disabled={isPast} className={`text-sm py-1.5 rounded-lg transition-all ${isSelected ? 'bg-[#D4A745] text-white font-bold' : isToday ? 'bg-[#D4A745]/15 text-[#D4A745] font-semibold' : isPast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}>{day}</button>) })}
                </div>
              </div>
              {selectedDay && (<div className="mb-4"><p className="text-sm font-semibold text-gray-700 mb-2">Horario</p><div className="grid grid-cols-4 gap-1.5 max-h-36 overflow-y-auto">{timeSlots.map(t => <button key={t} onClick={() => setTime(t)} className={`text-sm py-2 rounded-lg transition-all ${selectedTime === t ? 'bg-[#D4A745] text-white font-bold' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>{t}</button>)}</div></div>)}
              {scheduleDate && scheduleDate.includes('T') && (<div className="bg-[#D4A745]/10 rounded-lg p-3 mb-4 text-center"><p className="text-sm font-semibold text-[#D4A745]">{new Date(scheduleDate).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })} a las {selectedTime}hs</p></div>)}
              <div className="flex gap-3">
                <button onClick={() => setShowScheduleModal(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium">Cancelar</button>
                <button onClick={handleScheduleVisit} disabled={!scheduleDate || !scheduleDate.includes('T')} className="flex-1 py-2.5 bg-[#D4A745] text-white rounded-lg font-medium hover:bg-[#c49a3d] disabled:opacity-50">Confirmar</button>
              </div>
            </div>
          </div>
        )
      })()}

      {renderNewModal()}
    </main>
  )
}
