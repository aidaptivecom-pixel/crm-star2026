import { Phone, Mail, Calendar, MessageCircle, Check, Clock, ExternalLink } from 'lucide-react'
import { LeadDetail } from '../../types'
import { Avatar } from '../Avatar'

interface LeadPanelProps {
  lead: LeadDetail
}

export const LeadPanel = ({ lead }: LeadPanelProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-100 text-emerald-700'
    if (score >= 60) return 'bg-amber-100 text-amber-700'
    return 'bg-red-100 text-red-700'
  }

  const getAgentBadge = (type: LeadDetail['agentType']) => {
    switch (type) {
      case 'emprendimientos':
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">Emprendimientos</span>
      case 'inmuebles':
        return <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">Inmuebles</span>
      case 'tasaciones':
        return <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded">Tasaciones</span>
    }
  }

  const getChannelIcon = (channel: LeadDetail['channel']) => {
    switch (channel) {
      case 'whatsapp':
        return '💬 WhatsApp'
      case 'instagram':
        return '📷 Instagram'
      case 'facebook':
        return '👤 Facebook'
    }
  }

  return (
    <div className="w-80 min-w-[320px] border-l border-gray-200 bg-white overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <Avatar name={lead.name} size="lg" />
          </div>
          <h3 className="font-bold text-lg text-gray-900 mb-1">{lead.name}</h3>
          <p className="text-sm text-gray-500">{lead.project}</p>
          <div className="flex justify-center mt-2">
            {getAgentBadge(lead.agentType)}
          </div>
        </div>

        {/* Score */}
        <div className="flex items-center justify-center mb-6">
          <div className={`px-4 py-2 rounded-xl ${getScoreColor(lead.score)}`}>
            <span className="text-2xl font-bold">{lead.score}</span>
            <span className="text-sm font-medium ml-1">/ 100</span>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-700">{lead.phone}</span>
          </div>
          {lead.email && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700">{lead.email}</span>
            </div>
          )}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <MessageCircle className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-700">{getChannelIcon(lead.channel)}</span>
          </div>
        </div>

        {/* Details */}
        <div className="border-t border-gray-100 pt-4 mb-6">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Detalles</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Interés</span>
              <span className="text-gray-900 font-medium">{lead.interest}</span>
            </div>
            {lead.budget && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Presupuesto</span>
                <span className="text-gray-900 font-medium">
                  {lead.budgetCurrency} {lead.budget}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Creado</span>
              <span className="text-gray-900">{lead.createdAt}</span>
            </div>
          </div>
        </div>

        {/* History */}
        <div className="border-t border-gray-100 pt-4 mb-6">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Historial</h4>
          <div className="space-y-3">
            {lead.history.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                  item.completed ? 'bg-emerald-100' : 'bg-gray-100'
                }`}>
                  {item.completed ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Clock className="w-3 h-3 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${
                    item.completed ? 'text-gray-700' : 'text-gray-500'
                  }`}>
                    {item.action}
                  </p>
                  <p className="text-xs text-gray-400">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-100 pt-4">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Acciones rápidas</h4>
          <div className="grid grid-cols-3 gap-2">
            <button className="flex flex-col items-center gap-1 p-3 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors">
              <Phone className="w-5 h-5" />
              <span className="text-[10px] font-medium">Llamar</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
              <Mail className="w-5 h-5" />
              <span className="text-[10px] font-medium">Email</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
              <Calendar className="w-5 h-5" />
              <span className="text-[10px] font-medium">Agendar</span>
            </button>
          </div>
        </div>

        {/* View Full Profile */}
        <button className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          <ExternalLink className="w-4 h-4" />
          Ver perfil completo
        </button>
      </div>
    </div>
  )
}
