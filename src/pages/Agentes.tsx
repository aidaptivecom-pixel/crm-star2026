import { useState } from 'react'
import { Bot, MessageCircle, Clock, CheckCircle, AlertTriangle, Settings, Play, Pause, TrendingUp, Users, Zap, Brain, BarChart3 } from 'lucide-react'
import { Avatar } from '../components/Avatar'

type AgentType = 'emprendimientos' | 'inmuebles' | 'tasaciones'

interface Agent {
  id: AgentType
  name: string
  shortName: string
  description: string
  status: 'active' | 'paused'
  color: string
  bgColor: string
  metrics: {
    activeConversations: number
    todayConversations: number
    avgResponseTime: string
    successRate: number
    qualifiedLeads: number
    handoffs: number
  }
  recentActivity: {
    id: string
    leadName: string
    action: string
    time: string
    status: 'success' | 'pending' | 'handoff'
  }[]
}

const AGENTS: Agent[] = [
  {
    id: 'emprendimientos',
    name: 'Agente Emprendimientos',
    shortName: 'Emp',
    description: 'Califica leads interesados en proyectos nuevos',
    status: 'active',
    color: 'text-blue-600',
    bgColor: 'bg-blue-500',
    metrics: {
      activeConversations: 4,
      todayConversations: 42,
      avgResponseTime: '1.2s',
      successRate: 94,
      qualifiedLeads: 18,
      handoffs: 3,
    },
    recentActivity: [
      { id: '1', leadName: 'Juan Martinez', action: 'Brochure enviado', time: 'Hace 2 min', status: 'success' },
      { id: '2', leadName: 'Carlos López', action: 'Calificando...', time: 'Hace 5 min', status: 'pending' },
      { id: '3', leadName: 'María López', action: 'Derivado a humano', time: 'Hace 10 min', status: 'handoff' },
      { id: '4', leadName: 'Ana Rodríguez', action: 'Tipología enviada', time: 'Hace 15 min', status: 'success' },
    ],
  },
  {
    id: 'inmuebles',
    name: 'Agente Inmuebles',
    shortName: 'Inm',
    description: 'Atiende consultas de propiedades usadas',
    status: 'active',
    color: 'text-purple-600',
    bgColor: 'bg-purple-500',
    metrics: {
      activeConversations: 2,
      todayConversations: 28,
      avgResponseTime: '1.5s',
      successRate: 89,
      qualifiedLeads: 12,
      handoffs: 5,
    },
    recentActivity: [
      { id: '1', leadName: 'Pedro García', action: 'Fotos enviadas', time: 'Hace 8 min', status: 'success' },
      { id: '2', leadName: 'Laura Fernández', action: 'Visita agendada', time: 'Hace 20 min', status: 'success' },
      { id: '3', leadName: 'Diego Romero', action: 'Info enviada', time: 'Hace 35 min', status: 'success' },
    ],
  },
  {
    id: 'tasaciones',
    name: 'Agente Tasaciones',
    shortName: 'Tas',
    description: 'Recopila datos para tasaciones de inmuebles',
    status: 'active',
    color: 'text-amber-600',
    bgColor: 'bg-amber-500',
    metrics: {
      activeConversations: 1,
      todayConversations: 15,
      avgResponseTime: '2.1s',
      successRate: 92,
      qualifiedLeads: 8,
      handoffs: 2,
    },
    recentActivity: [
      { id: '1', leadName: 'Miguel Fernández', action: 'Datos recopilados', time: 'Hace 8 min', status: 'success' },
      { id: '2', leadName: 'Roberto Sánchez', action: 'Visita coordinada', time: 'Hace 1 hora', status: 'success' },
      { id: '3', leadName: 'Carolina Paz', action: 'Consulta inicial', time: 'Hace 2 horas', status: 'success' },
    ],
  },
]

// Fixed chart data to avoid random values on re-render
const CHART_DATA = [
  { day: 'Lun', emp: 85, inm: 60, tas: 40 },
  { day: 'Mar', emp: 70, inm: 75, tas: 35 },
  { day: 'Mié', emp: 90, inm: 50, tas: 55 },
  { day: 'Jue', emp: 65, inm: 80, tas: 45 },
  { day: 'Vie', emp: 75, inm: 65, tas: 60 },
  { day: 'Sáb', emp: 55, inm: 70, tas: 50 },
  { day: 'Dom', emp: 80, inm: 55, tas: 70 },
]

