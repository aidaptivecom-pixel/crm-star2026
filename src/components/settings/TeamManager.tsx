import { useState, useEffect } from 'react'
import { Users, Shield, Pencil, Trash2, Plus, Eye, EyeOff, Loader2, Check, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

interface Profile {
  id: string
  full_name: string
  role: 'admin' | 'agent' | 'viewer'
  avatar_url: string | null
  created_at: string
  email?: string
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  agent: 'Agente',
  viewer: 'Visor',
}

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-50 text-purple-700',
  agent: 'bg-blue-50 text-blue-700',
  viewer: 'bg-gray-50 text-gray-600',
}

export const TeamManager = () => {
  const { profile: currentProfile } = useAuth()
  const isAdmin = currentProfile?.role === 'admin'

  const [members, setMembers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ full_name: '', role: 'agent' as string, newPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteForm, setInviteForm] = useState({ email: '', full_name: '', role: 'agent', password: '' })
  const [inviting, setInviting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchMembers = async () => {
    if (!supabase) return
    setLoading(true)
    
    // Get profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (profiles) {
      // Get emails from auth admin (via edge function or service role)
      // For now we fetch from the session if available
      setMembers(profiles as Profile[])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  const handleEdit = (member: Profile) => {
    setEditingId(member.id)
    setEditForm({ full_name: member.full_name, role: member.role, newPassword: '' })
    setShowPassword(false)
  }

  const handleSave = async () => {
    if (!editingId || !isAdmin) return
    setSaving(true)
    setMessage(null)

    try {
      // Update profile
      if (supabase) {
        const { error } = await supabase
          .from('profiles')
          .update({ full_name: editForm.full_name, role: editForm.role })
          .eq('id', editingId)
        
        if (error) throw new Error(error.message)
      }

      // Update password if provided (requires service role - call via API)
      if (editForm.newPassword.trim()) {
        const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
        const SUPABASE_SERVICE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_KEY
        
        if (SUPABASE_SERVICE_KEY) {
          const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${editingId}`, {
            method: 'PUT',
            headers: {
              'apikey': SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password: editForm.newPassword }),
          })
          if (!res.ok) throw new Error('Error al cambiar contraseña')
        } else {
          throw new Error('Se necesita VITE_SUPABASE_SERVICE_KEY para cambiar contraseñas')
        }
      }

      setMessage({ type: 'success', text: 'Usuario actualizado' })
      setEditingId(null)
      fetchMembers()
    } catch (err: unknown) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error al guardar' })
    } finally {
      setSaving(false)
    }
  }

  const handleInvite = async () => {
    if (!isAdmin) return
    setInviting(true)
    setMessage(null)

    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
      const SUPABASE_SERVICE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_KEY

      if (!SUPABASE_SERVICE_KEY) {
        throw new Error('Se necesita VITE_SUPABASE_SERVICE_KEY para crear usuarios')
      }

      // Create auth user
      const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: inviteForm.email,
          password: inviteForm.password,
          email_confirm: true,
          user_metadata: { full_name: inviteForm.full_name },
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.msg || data.message || 'Error al crear usuario')
      }

      const user = await res.json()

      // Update role in profile (trigger creates it as 'agent')
      if (supabase && inviteForm.role !== 'agent') {
        await supabase
          .from('profiles')
          .update({ role: inviteForm.role })
          .eq('id', user.id)
      }

      setMessage({ type: 'success', text: `Usuario ${inviteForm.full_name} creado` })
      setShowInvite(false)
      setInviteForm({ email: '', full_name: '', role: 'agent', password: '' })
      fetchMembers()
    } catch (err: unknown) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error al invitar' })
    } finally {
      setInviting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!isAdmin || id === currentProfile?.id) return
    if (!confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.')) return

    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
      const SUPABASE_SERVICE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_KEY

      if (!SUPABASE_SERVICE_KEY) throw new Error('Se necesita VITE_SUPABASE_SERVICE_KEY')

      const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      })

      if (!res.ok) throw new Error('Error al eliminar')
      
      setMessage({ type: 'success', text: 'Usuario eliminado' })
      fetchMembers()
    } catch (err: unknown) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error al eliminar' })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">Equipo</h2>
        {isAdmin && (
          <button
            onClick={() => setShowInvite(!showInvite)}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-[#D4A745] text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-[#c49a3d]"
          >
            <Plus className="w-4 h-4" />
            Nuevo usuario
          </button>
        )}
      </div>

      {/* Messages */}
      {message && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm flex items-center justify-between ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Invite Form */}
      {showInvite && isAdmin && (
        <div className="bg-white rounded-xl border border-[#D4A745]/30 p-4 sm:p-5 mb-4">
          <h3 className="font-semibold text-gray-900 mb-4 text-sm">Nuevo usuario</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                value={inviteForm.full_name}
                onChange={(e) => setInviteForm(p => ({ ...p, full_name: e.target.value }))}
                placeholder="Nombre completo"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm(p => ({ ...p, email: e.target.value }))}
                placeholder="email@ejemplo.com"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="text"
                value={inviteForm.password}
                onChange={(e) => setInviteForm(p => ({ ...p, password: e.target.value }))}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Rol</label>
              <select
                value={inviteForm.role}
                onChange={(e) => setInviteForm(p => ({ ...p, role: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50"
              >
                <option value="agent">Agente</option>
                <option value="admin">Administrador</option>
                <option value="viewer">Visor</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setShowInvite(false)}
              className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              onClick={handleInvite}
              disabled={inviting || !inviteForm.email || !inviteForm.full_name || !inviteForm.password}
              className="flex items-center gap-2 px-4 py-2 bg-[#D4A745] text-white rounded-lg text-sm font-medium hover:bg-[#c49a3d] disabled:opacity-50"
            >
              {inviting && <Loader2 className="w-4 h-4 animate-spin" />}
              Crear usuario
            </button>
          </div>
        </div>
      )}

      {/* Members List */}
      <div className="space-y-3">
        {members.map((member) => (
          <div key={member.id} className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
            {editingId === member.id ? (
              /* Edit Mode */
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nombre</label>
                    <input
                      type="text"
                      value={editForm.full_name}
                      onChange={(e) => setEditForm(p => ({ ...p, full_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Rol</label>
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm(p => ({ ...p, role: e.target.value }))}
                      disabled={member.id === currentProfile?.id}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50 disabled:opacity-50"
                    >
                      <option value="agent">Agente</option>
                      <option value="admin">Administrador</option>
                      <option value="viewer">Visor</option>
                    </select>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nueva contraseña (dejar vacío para no cambiar)</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={editForm.newPassword}
                      onChange={(e) => setEditForm(p => ({ ...p, newPassword: e.target.value }))}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-[#D4A745] text-white rounded-lg text-sm font-medium hover:bg-[#c49a3d] disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Guardar
                  </button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#D4A745] flex items-center justify-center text-white text-sm font-bold">
                    {member.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 text-sm">{member.full_name}</span>
                      {member.id === currentProfile?.id && (
                        <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Tú</span>
                      )}
                    </div>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded mt-0.5 ${ROLE_COLORS[member.role]}`}>
                      <Shield className="w-3 h-3" />
                      {ROLE_LABELS[member.role]}
                    </span>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(member)}
                      className="p-2 text-gray-400 hover:text-[#D4A745] hover:bg-gray-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    {member.id !== currentProfile?.id && (
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {!isAdmin && (
        <p className="mt-4 text-xs text-gray-400 text-center">
          Solo los administradores pueden gestionar el equipo
        </p>
      )}
    </div>
  )
}
