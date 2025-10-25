import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import AdminApp from './AdminApp.jsx'
import './styles/index.css'

function getAppMode() {
  try {
    const forced = import.meta?.env?.VITE_FORCE_APP_MODE;
    if (forced === 'admin' || forced === 'user') return forced;
    const { hostname, pathname } = window.location || {};
    if (hostname && /^admin\./i.test(hostname)) return 'admin';
    if (pathname && pathname.startsWith('/admin')) return 'admin';
  } catch {}
  return 'user';
}

const mode = getAppMode();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {mode === 'admin' ? (
      <AdminApp />
    ) : (
      <App />
    )}
  </StrictMode>,
)
