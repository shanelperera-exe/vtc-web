import React from 'react'

export default function PreferencesSection() {
  return (
  <div className="space-y-4 border-2 border-neutral-900 p-6 bg-white">
      <h2 className="text-xl font-semibold">Preferences</h2>
      <p className="text-sm text-gray-600">Customize your admin experience. (Coming soon)</p>
      <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
        <li>Theme and appearance</li>
        <li>Default dashboard view</li>
        <li>Time zone and locale</li>
      </ul>
    </div>
  )
}
