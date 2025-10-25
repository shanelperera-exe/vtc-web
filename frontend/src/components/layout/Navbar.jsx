import React, { useState, useEffect } from "react";
import { FiUser, FiShoppingCart, FiHeart, FiSearch } from "react-icons/fi";
import NavbarButton from './NavbarButton'
import AccountDropdown from '../account/AccountDropdown'
import SearchOverlay from "./SearchOverlay";
import NavLinks from "./NavLinks";
import { CatDropDown } from "./CatDropDown";
import logo3 from "../../assets/vtc_logo3.svg";
import AuthPopup from "../auth/AuthPopup";
import CartSidebar from "../cart/CartSidebar";
import CornerNav from "./HamburgerMenu";
import Menu from "./Menu";
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  // Desktop / global state
  const [showLogin, setShowLogin] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth() || {};
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Close search on Escape and prevent body scroll while search overlay is open
  // SearchOverlay handles Escape and body-scroll lock when open (controlled)

  return (
    <>
    <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="max-w-8xl mx-auto flex items-center justify-between px-5 py-2">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <img src={logo3} alt="Logo" className="h-8 md:h-10 w-auto" />
          <span className="flex flex-col text-lg md:text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif', lineHeight: '0.9' }}>
            <span className="text-black">vidara</span>
            <span className="text-gray-500">tradecenter.</span>
          </span>
        </a>

        {/* Desktop section (center utilities) */}
        <div className="hidden lg:flex items-center gap-6 ml-8">
          <NavLinks />
        </div>

        {/* Right Side Icons (desktop & mobile) */}
        <div className="flex items-center gap-3 relative ml-auto">
          {/* Place Explore products dropdown just left of the right-side icons on desktop */}
          <div className="hidden lg:flex items-center mr-3">
            <CatDropDown />
          </div>
          <NavbarButton onClick={() => setSearchOpen(s => !s)} aria-label="Open search">
            <FiSearch />
          </NavbarButton>


          <NavbarButton onClick={() => setShowLogin((s)=>!s)} aria-label="Account">
            <FiUser />
          </NavbarButton>
          <AccountDropdown
            open={showLogin}
            isLoggedIn={isAuthenticated}
            userName={user ? (user.firstName + ' ' + user.lastName) : 'Guest'}
            email={user?.email || ''}
            provider="password"
            onSignIn={() => { setAuthMode('login'); setAuthOpen(true); setShowLogin(false); }}
            onCreateAccount={() => { setAuthMode('register'); setAuthOpen(true); setShowLogin(false); }}
            onVisitProfile={() => { window.location.href = '/account'; setShowLogin(false); }}
            onSignOut={() => { logout?.(); setShowLogin(false); }}
          />
          {/* Cart always visible; wishlist hidden on mobile */}
          <NavbarButton onClick={() => setCartOpen(true)} aria-label="Open cart sidebar">
            <FiShoppingCart />
          </NavbarButton>
          {/* Wishlist only rendered on desktop to ensure not present in mobile DOM */}
          {isDesktop && (
            <NavbarButton as="a" href="/wishlist" aria-label="Open wishlist" style={{ textDecoration: 'none' }}>
              <FiHeart />
            </NavbarButton>
          )}
          {/* Hamburger menu inline where wishlist would be on mobile */}
          <div className="flex lg:hidden">
            <CornerNav
              isLoggedIn={isAuthenticated}
              userName={user ? (user.firstName + ' ' + user.lastName) : 'Guest'}
              email={user?.email || ''}
              onLogin={() => { setAuthMode('login'); setAuthOpen(true); }}
              onSignup={() => { setAuthMode('register'); setAuthOpen(true); }}
              onVisitProfile={() => { window.location.href='/account'; setShowLogin(false); }}
              onViewOrders={() => { window.location.href='/account/orders'; }}
              onSignOut={() => { logout?.(); setShowLogin(false); }}
            />
            {/* <Menu/> */}
          </div>
        </div>
      </div>
      </header>
      {/* Spacer to prevent content from being hidden under fixed navbar */}
      <div className="w-full h-14 md:h-16" aria-hidden="true" />
  <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

  {/* AuthPopup disabled while dropdown in use */}
      <AuthPopup isOpen={authOpen} onClose={() => setAuthOpen(false)} initialMode={authMode} />
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
};



export default Navbar;
