import { PipelineLead, PipelineStage } from '../../types'
import { KanbanColumn } from './KanbanColumn'

interface KanbanBoardProps {
  columns: { id: PipelineStage; title: string; color: string }[]
  leadsByStage: Record<PipelineStage, PipelineLead[]>
  onMoveLead: (leadId: string, newStage: PipelineStage) => void
}

export const KanbanBoard = ({ columns, leadsByStage, onMoveLead }: KanbanBoardProps) => {
  return (
    <div className="h-full p-6 overflow-x-auto">
      <div className="flex gap-4 h-full min-w-max">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            leads={leadsByStage[column.id] || []}
            allColumns={columns}
            onMoveLead={onMoveLead}
          />
        ))}
      </div>
    </div>
  )
}
