import { useState, useEffect } from 'react'
import { Type, Loader2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { usePreferences } from '../../contexts/PreferencesContext'
import { supabase } from '../../lib/supabase'
import { ChangePasswordSection } from './ChangePassword'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

const FONT_SIZES = [
  { id: 'small', label: 'Pequeño', preview: 'Aa', size: 'text-xs' },
  { id: 'normal', label: 'Normal', preview: 'Aa', size: 'text-sm' },
  { id: 'large', label: 'Grande', preview: 'Aa', size: 'text-base' },
] as const

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  agent: 'Agente',
  viewer: 'Visor',
}

export const MyProfile = () => {
  const { profile, session, user } = useAuth()
  const isAdmin = profile?.role === 'admin'
  const { fontSize, setFontSize } = usePreferences()
  
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
  })
  const [email, setEmail] = useState('')
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        phone: (profile as any).phone || '',
      })
    }
    if (user) {
      setEmail(user.email || '')
    }
    setDirty(false)
  }, [profile, user])

  const handleChange = (field: string, value: string) => {
    if (field === 'email') {
      setEmail(value)
    } else {
      setForm(prev => ({ ...prev, [field]: value }))
    }
    setDirty(true)
  }

  const handleSave = async () => {
    if (!profile || !session) return
    setSaving(true)
    setMessage(null)

    try {
      // Update profiles table
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?id=eq.${profile.id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            full_name: form.full_name,
            phone: form.phone,
            updated_at: new Date().toISOString(),
          }),
        }
      )
      if (!res.ok) throw new Error('Error al guardar perfil')

      // Update email in auth if admin changed it
      if (isAdmin && email !== user?.email && email.trim() && supabase) {
        const { error } = await supabase.auth.updateUser({ email: email.trim() })
        if (error) throw new Error(error.message)
        setMessage({ type: 'success', text: 'Perfil guardado. Revisá tu nuevo email para confirmar el cambio.' })
        setDirty(false)
        setSaving(false)
        return
      }

      setMessage({ type: 'success', text: 'Perfil actualizado' })
      setDirty(false)
    } catch (err: unknown) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error al guardar' })
    } finally {
      setSaving(false)
    }
  }

  const getInitials = () => {
    const parts = form.full_name.trim().split(' ')
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return form.full_name.slice(0, 2).toUpperCase() || '??'
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Mi perfil</h2>

      {/* Profile Info */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
        {message && (
          <div className={`mb-4 px-3 py-2 rounded-lg text-xs ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-[#D4A745] flex items-center justify-center text-white text-xl sm:text-2xl font-bold border-2 border-[#D4A745]/20">
            {getInitials()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{form.full_name}</h3>
            <p className="text-xs sm:text-sm text-gray-500">{ROLE_LABELS[profile?.role || ''] || 'Sin rol'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => handleChange('full_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50 focus:border-[#D4A745]"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email</label>
            {isAdmin ? (
              <>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50 focus:border-[#D4A745]"
                />
                <p className="text-[10px] text-gray-400 mt-1">Se enviará un email de confirmación al nuevo correo</p>
              </>
            ) : (
              <>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="text-[10px] text-gray-400 mt-1">Contactá al administrador para cambiar el email</p>
              </>
            )}
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+54 9 11 ..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50 focus:border-[#D4A745]"
            />
          </div>
        </div>
      </div>

      {/* Accessibility */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
        <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
          <Type className="w-4 h-4 text-gray-400" />
          Accesibilidad
        </h3>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-3">Tamaño de texto</label>
          <div className="flex gap-2">
            {FONT_SIZES.map((size) => (
              <button
                key={size.id}
                onClick={() => setFontSize(size.id)}
                className={`flex-1 flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl border-2 transition-all ${
                  fontSize === size.id
                    ? 'border-[#D4A745] bg-[#D4A745]/5'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <span className={`font-bold text-gray-700 ${
                  size.id === 'small' ? 'text-sm' : size.id === 'normal' ? 'text-lg' : 'text-2xl'
                }`}>
                  {size.preview}
                </span>
                <span className="text-xs text-gray-500 font-medium">{size.label}</span>
                {fontSize === size.id && <span className="w-2 h-2 rounded-full bg-[#D4A745]" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Change Password */}
      <ChangePasswordSection />

      {/* Save */}
      <div className="mt-4 sm:mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || !dirty}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
            dirty
              ? 'bg-[#D4A745] text-white hover:bg-[#c49a3d]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  )
}
