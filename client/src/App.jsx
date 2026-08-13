import { Routes, Route, Navigate, useParams } from 'react-router-dom'
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
import MessagesPage     from './pages/MessagesPage'
import RulesPage        from './pages/RulesPage'
import ChoresPage       from './pages/ChoresPage'
import ComplaintsPage   from './pages/ComplaintsPage'
import ShoppingPage     from './pages/ShoppingPage'
import DiscoverPage     from './pages/DiscoverPage'

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

const ChatRedirect = () => {
  const { userId } = useParams()
  return <Navigate to={`/app/chat/${userId}`} replace />
}

const AppRoutes = () => {
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
        <Route path="chores"       element={<ChoresPage />} />
        <Route path="rules"        element={<RulesPage />} />
        <Route path="maintenance"  element={<MaintenancePage />} />
        <Route path="complaints"   element={<ComplaintsPage />} />
        <Route path="shopping"     element={<ShoppingPage />} />
        <Route path="discover"     element={<DiscoverPage />} />
        <Route path="matching"     element={<MatchingPage />} />
        <Route path="find-roommates" element={<FindRoommatesPage />} />
        <Route path="chat/:userId" element={<ChatPage />} />
        <Route path="messages"     element={<MessagesPage />} />
        <Route path="inbox"        element={<MessagesPage />} />
        <Route path="profile"      element={<ProfilePage />} />
      </Route>

      {/* Root-level redirects for convenience */}
      <Route path="/messages" element={<Navigate to="/app/messages" replace />} />
      <Route path="/inbox"    element={<Navigate to="/app/messages" replace />} />
      <Route path="/finance"  element={<Navigate to="/app/finance" replace />} />
      <Route path="/chores"   element={<Navigate to="/app/chores" replace />} />
      <Route path="/rules"    element={<Navigate to="/app/rules" replace />} />
      <Route path="/maintenance" element={<Navigate to="/app/maintenance" replace />} />
      <Route path="/complaints" element={<Navigate to="/app/complaints" replace />} />
      <Route path="/shopping" element={<Navigate to="/app/shopping" replace />} />
      <Route path="/discover" element={<Navigate to="/app/discover" replace />} />
      <Route path="/matching" element={<Navigate to="/app/matching" replace />} />
      <Route path="/chat/:userId" element={<ChatRedirect />} />

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
