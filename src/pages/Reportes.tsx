import { useState } from 'react'
import { BarChart3, TrendingUp, TrendingDown, Users, MessageCircle, Target, DollarSign, Calendar, Download, ChevronDown, Building2, Bot } from 'lucide-react'
import { GLOBAL_STATS } from '../constants'

type Period = '7d' | '30d' | '90d' | 'year'

interface MetricCard {
  label: string
  value: string
  change: number
  changeLabel: string
  icon: React.ElementType
  color: string
}

// Usando datos de GLOBAL_STATS
const METRICS: MetricCard[] = [
  { label: 'Leads totales', value: GLOBAL_STATS.leads.total.toLocaleString(), change: 12.5, changeLabel: 'vs mes anterior', icon: Users, color: 'blue' },
  { label: 'Conversaciones', value: GLOBAL_STATS.conversaciones.total.toLocaleString(), change: 8.3, changeLabel: 'vs mes anterior', icon: MessageCircle, color: 'purple' },
  { label: 'Leads calificados', value: GLOBAL_STATS.leads.calificado.toLocaleString(), change: 15.2, changeLabel: 'vs mes anterior', icon: Target, color: 'emerald' },
  { label: 'Reservas', value: GLOBAL_STATS.leads.reserva.toString(), change: 5.8, changeLabel: 'vs mes anterior', icon: DollarSign, color: 'amber' },
]

const AGENTS_PERFORMANCE = [
  { name: 'Agente Emprendimientos', ...GLOBAL_STATS.agentes.emprendimientos },
  { name: 'Agente Inmuebles', ...GLOBAL_STATS.agentes.inmuebles },
  { name: 'Agente Tasaciones', ...GLOBAL_STATS.agentes.tasaciones },
]

export const Reportes = () => {
  const [period, setPeriod] = useState<Period>('30d')

  const maxLeads = Math.max(...GLOBAL_STATS.proyectos.map(p => p.leads))

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-[#F8F9FA]">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-[#D4A745]" />
            <h1 className="text-xl font-bold text-gray-900">Reportes</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Period Selector */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              {[
                { value: '7d', label: '7 días' },
                { value: '30d', label: '30 días' },
                { value: '90d', label: '90 días' },
                { value: 'year', label: 'Año' },
              ].map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value as Period)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    period === p.value
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              <Calendar className="w-4 h-4" />
              Personalizado
              <ChevronDown className="w-4 h-4" />
            </button>

            <button className="flex items-center gap-2 px-4 py-2 bg-[#D4A745] text-white rounded-lg text-sm font-medium hover:bg-[#c49a3d]">
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {METRICS.map((metric) => (
            <div key={metric.label} className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 bg-${metric.color}-100 rounded-lg flex items-center justify-center`}>
                  <metric.icon className={`w-5 h-5 text-${metric.color}-600`} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${
                  metric.change >= 0 ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {metric.change >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {Math.abs(metric.change)}%
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
              <p className="text-xs text-gray-500">{metric.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Weekly Chart */}
          <div className="col-span-2 bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Evolución semanal</h3>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-blue-500 rounded" /> Leads
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-emerald-500 rounded" /> Calificados
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-amber-500 rounded" /> Reservas
                </span>
              </div>
            </div>
            <div className="h-52 flex items-end gap-6">
              {GLOBAL_STATS.semanal.map((data) => (
                <div key={data.week} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex gap-1 items-end h-44">
                    <div
                      className="flex-1 bg-blue-500 rounded-t transition-all"
                      style={{ height: `${(data.leads / 400) * 100}%` }}
                    />
                    <div
                      className="flex-1 bg-emerald-500 rounded-t transition-all"
                      style={{ height: `${(data.qualified / 400) * 100}%` }}
                    />
                    <div
                      className="flex-1 bg-amber-500 rounded-t transition-all"
                      style={{ height: `${(data.reservas / 400) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{data.week}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lead Sources */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Fuentes de leads</h3>
            <div className="space-y-3">
              {GLOBAL_STATS.fuentes.map((source) => (
                <div key={source.source}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700">{source.source}</span>
                    <span className="font-medium text-gray-900">{source.leads}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#D4A745] rounded-full"
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Leads by Project */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-gray-400" />
              <h3 className="font-semibold text-gray-900">Leads por proyecto</h3>
            </div>
            <div className="space-y-3">
              {GLOBAL_STATS.proyectos.map((project) => (
                <div key={project.name} className="flex items-center gap-3">
                  <div className={`w-1 h-8 ${project.color} rounded-full`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{project.name}</span>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-gray-500">{project.leads} leads</span>
                        <span className="text-emerald-600">{project.qualified} calif.</span>
                        <span className="font-medium text-amber-600">{project.reservas} res.</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${project.color} rounded-full`}
                        style={{ width: `${(project.leads / maxLeads) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Agent Performance */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-5 h-5 text-gray-400" />
              <h3 className="font-semibold text-gray-900">Rendimiento de agentes IA</h3>
            </div>
            <div className="space-y-4">
              {AGENTS_PERFORMANCE.map((agent) => (
                <div key={agent.name} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{agent.name}</span>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
                      {agent.successRate}% éxito
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-lg font-bold text-gray-900">{agent.conversations.toLocaleString()}</p>
                      <p className="text-[10px] text-gray-500 uppercase">Conversaciones</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-emerald-600">{agent.qualified}</p>
                      <p className="text-[10px] text-gray-500 uppercase">Calificados</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-blue-600">{agent.avgTime}</p>
                      <p className="text-[10px] text-gray-500 uppercase">Tiempo resp.</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="mt-6 bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Embudo de conversión</h3>
          <div className="flex items-center justify-between gap-4">
            {GLOBAL_STATS.embudo.map((step, index) => (
              <div key={step.label} className="flex-1 flex flex-col items-center">
                <div
                  className={`w-full ${step.color} rounded-lg flex items-center justify-center text-white font-bold transition-all`}
                  style={{ height: `${60 + (4 - index) * 20}px` }}
                >
                  {step.value.toLocaleString()}
                </div>
                <p className="text-xs text-gray-600 mt-2 font-medium">{step.label}</p>
                {index < GLOBAL_STATS.embudo.length - 1 && (
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {Math.round((GLOBAL_STATS.embudo[index + 1].value / step.value) * 100)}% conversión
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
