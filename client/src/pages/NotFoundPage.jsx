import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui'
import { Home } from 'lucide-react'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-obsidian px-6">
      <div className="text-center max-w-md">
        <div className="font-mono text-[120px] font-bold text-white/5 leading-none select-none">404</div>
        <h1 className="font-display text-[32px] font-bold text-white -mt-8 mb-3 tracking-tight">Page not found</h1>
        <p className="font-body text-[15px] text-primary-muted mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button onClick={() => navigate('/app/dashboard')} className="inline-flex items-center gap-2">
          <Home size={16} /> Go to Dashboard
        </Button>
      </div>
    </div>
  )
}
