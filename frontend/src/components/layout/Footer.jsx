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
    <footer className="w-full bg-gradient-to-b from-neutral-950 via-neutral-900 to-black text-neutral-300">
      {/* Decorative top border */}
      <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-500" />

      {/* USP strip */}
      <div className="border-b border-neutral-800 bg-neutral-950/60 backdrop-blur-sm">
        <div className="mx-auto max-w-8xl px-3 sm:px-4 lg:px-6">
          <div className="grid gap-6 py-7 sm:grid-cols-2 lg:grid-cols-4">
            <USP
              icon={<FaTruck className="h-8 w-8 text-emerald-400" aria-hidden />}
              title="Free islandwide delivery"
              subtitle="On orders over LKR 8,000"
            />
            <USP
              icon={<FaLock className="h-8 w-8 text-emerald-400" aria-hidden />}
              title="Secure checkout"
              subtitle="Encrypted payments & verified partners"
            />
            <USP
              icon={<FaUndoAlt className="h-8 w-8 text-emerald-400" aria-hidden />}
              title="Hassle-free returns"
              subtitle="7‑day return window on eligible items"
            />
            <USP
              icon={<FaWhatsapp className="h-8 w-8 text-emerald-400" aria-hidden />}
              title="Live support"
              subtitle="WhatsApp assistance 9.00 AM – 10.00 PM"
            />
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="mx-auto max-w-8xl px-3 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Brand + about + social */}
          <div className="lg:col-span-4 text-center lg:text-left">
            <a href="/" aria-label="Home" className="inline-flex items-center gap-2">
              <img src={logo} alt="Vidara Trade Center" className="h-10 w-auto" />
              <span
                className="flex flex-col text-base md:text-2xl font-bold"
                style={{ fontFamily: 'Poppins, sans-serif', lineHeight: '0.9' }}
              >
                <span className="text-white">vidara</span>
                <span className="text-neutral-400">tradecenter.</span>
              </span>
            </a>
            <p className="mt-3 max-w-sm text-sm text-neutral-400 mx-auto lg:mx-0">
              An online marketplace from Wattala, Sri Lanka, connecting you with
              trusted brands, fair prices and friendly customer care.
            </p>

            <dl className="mt-5 space-y-2 text-sm text-neutral-400">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2 justify-center lg:justify-start">
                <dt className="font-semibold text-neutral-200">Store address:</dt>
                <dd>353, Kerawalapitiya, Hendala, Wattala, Sri Lanka</dd>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2 justify-center lg:justify-start">
                <dt className="font-semibold text-neutral-200">Hotline:</dt>
                <dd>+94 77 123 4567</dd>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2 justify-center lg:justify-start">
                <dt className="font-semibold text-neutral-200">Email:</dt>
                <dd>support@vidaratradecenter.lk</dd>
              </div>
            </dl>

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
          <nav
            className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-8"
            aria-label="Footer navigation"
          >
            <FooterColumn title="Shop">
              <FooterLink to="/products">All products</FooterLink>
              <FooterLink to="/categories">Browse categories</FooterLink>
              <FooterLink to="/offers">Deals & offers</FooterLink>
              <FooterLink to="/wishlist">Wishlist</FooterLink>
            </FooterColumn>
            <FooterColumn title="Customer care">
              <FooterLink to="/help">Help center</FooterLink>
              <FooterLink to="/shipping">Delivery information</FooterLink>
              <FooterLink to="/returns">Returns & exchanges</FooterLink>
              <FooterLink to="/contact">Contact support</FooterLink>
            </FooterColumn>
            <FooterColumn title="Company">
              <FooterLink to="/about">About Vidara</FooterLink>
              <FooterLink to="/contact">Visit our store</FooterLink>
              <FooterLink to="/privacy">Privacy policy</FooterLink>
              <FooterLink to="/terms">Terms & conditions</FooterLink>
            </FooterColumn>
          </nav>

          {/* Newsletter + hours + payments */}
          <div className="lg:col-span-3">
            <div className="text-base font-semibold text-white">
              Stay in the loop.
            </div>
            <p className="mt-1 text-sm text-neutral-400">
              Be the first to hear about new arrivals, seasonal offers and
              curated picks just for you.
            </p>

            <form
              aria-live="polite"
              noValidate
              onSubmit={onSubmit}
              className="mt-4 flex w-full flex-col gap-3 sm:flex-row"
            >
              <label htmlFor="newsletter" className="sr-only">
                Email
              </label>
              <input
                id="newsletter"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                aria-required="true"
                aria-invalid={
                  email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'true' : 'false'
                }
                className="h-[44px] w-full rounded-full border border-neutral-700 bg-neutral-900/60 px-4 text-sm text-white placeholder:text-neutral-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={submitting}
                aria-busy={submitting}
                className="h-[44px] w-full sm:w-auto rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-6 text-sm font-semibold text-neutral-900 shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                aria-label="Subscribe to newsletter"
              >
                {submitting ? 'Subscribing…' : 'Subscribe'}
              </button>
            </form>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm text-neutral-400">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-200">
                  Opening hours
                </h4>
                <p className="mt-1">
                  Mon – Sat: 9.00 AM – 10.00 PM
                  <br />
                  Sun & Poya days: 9.00 AM – 8.00 PM
                </p>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-200">
                  Payment methods
                </h4>
                <div className="mt-2 flex flex-wrap items-center gap-3 opacity-80">
                  {['visa', 'mastercard', 'amex'].map((b) => (
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
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-neutral-800/80 bg-neutral-950/80">
        <div className="mx-auto max-w-8xl px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 py-5 text-center text-xs sm:text-sm text-neutral-400 md:flex-row">
            <p className="order-2 md:order-1">
              © {new Date().getFullYear()} Vidara Trade Center. All rights reserved.
            </p>
            <div className="order-1 flex flex-wrap items-center justify-center gap-4 md:order-2">
              <span className="hidden sm:inline text-neutral-500">Made with care in Sri Lanka.</span>
              <a className="hover:text-emerald-400" href="/privacy">
                Privacy
              </a>
              <a className="hover:text-emerald-400" href="/terms">
                Terms
              </a>
              <a className="hover:text-emerald-400" href="/contact">
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

function USP({ icon, title, subtitle }) {
  return (
    <div className="flex items-start sm:items-center gap-4">
      <div className="shrink-0 mt-1 sm:mt-0">{icon}</div>
      <div className="text-left">
        <div className="text-sm sm:text-base font-semibold text-white">{title}</div>
        <div className="text-xs sm:text-sm text-neutral-400">{subtitle}</div>
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
