import React, { useEffect, useMemo, useState } from 'react';
import { FiSearch, FiBell, FiMail, FiClock, FiCalendar } from 'react-icons/fi';
import { useAuth } from '../../../context/AuthContext';
import { AvatarImg } from '../../../services/AvatarImg';
import AdminAccountDropdown from './AdminAccountDropdown';
import { useNavigate } from 'react-router-dom';

  const AdminSearchBar = () => (
  <div className="relative w-40 sm:w-56 md:w-[320px]">
    <input
      type="text"
      name="text"
      className="w-full h-10 pl-3 pr-10 border-2 border-black rounded-xl text-sm focus:outline-none focus:border-black bg-white/90"
      placeholder="Search"
    />
    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black">
      <FiSearch size={20} />
    </span>
  </div>
);

const AdminIconsAvatar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth() || {};
  const [open, setOpen] = useState(false);

  const adminName = useMemo(() => {
    if (!user) return 'Admin';
    if (user.firstName || user.lastName) return [user.firstName, user.lastName].filter(Boolean).join(' ');
    return user.name || 'Admin';
  }, [user]);
  const email = user?.email || '';

  // Close on outside click / escape
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      // Close if clicking outside container
      const container = document.getElementById('admin-avatar-container');
      if (container && !container.contains(e.target)) setOpen(false);
    };
    const onEsc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  const handleSignOut = async () => {
    await logout?.();
    setOpen(false);
    navigate('/admin/login');
  };

  return (
    <div id="admin-avatar-container" className="relative flex shrink-0 gap-4">
      <button className="relative text-xl text-black" aria-label="Notifications">
        <FiBell size={24} />
        <span className="absolute left-0 top-0 grid h-5 w-5 -translate-x-[50%] -translate-y-[5%] place-content-center border-2 border-black text-xs font-medium" style={{background: "#0bd964", color: "black"}}>17</span>
      </button>
      <button className="relative text-xl text-gray-400" aria-label="Messages">
        <FiMail size={24} />
      </button>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="grid h-10 w-10 cursor-pointer place-content-center border-2 border-black rounded-full overflow-hidden"
        style={{ background: "#0bd964", color: "#000" }}
      >
        <AvatarImg
          seed={email || adminName}
          style="notionists"
          alt={`Avatar for ${adminName}`}
          className="h-12 w-12 object-cover"
        />
      </button>

      <AdminAccountDropdown
        open={open}
        isLoggedIn={!!user}
        adminName={adminName}
        email={email}
        onVisitDashboard={() => { navigate('/admin'); setOpen(false); }}
        onAccountSettings={() => { navigate('/admin/settings'); setOpen(false); }}
        onSignOut={handleSignOut}
        onSignIn={() => { navigate('/admin/login'); setOpen(false); }}
      />
    </div>
  );
};

const AdminGreeting = () => {
  const { user } = useAuth() || {};
  const [now, setNow] = useState(new Date());
  const [adminName, setAdminName] = useState('Vidara');

  useEffect(() => {
    // Prefer authenticated user name; fallback to stored value
    const full = user && (user.firstName || user.lastName)
      ? [user.firstName, user.lastName].filter(Boolean).join(' ')
      : (user?.name || null);
    if (full) setAdminName(full);
    else {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('adminName') : null;
      if (stored) setAdminName(stored);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    const full = (user.firstName || user.lastName)
      ? [user.firstName, user.lastName].filter(Boolean).join(' ')
      : (user.name || '');
    if (full) {
      setAdminName(full);
      try { localStorage.setItem('adminName', full); } catch {}
    }
  }, [user]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const greeting = useMemo(() => {
    const h = now.getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    if (h < 21) return 'Good evening';
    return 'Good night';
  }, [now]);

  const timeStr = useMemo(() => now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), [now]);
  const dateStr = useMemo(() => now.toLocaleDateString([], { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }), [now]);

  return (
    <div className="hidden sm:flex flex-col ml-2 md:ml-4">
      <div className="inline-flex items-center gap-2 text-black">
        <span className="text-xs md:text-base">{greeting},</span>
        <span className="text-xs md:text-base font-semibold truncate">{adminName}</span>
      </div>
      <div className="mt-1 flex items-center gap-3 text-[11px] md:text-xs text-gray-700">
        <div className="inline-flex items-center gap-1">
          <FiClock className="text-black" size={14} />
          <span>{timeStr}</span>
        </div>
        <div className="inline-flex items-center gap-1">
          <FiCalendar className="text-black" size={14} />
          <span>{dateStr}</span>
        </div>
      </div>
    </div>
  );
};

const AdminTopBar = () => (
  <div className="sticky top-0 z-40 w-full px-3 md:px-4 py-3 backdrop-blur-md bg-white/70 supports-[backdrop-filter]:bg-white/60 border-b border-black/10">
    <div className="flex items-center justify-between gap-3 md:gap-8 rounded-2xl px-3 md:px-4 py-2">
      <div className="flex w-full items-center gap-2 md:gap-4">
        <AdminSearchBar />
        <AdminGreeting />
      </div>
      <AdminIconsAvatar />
    </div>
  </div>
);

export default AdminTopBar;
