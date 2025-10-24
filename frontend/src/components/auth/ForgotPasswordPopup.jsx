import React, { useState } from 'react'
import { AnimatePresence, motion as M } from 'framer-motion'
import AuthButton from '../ui/AuthBtn'

/**
 * ForgotPasswordPopup
 * Props:
 *  - isOpen: boolean controls visibility
 *  - onClose: function to close popup
 *  - onBackToLogin: optional callback to return to login context
 *  - onSubmit: optional async handler receiving { email }
 */
const ForgotPasswordPopup = ({ isOpen, onClose, onBackToLogin, onSubmit }) => {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | submitting | sent | error
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (status === 'submitting') return
    setStatus('submitting')
    setError('')
    try {
      // Allow parent to handle real API; fallback to mock delay
      if (onSubmit) {
        await onSubmit({ email })
      } else {
        await new Promise(res => setTimeout(res, 800))
      }
      setStatus('sent')
    } catch (err) {
      setError(err?.message || 'Failed to send reset link')
      setStatus('error')
    }
  }

  const resetForm = () => {
    setEmail('')
    setError('')
    setStatus('idle')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <M.div
          initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 backdrop-blur-sm p-0 cursor-pointer"
        >
          <M.div
              initial={{ scale: 0.98 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl cursor-default border-2 border-neutral-950 rounded-lg"
            >
            <div className="absolute inset-0 bg-gradient-to-br bg-white" />
            <div className="relative z-10 h-full">
              <button
                onClick={onClose}
                aria-label="Close forgot password popup"
                className="absolute top-1 right-1 z-30 inline-flex h-12 w-12 items-center justify-center rounded-full text-neutral-900 transition"
              >
                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 md:h-8 md:w-8" xmlns="http://www.w3.org/2000/svg">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>

              <div className="w-full flex items-center justify-center p-6 md:p-8">
                <div className="w-full max-w-lg px-4 md:px-6">
                  {status !== 'sent' && (
                    <>
                      <h3 className="mb-1 text-center text-3xl font-bold uppercase">Forgot Password</h3>
                      <p className="mb-4 text-center text-sm text-neutral-500">Enter your account email and we'll send you a reset link.</p>
                      <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                          <label className="mb-1 block text-sm font-medium" htmlFor="fp-email">Email*</label>
                          <input
                            id="fp-email"
                            type="email"
                            required
                            placeholder="you@example.com"
                            className="w-full rounded border-[1px] border-neutral-300 p-2 outline-[#0bd964] transition-colors placeholder:italic focus:border-[#0bd964]"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>
                        {error && <div className="mb-3 text-sm font-medium text-red-600">{error}</div>}
                        <div className="flex flex-col gap-2">
                          <AuthButton
                            type="submit"
                            label={status === 'submitting' ? 'Sending...' : 'Send Reset Link'}
                            disabled={status === 'submitting'}
                            bgClass="bg-[#0bd964] text-black"
                          />
                          <AuthButton
                            type="button"
                            label="Back to Sign In"
                            onClick={() => { onBackToLogin?.(); onClose?.(); }}
                            bgClass="bg-neutral-600 text-white"
                          />
                        </div>
                      </form>
                    </>
                  )}
                  {status === 'sent' && (
                    <div className="text-center">
                      <h3 className="mb-2 text-2xl font-bold uppercase">Check Your Email</h3>
                      <p className="mb-4 text-sm text-neutral-600 max-w-md mx-auto">If an account exists for <span className="font-semibold">{email}</span>, you'll receive a password reset link shortly.</p>
                      <div className="flex flex-col gap-2 items-center">
                        <AuthButton
                          type="button"
                          label="Return to Sign In"
                          onClick={() => { onBackToLogin?.(); onClose?.(); }}
                          bgClass="bg-[#0bd964] text-black"
                        />
                        <button
                          type="button"
                          onClick={resetForm}
                          className="mt-2 text-xs italic text-[#0bd964] hover:underline"
                        >Use a different email</button>
                      </div>
                    </div>
                  )}
                  <div className="mt-4 flex flex-col items-center justify-center gap-2 text-xs text-neutral-700">
                    <div className="font-medium">
                      <a className="hover:underline" href="/components/license" rel="nofollow" target="_blank">License</a>
                      <span className="mx-2 inline-block">|</span>
                      <a className="hover:underline" href="/privacy.html" rel="nofollow" target="_blank">Privacy Policy</a>
                      <span className="mx-2 inline-block">|</span>
                      <a className="hover:underline" href="/terms.html" rel="nofollow" target="_blank">Terms</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </M.div>
        </M.div>
      )}
    </AnimatePresence>
  )
}

export default ForgotPasswordPopup
