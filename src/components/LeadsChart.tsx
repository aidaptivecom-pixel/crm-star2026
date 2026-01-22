import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'
import { RefreshCw, Download, Share2 } from 'lucide-react'
import { CHART_DATA } from '../constants'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const total = payload.find((p: any) => p.dataKey === 'total')?.value || 0
    const qualified = payload.find((p: any) => p.dataKey === 'qualified')?.value || 0
    const rate = total > 0 ? Math.round((qualified / total) * 100) : 0
    
    return (
      <div className="bg-white p-3 sm:p-4 border border-gray-100 rounded-lg shadow-xl min-w-[160px] sm:min-w-[200px]">
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
          <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Tasa: {rate}%</span>
        </div>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.stroke }}></div>
                <span className="text-gray-600 text-xs sm:text-sm">{entry.name}</span>
              </div>
              <span className="font-bold text-gray-900">{entry.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

export const LeadsChart = () => {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Leads por Día</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Total vs. Calificados en los últimos 28 días</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm">
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">CSV</span>
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="h-[250px] sm:h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={CHART_DATA} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorQualified" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94A3B8', fontSize: 11 }} 
              dy={10}
              interval="preserveStartEnd"
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              tickFormatter={(value) => `${value / 1000}k`}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="total" 
              name="Total Leads"
              stroke="#3B82F6" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorTotal)" 
            />
            <Area 
              type="monotone" 
              dataKey="qualified" 
              name="Calificados"
              stroke="#10B981" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorQualified)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
