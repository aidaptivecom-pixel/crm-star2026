import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { 
  Search, 
  Home, 
  Inbox, 
  Trello,
  Users,
  Bot, 
  Building2,
  Home as HomeIcon,
  Calculator,
  BarChart3, 
  Settings, 
  HelpCircle,
  Activity,
  LogOut
} from 'lucide-react'
import { CONVERSATIONS } from '../constants'

interface SidebarProps {
  onNavigate?: () => void
  onLogout?: () => void
  onCollapse?: () => void
  userName?: string | null
  userRole?: string | null
}

export const Sidebar = ({ onNavigate, onLogout, onCollapse, userName, userRole }: SidebarProps) => {
  const unreadCount = CONVERSATIONS.filter(c => c.unread).length
  const [searchQuery, setSearchQuery] = useState('')

  const matchesSearch = (label: string) => {
    if (!searchQuery) return true
    return label.toLowerCase().includes(searchQuery.toLowerCase())
  }

  return (
    <aside className="w-[240px] min-w-[240px] h-full bg-white border-r border-gray-100 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 justify-between">
        <div className="flex items-center">
          <img src="/logo-star-crop.png" alt="Star" className="h-12 object-contain" />
        </div>
        {onCollapse && (
          <button
            onClick={onCollapse}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            title="Ocultar sidebar"
          >

            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 19l-7-7 7-7"/>
              <path d="M18 19l-7-7 7-7"/>
            </svg>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="px-4 mb-6">
        <div className="relative group">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#D4A745] transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50 focus:border-[#D4A745] transition-all"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6">
        
        {/* Principal */}
        {(['Inicio', 'Inbox', 'Pipeline', 'Leads'].some(matchesSearch)) && (
        <div>
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Principal</h3>
          <nav className="space-y-0.5">
            {matchesSearch('Inicio') && <NavItem to="/" icon={Home} label="Inicio" onNavigate={onNavigate} />}
            {matchesSearch('Inbox') && <NavItem to="/inbox" icon={Inbox} label="Inbox" badge={unreadCount > 0 ? String(unreadCount) : undefined} onNavigate={onNavigate} />}
            {matchesSearch('Pipeline') && <NavItem to="/pipeline" icon={Trello} label="Pipeline" onNavigate={onNavigate} />}
            {matchesSearch('Leads') && <NavItem to="/leads" icon={Users} label="Leads" onNavigate={onNavigate} />}
          </nav>
        </div>
        )}

        {/* Agentes */}
        {matchesSearch('Monitoreo IA') && (
        <div>
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Agentes</h3>
          <nav className="space-y-0.5">
            <NavItem to="/agentes" icon={Bot} label="Monitoreo IA" onNavigate={onNavigate} />
          </nav>
        </div>
        )}

        {/* Catálogo */}
        {(['Emprendimientos', 'Propiedades', 'Tasaciones', 'Tasación Web'].some(matchesSearch)) && (
        <div>
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Catálogo</h3>
          <nav className="space-y-0.5">
            {matchesSearch('Emprendimientos') && <NavItem to="/emprendimientos" icon={Building2} label="Emprendimientos" onNavigate={onNavigate} />}
            {matchesSearch('Propiedades') && <NavItem to="/propiedades" icon={HomeIcon} label="Propiedades" onNavigate={onNavigate} />}
            {matchesSearch('Tasaciones') && <NavItem to="/tasaciones" icon={Calculator} label="Tasaciones" onNavigate={onNavigate} />}
            {matchesSearch('Tasación Web') && <NavItem to="/tasacion-web" icon={Calculator} label="Tasación Web" onNavigate={onNavigate} />}
          </nav>
        </div>
        )}

        {/* Analytics */}
        {matchesSearch('Reportes') && (
        <div>
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Analytics</h3>
          <nav className="space-y-0.5">
            <NavItem to="/reportes" icon={BarChart3} label="Reportes" onNavigate={onNavigate} />
          </nav>
        </div>
        )}

      </div>

      {/* Bottom Actions */}
      <div className="px-4 pb-4 mt-auto">
        <div className="border-t border-gray-100 pt-4 mb-4 space-y-0.5">
           <NavItem to="/status" icon={Activity} label="Estado" onNavigate={onNavigate} />
           <NavItem to="/configuracion" icon={Settings} label="Configuración" onNavigate={onNavigate} />
           <NavItem to="/ayuda" icon={HelpCircle} label="Ayuda" disabled onNavigate={onNavigate} />
        </div>
        
        {/* User Profile */}
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-[#D4A745] flex items-center justify-center text-white text-sm font-bold">
            {userName?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-semibold text-gray-700 truncate">{userName || 'Usuario'}</span>
            <span className="text-xs text-gray-500 capitalize">{userRole || ''}</span>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 rounded-md hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}

interface NavItemProps {
  to: string
  icon: React.ElementType
  label: string
  badge?: string
  disabled?: boolean
  onNavigate?: () => void
}

const NavItem = ({ to, icon: Icon, label, badge, disabled, onNavigate }: NavItemProps) => {
  if (disabled) {
    return (
      <span className="flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-gray-400 cursor-not-allowed">
        <div className="flex items-center gap-3">
          <Icon className="w-4 h-4 text-gray-300" />
          <span>{label}</span>
        </div>
        <span className="text-[9px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">Pronto</span>
      </span>
    )
  }

  return (
    <NavLink
      to={to}
      end={to === '/'}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center justify-between px-3 py-2 min-h-[40px] rounded-md text-sm font-medium transition-colors ${
          isActive
            ? 'bg-gray-100 text-gray-900'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div className="flex items-center gap-3">
            <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4A745]' : 'text-gray-400'}`} />
            <span>{label}</span>
          </div>
          {badge && (
            <span className="bg-[#D4A745] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}
