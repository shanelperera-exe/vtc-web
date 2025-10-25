import React from 'react'
import Field from './Field'
import { inputCls } from './formUtils'
import Dropdown from '../ui/Dropdown'
import { provinces, districtsByProvince } from '../../data/sriLankaLocations'

export default function BillingForm({ data, onChange, errors, clearError }) {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-base font-semibold mb-3">Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="First Name" id="billing-firstName" required error={errors.firstName ? 'Billing First name is a required field.' : ''}>
            <input
              id="billing-firstName"
              type="text"
              value={data.firstName}
              onChange={(e) => {
                const v = e.target.value
                onChange({ ...data, firstName: v })
                if (v.trim()) clearError && clearError('firstName')
              }}
              className={inputCls(errors.firstName)}
              placeholder="John"
            />
          </Field>
          <Field label="Last Name" id="billing-lastName" required error={errors.lastName ? 'Billing Last name is a required field.' : ''}>
            <input
              id="billing-lastName"
              type="text"
              value={data.lastName}
              onChange={(e) => {
                const v = e.target.value
                onChange({ ...data, lastName: v })
                if (v.trim()) clearError && clearError('lastName')
              }}
              className={inputCls(errors.lastName)}
              placeholder="Doe"
            />
          </Field>
          <Field label="Company (optional)" id="billing-company" className="md:col-span-2">
            <input
              id="billing-company"
              type="text"
              value={data.company}
              onChange={(e) => onChange({ ...data, company: e.target.value })}
              className={inputCls(false)}
              placeholder="Company Pvt Ltd"
            />
          </Field>
          <Field label="Email" id="billing-email" required error={errors.email ? (data.email ? 'Please enter a valid email address.' : 'Billing Email is a required field.') : ''}>
            <input
              id="billing-email"
              type="email"
              value={data.email}
              onChange={(e) => {
                const v = e.target.value
                onChange({ ...data, email: v })
                if (/\S+@\S+\.\S+/.test(v)) clearError && clearError('email')
              }}
              className={inputCls(errors.email)}
              placeholder="john@example.com"
            />
          </Field>
          <Field label="Phone" id="billing-phone" required error={errors.phone ? (data.phone ? 'Please enter a valid phone number.' : 'Billing Phone is a required field.') : ''}>
            <input
              id="billing-phone"
              type="tel"
              value={data.phone}
              onChange={(e) => {
                const v = e.target.value
                onChange({ ...data, phone: v })
                if (v.trim()) clearError && clearError('phone')
              }}
              className={inputCls(errors.phone)}
              placeholder="0771234567"
            />
          </Field>
        </div>
      </section>

      <section>
        <h3 className="text-base font-semibold mb-3">Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Address line 1" id="billing-address1" required className="md:col-span-2" error={errors.address1 ? 'Billing Address line 1 is a required field.' : ''}>
            <input
              id="billing-address1"
              type="text"
              value={data.address1 || ''}
              onChange={(e) => {
                const v = e.target.value
                onChange({ ...data, address1: v })
                if (v.trim()) clearError && clearError('address1')
              }}
              className={inputCls(errors.address1)}
              placeholder="House number and street name"
            />
          </Field>
          <Field label="Address line 2 (optional)" id="billing-address2" className="md:col-span-2">
            <input
              id="billing-address2"
              type="text"
              value={data.address2 || ''}
              onChange={(e) => onChange({ ...data, address2: e.target.value })}
              className={inputCls(false)}
              placeholder="Apartment, suite, unit, etc. (optional)"
            />
          </Field>
          <Field label="Postcode / ZIP" id="billing-postal" required error={errors.postal ? 'Billing Postcode / ZIP is a required field.' : ''}>
            <input
              id="billing-postal"
              type="text"
              value={data.postal || ''}
              onChange={(e) => {
                const v = e.target.value
                onChange({ ...data, postal: v })
                if (v.trim()) clearError && clearError('postal')
              }}
              className={inputCls(errors.postal)}
              placeholder="00000"
            />
          </Field>

          <Field label="Town / City" id="billing-city" required error={errors.city ? 'Billing Town / City is a required field.' : ''}>
            <input
              id="billing-city"
              type="text"
              value={data.city || ''}
              onChange={(e) => {
                const v = e.target.value
                onChange({ ...data, city: v })
                if (v.trim()) clearError && clearError('city')
              }}
              className={inputCls(errors.city)}
              placeholder="Colombo"
            />
          </Field>

          <Field label="Province" id="billing-province" required>
            <Dropdown
              value={data.province || ''}
              onChange={(v) => onChange({ ...data, province: v, district: '' })}
              options={[{ label: 'Select province', value: '', disabled: true }, ...provinces]}
            />
          </Field>

          <Field label="District" id="billing-district" required error={errors.district ? 'District is required.' : ''}>
            <Dropdown
              value={data.district || ''}
              onChange={(v) => onChange({ ...data, district: v })}
              options={data.province ? [{ label: 'Select district', value: '', disabled: true }, ...(districtsByProvince[data.province] || []).map(d => ({ label: d, value: d }))] : [{ label: 'Select district', value: '', disabled: true }]}
            />
          </Field>

          <Field label="Country / Region" id="billing-country" required className="md:col-span-2">
            <input
              id="billing-country"
              type="text"
              value={data.country || 'Sri Lanka'}
              readOnly
              className={inputCls(false)}
            />
          </Field>
        </div>
      </section>

      <section>
        <h3 className="text-base font-semibold mb-3">Order Notes</h3>
        <Field label="Notes" id="billing-order-notes" className="md:col-span-2">
          <textarea
            id="billing-order-notes"
            rows={3}
            value={data.orderNotes || ''}
            onChange={(e) => onChange({ ...data, orderNotes: e.target.value })}
            className={inputCls(false)}
            placeholder="Notes about your order, e.g. special notes for delivery."
          />
        </Field>
      </section>
    </div>
  )
}
