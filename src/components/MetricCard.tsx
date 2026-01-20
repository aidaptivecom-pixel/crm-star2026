import { TrendingUp } from 'lucide-react'
import { MetricData } from '../types'

interface MetricCardProps {
  data: MetricData
}

export const MetricCard = ({ data }: MetricCardProps) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-gray-500">{data.title}</h3>
        {data.change && (
          <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
            data.isPositive 
              ? 'bg-emerald-50 text-emerald-600' 
              : 'bg-red-50 text-red-600'
          }`}>
            <TrendingUp className="w-3 h-3" />
            {data.change}
          </span>
        )}
      </div>
      
      <p className="text-3xl font-bold text-gray-900 mb-2">{data.value}</p>
      
      {data.type === 'usage' && data.usagePercent !== undefined && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Capacidad</span>
            <span>{data.usagePercent}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div 
              className="bg-[#D4A745] h-2 rounded-full transition-all" 
              style={{ width: `${data.usagePercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}