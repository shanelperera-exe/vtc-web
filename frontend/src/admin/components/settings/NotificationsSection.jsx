import React, { useEffect, useState } from 'react';
import { FiBell, FiMail, FiShoppingBag, FiAlertCircle } from 'react-icons/fi';

const STORAGE_KEY = 'vtc.admin.notifications';

function readPrefs() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function writePrefs(next) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export default function NotificationsSection() {
  const [prefs, setPrefs] = useState({
    emailNotifications: true,
    orderUpdates: true,
    lowStockAlerts: true,
  });

  useEffect(() => {
    const fromStorage = readPrefs();
    if (fromStorage) setPrefs((p) => ({ ...p, ...fromStorage }));
  }, []);

  useEffect(() => {
    writePrefs(prefs);
  }, [prefs]);

  const Toggle = ({ icon: Icon, title, description, value, onChange }) => (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-black/10 bg-white p-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-black/60" aria-hidden="true" />
          <div className="text-sm font-semibold text-gray-900">{title}</div>
        </div>
        <p className="mt-1 text-sm text-gray-600">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${value ? 'bg-black border-black' : 'bg-gray-200 border-black/10'}`}
        role="switch"
        aria-checked={value}
      >
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 inline-flex items-center gap-2">
          <FiBell className="w-5 h-5 text-black/60" aria-hidden="true" />
          <span>Notifications</span>
        </h2>
        <p className="mt-1 text-sm text-gray-600">Saved to this browser. Backend delivery can be wired later.</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <Toggle
          icon={FiMail}
          title="Email notifications"
          description="Allow admin email notifications."
          value={prefs.emailNotifications}
          onChange={(v) => setPrefs((p) => ({ ...p, emailNotifications: v }))}
        />
        <Toggle
          icon={FiShoppingBag}
          title="Order updates"
          description="Notify about important order state changes."
          value={prefs.orderUpdates}
          onChange={(v) => setPrefs((p) => ({ ...p, orderUpdates: v }))}
        />
        <Toggle
          icon={FiAlertCircle}
          title="Low stock alerts"
          description="Notify when products are running low in stock."
          value={prefs.lowStockAlerts}
          onChange={(v) => setPrefs((p) => ({ ...p, lowStockAlerts: v }))}
        />
      </div>
    </div>
  );
}
