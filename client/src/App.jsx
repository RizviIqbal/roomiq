import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'

// Pages
import LandingPage      from './pages/LandingPage'
import LoginPage        from './pages/LoginPage'
import RegisterPage     from './pages/RegisterPage'
import QuizPage         from './pages/QuizPage'
import HouseSetupPage   from './pages/HouseSetupPage'
import FinancePage      from './pages/FinancePage'
import MaintenancePage  from './pages/MaintenancePage'
import ProfilePage      from './pages/ProfilePage'
import MatchingPage     from './pages/MatchingPage'
import FindRoommatesPage from './pages/FindRoommatesPage'
import ChatPage         from './pages/ChatPage'
import InboxPage        from './pages/InboxPage'
import RulesPage        from './pages/RulesPage'
import ChoresPage       from './pages/ChoresPage'

// Layout
import AppShell from './components/layout/AppShell'

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!user) return <Navigate to="/login" replace />
  return children
}

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  if (user) return <Navigate to="/app/finance" replace />
  return children
}

const PageLoader = () => (
  <div className="flex items-center justify-center h-screen bg-canvas">
    <div className="w-7 h-7 rounded-full border-2 border-neutral-200 border-t-neutral-950 animate-spin" />
  </div>
)

const AppRoutes = () => {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Public */}
      <Route path="/"         element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Onboarding — auth required but no house yet */}
      <Route path="/quiz"       element={<PrivateRoute><QuizPage /></PrivateRoute>} />
      <Route path="/house-setup" element={<PrivateRoute><HouseSetupPage /></PrivateRoute>} />
      
      {/* App shell with sidebar */}
      <Route path="/app" element={<PrivateRoute><AppShell /></PrivateRoute>}>
        <Route index               element={<Navigate to="finance" replace />} />
        <Route path="finance"      element={<FinancePage />} />
        <Route path="maintenance"  element={<MaintenancePage />} />
        <Route path="profile"      element={<ProfilePage />} />
        <Route path="matching"     element={<MatchingPage />} />
        <Route path="find-roommates" element={<FindRoommatesPage />} />
        <Route path="chat/:userId" element={<ChatPage />} />
        <Route path="inbox"        element={<InboxPage />} />
        <Route path="rules"        element={<RulesPage />} />
        <Route path="chores"       element={<ChoresPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/app/finance" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <AppRoutes />
      </SocketProvider>
    </AuthProvider>
  )
}
