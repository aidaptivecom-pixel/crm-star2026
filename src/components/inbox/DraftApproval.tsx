import { useState } from 'react'
import { Check, Pencil, RefreshCw, Bot, Send, X, FileText } from 'lucide-react'

interface DraftAttachment {
  type: string
  project: string
}

interface DraftApprovalProps {
  draft: string
  attachments?: DraftAttachment[] | null
  onApprove: (text: string, sendAttachments: boolean) => void
  onRegenerate: () => void
  onDismiss: () => void
  isLoading?: boolean
}

export const DraftApproval = ({ 
  draft, 
  attachments,
  onApprove, 
  onRegenerate, 
  onDismiss,
  isLoading = false 
}: DraftApprovalProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedText, setEditedText] = useState(draft)
  const [sendAttachments, setSendAttachments] = useState(false)

  const handleApprove = () => {
    onApprove(isEditing ? editedText : draft, sendAttachments && !!attachments?.length)
  }

  const handleStartEdit = () => {
    setEditedText(draft)
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setEditedText(draft)
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <div className="mx-3 sm:mx-6 mb-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="animate-spin">
            <RefreshCw className="w-5 h-5 text-blue-500" />
          </div>
          <span className="text-sm text-blue-700 font-medium">
            Generando respuesta...
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-3 sm:mx-6 mb-3">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="px-4 py-2 bg-blue-100/50 border-b border-blue-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-800">
              Borrador del Agente
            </span>
          </div>
          <button
            onClick={onDismiss}
            className="p-1 hover:bg-blue-200/50 rounded text-blue-600 hover:text-blue-800 transition-colors"
            title="Descartar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {isEditing ? (
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && editedText.trim()) {
                  e.preventDefault()
                  handleApprove()
                }
              }}
              className="w-full p-3 bg-white border border-blue-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent min-h-[100px]"
              autoFocus
            />
          ) : (
            <div className="p-3 bg-white/70 rounded-lg">
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{draft}</p>
            </div>
          )}

          {/* Attachment indicator */}
          {attachments && attachments.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <label className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg cursor-pointer hover:bg-amber-100 transition-colors">
                <input
                  type="checkbox"
                  checked={sendAttachments}
                  onChange={(e) => setSendAttachments(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                />
                <FileText className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-medium text-amber-800">
                  📎 Brochure: {attachments[0].project}
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-4 pb-4 flex flex-wrap gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleApprove}
                disabled={!editedText.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                Enviar Editado
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleApprove}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors shadow-sm"
              >
                <Check className="w-4 h-4" />
                Aprobar
              </button>
              <button
                onClick={handleStartEdit}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors shadow-sm"
              >
                <Pencil className="w-4 h-4" />
                Editar
              </button>
              <button
                onClick={onRegenerate}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Rehacer
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
