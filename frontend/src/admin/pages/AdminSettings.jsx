import React, { useEffect, useMemo, useState } from 'react'
import { FiLock, FiUser, FiBell, FiSliders } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import userApi from '../../api/userApi'
import { validateEmail as sharedValidateEmail } from '../../utils/validation'
import zxcvbn from 'zxcvbn'
import AccountSettingsSection from '../components/settings/AccountSettingsSection'
import SecuritySection from '../components/settings/SecuritySection'
import NotificationsSection from '../components/settings/NotificationsSection'

export default function AdminSettings() {
  const { user, refreshProfile } = useAuth() || {}
  const [activeTab, setActiveTab] = useState('account') // 'account' | 'security' | 'notifications'
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

  const inputBase = 'w-full rounded-none border-[3px] border-gray-300 px-3 py-2 outline-none focus:border-[#0bd964]'
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

  const emailInvalid = touched.email && Boolean(errors.email)
  const phoneInvalid = touched.phone && Boolean(errors.phone)

  return (
    <div className="px-2 md:px-6 py-6">
      <div className="mb-6">
        <h1 className="text-6xl font-semibold text-gray-900 ml-3">Settings</h1>
        <p className="mt-2 text-sm text-gray-500 ml-3">Manage your admin account and security settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        <form onSubmit={async (e) => { e.preventDefault(); try { await saveProfile(); } catch {} }} className="lg:col-span-3 bg-white p-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
            {/* Subsection menu */}
            <aside className="md:col-span-1">
              <nav aria-label="Settings sections" className="border-2 border-neutral-900">
                <ul className="divide-y-2 divide-neutral-900">
                  <li>
                    <button type="button" onClick={() => setActiveTab('account')} className={`w-full flex items-center gap-3 px-4 py-3 text-base font-semibold ${activeTab==='account' ? 'bg-black text-green-400' : 'bg-white text-black hover:bg-neutral-100'}`} aria-current={activeTab==='account' ? 'page' : undefined}>
                      <FiUser /> <span>Account</span>
                    </button>
                  </li>
                  <li>
                    <button type="button" onClick={() => setActiveTab('security')} className={`w-full flex items-center gap-3 px-4 py-3 text-base font-semibold ${activeTab==='security' ? 'bg-black text-green-400' : 'bg-white text-black hover:bg-neutral-100'}`}>
                      <FiLock /> <span>Security</span>
                    </button>
                  </li>
                  <li>
                    <button type="button" onClick={() => setActiveTab('notifications')} className={`w-full flex items-center gap-3 px-4 py-3 text-base font-semibold ${activeTab==='notifications' ? 'bg-black text-green-400' : 'bg-white text-black hover:bg-neutral-100'}`}>
                      <FiBell /> <span>Notifications</span>
                    </button>
                  </li>
                  {/* Preferences removed */}
                </ul>
              </nav>
            </aside>

            {/* Section content */}
            <section className="md:col-span-5 space-y-4 px-0">
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

              {/* Preferences removed */}
            </section>
          </div>
        </form>

        {/* desktop save moved into AccountSettingsSection */}
      </div>
      
    </div>
  )
}
