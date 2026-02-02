import { useState } from 'react'
import { Settings, User, Bot, Link2, Bell, Users, Building, Check, ChevronRight, Shield, Palette, Mail, MessageCircle, Instagram, Facebook, Type, Volume2, VolumeX, Play, Lock } from 'lucide-react'
import { usePreferences } from '../contexts/PreferencesContext'
import { useNotifications } from '../hooks/useNotifications'

type Tab = 'perfil' | 'agentes' | 'integraciones' | 'notificaciones' | 'equipo' | 'empresa'

interface TeamMember {
  id: string
  name: string
  email: string
  role: 'admin' | 'vendedor' | 'viewer'
  avatar: string
  active: boolean
}

const TEAM_MEMBERS: TeamMember[] = [
  { id: '1', name: 'Jony Martinez', email: 'jony@starinmobiliaria.com', role: 'admin', avatar: 'https://picsum.photos/40/40?random=100', active: true },
  { id: '2', name: 'Matias', email: 'matias@aidaptive.com', role: 'admin', avatar: 'https://picsum.photos/40/40?random=101', active: true },
]

const TABS: { id: Tab; label: string; shortLabel: string; icon: React.ElementType }[] = [
  { id: 'perfil', label: 'Mi perfil', shortLabel: 'Perfil', icon: User },
  { id: 'agentes', label: 'Agentes IA', shortLabel: 'Agentes', icon: Bot },
  { id: 'integraciones', label: 'Integraciones', shortLabel: 'Integ.', icon: Link2 },
  { id: 'notificaciones', label: 'Notificaciones', shortLabel: 'Notif.', icon: Bell },
  { id: 'equipo', label: 'Equipo', shortLabel: 'Equipo', icon: Users },
  { id: 'empresa', label: 'Empresa', shortLabel: 'Empresa', icon: Building },
]

const FONT_SIZES = [
  { id: 'small', label: 'Pequeño', preview: 'Aa', size: 'text-xs' },
  { id: 'normal', label: 'Normal', preview: 'Aa', size: 'text-sm' },
  { id: 'large', label: 'Grande', preview: 'Aa', size: 'text-base' },
] as const

