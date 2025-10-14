import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import RegisterForm from '../components/auth/RegisterForm'
import { useAuth } from '../context/AuthContext'
import { getLastProtectedPath, clearLastProtectedPath } from '../components/auth/PrivateRoute'
import { useNotifications } from '../components/ui/notificationsContext'

export default function Register() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth() || {};
  const { notify } = (() => { try { return useNotifications(); } catch { return {}; } })();

  useEffect(() => {
    if (isAuthenticated) {
      notify?.({ type: 'info', text: 'You are already signed in.' })
      navigate('/account', { replace: true })
    }
  }, [isAuthenticated, navigate, notify])

  const handleSubmit = () => {
    const target = getLastProtectedPath() || '/account';
    setTimeout(() => { clearLastProtectedPath(); navigate(target, { replace: true }); }, 400);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-12">
        <RegisterForm onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
