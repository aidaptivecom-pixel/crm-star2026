import { ChevronDown, Plus } from 'lucide-react'

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
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Bienvenido, Jony 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1 capitalize">{formattedDate}</p>
      </div>
      
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
          Últimos 7 días
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#D4A745] rounded-lg hover:bg-[#B8923D] transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          Nuevo Lead
        </button>
      </div>
    </div>
  )
}