export const Agentes = () => {
  const [agents, setAgents] = useState<Agent[]>(AGENTS)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)

  const toggleAgentStatus = (agentId: AgentType) => {
    setAgents(prev =>
      prev.map(agent =>
        agent.id === agentId
          ? { ...agent, status: agent.status === 'active' ? 'paused' : 'active' }
          : agent
      )
    )
  }

  const totalActiveConversations = agents.reduce((sum, a) => sum + a.metrics.activeConversations, 0)
  const totalTodayConversations = agents.reduce((sum, a) => sum + a.metrics.todayConversations, 0)
  const totalQualifiedLeads = agents.reduce((sum, a) => sum + a.metrics.qualifiedLeads, 0)
  const avgSuccessRate = Math.round(agents.reduce((sum, a) => sum + a.metrics.successRate, 0) / agents.length)

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-[#F8F9FA]">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="w-6 h-6 text-[#D4A745]" />
            <h1 className="text-xl font-bold text-gray-900">Monitoreo IA</h1>
            <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              {agents.filter(a => a.status === 'active').length} agentes activos
            </span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <Settings className="w-4 h-4" />
            Configuración
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Global Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalActiveConversations}</p>
                <p className="text-xs text-gray-500">Conversaciones activas</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalTodayConversations}</p>
                <p className="text-xs text-gray-500">Conversaciones hoy</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalQualifiedLeads}</p>
                <p className="text-xs text-gray-500">Leads calificados hoy</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{avgSuccessRate}%</p>
                <p className="text-xs text-gray-500">Tasa de éxito promedio</p>
              </div>
            </div>
          </div>
        </div>

        {/* Agents Grid - Equal Height Cards */}
        <div className="grid grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
            >
              {/* Agent Header */}
              <div className={`${agent.bgColor} px-4 py-3`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{agent.name}</h3>
                      <p className="text-xs text-white/80">{agent.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleAgentStatus(agent.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      agent.status === 'active'
                        ? 'bg-white/20 hover:bg-white/30'
                        : 'bg-red-500/50 hover:bg-red-500/70'
                    }`}
                  >
                    {agent.status === 'active' ? (
                      <Pause className="w-4 h-4 text-white" />
                    ) : (
                      <Play className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>
              </div>

              {/* Status Badge */}
              <div className="px-4 py-2 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {agent.status === 'active' ? (
                      <>
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-xs font-medium text-emerald-600">Activo</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 bg-gray-400 rounded-full" />
                        <span className="text-xs font-medium text-gray-500">Pausado</span>
                      </>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {agent.metrics.activeConversations} conversaciones activas
                  </span>
                </div>
              </div>

              {/* Metrics */}
              <div className="p-4 grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-[10px] text-gray-500 uppercase">Tiempo resp.</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{agent.metrics.avgResponseTime}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-[10px] text-gray-500 uppercase">Éxito</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{agent.metrics.successRate}%</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-[10px] text-gray-500 uppercase">Calificados</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{agent.metrics.qualifiedLeads}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-[10px] text-gray-500 uppercase">Handoffs</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{agent.metrics.handoffs}</p>
                </div>
              </div>

              {/* Recent Activity - Fixed Height */}
              <div className="px-4 pb-4 flex-1">
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Actividad reciente</h4>
                <div className="space-y-2">
                  {agent.recentActivity.slice(0, 3).map((activity) => (
                    <div key={activity.id} className="flex items-center gap-2 text-sm">
                      <Avatar name={activity.leadName} size="xs" />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-gray-900 truncate block text-xs">
                          {activity.leadName}
                        </span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap ${
                        activity.status === 'success' ? 'bg-emerald-100 text-emerald-700' :
                        activity.status === 'pending' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {activity.action}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 mt-auto">
                <button
                  onClick={() => setSelectedAgent(agent)}
                  className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  <BarChart3 className="w-4 h-4" />
                  Ver métricas detalladas
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Performance Chart */}
        <div className="mt-6 bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Rendimiento semanal</h3>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-blue-500 rounded" /> Emprendimientos
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-purple-500 rounded" /> Inmuebles
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-amber-500 rounded" /> Tasaciones
              </span>
            </div>
          </div>
          <div className="h-48 flex items-end gap-4">
            {CHART_DATA.map((data) => (
              <div key={data.day} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex gap-1 items-end h-40">
                  <div 
                    className="flex-1 bg-blue-500 rounded-t transition-all" 
                    style={{ height: `${data.emp}%` }} 
                  />
                  <div 
                    className="flex-1 bg-purple-500 rounded-t transition-all" 
                    style={{ height: `${data.inm}%` }} 
                  />
                  <div 
                    className="flex-1 bg-amber-500 rounded-t transition-all" 
                    style={{ height: `${data.tas}%` }} 
                  />
                </div>
                <span className="text-xs text-gray-500">{data.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedAgent(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 m-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${selectedAgent.bgColor} rounded-xl flex items-center justify-center`}>
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedAgent.name}</h3>
                  <p className="text-sm text-gray-500">{selectedAgent.description}</p>
                </div>
              </div>
              <button onClick={() => setSelectedAgent(null)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Conversaciones hoy</p>
                <p className="text-2xl font-bold text-gray-900">{selectedAgent.metrics.todayConversations}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Tiempo promedio</p>
                <p className="text-2xl font-bold text-gray-900">{selectedAgent.metrics.avgResponseTime}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Tasa de éxito</p>
                <p className="text-2xl font-bold text-emerald-600">{selectedAgent.metrics.successRate}%</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Derivaciones</p>
                <p className="text-2xl font-bold text-amber-600">{selectedAgent.metrics.handoffs}</p>
              </div>
            </div>

            <h4 className="font-semibold text-gray-900 mb-3">Actividad reciente</h4>
            <div className="space-y-2 mb-6">
              {selectedAgent.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Avatar name={activity.leadName} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.leadName}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    activity.status === 'success' ? 'bg-emerald-100 text-emerald-700' :
                    activity.status === 'pending' ? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {activity.action}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => toggleAgentStatus(selectedAgent.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium ${
                  selectedAgent.status === 'active'
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                }`}
              >
                {selectedAgent.status === 'active' ? (
                  <><Pause className="w-4 h-4" /> Pausar agente</>
                ) : (
                  <><Play className="w-4 h-4" /> Activar agente</>
                )}
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                <Settings className="w-4 h-4" />
                Configurar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
