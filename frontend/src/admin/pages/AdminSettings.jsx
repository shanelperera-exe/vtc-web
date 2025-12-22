import React, { useEffect, useMemo, useState } from 'react'
import { FiLock, FiUser, FiBell, FiSliders } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import userApi from '../../api/userApi'
import { validateEmail as sharedValidateEmail } from '../../utils/validation'
import zxcvbn from 'zxcvbn'
import AccountSettingsSection from '../components/settings/AccountSettingsSection'
import SecuritySection from '../components/settings/SecuritySection'
import NotificationsSection from '../components/settings/NotificationsSection'
import PreferencesSection from '../components/settings/PreferencesSection'

export default function AdminSettings() {
  const { user, refreshProfile } = useAuth() || {}
  const [activeTab, setActiveTab] = useState('account') // 'account' | 'security' | 'notifications' | 'preferences'
  const [values, setValues] = useState({ firstName: '', lastName: '', email: '', phone: '' })
  const [touched, setTouched] = useState({ email: false, phone: false })
  const [errors, setErrors] = useState({ email: '', phone: '' })
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  const [emailEditing, setEmailEditing] = useState(false)
  const [emailDraft, setEmailDraft] = useState('')

  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' })
  const [pwdErr, setPwdErr] = useState({ current: '', next: '', confirm: '' })
  const [pwdSaving, setPwdSaving] = useState(false)
  const [pwdMsg, setPwdMsg] = useState('')

  // Admin extras
  const roles = user?.roles || []

  const pwdStrength = useMemo(() => {
    if (!pwd.next) return null
    const analysis = zxcvbn(pwd.next)
    const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong']
    const feedback = analysis.feedback?.warning || analysis.feedback?.suggestions?.[0] || ''
    return { score: analysis.score, label: labels[analysis.score] || 'Very weak', feedback }
  }, [pwd.next])

  useEffect(() => {
    if (user) {
      setValues({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      })
      // 2FA removed per request
    }
  }, [user])

  const inputBase = 'w-full h-11 rounded-xl border border-black/10 bg-white px-4 text-sm text-gray-900 placeholder:text-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white'
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-600']

  const validateEmail = (email) => {
    const err = sharedValidateEmail(email)
    return err ? 'Add a valid email address.' : ''
  }
  const validatePhone = (phone) => {
    if (!phone) return ''
    const digits = phone.replace(/\D/g, '')
    return digits.length >= 7 && digits.length <= 15 ? '' : 'Add a valid phone number.'
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((v) => ({ ...v, [name]: value }))
    if ((name === 'email' || name === 'phone') && touched[name] && errors[name]) {
      setErrors((er) => ({ ...er, [name]: '' }))
    }
  }
  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched((t) => ({ ...t, [name]: true }))
    if (name === 'email') setErrors((er) => ({ ...er, email: validateEmail(value) }))
    if (name === 'phone') setErrors((er) => ({ ...er, phone: validatePhone(value) }))
  }

  const saveProfile = async () => {
    const emailErr = validateEmail(values.email)
    const phoneErr = validatePhone(values.phone)
    setTouched({ email: true, phone: true })
    setErrors({ email: emailErr, phone: phoneErr })
    if (!emailErr && !phoneErr) {
      setSaving(true)
      setSaveMsg('')
      try {
        const payload = {
          firstName: values.firstName?.trim() || undefined,
          lastName: values.lastName?.trim() || undefined,
          email: values.email?.trim() || undefined,
          phone: values.phone || undefined,
        }
        await userApi.updateMe(payload)
        await refreshProfile?.()
        setSaveMsg('Changes saved successfully.')
      } catch (e) {
        const msg = e?.message || 'Failed to save changes'
        setSaveMsg(msg)
        throw new Error(msg)
      } finally {
        setSaving(false)
      }
    } else {
      throw new Error('Validation failed')
    }
  }

  useEffect(() => {
    if (!saveMsg) return
    const isSuccess = saveMsg.toLowerCase().includes('saved') || saveMsg.toLowerCase().includes('success')
    const timeout = isSuccess ? 2000 : 4000
    const t = setTimeout(() => setSaveMsg(''), timeout)
    return () => clearTimeout(t)
  }, [saveMsg])

  const validatePasswordForm = () => {
    const errs = { current: '', next: '', confirm: '' }
    if (!pwd.current || pwd.current.length < 1) errs.current = 'Enter your current password.'
    if (!pwd.next || pwd.next.length < 8) errs.next = 'New password must be at least 8 characters.'
    if (pwd.next && pwd.current && pwd.next === pwd.current) errs.next = 'New password must be different from current.'
    if (!pwd.confirm) errs.confirm = 'Please confirm your new password.'
    if (pwd.next && pwd.confirm && pwd.next !== pwd.confirm) errs.confirm = 'Passwords do not match.'
    setPwdErr(errs)
    return !errs.current && !errs.next && !errs.confirm
  }

  const handleChangePassword = async () => {
    setPwdMsg('')
    if (!validatePasswordForm()) return
    setPwdSaving(true)
    try {
      await userApi.changePassword({ currentPassword: pwd.current, newPassword: pwd.next })
  setPwdMsg('Password changed successfully.')
  setPwd({ current: '', next: '', confirm: '' })
    } catch (e) {
      setPwdMsg(e?.message || 'Failed to change password')
    } finally {
      setPwdSaving(false)
    }
  }

  const sections = [
    { key: 'account', label: 'Account', Icon: FiUser, description: 'Profile and contact details' },
    { key: 'security', label: 'Security', Icon: FiLock, description: 'Password and access' },
    { key: 'notifications', label: 'Notifications', Icon: FiBell, description: 'Alerts and updates' },
    { key: 'preferences', label: 'Preferences', Icon: FiSliders, description: 'UI preferences' },
  ]

  return (
    <div className="mx-auto w-full max-w-screen-2xl px-5 md:px-10 py-8">
      <header className="mb-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-gray-900">Settings</h1>
            <p className="mt-2 text-sm text-gray-600">Manage your admin account, security, and preferences.</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sidebar */}
        <aside className="lg:col-span-4 xl:col-span-3">
          <nav aria-label="Settings sections" className="sticky top-6 rounded-2xl border border-black/10 bg-white p-2">
            <ul className="space-y-1">
              {sections.map(({ key, label, Icon, description }) => {
                const active = activeTab === key
                return (
                  <li key={key}>
                    <button
                      type="button"
                      onClick={() => setActiveTab(key)}
                      className={`w-full rounded-xl px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${active ? 'bg-black text-white' : 'bg-white text-gray-900 hover:bg-gray-50'}`}
                      aria-current={active ? 'page' : undefined}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-black/60'}`} aria-hidden="true" />
                        <div className="min-w-0">
                          <div className="text-sm font-semibold">{label}</div>
                          <div className={`text-xs ${active ? 'text-white/70' : 'text-gray-500'}`}>{description}</div>
                        </div>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>
        </aside>

        {/* Content */}
        <div className="lg:col-span-8 xl:col-span-9">
          <form onSubmit={async (e) => { e.preventDefault(); try { await saveProfile(); } catch {} }} className="space-y-6">
            {activeTab === 'account' && (
              <AccountSettingsSection
                values={{ ...values, roles }}
                errors={errors}
                touched={touched}
                emailEditing={emailEditing}
                emailDraft={emailDraft}
                setEmailEditing={setEmailEditing}
                setEmailDraft={setEmailDraft}
                setErrors={setErrors}
                setTouched={setTouched}
                setValues={setValues}
                validateEmail={validateEmail}
                handleChange={handleChange}
                handleBlur={handleBlur}
                saveMsg={saveMsg}
                saveProfile={saveProfile}
                inputBase={inputBase}
              />
            )}

            {activeTab === 'security' && (
              <SecuritySection
                inputBase={inputBase}
                pwd={pwd}
                setPwd={setPwd}
                pwdErr={pwdErr}
                pwdMsg={pwdMsg}
                pwdSaving={pwdSaving}
                pwdStrength={pwdStrength}
                strengthColors={strengthColors}
                handleChangePassword={handleChangePassword}
              />
            )}

            {activeTab === 'notifications' && (
              <NotificationsSection />
            )}

            {activeTab === 'preferences' && (
              <PreferencesSection />
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
