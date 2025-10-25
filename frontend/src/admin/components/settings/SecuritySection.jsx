import React from 'react'
import OutlineButton from '../../../components/ui/OutlineBtn'

export default function SecuritySection({
  inputBase,
  pwd,
  setPwd,
  pwdErr,
  pwdMsg,
  pwdSaving,
  pwdStrength,
  strengthColors,
  handleChangePassword,
}) {
  return (
  <div className="space-y-4 border-2 border-neutral-900 p-6 bg-white">
      <h2 className="text-xl font-semibold">Password</h2>
      <div className="space-y-3 bg-gray-50 p-3 border border-gray-200 max-w-md">
        <div className="space-y-1">
          <label className="text-xs text-gray-700" htmlFor="currentPassword">Current password</label>
          <input id="currentPassword" type="password" placeholder="Current password" className={`${inputBase} text-sm px-2 py-1 ${pwdErr.current ? 'border-red-500' : ''}`} value={pwd.current} onChange={(e) => setPwd((p) => ({ ...p, current: e.target.value }))} />
          {pwdErr.current ? <p className="text-sm text-red-600">{pwdErr.current}</p> : null}
        </div>
        <div className="space-y-1">
          <label className="text-xs text-gray-700" htmlFor="newPassword">New password</label>
          <input id="newPassword" type="password" placeholder="New password" className={`${inputBase} text-sm px-2 py-1 ${pwdErr.next ? 'border-red-500' : ''}`} value={pwd.next} onChange={(e) => setPwd((p) => ({ ...p, next: e.target.value }))} />
          {pwd.next && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex gap-1 w-40">
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
          {pwdErr.next ? <p className="text-sm text-red-600">{pwdErr.next}</p> : null}
        </div>
        <div className="space-y-1">
          <label className="text-xs text-gray-700" htmlFor="confirmPassword">Confirm new password</label>
          <input id="confirmPassword" type="password" placeholder="Confirm new password" className={`${inputBase} text-sm px-2 py-1 ${pwdErr.confirm ? 'border-red-500' : ''}`} value={pwd.confirm} onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))} />
          {pwdErr.confirm ? <p className="text-sm text-red-600">{pwdErr.confirm}</p> : null}
        </div>
        <div className="flex items-center gap-3">
          <OutlineButton onClick={handleChangePassword} disabled={pwdSaving} label={pwdSaving ? 'Changing...' : 'Change Password'} size="sm" color="black" className="mt-2"/>
        </div>
      </div>
      {pwdMsg && <span className="text-sm text-gray-600">{pwdMsg}</span>}
    </div>
  )
}
