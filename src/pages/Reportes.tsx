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
      <div className="flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <BarChart3 className="w-5 sm:w-6 h-5 sm:h-6 text-[#D4A745]" />
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Reportes</h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Period Selector - Scrollable on mobile */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 overflow-x-auto">
              {[
                { value: '7d', label: '7d' },
                { value: '30d', label: '30d' },
                { value: '90d', label: '90d' },
                { value: 'year', label: 'Año' },
              ].map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value as Period)}
                  className={`px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                    period === p.value
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <button className="hidden md:flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              <Calendar className="w-4 h-4" />
              <span className="hidden lg:inline">Personalizado</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            <button className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-[#D4A745] text-white rounded-lg text-sm font-medium hover:bg-[#c49a3d]">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {METRICS.map((metric) => (
            <div key={metric.label} className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100">
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <div className={`w-8 sm:w-10 h-8 sm:h-10 bg-${metric.color}-100 rounded-lg flex items-center justify-center`}>
                  <metric.icon className={`w-4 sm:w-5 h-4 sm:h-5 text-${metric.color}-600`} />
                </div>
                <div className={`flex items-center gap-1 text-[10px] sm:text-xs font-medium ${
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
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
              <p className="text-[10px] sm:text-xs text-gray-500 truncate">{metric.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
          {/* Weekly Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Evolución semanal</h3>
              <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 sm:w-3 h-2.5 sm:h-3 bg-blue-500 rounded" /> Leads
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 sm:w-3 h-2.5 sm:h-3 bg-emerald-500 rounded" /> Calif.
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 sm:w-3 h-2.5 sm:h-3 bg-amber-500 rounded" /> Res.
                </span>
              </div>
            </div>
            <div className="h-40 sm:h-52 flex items-end gap-3 sm:gap-6">
              {GLOBAL_STATS.semanal.map((data) => (
                <div key={data.week} className="flex-1 flex flex-col items-center gap-1 sm:gap-2">
                  <div className="w-full flex gap-0.5 sm:gap-1 items-end h-32 sm:h-44">
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
                  <span className="text-[10px] sm:text-xs text-gray-500">{data.week}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lead Sources */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">Fuentes de leads</h3>
            <div className="space-y-3">
              {GLOBAL_STATS.fuentes.map((source) => (
                <div key={source.source}>
                  <div className="flex items-center justify-between text-xs sm:text-sm mb-1">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Leads by Project */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400" />
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Leads por proyecto</h3>
            </div>
            <div className="space-y-3">
              {GLOBAL_STATS.proyectos.map((project) => (
                <div key={project.name} className="flex items-center gap-2 sm:gap-3">
                  <div className={`w-1 h-6 sm:h-8 ${project.color} rounded-full flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">{project.name}</span>
                      <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs flex-shrink-0">
                        <span className="text-gray-500">{project.leads}</span>
                        <span className="text-emerald-600">{project.qualified}</span>
                        <span className="font-medium text-amber-600">{project.reservas}</span>
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
          <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400" />
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Rendimiento agentes IA</h3>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {AGENTS_PERFORMANCE.map((agent) => (
                <div key={agent.name} className="p-2.5 sm:p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">{agent.name}</span>
                    <span className="text-[10px] sm:text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded flex-shrink-0">
                      {agent.successRate}%
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                    <div>
                      <p className="text-base sm:text-lg font-bold text-gray-900">{agent.conversations.toLocaleString()}</p>
                      <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase">Conv.</p>
                    </div>
                    <div>
                      <p className="text-base sm:text-lg font-bold text-emerald-600">{agent.qualified}</p>
                      <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase">Calif.</p>
                    </div>
                    <div>
                      <p className="text-base sm:text-lg font-bold text-blue-600">{agent.avgTime}</p>
                      <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase">Tiempo</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="mt-6 bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
          <h3 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">Embudo de conversión</h3>
          
          {/* Desktop funnel */}
          <div className="hidden sm:flex items-center justify-between gap-4">
            {GLOBAL_STATS.embudo.map((step, index) => (
              <div key={step.label} className="flex-1 flex flex-col items-center">
                <div
                  className={`w-full ${step.color} rounded-lg flex items-center justify-center text-white font-bold transition-all text-sm sm:text-base`}
                  style={{ height: `${60 + (4 - index) * 20}px` }}
                >
                  {step.value.toLocaleString()}
                </div>
                <p className="text-[10px] sm:text-xs text-gray-600 mt-2 font-medium text-center">{step.label}</p>
                {index < GLOBAL_STATS.embudo.length - 1 && (
                  <p className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5">
                    {Math.round((GLOBAL_STATS.embudo[index + 1].value / step.value) * 100)}% conv.
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Mobile funnel - Vertical */}
          <div className="sm:hidden space-y-2">
            {GLOBAL_STATS.embudo.map((step, index) => (
              <div key={step.label} className="flex items-center gap-3">
                <div
                  className={`${step.color} rounded-lg flex items-center justify-center text-white font-bold text-sm h-10`}
                  style={{ width: `${100 - (index * 15)}%` }}
                >
                  {step.value.toLocaleString()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600 font-medium truncate">{step.label}</p>
                  {index < GLOBAL_STATS.embudo.length - 1 && (
                    <p className="text-[10px] text-gray-400">
                      → {Math.round((GLOBAL_STATS.embudo[index + 1].value / step.value) * 100)}%
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
