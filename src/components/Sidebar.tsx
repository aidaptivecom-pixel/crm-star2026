import { NavLink } from 'react-router-dom'
import { 
  Search, 
  Home, 
  Inbox, 
  Trello, 
  Bot, 
  Building2, 
  BarChart3, 
  Settings, 
  HelpCircle,
  Star
} from 'lucide-react'
import { CONVERSATIONS } from '../constants'

export const Sidebar = () => {
  const unreadCount = CONVERSATIONS.filter(c => c.unread).length

  return (
    <aside className="w-[240px] min-w-[240px] h-full bg-white border-r border-gray-100 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 gap-2">
        <div className="w-8 h-8 bg-[#D4A745] rounded-lg flex items-center justify-center shadow-sm">
          <Star className="w-5 h-5 text-white fill-white" />
        </div>
        <span className="font-bold text-xl tracking-tight text-gray-900">STAR</span>
      </div>

      {/* Search */}
      <div className="px-4 mb-6">
        <div className="relative group">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#D4A745] transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar..." 
            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50 focus:border-[#D4A745] transition-all"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6">
        
        {/* Principal */}
        <div>
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Principal</h3>
          <nav className="space-y-0.5">
            <NavItem to="/" icon={Home} label="Inicio" />
            <NavItem to="/inbox" icon={Inbox} label="Inbox" badge={unreadCount > 0 ? String(unreadCount) : undefined} />
            <NavItem to="/pipeline" icon={Trello} label="Pipeline" disabled />
          </nav>
        </div>

        {/* Agentes */}
        <div>
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Agentes</h3>
          <nav className="space-y-0.5">
            <NavItem to="/agentes" icon={Bot} label="Monitoreo IA" disabled />
          </nav>
        </div>

        {/* Catálogo */}
        <div>
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Catálogo</h3>
          <nav className="space-y-0.5">
            <NavItem to="/propiedades" icon={Building2} label="Propiedades" disabled />
          </nav>
        </div>

        {/* Analytics */}
        <div>
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Analytics</h3>
          <nav className="space-y-0.5">
            <NavItem to="/reportes" icon={BarChart3} label="Reportes" disabled />
          </nav>
        </div>

      </div>

      {/* Bottom Actions */}
      <div className="px-4 pb-4 mt-auto">
        <div className="border-t border-gray-100 pt-4 mb-4 space-y-0.5">
           <NavItem to="/configuracion" icon={Settings} label="Configuración" disabled />
           <NavItem to="/ayuda" icon={HelpCircle} label="Ayuda" disabled />
        </div>
        
        {/* User Profile */}
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
          <img src="https://picsum.photos/40/40?random=100" alt="User" className="w-9 h-9 rounded-full object-cover border border-gray-100" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-700">Jony M.</span>
            <span className="text-xs text-gray-500">Admin</span>
          </div>
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
}

const NavItem = ({ to, icon: Icon, label, badge, disabled }: NavItemProps) => {
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
      className={({ isActive }) =>
        `flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
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
            <span className="bg-[#D4A745] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}
