import { Routes, Route } from 'react-router-dom'
import { Sidebar } from './components/Sidebar'
import { Dashboard } from './pages/Dashboard'
import { Inbox } from './pages/Inbox'
import { Pipeline } from './pages/Pipeline'
import { Agentes } from './pages/Agentes'

function App() {
  return (
    <div className="h-screen bg-[#D1D5DB] p-4 font-sans overflow-hidden">
      {/* Main Container with rounded corners */}
      <div className="flex h-[calc(100vh-32px)] bg-[#F8F9FA] rounded-3xl overflow-hidden shadow-xl">
        
        {/* Sidebar - fixed inside container */}
        <Sidebar />
        
        {/* Main Content - Routes */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/inbox/:conversationId" element={<Inbox />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/agentes" element={<Agentes />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
