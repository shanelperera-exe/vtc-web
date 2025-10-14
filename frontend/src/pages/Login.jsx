import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import LoginForm from '../components/auth/LoginForm'
import { useAuth } from '../context/AuthContext'
import { getLastProtectedPath, clearLastProtectedPath } from '../components/auth/PrivateRoute'
import { useNotifications } from '../components/ui/notificationsContext'

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth() || {};
  const { notify } = (() => { try { return useNotifications(); } catch { return {}; } })();

  // If already logged in, redirect away
  useEffect(() => {
    if (isAuthenticated) {
      notify?.({ type: 'info', text: 'You are already signed in.' })
      navigate('/account', { replace: true })
    }
  }, [isAuthenticated, navigate, notify])

  const handleSubmit = () => {
    const target = getLastProtectedPath() || location.state?.from?.pathname || '/account';
    setTimeout(() => {
      clearLastProtectedPath();
      navigate(target, { replace: true });
    }, 300);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-12">
        <LoginForm onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
