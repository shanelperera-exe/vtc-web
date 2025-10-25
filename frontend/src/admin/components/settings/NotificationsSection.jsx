import React from 'react'

export default function NotificationsSection() {
  return (
  <div className="space-y-4 border-2 border-neutral-900 p-6 bg-white">
      <h2 className="text-xl font-semibold">Notifications</h2>
      <p className="text-sm text-gray-600">Manage your notification preferences. (Coming soon)</p>
      <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
        <li>Email notifications</li>
        <li>Order updates</li>
        <li>Promotions and announcements</li>
      </ul>
    </div>
  )
}
