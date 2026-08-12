import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopHeader from './TopHeader'
import Footer from './Footer'
import { PageOrbs } from '../ui'

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-transparent text-white font-body overflow-x-hidden flex relative z-0">
      <PageOrbs />
      
      {/* Left Fixed / Collapsible Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content Area (offset by 64 (16rem / 256px) on large screens) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
        <TopHeader onOpenSidebar={() => setSidebarOpen(true)} />
        
        <main className="pt-6 pb-20 flex-grow w-full">
          <Outlet />
        </main>
        
        <Footer className="bg-transparent backdrop-blur-md border-glass-border" />
      </div>
    </div>
  )
}
