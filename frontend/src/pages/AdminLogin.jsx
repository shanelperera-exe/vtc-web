import React, { useState } from 'react'
import { useNavigate, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, login } = useAuth() || {}
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const roles = user?.roles || []
  const isAdmin = roles.includes('ROLE_ADMIN') || roles.includes('ROLE_MANAGER')
  if (isAdmin) {
    return <Navigate to="/admin" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setError('')
    try {
      const u = await login({ email, password })
      const uRoles = u?.roles || []
      const allow = uRoles.includes('ROLE_ADMIN') || uRoles.includes('ROLE_MANAGER')
      if (!allow) throw new Error('You do not have admin access')
      const redirectTo = (location.state && location.state.from && location.state.from.pathname) || '/admin'
      navigate(redirectTo, { replace: true })
    } catch (e) {
      setError(e.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-neutral-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight uppercase text-neutral-900">Admin Portal</h1>
          <span className="text-xs font-medium text-neutral-500">Vidara Trade Center</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="relative group">
            <div className="absolute inset-0 translate-x-1 translate-y-1 bg-neutral-900 rounded-xl" />
            <div className="relative rounded-xl border-2 border-neutral-900 bg-white p-6 sm:p-8 shadow-lg">
              <div className="mb-6 text-center">
                <h2 className="text-3xl font-extrabold tracking-tight uppercase text-neutral-900">Admin Sign In</h2>
                <p className="mt-2 text-xs text-neutral-500">Restricted area. Authorized personnel only.</p>
              </div>

              {error && (
                <div className="mb-4 rounded border border-red-500/30 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="admin-email" className="mb-1 block text-xs font-semibold tracking-wide text-neutral-700 uppercase">Email</label>
                  <input
                    id="admin-email"
                    type="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-md border-2 border-neutral-900/80 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#0bd964]"
                    placeholder="you@admin.com"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="admin-password" className="block text-xs font-semibold tracking-wide text-neutral-700 uppercase">Password</label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="text-[10px] font-medium text-[#0bd964] hover:underline"
                    >{showPassword ? 'HIDE' : 'SHOW'}</button>
                  </div>
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-md border-2 border-neutral-900/80 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#0bd964] tracking-widest"
                    placeholder="••••••"
                  />
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full overflow-hidden rounded-md border-2 border-neutral-900 bg-[#0bd964] px-4 py-2 text-sm font-semibold uppercase tracking-wide text-neutral-900 shadow transition disabled:cursor-not-allowed disabled:opacity-70 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span className="relative z-10">{loading ? 'Authenticating...' : 'Sign In'}</span>
                    <span className="absolute inset-0 -z-0 bg-gradient-to-br from-white/40 via-transparent to-black/10 opacity-0 transition group-hover:opacity-100" />
                  </button>
                </div>
              </form>

              <div className="mt-6 flex flex-col items-center text-[10px] font-medium text-neutral-500 gap-1">
                <p className="uppercase tracking-wide">Security Notice</p>
                <p className="text-center leading-snug">Your IP may be logged. Unauthorized access prohibited.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-[10px] text-neutral-500">
        © {new Date().getFullYear()} Vidara Trade Center — Admin Portal
      </footer>
    </div>
  )
}
