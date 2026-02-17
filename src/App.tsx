import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Sidebar } from './components/Sidebar'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Inbox } from './pages/Inbox'
import { Pipeline } from './pages/Pipeline'
import { Leads } from './pages/Leads'
import { Agentes } from './pages/Agentes'
import { Emprendimientos } from './pages/Emprendimientos'
import { Propiedades } from './pages/Propiedades'
import { Tasaciones } from './pages/Tasaciones'
import { TasacionWeb } from './pages/TasacionWeb'
import { Reportes } from './pages/Reportes'
import { Configuracion } from './pages/Configuracion'
import { Status } from './pages/Status'
import { NotificationBell } from './components/NotificationBell'
import { Menu, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react'

function AuthenticatedApp() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { profile, signOut } = useAuth()

  return (
    <div className="h-screen bg-[#F8F9FA] lg:bg-[#D1D5DB] lg:p-4 font-sans overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
        >
          <Menu className="w-6 h-6" />
        </button>
        <span className="font-bold text-lg text-gray-900">STAR CRM</span>
        <NotificationBell />
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Container */}
      <div className="flex h-[calc(100vh-56px)] lg:h-[calc(100vh-32px)] bg-[#F8F9FA] rounded-none lg:rounded-3xl overflow-hidden lg:shadow-xl mt-14 lg:mt-0">
        <div className={`
          fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
          transform transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${sidebarCollapsed ? 'lg:hidden' : ''}
        `}>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 text-gray-600 z-10"
          >
            <X className="w-5 h-5" />
          </button>
          <Sidebar 
            onNavigate={() => setSidebarOpen(false)} 
            onLogout={signOut} 
            userName={profile?.full_name ?? 'Usuario'} 
            userRole={profile?.role ?? 'agent'}
            onCollapse={() => setSidebarCollapsed(true)}
          />
        </div>
        
        <div className="flex-1 overflow-auto relative">
          {/* Expand sidebar button (desktop only) */}
          {sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="hidden lg:flex fixed top-1/2 left-6 -translate-y-1/2 z-30 items-center justify-center w-8 h-8 bg-white border border-gray-200 rounded-full shadow-md hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-colors"
              title="Mostrar sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          )}
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/inbox/:conversationId" element={<Inbox />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/agentes" element={<Agentes />} />
            <Route path="/emprendimientos" element={<Emprendimientos />} />
            <Route path="/propiedades" element={<Propiedades />} />
            <Route path="/tasaciones" element={<Tasaciones />} />
            <Route path="/tasacion-web" element={<TasacionWeb />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/configuracion" element={<Configuracion />} />
            <Route path="/status" element={<Status />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

function AppContent() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#D4A745] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <Login />
  }

  return <AuthenticatedApp />
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
