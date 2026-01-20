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

export const Sidebar = () => {
  return (
    <aside className="w-[240px] min-w-[240px] bg-white border-r border-gray-100 flex flex-col">
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
            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A745]/50 focus:border-[#D4A745] transition-all"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 bg-white">
            ⌘K
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6">
        
        {/* Principal */}
        <div>
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Principal</h3>
          <nav className="space-y-0.5">
            <NavItem icon={Home} label="Inicio" active />
            <NavItem icon={Inbox} label="Inbox" badge="5" />
            <NavItem icon={Trello} label="Pipeline" />
          </nav>
        </div>

        {/* Agentes */}
        <div>
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Agentes</h3>
          <nav className="space-y-0.5">
            <NavItem icon={Bot} label="Monitoreo IA" />
          </nav>
        </div>

        {/* Catálogo */}
        <div>
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Catálogo</h3>
          <nav className="space-y-0.5">
            <NavItem icon={Building2} label="Propiedades" />
          </nav>
        </div>

        {/* Analytics */}
        <div>
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Analytics</h3>
          <nav className="space-y-0.5">
            <NavItem icon={BarChart3} label="Reportes" />
          </nav>
        </div>

      </div>

      {/* Bottom Actions */}
      <div className="px-4 pb-4 mt-auto">
        <div className="border-t border-gray-100 pt-4 mb-4 space-y-0.5">
           <NavItem icon={Settings} label="Configuración" />
           <NavItem icon={HelpCircle} label="Ayuda" />
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
  icon: React.ElementType
  label: string
  active?: boolean
  badge?: string
}

const NavItem = ({ icon: Icon, label, active, badge }: NavItemProps) => (
  <a href="#" className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
    active 
      ? 'bg-gray-100 text-gray-900' 
      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
  }`}>
    <div className="flex items-center gap-3">
      <Icon className={`w-4 h-4 ${active ? 'text-[#D4A745]' : 'text-gray-400'}`} />
      <span>{label}</span>
    </div>
    {badge && (
      <span className="bg-[#D4A745] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
        {badge}
      </span>
    )}
  </a>
)
