import { MessageCircle, Instagram, ChevronRight, CheckCircle, Clock, XCircle } from 'lucide-react'
import { RECENT_ACTIVITY } from '../constants'
import { LeadActivity } from '../types'

const getChannelIcon = (channel: string) => {
  switch (channel) {
    case 'WhatsApp':
      return <MessageCircle className="w-4 h-4 text-green-500" />
    case 'Instagram':
      return <Instagram className="w-4 h-4 text-pink-500" />
    default:
      return <MessageCircle className="w-4 h-4 text-gray-400" />
  }
}

const getStatusBadge = (status: LeadActivity['status']) => {
  switch (status) {
    case 'Qualified':
      return (
        <span className="flex items-center gap-1 text-emerald-600">
          <CheckCircle className="w-4 h-4" />
        </span>
      )
    case 'Pending':
      return (
        <span className="flex items-center gap-1 text-amber-500">
          <Clock className="w-4 h-4" />
        </span>
      )
    case 'NotInterested':
      return (
        <span className="flex items-center gap-1 text-red-500">
          <XCircle className="w-4 h-4" />
        </span>
      )
  }
}

export const RecentActivityTable = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
      <div className="flex justify-between items-center p-6 border-b border-gray-100">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Actividad Reciente</h2>
          <p className="text-sm text-gray-500 mt-1">Últimas interacciones de leads</p>
        </div>
        <a href="#" className="flex items-center gap-1 text-sm font-medium text-[#D4A745] hover:text-[#B8923D] transition-colors">
          Ver Todo
          <ChevronRight className="w-4 h-4" />
        </a>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">Lead</th>
              <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">Proyecto</th>
              <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">Canal</th>
              <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">Duración</th>
              <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {RECENT_ACTIVITY.map((activity) => (
              <tr key={activity.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={activity.avatar} 
                      alt={activity.name} 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-sm font-medium text-gray-900">{activity.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">{activity.project}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getChannelIcon(activity.channel)}
                    <span className="text-sm text-gray-600">{activity.channel}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">{activity.duration}</span>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(activity.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}