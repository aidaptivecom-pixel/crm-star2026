import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { NotificationBell } from './NotificationBell'
import { useAuth } from '../contexts/AuthContext'

const PERIOD_OPTIONS = [
  { label: 'Hoy', value: 'today' },
  { label: 'Últimos 7 días', value: '7d' },
  { label: 'Últimos 30 días', value: '30d' },
  { label: 'Este mes', value: 'month' },
  { label: 'Todo', value: 'all' },
]

export const Header = () => {
  const { profile } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState('7d')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const today = new Date()
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  }
  const formattedDate = today.toLocaleDateString('es-AR', options)

  const selectedLabel = PERIOD_OPTIONS.find(o => o.value === selectedPeriod)?.label || 'Últimos 7 días'

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
          Bienvenido, {profile?.full_name ?? 'Usuario'} 👋
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 capitalize">{formattedDate}</p>
      </div>
      
      <div className="flex items-center gap-3 w-full sm:w-auto">
        {/* Date Filter */}
        <div className="relative flex-1 sm:flex-none" ref={dropdownRef}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            {selectedLabel}
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {dropdownOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
              {PERIOD_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSelectedPeriod(option.value)
                    setDropdownOpen(false)
                  }}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                    selectedPeriod === option.value
                      ? 'bg-[#D4A745]/10 text-[#D4A745] font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Notification Bell - Desktop only */}
        <div className="hidden lg:block">
          <NotificationBell />
        </div>
      </div>
    </div>
  )
}
