import { Outlet } from 'react-router-dom'
import TopNavBar from './TopNavBar'
import Footer from './Footer'
import { useSocketEvent } from '../../context/SocketContext'
import toast from 'react-hot-toast'
import { PageOrbs } from '../ui'

export default function AppShell() {  return (
    <div className="min-h-screen bg-transparent text-white font-body overflow-x-hidden flex flex-col relative z-0">
      <PageOrbs />
      <TopNavBar />
      
      <main className="pt-28 pb-24 flex-grow w-full">
        <Outlet />
      </main>
      
      <Footer className="bg-transparent backdrop-blur-md border-glass-border" />
    </div>
  )
}
