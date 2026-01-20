import { ArrowUpDown, Phone, Mail, Calendar } from 'lucide-react'
import { PipelineLead, PipelineStage } from '../../types'
import { Avatar } from '../Avatar'
import { PIPELINE_COLUMNS } from '../../constants'

interface PipelineTableProps {
  leads: PipelineLead[]
}

export const PipelineTable = ({ leads }: PipelineTableProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-100 text-emerald-700'
    if (score >= 60) return 'bg-amber-100 text-amber-700'
    return 'bg-red-100 text-red-700'
  }

  const getStageBadge = (stage: PipelineStage) => {
    const col = PIPELINE_COLUMNS.find((c: { id: PipelineStage; title: string; color: string }) => c.id === stage)
    if (!col) return null
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-opacity-20`}>
        <span className={`w-1.5 h-1.5 rounded-full ${col.color}`} />
        {col.title}
      </span>
    )
  }

  const getAgentBadge = (type: PipelineLead['agentType']) => {
    switch (type) {
      case 'emprendimientos':
        return <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-medium rounded">Emp</span>
      case 'inmuebles':
        return <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-medium rounded">Inm</span>
      case 'tasaciones':
        return <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-medium rounded">Tas</span>
    }
  }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-3">
                <button className="flex items-center gap-1 hover:text-gray-700">
                  Lead <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-4 py-3">Proyecto</th>
              <th className="px-4 py-3">
                <button className="flex items-center gap-1 hover:text-gray-700">
                  Etapa <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-4 py-3">
                <button className="flex items-center gap-1 hover:text-gray-700">
                  Score <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-4 py-3">Presupuesto</th>
              <th className="px-4 py-3">Interés</th>
              <th className="px-4 py-3">Asignado</th>
              <th className="px-4 py-3">Actividad</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={lead.name} size="sm" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-sm text-gray-900">{lead.name}</span>
                        {getAgentBadge(lead.agentType)}
                      </div>
                      <p className="text-xs text-gray-500">{lead.phone}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-700">{lead.project}</span>
                </td>
                <td className="px-4 py-3">
                  {getStageBadge(lead.stage)}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${getScoreColor(lead.score)}`}>
                    {lead.score}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {lead.budget ? (
                    <span className="text-sm text-gray-700">
                      {lead.budgetCurrency} {lead.budget}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-600 truncate max-w-[150px] block">
                    {lead.interest}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {lead.assignedTo ? (
                    <span className="text-sm text-gray-700">{lead.assignedTo}</span>
                  ) : (
                    <span className="text-sm text-gray-400">Sin asignar</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-gray-500">{lead.lastActivity}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-1.5 hover:bg-gray-100 rounded transition-colors" title="Llamar">
                      <Phone className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-1.5 hover:bg-gray-100 rounded transition-colors" title="Email">
                      <Mail className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-1.5 hover:bg-gray-100 rounded transition-colors" title="Agendar">
                      <Calendar className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
