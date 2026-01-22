import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Sidebar } from './components/Sidebar'
import { Dashboard } from './pages/Dashboard'
import { Inbox } from './pages/Inbox'
import { Pipeline } from './pages/Pipeline'
import { Agentes } from './pages/Agentes'
import { Emprendimientos } from './pages/Emprendimientos'
import { Propiedades } from './pages/Propiedades'
import { Tasaciones } from './pages/Tasaciones'
import { Reportes } from './pages/Reportes'
import { Configuracion } from './pages/Configuracion'
import { Menu, X } from 'lucide-react'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="h-screen bg-[#D1D5DB] p-2 md:p-4 font-sans overflow-hidden">
      {/* Mobile Header - Only visible on small screens */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
        >
          <Menu className="w-6 h-6" />
        </button>
        <span className="font-bold text-lg text-gray-900">STAR CRM</span>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Container */}
      <div className="flex h-[calc(100vh-16px)] md:h-[calc(100vh-32px)] bg-[#F8F9FA] rounded-2xl md:rounded-3xl overflow-hidden shadow-xl mt-14 lg:mt-0">
        
        {/* Sidebar - Responsive */}
        <div className={`
          fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* Close button for mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 text-gray-600 z-10"
          >
            <X className="w-5 h-5" />
          </button>
          <Sidebar onNavigate={() => setSidebarOpen(false)} />
        </div>
        
        {/* Main Content - Routes - CHANGED: overflow-auto instead of overflow-hidden */}
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/inbox/:conversationId" element={<Inbox />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/agentes" element={<Agentes />} />
            <Route path="/emprendimientos" element={<Emprendimientos />} />
            <Route path="/propiedades" element={<Propiedades />} />
            <Route path="/tasaciones" element={<Tasaciones />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/configuracion" element={<Configuracion />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default App
