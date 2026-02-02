import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { PageTransition } from './PageTransition'
import { Dashboard } from '../pages/Dashboard'
import { Inbox } from '../pages/Inbox'
import { Pipeline } from '../pages/Pipeline'
import { Leads } from '../pages/Leads'
import { Agentes } from '../pages/Agentes'
import { Emprendimientos } from '../pages/Emprendimientos'
import { Propiedades } from '../pages/Propiedades'
import { Tasaciones } from '../pages/Tasaciones'
import { Reportes } from '../pages/Reportes'
import { Configuracion } from '../pages/Configuracion'

export const AnimatedRoutes = () => {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/inbox" element={<PageTransition><Inbox /></PageTransition>} />
        <Route path="/inbox/:conversationId" element={<PageTransition><Inbox /></PageTransition>} />
        <Route path="/pipeline" element={<PageTransition><Pipeline /></PageTransition>} />
        <Route path="/leads" element={<PageTransition><Leads /></PageTransition>} />
        <Route path="/agentes" element={<PageTransition><Agentes /></PageTransition>} />
        <Route path="/emprendimientos" element={<PageTransition><Emprendimientos /></PageTransition>} />
        <Route path="/propiedades" element={<PageTransition><Propiedades /></PageTransition>} />
        <Route path="/tasaciones" element={<PageTransition><Tasaciones /></PageTransition>} />
        <Route path="/reportes" element={<PageTransition><Reportes /></PageTransition>} />
        <Route path="/configuracion" element={<PageTransition><Configuracion /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  )
}
