import React from 'react'
import Field from './Field'
import { inputCls } from './formUtils'
import { CreditCardIcon, BanknotesIcon, LockClosedIcon } from '@heroicons/react/24/solid'
import RadioBtn from '../ui/RadioBtn'

export default function PaymentForm({ data, onChange, errors, clearError }) {
  const detectBrand = (num = '') => {
    const n = (num || '').replace(/\D/g, '')
    if (/^4/.test(n)) return 'visa'
    if (/^(5[1-5]|2[2-7])/.test(n)) return 'mastercard'
    if (/^(34|37)/.test(n)) return 'amex'
    return null
  }
  const brand = detectBrand(data.cardNumber)
  const formatCardNumberDisplay = (digits, inferredBrand) => {
    const d = (digits || '').replace(/\D/g, '')
    const groups = inferredBrand === 'amex' ? [4, 6, 5] : [4, 4, 4, 4]
    const parts = []
    let idx = 0
    for (const g of groups) {
      if (idx >= d.length) break
      parts.push(d.slice(idx, idx + g))
      idx += g
    }
    return parts.join(' ')
  }
  const brandLogo = brand === 'visa'
    ? 'https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1/assets/visa.sxIq5Dot.svg'
    : brand === 'mastercard'
    ? 'https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1/assets/mastercard.1c4_lyMp.svg'
    : brand === 'amex'
    ? 'https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1/assets/amex.Csr7hRoy.svg'
    : null
  const expiryInvalid = data.expiry && data.expiry.length === 5 && !/^(0[1-9]|1[0-2])\/(\d{2})$/.test(data.expiry)
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex items-center gap-3 border-3 p-3 cursor-pointer">
          <RadioBtn
            name="payment-method"
            value="card"
            checked={data.method === 'card'}
            onChange={() => onChange({ ...data, method: 'card' })}
            ariaLabel="Pay by card"
          />
          <span className="flex items-center gap-2 font-medium px-2">
            <CreditCardIcon className="h-6 w-6 text-black" />
            <span>Card</span>
          </span>
          <span className="ml-auto flex items-center gap-1">
            <img
              src="https://raw.githubusercontent.com/datatrans/payment-logos/master/assets/cards/visa.svg"
              alt="Visa"
              width="40"
              height="24"
              style={brand && brand !== 'visa' ? { filter: 'grayscale(100%)', opacity: 0.5 } : {}}
              className='border-2'
            />
            <img
              src="https://raw.githubusercontent.com/datatrans/payment-logos/master/assets/cards/mastercard.svg"
              alt="Mastercard"
              width="40"
              height="24"
              style={brand && brand !== 'mastercard' ? { filter: 'grayscale(100%)', opacity: 0.5 } : {}}
              className='border-2'
            />
            <img
              src="https://raw.githubusercontent.com/datatrans/payment-logos/master/assets/cards/american-express.svg"
              alt="American Express"
              width="40"
              height="24"
              style={brand && brand !== 'amex' ? { filter: 'grayscale(100%)', opacity: 0.5 } : {}}
              className='border-2'
            />
          </span>
        </label>
        <label className="flex items-center gap-3 border-3 p-3 cursor-pointer">
          <RadioBtn
            name="payment-method"
            value="cod"
            checked={data.method === 'cod'}
            onChange={() => onChange({ ...data, method: 'cod' })}
            ariaLabel="Cash on delivery"
          />
          <span className="flex items-center gap-2 font-medium px-2"><BanknotesIcon className="h-6 w-6 text-black" /> Cash on Delivery</span>
        </label>
      </div>

      {data.method === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Cardholder Name" id="card-name" required error={errors.cardName ? 'Cardholder name is a required field.' : ''}>
            <input
              id="card-name"
              type="text"
              value={data.cardName}
              onChange={(e) => {
                const v = e.target.value
                onChange({ ...data, cardName: v })
                if (v.trim()) clearError && clearError('cardName')
              }}
              className={inputCls(errors.cardName)}
              placeholder="John Doe"
            />
          </Field>
          <Field label="Card Number" id="card-number" required error={errors.cardNumber ? (data.cardNumber ? 'Please enter a valid card number.' : 'Card number is a required field.') : ''}>
            <div className="relative">
              <input
                id="card-number-input"
                type="text"
                inputMode="numeric"
                value={formatCardNumberDisplay(data.cardNumber, brand)}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '')
                  const inferred = detectBrand(raw) || brand
                  const maxLen = inferred === 'amex' ? 15 : 16
                  const next = raw.slice(0, maxLen)
                  onChange({ ...data, cardNumber: next })
                  if (/^\d{15,16}$/.test(next)) clearError && clearError('cardNumber')
                }}
                className={`${inputCls(errors.cardNumber)} pr-24`}
                placeholder="0000 0000 0000 0000"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {brandLogo && (
                  <img
                    src={brandLogo}
                    alt={`${brand} logo`}
                    className="h-5 w-auto"
                  />
                )}
                <LockClosedIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
              </span>
            </div>
          </Field>
          <Field label="Expiration date (MM/YY)" id="card-expiry" required error={(errors.expiry || expiryInvalid) ? (data.expiry && data.expiry.length > 0 ? 'Please enter a valid expiration date.' : 'Expiration date is a required field.') : ''}>
            <div>
              <input
                id="card-expiry"
                type="text"
                inputMode="numeric"
                maxLength={5}
                value={data.expiry}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 4)
                  const mm = digits.slice(0, 2)
                  const yy = digits.slice(2)
                  const formatted = yy ? `${mm}/${yy}` : mm
                  onChange({ ...data, expiry: formatted })
                  if (/^(0[1-9]|1[0-2])\/(\d{2})$/.test(formatted)) clearError && clearError('expiry')
                }}
                className={inputCls(errors.expiry || expiryInvalid)}
                placeholder="MM/YY"
              />
              {/* Error message handled by Field's `error` prop */}
            </div>
          </Field>
          <Field label="CVV" id="card-cvc" required error={errors.cvc ? (data.cvc ? 'Please enter a valid CVV.' : 'CVV is a required field.') : ''}>
            <input
              id="card-cvc"
              type="password"
              inputMode="numeric"
              value={data.cvc}
              onChange={(e) => {
                const next = e.target.value.replace(/\D/g, '').slice(0, 4)
                onChange({ ...data, cvc: next })
                if (/^\d{3,4}$/.test(next)) clearError && clearError('cvc')
              }}
              className={inputCls(errors.cvc)}
              placeholder="CVV"
            />
          </Field>
        </div>
      )}
        {/* coupon input moved to Summary component */}
    </div>
  )
}
