import React, { useState, useEffect } from "react";
import { FiUser, FiShoppingCart, FiHeart } from "react-icons/fi";
import NavbarButton from './NavbarButton'
import AccountDropdown from '../account/AccountDropdown'
import Searchbar from "./SearchBar";
import NavLinks from "./NavLinks";
import { CatDropDown } from "./CatDropDown";
import assets from "../../assets/assets";
import AuthPopup from "../auth/AuthPopup";
import CartSidebar from "../cart/CartSidebar";
import CornerNav from "./HamburgerMenu";
import Menu from "./Menu";

const Navbar = () => {
  // Desktop / global state
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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

  return (
    <>
  <header className="bg-white shadow-md sticky top-0 z-40 border-b-3 border-black">
        <div className="max-w-8xl mx-auto flex items-center justify-between px-5 py-2">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <img src={assets.logo3} alt="Logo" className="h-8 md:h-10 w-auto" />
          <span className="flex flex-col text-lg md:text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif', lineHeight: '0.9' }}>
            <span className="text-black">vidara</span>
            <span className="text-gray-500">tradecenter.</span>
          </span>
        </a>

        {/* Desktop section (center utilities) */}
        <div className="hidden lg:flex items-center gap-6 ml-8">
          <NavLinks />
          <CatDropDown />
          <div className="w-72">
            <Searchbar />
          </div>
        </div>

        {/* Right Side Icons (desktop & mobile) */}
        <div className="flex items-center gap-3 relative ml-auto">
          <NavbarButton onClick={() => setShowLogin((s)=>!s)} aria-label="Account">
            <FiUser />
          </NavbarButton>
          <AccountDropdown
            open={showLogin}
            isLoggedIn={isLoggedIn}
            userName="Tim Cook"
            email="timc@gmail.com"
            provider="google.com"
            onSignIn={() => { setAuthMode('login'); setAuthOpen(true); setShowLogin(false); }}
            onCreateAccount={() => { setAuthMode('register'); setAuthOpen(true); setShowLogin(false); }}
            onVisitProfile={() => { console.log('Visit profile'); }}
            onSignOut={() => setIsLoggedIn(false)}
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
              isLoggedIn={isLoggedIn}
              userName="Tim Cook"
              email="timc@gmail.com"
              onLogin={() => { setAuthMode('login'); setAuthOpen(true); }}
              onSignup={() => { setAuthMode('register'); setAuthOpen(true); }}
              onVisitProfile={() => { console.log('Visit profile (mobile)'); setShowLogin(false); }}
              onViewOrders={() => { console.log('View orders (mobile)'); }}
              onSignOut={() => { setIsLoggedIn(false); setShowLogin(false); }}
            />
            {/* <Menu/> */}
          </div>
        </div>
      </div>
      </header>
  {/* AuthPopup disabled while dropdown in use */}
      <AuthPopup isOpen={authOpen} onClose={() => setAuthOpen(false)} initialMode={authMode} />
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
};



export default Navbar;
