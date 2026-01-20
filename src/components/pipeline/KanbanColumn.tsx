import { PipelineLead, PipelineStage } from '../../types'
import { KanbanCard } from './KanbanCard'

interface KanbanColumnProps {
  column: { id: PipelineStage; title: string; color: string }
  leads: PipelineLead[]
  allColumns: { id: PipelineStage; title: string; color: string }[]
  onMoveLead: (leadId: string, newStage: PipelineStage) => void
}

export const KanbanColumn = ({ column, leads, allColumns, onMoveLead }: KanbanColumnProps) => {
  // Calculate total value for column
  const totalValue = leads
    .filter(l => l.budget)
    .reduce((sum, l) => {
      const value = parseInt(l.budget?.replace(/,/g, '') || '0')
      return sum + value
    }, 0)

  return (
    <div className="w-72 min-w-[288px] flex flex-col bg-gray-100/50 rounded-xl">
      {/* Column Header */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${column.color}`} />
            <h3 className="font-semibold text-gray-900">{column.title}</h3>
            <span className="bg-gray-200 text-gray-600 text-xs font-bold px-1.5 py-0.5 rounded-full">
              {leads.length}
            </span>
          </div>
        </div>
        {totalValue > 0 && (
          <p className="text-xs text-gray-500">
            USD {totalValue.toLocaleString()}
          </p>
        )}
      </div>

      {/* Cards */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto">
        {leads.map((lead) => (
          <KanbanCard
            key={lead.id}
            lead={lead}
            allColumns={allColumns}
            currentStage={column.id}
            onMove={onMoveLead}
          />
        ))}

        {leads.length === 0 && (
          <div className="flex items-center justify-center h-24 text-sm text-gray-400">
            Sin leads
          </div>
        )}
      </div>
    </div>
  )
}
