import { ChevronDown } from 'lucide-react'

export const Header = () => {
  const today = new Date()
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  }
  const formattedDate = today.toLocaleDateString('es-AR', options)

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
          Bienvenido, Jony 👋
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 capitalize">{formattedDate}</p>
      </div>
      
      <div className="flex items-center gap-3 w-full sm:w-auto">
        {/* Date Filter */}
        <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
          Últimos 7 días
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
  )
}