export const Configuracion = () => {
  const { fontSize, setFontSize } = usePreferences()
  const { soundEnabled, toggleSound, testSound, browserNotificationsEnabled } = useNotifications()
  const [activeTab, setActiveTab] = useState<Tab>('perfil')
  const [agentSettings, setAgentSettings] = useState({
    emprendimientos: { active: true, autoReply: true, workingHours: true },
    inmuebles: { active: true, autoReply: true, workingHours: false },
    tasaciones: { active: true, autoReply: false, workingHours: true },
  })
  const [notifications, setNotifications] = useState({
    newLead: true,
    leadQualified: true,
    handoff: true,
    dailyReport: false,
    weeklyReport: true,
    emailNotif: true,
    pushNotif: true,
    whatsappNotif: false,
  })

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-[#F8F9FA]">
      {/* Header */}
      <div className="flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2 sm:gap-3">
          <Settings className="w-5 sm:w-6 h-5 sm:h-6 text-[#D4A745]" />
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">Configuración</h1>
        </div>
      </div>

      {/* Mobile Tabs - Horizontal scroll */}
      <div className="lg:hidden flex-shrink-0 bg-white border-b border-gray-200 overflow-x-auto">
        <div className="flex px-2 py-2 gap-1 min-w-max">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#D4A745]/10 text-[#D4A745]'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-[#D4A745]' : 'text-gray-400'}`} />
              {tab.shortLabel}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar Tabs */}
        <div className="hidden lg:block w-56 bg-white border-r border-gray-100 p-4 flex-shrink-0">
          <nav className="space-y-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#D4A745]/10 text-[#D4A745]'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-[#D4A745]' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          {/* Perfil */}
          {activeTab === 'perfil' && (
            <div className="max-w-2xl">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Mi perfil</h2>
              
              <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-[#D4A745] flex items-center justify-center text-white text-xl sm:text-2xl font-bold border-2 border-[#D4A745]/20">
                    JM
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Jony Martinez</h3>
                    <p className="text-xs sm:text-sm text-gray-500">Administrador</p>
                    <button className="mt-1 sm:mt-2 text-xs sm:text-sm text-[#D4A745] font-medium hover:underline">
                      Cambiar foto
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input
                      type="text"
                      defaultValue="Jony"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50 focus:border-[#D4A745]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Apellido</label>
                    <input
                      type="text"
                      defaultValue="Martinez"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50 focus:border-[#D4A745]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      defaultValue="jony@starinmobiliaria.com"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50 focus:border-[#D4A745]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input
                      type="tel"
                      defaultValue="+54 9 11 6214-8113"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50 focus:border-[#D4A745]"
                    />
                  </div>
                </div>
              </div>

              {/* Accesibilidad - Tamaño de fuente */}
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
                          size.id === 'small' ? 'text-sm' : 
                          size.id === 'normal' ? 'text-lg' : 
                          'text-2xl'
                        }`}>
                          {size.preview}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">{size.label}</span>
                        {fontSize === size.id && (
                          <span className="w-2 h-2 rounded-full bg-[#D4A745]" />
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-gray-400">Los cambios se aplican automáticamente en todo el dashboard</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6 opacity-60">
                <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center justify-between text-sm sm:text-base">
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-400" />
                    Seguridad
                  </span>
                  <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded">
                    <Lock className="w-3 h-3" />
                    Próximamente
                  </span>
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  <button disabled className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-not-allowed">
                    <span className="text-xs sm:text-sm font-medium text-gray-400">Cambiar contraseña</span>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </button>
                  <button disabled className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-not-allowed">
                    <span className="text-xs sm:text-sm font-medium text-gray-400">Autenticación 2FA</span>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </button>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 flex justify-end">
                <button className="px-4 py-2 bg-[#D4A745] text-white rounded-lg text-sm font-medium hover:bg-[#c49a3d]">
                  Guardar
                </button>
              </div>
            </div>
          )}

          {/* Agentes IA */}
          {activeTab === 'agentes' && (
            <div className="max-w-3xl">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Configuración de Agentes IA</h2>
              
              {/* Agente Emprendimientos - Activo */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Bot className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Agente Emprendimientos</h3>
                        <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                          <Check className="w-3 h-3" />
                          Activo
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500">Califica leads de proyectos nuevos via WhatsApp</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agentSettings.emprendimientos.active}
                      onChange={(e) => setAgentSettings(prev => ({
                        ...prev,
                        emprendimientos: { ...prev.emprendimientos, active: e.target.checked }
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4A745]"></div>
                  </label>
                </div>
                
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Respuesta automática</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agentSettings.emprendimientos.autoReply}
                        onChange={(e) => setAgentSettings(prev => ({
                          ...prev,
                          emprendimientos: { ...prev.emprendimientos, autoReply: e.target.checked }
                        }))}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Solo en horario laboral</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agentSettings.emprendimientos.workingHours}
                        onChange={(e) => setAgentSettings(prev => ({
                          ...prev,
                          emprendimientos: { ...prev.emprendimientos, workingHours: e.target.checked }
                        }))}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Agentes Próximamente */}
              <div className="space-y-3 mb-4">
                {[
                  { name: 'Agente Inmuebles', desc: 'Atiende consultas de propiedades usadas', color: 'purple' },
                  { name: 'Agente Tasaciones', desc: 'Recopila datos para tasaciones', color: 'amber' },
                ].map((agent) => (
                  <div key={agent.name} className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 opacity-60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center`}>
                          <Bot className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-500 text-sm sm:text-base">{agent.name}</h3>
                            <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-medium">
                              <Lock className="w-3 h-3" />
                              Próximamente
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-400">{agent.desc}</p>
                        </div>
                      </div>
                      <div className="w-11 h-6 bg-gray-100 rounded-full relative">
                        <div className="absolute top-[2px] left-[2px] bg-white border-gray-200 border rounded-full h-5 w-5"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Horario laboral */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
                <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Horario laboral</h3>
                <p className="text-xs text-gray-400 mb-3">El agente solo responderá automáticamente dentro de este horario</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Inicio</label>
                    <input
                      type="time"
                      defaultValue="09:00"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Fin</label>
                    <input
                      type="time"
                      defaultValue="18:00"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Integraciones */}
          {activeTab === 'integraciones' && (
            <div className="max-w-3xl">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Integraciones</h2>
              
              <div className="space-y-3 sm:space-y-4">
                {[
                  { name: 'WhatsApp Business', icon: MessageCircle, connected: true, color: 'emerald', account: '+54 9 11 3556-5132' },
                  { name: 'Instagram', icon: Instagram, connected: false, color: 'pink', account: null },
                  { name: 'Facebook', icon: Facebook, connected: false, color: 'blue', account: null },
                  { name: 'Email (SMTP)', icon: Mail, connected: false, color: 'gray', account: null },
                ].map((integration) => (
                  <div key={integration.name} className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <div className={`w-8 sm:w-10 h-8 sm:h-10 bg-${integration.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <integration.icon className={`w-4 sm:w-5 h-4 sm:h-5 text-${integration.color}-600`} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{integration.name}</h3>
                          {integration.connected ? (
                            <p className="text-xs sm:text-sm text-gray-500 truncate">{integration.account}</p>
                          ) : (
                            <p className="text-xs sm:text-sm text-gray-400">No conectado</p>
                          )}
                        </div>
                      </div>
                      {integration.connected ? (
                        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                          <span className="hidden sm:flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                            <Check className="w-3 h-3" />
                            Conectado
                          </span>
                          <Check className="sm:hidden w-5 h-5 text-emerald-600" />
                          <button className="text-xs sm:text-sm text-gray-500 hover:text-gray-700">Config</button>
                        </div>
                      ) : (
                        <button className="px-3 sm:px-4 py-2 bg-[#D4A745] text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-[#c49a3d] flex-shrink-0">
                          Conectar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 sm:mt-6 bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
                <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">API Key</h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">Usa esta clave para integrar con servicios externos</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    readOnly
                    value="sk_live_••••••••••••••••••••••••"
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600"
                  />
                  <div className="flex gap-2">
                    <button className="flex-1 sm:flex-none px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                      Copiar
                    </button>
                    <button className="flex-1 sm:flex-none px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                      Regen.
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notificaciones */}
          {activeTab === 'notificaciones' && (
            <div className="max-w-2xl">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Notificaciones</h2>
              
              {/* Sonido */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 mb-4 sm:mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base flex items-center gap-2">
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-500" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
                  Sonido
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs sm:text-sm text-gray-700 font-medium">Sonido de notificaciones</span>
                      <p className="text-xs text-gray-400 mt-0.5">Reproduce un sonido cuando llega un mensaje nuevo</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={soundEnabled}
                        onChange={toggleSound}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                  <button
                    onClick={testSound}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    Probar sonido
                  </button>
                </div>
              </div>

              {/* Permisos del navegador */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 mb-4 sm:mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base flex items-center gap-2">
                  <Bell className="w-4 h-4 text-gray-400" />
                  Notificaciones del navegador
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs sm:text-sm text-gray-700 font-medium">Push notifications</span>
                    <p className="text-xs text-gray-400 mt-0.5">Muestra notificaciones aunque la pestaña esté minimizada</p>
                  </div>
                  {browserNotificationsEnabled ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded font-medium">
                      <Check className="w-3 h-3" />
                      Activado
                    </span>
                  ) : (
                    <button
                      onClick={() => window.Notification?.requestPermission()}
                      className="px-3 py-1.5 bg-[#D4A745] text-white rounded-lg text-xs font-medium hover:bg-[#c49a3d]"
                    >
                      Activar
                    </button>
                  )}
                </div>
              </div>

              {/* Eventos */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 mb-4 sm:mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Eventos</h3>
                <div className="space-y-3 sm:space-y-4">
                  {[
                    { key: 'newLead', label: 'Nuevo lead recibido', desc: 'Cuando un contacto nuevo escribe' },
                    { key: 'leadQualified', label: 'Lead calificado (score alto)', desc: 'Cuando el score supera 80' },
                    { key: 'handoff', label: 'Derivación a humano', desc: 'Cuando el agente escala la conversación' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-1">
                      <div>
                        <span className="text-xs sm:text-sm text-gray-700 font-medium">{item.label}</span>
                        <p className="text-xs text-gray-400">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications[item.key as keyof typeof notifications]}
                          onChange={(e) => setNotifications(prev => ({ ...prev, [item.key]: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#D4A745]"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reportes - Próximamente */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 opacity-60">
                <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base flex items-center justify-between">
                  <span>Reportes automáticos</span>
                  <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded">
                    <Lock className="w-3 h-3" />
                    Próximamente
                  </span>
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {[
                    { key: 'dailyReport', label: 'Reporte diario' },
                    { key: 'weeklyReport', label: 'Reporte semanal' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-1">
                      <span className="text-xs sm:text-sm text-gray-400">{item.label}</span>
                      <label className="relative inline-flex items-center cursor-not-allowed">
                        <input
                          type="checkbox"
                          disabled
                          checked={false}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-100 rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-200 after:border after:rounded-full after:h-4 after:w-4"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Equipo */}
          {activeTab === 'equipo' && (
            <div className="max-w-3xl">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Equipo</h2>
                <button className="px-3 sm:px-4 py-2 bg-[#D4A745] text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-[#c49a3d]">
                  + Invitar
                </button>
              </div>
              
              {/* Desktop Table */}
              <div className="hidden sm:block bg-white rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 sm:px-5 py-3">Usuario</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 sm:px-5 py-3">Rol</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 sm:px-5 py-3">Estado</th>
                      <th className="text-right text-xs font-semibold text-gray-500 uppercase px-4 sm:px-5 py-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {TEAM_MEMBERS.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-4 sm:px-5 py-3 sm:py-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <img src={member.avatar} alt={member.name} className="w-8 sm:w-9 h-8 sm:h-9 rounded-full object-cover" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                              <p className="text-xs text-gray-500 truncate">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-5 py-3 sm:py-4">
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            member.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                            member.role === 'vendedor' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {member.role === 'admin' ? 'Admin' : member.role === 'vendedor' ? 'Vendedor' : 'Viewer'}
                          </span>
                        </td>
                        <td className="px-4 sm:px-5 py-3 sm:py-4">
                          <span className={`flex items-center gap-1.5 text-xs ${
                            member.active ? 'text-emerald-600' : 'text-gray-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${member.active ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                            {member.active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-4 sm:px-5 py-3 sm:py-4 text-right">
                          <button className="text-sm text-gray-500 hover:text-gray-700">Editar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden space-y-3">
                {TEAM_MEMBERS.map((member) => (
                  <div key={member.id} className="bg-white rounded-xl border border-gray-100 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                          <p className="text-xs text-gray-500 truncate">{member.email}</p>
                        </div>
                      </div>
                      <button className="text-xs text-gray-500 hover:text-gray-700 flex-shrink-0">Editar</button>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        member.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        member.role === 'vendedor' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {member.role === 'admin' ? 'Admin' : member.role === 'vendedor' ? 'Vendedor' : 'Viewer'}
                      </span>
                      <span className={`flex items-center gap-1.5 text-xs ${
                        member.active ? 'text-emerald-600' : 'text-gray-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${member.active ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                        {member.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empresa */}
          {activeTab === 'empresa' && (
            <div className="max-w-2xl">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Datos de la empresa</h2>
              
              <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="w-12 sm:w-16 h-12 sm:h-16 bg-[#D4A745] rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg sm:text-xl">★</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Star Inmobiliaria</h3>
                    <p className="text-xs sm:text-sm text-gray-500">Desarrolladora inmobiliaria</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Nombre de la empresa</label>
                    <input
                      type="text"
                      defaultValue="Star Inmobiliaria"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email general</label>
                    <input
                      type="email"
                      defaultValue="info@starinmobiliaria.com"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input
                      type="tel"
                      defaultValue="+54 9 11 3556-5132"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Dirección</label>
                    <input
                      type="text"
                      defaultValue="Buenos Aires, Argentina"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6">
                <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                  <Palette className="w-4 h-4 text-gray-400" />
                  Personalización
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Color principal</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        defaultValue="#D4A745"
                        className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
                      />
                      <input
                        type="text"
                        defaultValue="#D4A745"
                        className="w-28 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Idioma</label>
                    <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50">
                      <option>Español (Argentina)</option>
                      <option>Español (España)</option>
                      <option>English</option>
                      <option>Português</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Zona horaria</label>
                    <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50">
                      <option>America/Buenos_Aires (GMT-3)</option>
                      <option>America/Montevideo (GMT-3)</option>
                      <option>America/Santiago (GMT-3)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 flex justify-end">
                <button className="px-4 py-2 bg-[#D4A745] text-white rounded-lg text-sm font-medium hover:bg-[#c49a3d]">
                  Guardar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
