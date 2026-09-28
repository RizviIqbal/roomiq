import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import TopHeader from './TopHeader'
import Footer from './Footer'
import { PageOrbs } from '../ui'

const pageVariants = {
  initial: { opacity: 0, y: 16, filter: 'blur(6px)' },
  animate: { 
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  },
  exit: { 
    opacity: 0, y: -8, filter: 'blur(4px)',
    transition: { duration: 0.2, ease: 'easeIn' }
  }
}

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-screen bg-transparent text-white font-body overflow-x-hidden flex relative z-0">
      <PageOrbs />
      
      {/* Left Fixed / Collapsible Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content Area (offset by 64 (16rem / 256px) on large screens) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
        <TopHeader onOpenSidebar={() => setSidebarOpen(true)} />
        
        <main className="pt-6 pb-20 flex-grow w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
        
        <Footer className="bg-transparent backdrop-blur-md border-glass-border" />
      </div>
    </div>
  )
}
