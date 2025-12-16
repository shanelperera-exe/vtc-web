import React, { useState } from 'react'
import { HiLockClosed, HiShieldCheck, HiEye, HiEyeOff, HiExclamationCircle, HiRefresh, HiExternalLink } from 'react-icons/hi'
import { RiAdminLine } from 'react-icons/ri'
import { useNavigate, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'

export default function AdminLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, login, authError } = useAuth() || {}
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
      const rawMessage = authError || e?.message || 'Login failed'
      setError(rawMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-x-hidden overflow-y-auto bg-slate-50 text-neutral-900">
      {/* Animated aurora background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#bbf7d022,_transparent_60%),_radial-gradient(circle_at_bottom,_#a7f3d022,_transparent_55%)]" />
        <motion.div
          className="absolute -left-1/3 -top-1/4 h-[60vh] w-[70vw] rounded-full bg-emerald-300/70 mix-blend-screen blur-3xl"
          animate={{
            x: ['-15%', '8%', '18%', '-4%', '-15%'],
            y: ['0%', '-14%', '6%', '12%', '0%'],
            scale: [1, 1.06, 1.03, 1.08, 1],
          }}
          transition={{ duration: 32, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -right-1/4 top-1/3 h-[55vh] w-[60vw] rounded-full bg-sky-200/80 mix-blend-screen blur-3xl"
          animate={{
            x: ['12%', '-4%', '-14%', '6%', '12%'],
            y: ['12%', '0%', '-10%', '4%', '12%'],
            scale: [1.02, 1.06, 1.01, 1.05, 1.02],
          }}
          transition={{ duration: 26, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-1/3 left-1/4 h-[52vh] w-[55vw] rounded-full bg-emerald-100/80 mix-blend-screen blur-3xl"
          animate={{
            x: ['-4%', '10%', '-10%', '6%', '-4%'],
            y: ['10%', '0%', '-8%', '6%', '10%'],
            scale: [1, 1.04, 1.02, 1.06, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        />
        <div className="absolute inset-0 opacity-[0.40] bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:88px_88px]" />
      </div>

      {/* Content shell */}
      <div className="relative z-10 flex w-full max-w-6xl flex-col px-4 py-6 md:px-8 lg:px-12">
        {/* Main content */}
        <main className="mt-6 flex flex-1 flex-col gap-8 md:mt-8 md:flex-row md:items-center">
          {/* Left: copy / reassurance */}
          <section className="max-w-xl space-y-5 md:flex-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200/80 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-[pulse_1.6s_ease-in-out_infinite]" />
              <span>Secure access for authorized staff only</span>
            </div>

            <h1 className="text-3xl font-bold uppercase tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
              <span className="flex items-center gap-2">
                <RiAdminLine className="h-7 w-7 text-emerald-600 sm:h-9 sm:w-9" />
                <span>Admin Portal</span>
              </span>
              <span className="mt-2 block whitespace-nowrap bg-gradient-to-r from-emerald-700 via-emerald-500 to-emerald-300 bg-clip-text text-transparent">
                Vidara Trade Center
              </span>
            </h1>

            <p className="text-sm leading-relaxed text-neutral-600 sm:text-[15px]">
              Sign in to manage catalog updates, orders, pricing and
              operational workflows in a single, secure interface. All
              actions are recorded for compliance and audit purposes.
            </p>

            <p className="text-xs text-neutral-500">
              Need the public storefront instead? Visit our main site:
            </p>

            <a
              href="https://vidaratradecenter.me"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-black/60 focus:ring-offset-2 focus:ring-offset-slate-50"
            >
              <HiExternalLink className="h-3.5 w-3.5" />
              <span>Visit vidaratradecenter.me</span>
            </a>
          </section>

          {/* Right: login surface (form styling preserved) */}
          <section className="flex flex-1 items-center justify-center">
            <div className="relative w-full max-w-md sm:max-w-lg">
              {/* Glow behind card */}
              <div className="pointer-events-none absolute -inset-[2px] rounded-3xl bg-gradient-to-br from-emerald-400/55 via-emerald-300/25 to-transparent opacity-60 blur-xl" />

              {/* Card wrapper with original form styles preserved */}
              <div className="relative flex w-full flex-col justify-center rounded-3xl border-2 border-black bg-white/90 p-8 shadow-xl backdrop-blur-md sm:p-10">
                <div className="mb-6 space-y-3 text-center">
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                    <HiShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span>Verified Admin Access</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <HiLockClosed className="h-6 w-6 text-emerald-500 sm:h-7 sm:w-7" />
                    <h2 className="text-2xl font-extrabold uppercase tracking-tight text-neutral-900 sm:text-3xl">
                      Admin Sign In
                    </h2>
                  </div>
                  <p className="mt-1 text-[11px] sm:text-xs text-neutral-500">
                    Restricted console. Authorized personnel only.
                  </p>
                </div>

                {error && (
                  <div
                    className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 shadow-sm"
                    role="alert"
                  >
                    <div className="mt-0.5">
                      <HiExclamationCircle className="h-4 w-4 text-red-500" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-red-600">
                        Authentication error
                      </p>
                      <p className="text-xs leading-snug">
                        {error}
                      </p>
                    </div>
                  </div>
                )}

                {/* ORIGINAL FORM STYLES KEPT */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label
                      htmlFor="admin-email"
                      className="mb-1 block text-xs font-semibold tracking-wide text-neutral-700 uppercase"
                    >
                      Email
                    </label>
                    <input
                      id="admin-email"
                      type="email"
                      autoComplete="username"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-md border-2 border-neutral-900/80 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-[#0bd964]"
                      placeholder="you@admin.com"
                    />
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <label
                        htmlFor="admin-password"
                        className="block text-xs font-semibold tracking-wide text-neutral-700 uppercase"
                      >
                        Password
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        id="admin-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-md border-2 border-neutral-900/80 bg-white px-3 py-2 pr-10 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-[#0bd964] tracking-widest"
                        placeholder="••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-neutral-400 hover:text-neutral-700"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <HiEyeOff className="h-4 w-4" />
                        ) : (
                          <HiEye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-md border-2 border-neutral-900 bg-[#0bd964] px-4 py-2 text-sm font-semibold uppercase tracking-wide text-neutral-900 shadow transition disabled:cursor-not-allowed disabled:opacity-70 hover:-translate-y-0.5 active:translate-y-0"
                    >
                      {loading ? (
                        <>
                          <HiRefresh className="relative z-10 h-4 w-4 animate-spin" />
                          <span className="relative z-10">
                            Authenticating...
                          </span>
                        </>
                      ) : (
                        <>
                          <HiLockClosed className="relative z-10 h-4 w-4" />
                          <span className="relative z-10">
                            Sign In
                          </span>
                        </>
                      )}
                      <span className="absolute inset-0 -z-0 bg-gradient-to-br from-white/40 via-transparent to-black/10 opacity-0 transition group-hover:opacity-100" />
                    </button>
                  </div>
                </form>

                <div className="mt-5 flex flex-col items-center gap-1 text-[10px] font-medium text-neutral-500">
                  <p className="uppercase tracking-wide">Security Notice</p>
                  <p className="text-center leading-snug">
                    Your IP may be logged. Unauthorized access is prohibited.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer inside viewport */}
        <footer className="mt-4 text-[11px] text-center text-neutral-500 md:mt-6">
          © {new Date().getFullYear()} Vidara Trade Center. All rights reserved. Unauthorized access to this administrative portal is strictly prohibited.
        </footer>
      </div>
    </div>
  )
}