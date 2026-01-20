import { useState } from 'react'
import { Settings, User, Bot, Link2, Bell, Users, Building, Check, ChevronRight, Shield, Palette, Mail, Phone, MessageCircle, Instagram, Facebook } from 'lucide-react'

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
  { id: '1', name: 'Jonathan Martinez', email: 'jonathan@star.com', role: 'admin', avatar: 'https://picsum.photos/40/40?random=100', active: true },
  { id: '2', name: 'María García', email: 'maria@star.com', role: 'vendedor', avatar: 'https://picsum.photos/40/40?random=101', active: true },
  { id: '3', name: 'Carlos López', email: 'carlos@star.com', role: 'vendedor', avatar: 'https://picsum.photos/40/40?random=102', active: true },
  { id: '4', name: 'Ana Rodríguez', email: 'ana@star.com', role: 'viewer', avatar: 'https://picsum.photos/40/40?random=103', active: false },
]

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'perfil', label: 'Mi perfil', icon: User },
  { id: 'agentes', label: 'Agentes IA', icon: Bot },
  { id: 'integraciones', label: 'Integraciones', icon: Link2 },
  { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
  { id: 'equipo', label: 'Equipo', icon: Users },
  { id: 'empresa', label: 'Empresa', icon: Building },
]

export const Configuracion = () => {
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
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-[#D4A745]" />
          <h1 className="text-xl font-bold text-gray-900">Configuración</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Tabs */}
        <div className="w-56 bg-white border-r border-gray-100 p-4">
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
        <div className="flex-1 overflow-auto p-6">
          {/* Perfil */}
          {activeTab === 'perfil' && (
            <div className="max-w-2xl">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Mi perfil</h2>
              
              <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src="https://picsum.photos/80/80?random=100"
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-100"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">Jonathan Martinez</h3>
                    <p className="text-sm text-gray-500">Administrador</p>
                    <button className="mt-2 text-sm text-[#D4A745] font-medium hover:underline">
                      Cambiar foto
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input
                      type="text"
                      defaultValue="Jonathan"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50 focus:border-[#D4A745]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                    <input
                      type="text"
                      defaultValue="Martinez"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50 focus:border-[#D4A745]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      defaultValue="jonathan@star.com"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50 focus:border-[#D4A745]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input
                      type="tel"
                      defaultValue="+54 11 5555-1234"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50 focus:border-[#D4A745]"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-400" />
                  Seguridad
                </h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="text-sm font-medium text-gray-700">Cambiar contraseña</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="text-sm font-medium text-gray-700">Autenticación de dos factores</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button className="px-4 py-2 bg-[#D4A745] text-white rounded-lg text-sm font-medium hover:bg-[#c49a3d]">
                  Guardar cambios
                </button>
              </div>
            </div>
          )}

          {/* Agentes IA */}
          {activeTab === 'agentes' && (
            <div className="max-w-3xl">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Configuración de Agentes IA</h2>
              
              <div className="space-y-4">
                {[
                  { id: 'emprendimientos', name: 'Agente Emprendimientos', color: 'blue', desc: 'Califica leads de proyectos nuevos' },
                  { id: 'inmuebles', name: 'Agente Inmuebles', color: 'purple', desc: 'Atiende consultas de propiedades usadas' },
                  { id: 'tasaciones', name: 'Agente Tasaciones', color: 'amber', desc: 'Recopila datos para tasaciones' },
                ].map((agent) => (
                  <div key={agent.id} className="bg-white rounded-xl border border-gray-100 p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-${agent.color}-100 rounded-lg flex items-center justify-center`}>
                          <Bot className={`w-5 h-5 text-${agent.color}-600`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                          <p className="text-sm text-gray-500">{agent.desc}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agentSettings[agent.id as keyof typeof agentSettings].active}
                          onChange={(e) => setAgentSettings(prev => ({
                            ...prev,
                            [agent.id]: { ...prev[agent.id as keyof typeof prev], active: e.target.checked }
                          }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4A745]"></div>
                      </label>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Respuesta automática</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={agentSettings[agent.id as keyof typeof agentSettings].autoReply}
                            onChange={(e) => setAgentSettings(prev => ({
                              ...prev,
                              [agent.id]: { ...prev[agent.id as keyof typeof prev], autoReply: e.target.checked }
                            }))}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Solo horario laboral</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={agentSettings[agent.id as keyof typeof agentSettings].workingHours}
                            onChange={(e) => setAgentSettings(prev => ({
                              ...prev,
                              [agent.id]: { ...prev[agent.id as keyof typeof prev], workingHours: e.target.checked }
                            }))}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Horario laboral</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Inicio</label>
                    <input
                      type="time"
                      defaultValue="09:00"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fin</label>
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
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Integraciones</h2>
              
              <div className="space-y-4">
                {[
                  { name: 'WhatsApp Business', icon: MessageCircle, connected: true, color: 'emerald', account: '+54 11 5555-0000' },
                  { name: 'Instagram', icon: Instagram, connected: true, color: 'pink', account: '@star_real_estate' },
                  { name: 'Facebook', icon: Facebook, connected: false, color: 'blue', account: null },
                  { name: 'Email (SMTP)', icon: Mail, connected: true, color: 'gray', account: 'ventas@star.com' },
                ].map((integration) => (
                  <div key={integration.name} className="bg-white rounded-xl border border-gray-100 p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-${integration.color}-100 rounded-lg flex items-center justify-center`}>
                          <integration.icon className={`w-5 h-5 text-${integration.color}-600`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                          {integration.connected ? (
                            <p className="text-sm text-gray-500">{integration.account}</p>
                          ) : (
                            <p className="text-sm text-gray-400">No conectado</p>
                          )}
                        </div>
                      </div>
                      {integration.connected ? (
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                            <Check className="w-3 h-3" />
                            Conectado
                          </span>
                          <button className="text-sm text-gray-500 hover:text-gray-700">Configurar</button>
                        </div>
                      ) : (
                        <button className="px-4 py-2 bg-[#D4A745] text-white rounded-lg text-sm font-medium hover:bg-[#c49a3d]">
                          Conectar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-900 mb-2">API Key</h3>
                <p className="text-sm text-gray-500 mb-4">Usa esta clave para integrar con servicios externos</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value="sk_live_••••••••••••••••••••••••"
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600"
                  />
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                    Copiar
                  </button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                    Regenerar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notificaciones */}
          {activeTab === 'notificaciones' && (
            <div className="max-w-2xl">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Notificaciones</h2>
              
              <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Eventos</h3>
                <div className="space-y-4">
                  {[
                    { key: 'newLead', label: 'Nuevo lead recibido' },
                    { key: 'leadQualified', label: 'Lead calificado' },
                    { key: 'handoff', label: 'Derivación a humano' },
                    { key: 'dailyReport', label: 'Reporte diario' },
                    { key: 'weeklyReport', label: 'Reporte semanal' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{item.label}</span>
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

              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Canales</h3>
                <div className="space-y-4">
                  {[
                    { key: 'emailNotif', label: 'Email', icon: Mail },
                    { key: 'pushNotif', label: 'Push (navegador)', icon: Bell },
                    { key: 'whatsappNotif', label: 'WhatsApp', icon: Phone },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <item.icon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{item.label}</span>
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
            </div>
          )}

          {/* Equipo */}
          {activeTab === 'equipo' && (
            <div className="max-w-3xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Equipo</h2>
                <button className="px-4 py-2 bg-[#D4A745] text-white rounded-lg text-sm font-medium hover:bg-[#c49a3d]">
                  + Invitar miembro
                </button>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Usuario</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Rol</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Estado</th>
                      <th className="text-right text-xs font-semibold text-gray-500 uppercase px-5 py-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {TEAM_MEMBERS.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <img src={member.avatar} alt={member.name} className="w-9 h-9 rounded-full object-cover" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{member.name}</p>
                              <p className="text-xs text-gray-500">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            member.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                            member.role === 'vendedor' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {member.role === 'admin' ? 'Administrador' : member.role === 'vendedor' ? 'Vendedor' : 'Viewer'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`flex items-center gap-1.5 text-xs ${
                            member.active ? 'text-emerald-600' : 'text-gray-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${member.active ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                            {member.active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button className="text-sm text-gray-500 hover:text-gray-700">Editar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empresa */}
          {activeTab === 'empresa' && (
            <div className="max-w-2xl">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Datos de la empresa</h2>
              
              <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-[#D4A745] rounded-xl flex items-center justify-center">
                    <Building className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">STAR Real Estate</h3>
                    <p className="text-sm text-gray-500">Desarrolladora inmobiliaria</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la empresa</label>
                    <input
                      type="text"
                      defaultValue="STAR Real Estate"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email general</label>
                    <input
                      type="email"
                      defaultValue="info@star.com"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input
                      type="tel"
                      defaultValue="+54 11 4555-0000"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                    <input
                      type="text"
                      defaultValue="Av. del Libertador 1234, CABA"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-gray-400" />
                  Personalización
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color principal</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Idioma</label>
                    <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50">
                      <option>Español (Argentina)</option>
                      <option>Español (España)</option>
                      <option>English</option>
                      <option>Português</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zona horaria</label>
                    <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50">
                      <option>America/Buenos_Aires (GMT-3)</option>
                      <option>America/Montevideo (GMT-3)</option>
                      <option>America/Santiago (GMT-3)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button className="px-4 py-2 bg-[#D4A745] text-white rounded-lg text-sm font-medium hover:bg-[#c49a3d]">
                  Guardar cambios
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
