import { useEffect, useMemo, useState } from "react"
import { validateEmail as sharedValidateEmail } from '../../utils/validation'
import OutlineButton from "../ui/OutlineBtn"
import SaveBtn from "../ui/SaveBtn"
import { FiEdit, FiMail, FiLock, FiPhone } from 'react-icons/fi'
import { AvatarImg } from "../../services/AvatarImg"
import userApi from '../../api/userApi'
import { useAuth } from '../../context/AuthContext'
import zxcvbn from 'zxcvbn'

function AccountDetails() {
  const { user, refreshProfile } = useAuth()
  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })

  const [touched, setTouched] = useState({ email: false, phone: false })
  const [errors, setErrors] = useState({ email: "", phone: "" })
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState("")

  // Local state for inline email editing
  const [emailEditing, setEmailEditing] = useState(false)
  const [emailDraft, setEmailDraft] = useState("")

  // Change password UI state
  const [showPwdForm, setShowPwdForm] = useState(false)
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" })
  const [pwdErr, setPwdErr] = useState({ current: "", next: "", confirm: "" })
  const [pwdSaving, setPwdSaving] = useState(false)
  const [pwdMsg, setPwdMsg] = useState("")

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
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      })
    }
  }, [user])

  const validateEmail = (email) => {
    const err = sharedValidateEmail(email)
    return err ? 'Add a valid email address.' : ''
  }

  const validatePhone = (phone) => {
    if (!phone) return ""
    const digits = phone.replace(/\D/g, "")
    return digits.length >= 7 && digits.length <= 15 ? "" : "Add a valid phone number."
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((v) => ({ ...v, [name]: value }))
    if ((name === "email" || name === "phone") && touched[name] && errors[name]) {
      setErrors((er) => ({ ...er, [name]: "" }))
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched((t) => ({ ...t, [name]: true }))
    if (name === "email") setErrors((er) => ({ ...er, email: validateEmail(value) }))
    if (name === "phone") setErrors((er) => ({ ...er, phone: validatePhone(value) }))
  }

  // saveProfile will be passed to the new SaveBtn as `onSave`.
  // It performs validation, updates the profile, sets saveMsg on success/error
  // and throws on failure so the SaveBtn can reflect the error state.
  const saveProfile = async () => {
    const emailErr = validateEmail(values.email)
    const phoneErr = validatePhone(values.phone)
    setTouched({ email: true, phone: true })
    setErrors({ email: emailErr, phone: phoneErr })
    if (!emailErr && !phoneErr) {
      setSaving(true)
      setSaveMsg("")
      try {
        const payload = {
          firstName: values.firstName?.trim() || undefined,
          lastName: values.lastName?.trim() || undefined,
          email: values.email?.trim() || undefined,
          phone: values.phone || undefined,
        }
        await userApi.updateMe(payload)
  await refreshProfile()
  setSaveMsg("Changes saved successfully.")
      } catch (e) {
          const msg = e?.message || 'Failed to save changes'
          setSaveMsg(msg)
        // rethrow so SaveBtn shows error state
        throw new Error(msg)
      } finally {
        setSaving(false)
      }
    } else {
      // validation failed: surface error state on the button
      throw new Error('Validation failed')
    }
  }

  // Auto-hide save message: shorter for success, longer for errors
  useEffect(() => {
    if (!saveMsg) return
    const isSuccess = saveMsg.toLowerCase().includes('saved') || saveMsg.toLowerCase().includes('success')
    const timeout = isSuccess ? 2000 : 4000
    const t = setTimeout(() => setSaveMsg(''), timeout)
    return () => clearTimeout(t)
  }, [saveMsg])

  const validatePasswordForm = () => {
    const errs = { current: "", next: "", confirm: "" }
    if (!pwd.current || pwd.current.length < 1) errs.current = 'Enter your current password.'
    if (!pwd.next || pwd.next.length < 8) errs.next = 'New password must be at least 8 characters.'
    if (pwd.next && pwd.current && pwd.next === pwd.current) errs.next = 'New password must be different from current.'
    if (!pwd.confirm) errs.confirm = 'Please confirm your new password.'
    if (pwd.next && pwd.confirm && pwd.next !== pwd.confirm) errs.confirm = 'Passwords do not match.'
    setPwdErr(errs)
    return !errs.current && !errs.next && !errs.confirm
  }

  const handleChangePassword = async () => {
    setPwdMsg("")
    if (!validatePasswordForm()) return
    setPwdSaving(true)
    try {
      await userApi.changePassword({ currentPassword: pwd.current, newPassword: pwd.next })
      setPwdMsg('Password changed successfully.')
      setPwd({ current: "", next: "", confirm: "" })
      setShowPwdForm(false)
    } catch (e) {
      setPwdMsg(e?.message || 'Failed to change password')
    } finally {
      setPwdSaving(false)
    }
  }

  const inputBase = "w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/15"
  const emailInvalid = touched.email && Boolean(errors.email)
  const phoneInvalid = touched.phone && Boolean(errors.phone)

  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-600']

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-neutral-900 sm:text-3xl">Account Details</h2>
        <p className="mt-1 text-sm text-neutral-600">Update your personal information</p>
      </div>

      <div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try { await saveProfile(); } catch (err) { /* saveProfile sets saveMsg; swallow */ }
          }}
          className="space-y-5"
        >
          <div className="flex flex-col items-center gap-3 pb-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center">
              <AvatarImg
                seed={values.email || `${values.firstName} ${values.lastName}`}
                className="h-28 w-28 rounded-3xl border-2 border-black/10 object-cover sm:h-40 sm:w-40"
                alt={`Avatar for ${values.firstName || values.email || 'user'}`}
              />
              <div className="text-center sm:text-left">
                <div className="text-lg font-semibold text-neutral-900">
                  {[values.firstName, values.lastName].filter(Boolean).join(' ') || 'Your profile'}
                </div>
                <div className="text-sm text-neutral-600">{values.email || 'no-email@example.com'}</div>
              </div>
            </div>
          </div>

          {/* Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-700" htmlFor="firstName">First Name</label>
              <input id="firstName" name="firstName" placeholder="John" className={inputBase} value={values.firstName} onChange={handleChange} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-700" htmlFor="lastName">Last Name</label>
              <input id="lastName" name="lastName" placeholder="Doe" className={inputBase} value={values.lastName} onChange={handleChange} />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="flex items-center gap-2 text-sm font-medium text-neutral-700" htmlFor="email"><FiMail className="text-neutral-400" aria-hidden="true" /><span>Email</span></label>
            {!emailEditing ? (
              <div className="flex items-center gap-3">
                <div className="text-sm text-neutral-800">{values.email || 'no-email@example.com'}</div>
                <button type="button" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800" onClick={() => { setEmailDraft(values.email || ""); setEmailEditing(true) }}>
                  <FiEdit aria-hidden="true" />
                  <span>Change</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 w-full">
                <input id="email" type="email" name="email" placeholder="john@example.com" className={`${inputBase} ${emailInvalid ? "border-rose-500" : ""} flex-1`} value={emailDraft} onChange={(e) => setEmailDraft(e.target.value)} onBlur={() => setTouched((t) => ({ ...t, email: true }))} aria-invalid={Boolean(errors.email) && touched.email} />
                <button type="button" className="text-sm font-semibold text-neutral-700 hover:underline" onClick={() => { setEmailEditing(false); setEmailDraft(""); setErrors((er) => ({ ...er, email: "" })); }}>Cancel</button>
                <button type="button" className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700" onClick={() => {
                  const err = validateEmail(emailDraft); setTouched((t) => ({ ...t, email: true })); setErrors((er) => ({ ...er, email: err })); if (!err) { setValues((v) => ({ ...v, email: emailDraft })); setEmailEditing(false); setEmailDraft(""); }
                }}>Save</button>
              </div>
            )}
            {touched.email && errors.email ? (<p className="text-sm text-rose-700">{errors.email}</p>) : null}
          </div>

          {/* Password section */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-neutral-700"><FiLock className="text-neutral-400" aria-hidden="true" /><span>Password</span></label>
            {!showPwdForm ? (
              <div className="flex items-center gap-3">
                <div className="text-sm tracking-widest text-neutral-700">********</div>
                <button type="button" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800" onClick={() => { setShowPwdForm(true); setPwdMsg(""); setPwdErr({ current: "", next: "", confirm: "" }); }}>
                  <FiEdit aria-hidden="true" />
                  <span>Edit</span>
                </button>
              </div>
            ) : (
              <div className="max-w-md space-y-3 rounded-xl border border-black/10 bg-neutral-50 p-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-neutral-600" htmlFor="currentPassword">Current password</label>
                  <input id="currentPassword" type="password" placeholder="Current password" className={`${inputBase} ${pwdErr.current ? 'border-rose-500' : ''}`} value={pwd.current} onChange={(e) => setPwd((p) => ({ ...p, current: e.target.value }))} aria-invalid={Boolean(pwdErr.current)} />
                  {pwdErr.current ? <p className="text-sm text-rose-700">{pwdErr.current}</p> : null}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-neutral-600" htmlFor="newPassword">New password</label>
                  <input id="newPassword" type="password" placeholder="New password" className={`${inputBase} ${pwdErr.next ? 'border-rose-500' : ''}`} value={pwd.next} onChange={(e) => setPwd((p) => ({ ...p, next: e.target.value }))} aria-invalid={Boolean(pwdErr.next)} />
                  {/* Strength meter */}
                  {pwd.next && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1 w-40" aria-hidden="true">
                          {Array.from({ length: 5 }).map((_, i) => {
                            const activeCount = pwdStrength ? Math.max(1, pwdStrength.score + 1) : 0
                            const active = i < activeCount
                            const color = pwdStrength ? strengthColors[pwdStrength.score] : 'bg-gray-200'
                            return <div key={i} className={`h-1.5 flex-1 rounded ${active ? color : 'bg-gray-200'}`}></div>
                          })}
                        </div>
                        <span className="text-xs text-gray-600">{pwdStrength?.label || ''}</span>
                      </div>
                      {pwdStrength?.feedback && <p className="text-xs text-gray-500">{pwdStrength.feedback}</p>}
                    </div>
                  )}
                  {pwdErr.next ? <p className="text-sm text-rose-700">{pwdErr.next}</p> : null}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-neutral-600" htmlFor="confirmPassword">Confirm new password</label>
                  <input id="confirmPassword" type="password" placeholder="Confirm new password" className={`${inputBase} ${pwdErr.confirm ? 'border-rose-500' : ''}`} value={pwd.confirm} onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))} aria-invalid={Boolean(pwdErr.confirm)} />
                  {pwdErr.confirm ? <p className="text-sm text-rose-700">{pwdErr.confirm}</p> : null}
                </div>
                <div className="flex items-center gap-3">
                  <OutlineButton onClick={handleChangePassword} disabled={pwdSaving} label={pwdSaving ? 'Changing...' : 'Change Password'} size="sm" color="black" className="mt-2"/>
                  <button type="button" className="text-sm text-black hover:underline mt-2" onClick={() => { setShowPwdForm(false); setPwd({ current: '', next: '', confirm: '' }); setPwdErr({ current: '', next: '', confirm: '' }); setPwdMsg(''); }}>Cancel</button>
                  {pwdMsg && <span className="text-sm text-gray-600">{pwdMsg}</span>}
                </div>
              </div>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="flex items-center gap-2 text-sm font-medium text-neutral-700" htmlFor="phone"><FiPhone className="text-neutral-400" aria-hidden="true" /><span>Phone</span></label>
            <div className="flex items-center">
              <input id="phone" name="phone" type="tel" placeholder="e.g. +94 77 123 4567" className={`${inputBase} ${phoneInvalid ? 'border-rose-500' : ''} w-full sm:max-w-sm`} value={values.phone} onChange={handleChange} onBlur={handleBlur} />
            </div>
            {touched.phone && errors.phone ? (<p className="text-sm text-rose-700">{errors.phone}</p>) : null}
          </div>

          <div className="flex items-center justify-between gap-4 pt-2">
            <div className="min-h-[1.25rem] text-sm">
              {saveMsg ? (
                <span className="font-medium text-neutral-700">{saveMsg}</span>
              ) : null}
            </div>
            <SaveBtn onSave={saveProfile} className="rounded-xl inline-flex items-center justify-center px-5 py-2 text-base" />
          </div>

        </form>
      </div>
    </div>
  )
}

export default AccountDetails
