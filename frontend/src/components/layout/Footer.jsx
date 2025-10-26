import React, { useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { FaFacebookF, FaInstagram, FaUndoAlt, FaLock, FaTruck, FaWhatsapp } from 'react-icons/fa'
import { NotificationContext } from '../ui/notificationsContext'
import logo from '../../assets/vtc_logo3.svg'
import { sendNewsletterWelcome } from '../../api/notifications'

// Tailwind-first footer aligned with site styling (neutral/black base with emerald accents)
export default function Footer() {
  const notifCtx = useContext(NotificationContext)
  const notify = notifCtx?.notify
  const [email, setEmail] = useState('')

  const brandLogo = (brand) => (
    brand === 'visa'
      ? 'https://raw.githubusercontent.com/datatrans/payment-logos/master/assets/cards/visa.svg'
      : brand === 'mastercard'
      ? 'https://raw.githubusercontent.com/datatrans/payment-logos/master/assets/cards/mastercard.svg'
      : brand === 'amex'
      ? 'https://raw.githubusercontent.com/datatrans/payment-logos/master/assets/cards/american-express.svg'
      : null
  )

  const [submitting, setSubmitting] = useState(false)

  function deriveNameFromEmail(value) {
    if (!value) return 'Subscriber'
    const local = String(value).split('@')[0] || 'subscriber'
    // Capitalize first segment if possible
    const pretty = local.replace(/[^a-zA-Z0-9]+/g, ' ').trim()
    if (!pretty) return 'Subscriber'
    return pretty.charAt(0).toUpperCase() + pretty.slice(1)
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (submitting) return
    const isValid = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    if (!isValid) {
      if (notify) notify({ type: 'error', message: 'Please enter a valid email.' })
      return
    }
    try {
      setSubmitting(true)
      const customerName = deriveNameFromEmail(email)
      await sendNewsletterWelcome({ to: email, customerName })
      if (notify) notify({ type: 'success', message: 'You are subscribed! Check your inbox.' })
      setEmail('')
    } catch {
      if (notify) notify({ type: 'error', message: 'Subscription failed. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <footer className="w-full bg-neutral-950 text-neutral-300">
      {/* USP strip */}
      <div className="border-b border-neutral-800">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
          <div className="grid gap-6 py-8 sm:grid-cols-2 lg:grid-cols-3">
            <USP
              icon={<FaTruck className="h-10 w-10 text-emerald-400" aria-hidden />}
              title="Free islandwide delivery"
              subtitle="On orders over LKR 8,000"
            />
            <USP
              icon={<FaLock className="h-10 w-10 text-emerald-400" aria-hidden />}
              title="100% Payment secure"
              subtitle="We ensure secure payment"
            />
            <USP
              icon={<FaUndoAlt className="h-10 w-10 text-emerald-400" aria-hidden />}
              title="Money back guarantee"
              subtitle="You can return any item"
            />
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Brand + social */}
          <div className="lg:col-span-4 text-center lg:text-left">
            <a href="/" aria-label="Home" className="inline-flex items-center gap-2">
              <img src={logo} alt="Vidara Trade Center" className="h-10 w-auto" />
              <span className="flex flex-col text-base md:text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif', lineHeight: '0.9' }}>
                <span className="text-white">vidara</span>
                <span className="text-neutral-400">tradecenter.</span>
              </span>
            </a>
            <p className="mt-3 max-w-sm text-sm text-neutral-400">
              Vidara Trade Center brings you quality products with great service and secure shopping.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3 lg:justify-start">
              <SocialLink href="https://facebook.com" label="Facebook">
                <FaFacebookF className="h-6 w-6" />
              </SocialLink>
              <SocialLink href="https://wa.me/" label="WhatsApp">
                <FaWhatsapp className="h-6 w-6" />
              </SocialLink>
              <SocialLink href="https://instagram.com" label="Instagram">
                <FaInstagram className="h-6 w-6" />
              </SocialLink>
            </div>
          </div>

          {/* Link columns */}
          <nav className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-6" aria-label="Footer">
            <FooterColumn title="Information">
              <FooterLink to="/about">About us</FooterLink>
              <FooterLink to="/contact">Contact us</FooterLink>
              <FooterLink to="/terms">Terms & conditions</FooterLink>
              <FooterLink to="/privacy">Privacy policy</FooterLink>
            </FooterColumn>
            <FooterColumn title="Customer Service">
              <FooterLink to="/shipping">Shipping & delivery</FooterLink>
              <FooterLink to="/returns">Returns & exchanges</FooterLink>
              <FooterLink to="/contact">Customer support</FooterLink>
            </FooterColumn>
            <FooterColumn title="Account">
              <FooterLink to="/account">Order history</FooterLink>
              <FooterLink to="/wishlist">Wishlist</FooterLink>
              <FooterLink to="/cart">Shopping cart</FooterLink>
              <FooterLink to="/login">Sign in</FooterLink>
            </FooterColumn>
          </nav>

          {/* Newsletter */}
          <div className="lg:col-span-3">
            <div className="text-base font-semibold text-white">
              Subscribe to our newsletter.
            </div>
            <form aria-live="polite" noValidate onSubmit={onSubmit} className="mt-1 flex w-full flex-row">
              <div className="flex w-full min-h-[120px] flex-col justify-center p-0">
                {/* Row 1: Email input */}
                <div className="relative flex flex-row items-stretch">
                  <div className="relative flex flex-[1_0_0] justify-start p-0">
                    <div className="flex grow flex-col self-end">
                      <label htmlFor="newsletter" className="sr-only">Email</label>
                      <input
                        id="newsletter"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        aria-required="true"
                        aria-invalid={email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'true' : 'false'}
                        className="h-[40px] w-full rounded-none border-0 border-b border-neutral-600 bg-transparent pl-4 text-left text-[16px] font-normal text-white placeholder:text-neutral-400 focus:outline-none"
                      />
                      <div className="relative w-full" />
                    </div>
                  </div>
                </div>
                {/* Row 2: Subscribe button */}
                <div className="relative flex flex-row items-stretch">
                  <div className="relative flex flex-[1_0_0] justify-start py-[10px] px-0">
                    <button
                      type="submit"
                      disabled={submitting}
                      aria-busy={submitting}
                      className="h-[45px] w-full cursor-pointer rounded-full border-0 bg-white text-[16px] font-bold leading-[1] text-neutral-900 hover:bg-neutral-100 transition disabled:opacity-70 disabled:cursor-not-allowed"
                      aria-label="Subscribe"
                    >
                      {submitting ? 'Subscribing…' : 'Subscribe'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
            {/* Supported payment methods */}
            <div className="mt-5 flex items-center gap-3 opacity-80">
              {['visa','mastercard','amex'].map((b) => (
                <img
                  key={b}
                  src={brandLogo(b)}
                  alt={`${b} logo`}
                  className="h-7 w-auto"
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-neutral-800">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 py-6 text-center text-sm text-neutral-400 md:flex-row">
            <p className="order-2 md:order-1">© {new Date().getFullYear()} Vidara Trade Center. All rights reserved.</p>
            <div className="order-1 flex gap-4 md:order-2">
              <a className="hover:text-emerald-400" href="/privacy">Privacy</a>
              <a className="hover:text-emerald-400" href="/terms">Terms</a>
              <a className="hover:text-emerald-400" href="/contact">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

function USP({ icon, title, subtitle }) {
  return (
    <div className="flex items-center justify-center gap-4">
      <div className="shrink-0">{icon}</div>
      <div>
        <div className="text-base font-semibold text-white">{title}</div>
        <div className="text-sm text-neutral-400">{subtitle}</div>
      </div>
    </div>
  )
}

function FooterColumn({ title, children }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">{title}</h3>
      <ul className="space-y-2 text-sm text-neutral-300">{children}</ul>
    </div>
  )
}

function FooterLink({ to, children }) {
  return (
    <li>
      <Link to={to} className="transition-colors hover:text-emerald-400" aria-label={String(children)}>
        {children}
      </Link>
    </li>
  )
}

function SocialLink({ href, label, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-neutral-200 bg-white text-neutral-900 shadow-sm transition duration-150 ease-in-out hover:bg-emerald-600 hover:border-emerald-600 hover:text-white"
    >
      <span className="sr-only">{label}</span>
      <span aria-hidden className="text-lg">{children}</span>
    </a>
  )
}
