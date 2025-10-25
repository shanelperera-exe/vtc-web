import React from 'react'
import { FiEdit, FiMail, FiPhone, FiTag } from 'react-icons/fi'
import SaveBtn from '../../../components/ui/SaveBtn'
import { AvatarImg } from '../../../services/AvatarImg'
import RoleBadge from '../../components/users/RoleBadge'

export default function AccountSettingsSection({
  values,
  errors,
  touched,
  emailEditing,
  emailDraft,
  setEmailEditing,
  setEmailDraft,
  setErrors,
  setTouched,
  setValues,
  validateEmail,
  handleChange,
  handleBlur,
  saveMsg,
  saveProfile,
  inputBase,
}) {
  const emailInvalid = touched.email && Boolean(errors.email)
  const phoneInvalid = touched.phone && Boolean(errors.phone)

  const maskEmail = (email) => {
    if (!email) return 'no-email@example.com'
    const parts = email.split('@')
    if (parts.length !== 2) return email.replace(/.(?=.{4})/g, '*')
    const [local, domain] = parts
    const keep = Math.min(5, local.length)
    const visible = local.slice(0, keep)
    const stars = '********'
    return `${visible}${stars}${domain}`
  }

  const roles = (values.roles && Array.isArray(values.roles)) ? values.roles : []

  return (
  <div className="border-2 border-neutral-900 p-6 bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: fields */}
        <div className="lg:col-span-2 space-y-4">
          {/* Name fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm text-gray-700" htmlFor="firstName">First Name</label>
              <input id="firstName" name="firstName" placeholder="Jane" className={inputBase} value={values.firstName} onChange={handleChange} />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-700" htmlFor="lastName">Last Name</label>
              <input id="lastName" name="lastName" placeholder="Doe" className={inputBase} value={values.lastName} onChange={handleChange} />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-sm text-gray-700 flex items-center gap-2" htmlFor="email"><FiMail className="text-gray-400" /><span>Email</span></label>
            {!emailEditing ? (
              <div className="flex items-center gap-3">
                <div className="text-gray-700">{maskEmail(values.email)}</div>
                <button type="button" className="inline-flex items-center gap-1 text-sm text-[#09a84e]" onClick={() => { setEmailDraft(values.email || ''); setEmailEditing(true) }}>
                  <FiEdit />
                  <span className="hover:underline">Change</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 w-full">
                <input id="email" type="email" name="email" placeholder="jane@example.com" className={`${inputBase} ${emailInvalid ? 'border-red-500' : ''} flex-1`} value={emailDraft} onChange={(e) => setEmailDraft(e.target.value)} onBlur={() => setTouched((t) => ({ ...t, email: true }))} />
                <button type="button" className="text-sm text-gray-600 hover:underline" onClick={() => { setEmailEditing(false); setEmailDraft(''); setErrors((er) => ({ ...er, email: '' })); }}>Cancel</button>
                <button type="button" className="text-sm text-white bg-[#09a84e] px-3 py-1" onClick={() => {
                  const err = validateEmail(emailDraft); setTouched((t) => ({ ...t, email: true })); setErrors((er) => ({ ...er, email: err })); if (!err) { setValues((v) => ({ ...v, email: emailDraft })); setEmailEditing(false); setEmailDraft(''); }
                }}>Save</button>
              </div>
            )}
            {touched.email && errors.email ? (<p className="text-sm text-red-600">{errors.email}</p>) : null}
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-sm text-gray-700 flex items-center gap-2" htmlFor="phone"><FiPhone className="text-gray-400" /><span>Phone</span></label>
            <div className="flex items-center">
              <input id="phone" name="phone" type="tel" placeholder="e.g. +1 555 555 5555" className={`${inputBase} ${phoneInvalid ? 'border-red-500' : ''} w-full sm:w-[265px]`} value={values.phone} onChange={handleChange} onBlur={handleBlur} />
            </div>
            {touched.phone && errors.phone ? (<p className="text-sm text-red-600">{errors.phone}</p>) : null}
          </div>

          {/* Roles (read-only) */}
          <div className="space-y-1">
            <label className="text-sm text-gray-700 flex items-center gap-2"><FiTag className="text-gray-400" /><span>Roles</span></label>
            <div className="flex flex-wrap gap-2">
              {(roles.length ? roles : ['ROLE_ADMIN']).map((r) => {
                const normalized = (r || '').toString().replace(/^ROLE_/i, '').toLowerCase();
                const label = normalized || 'user';
                return (<RoleBadge key={r} role={label} />)
              })}
            </div>
          </div>

          {/* Save (placed immediately under Roles for both mobile and desktop) */}
          <div className="flex flex-col items-start mt-4">
            <SaveBtn onSave={saveProfile} className="inline-flex items-center px-4 py-2 text-base w-auto justify-center" />
            {saveMsg && (<span className="mt-2 text-sm font-medium text-black">{saveMsg}</span>)}
          </div>
        </div>

        {/* Right: avatar */}
        <div className="hidden lg:flex lg:flex-col items-end">
          <AvatarImg
            seed={values.email || `${values.firstName} ${values.lastName}`}
            className="w-64 h-64 border-3 border-gray-300 object-cover"
            alt={`Avatar for ${values.firstName || values.email || 'admin'}`}
          />
        </div>

        {/* Mobile avatar */}
        <div className="lg:hidden w-full flex justify-center">
          <AvatarImg
            seed={values.email || `${values.firstName} ${values.lastName}`}
            className="w-40 h-40 border-3 border-gray-300 object-cover"
            alt={`Avatar for ${values.firstName || values.email || 'admin'}`}
          />
        </div>
      </div>
    </div>
  )
}
