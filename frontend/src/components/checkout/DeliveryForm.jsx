import React from 'react'
import { FiUser, FiHome, FiTruck } from 'react-icons/fi'
import Field from './Field'
import { inputCls } from './formUtils'
import Dropdown from '../ui/Dropdown'
import { provinces, districtsByProvince } from '../../data/sriLankaLocations'
import Checkbox from '../ui/Checkbox'
import RadioBtn from '../ui/RadioBtn'

export default function DeliveryForm({ data, onChange, errors, billing, onEditBilling, clearError }) {
  const toggleShipToDifferent = () => {
    onChange({ ...data, shipToDifferent: !data.shipToDifferent })
  }

  const setDeliveryMethod = (method) => onChange({ ...data, deliveryMethod: method })

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <Checkbox checked={!!data.shipToDifferent} onChange={toggleShipToDifferent} ariaLabel="Ship to a different address" />
          <span className="text-sm font-medium">Ship to a different address?</span>
        </div>

        {data.shipToDifferent && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Address line 1" id="shipping-address" required className="md:col-span-2" error={errors.shippingAddress ? (data.shippingAddress ? 'Please enter a valid address line 1.' : 'Shipping Address line 1 is a required field.') : ''}>
              <input
                id="shipping-address"
                type="text"
                value={data.shippingAddress || ''}
                onChange={(e) => {
                  const v = e.target.value
                  onChange({ ...data, shippingAddress: v })
                  if (v.trim()) clearError && clearError('shippingAddress')
                }}
                className={inputCls(errors.shippingAddress)}
                placeholder="House number and street name"
              />
            </Field>
            <Field label="Address line 2 (optional)" id="shipping-address2" className="md:col-span-2">
              <input
                id="shipping-address2"
                type="text"
                value={data.shippingAddress2 || ''}
                onChange={(e) => onChange({ ...data, shippingAddress2: e.target.value })}
                className={inputCls(false)}
                placeholder="Apartment, suite, unit, etc. (optional)"
              />
            </Field>
            <Field label="Postcode / ZIP" id="shipping-postal" required error={errors.shippingPostal ? (data.shippingPostal ? 'Please enter a valid postcode/ZIP.' : 'Shipping Postcode / ZIP is a required field.') : ''}>
              <input
                id="shipping-postal"
                type="text"
                value={data.shippingPostal || ''}
                onChange={(e) => {
                  const v = e.target.value
                  onChange({ ...data, shippingPostal: v })
                  if (v.trim()) clearError && clearError('shippingPostal')
                }}
                className={inputCls(errors.shippingPostal)}
                placeholder="00000"
              />
            </Field>
            <Field label="Town / City" id="shipping-city" required error={errors.shippingCity ? (data.shippingCity ? 'Please enter a valid town/city.' : 'Shipping Town / City is a required field.') : ''}>
              <input
                id="shipping-city"
                type="text"
                value={data.shippingCity || ''}
                onChange={(e) => {
                  const v = e.target.value
                  onChange({ ...data, shippingCity: v })
                  if (v.trim()) clearError && clearError('shippingCity')
                }}
                className={inputCls(errors.shippingCity)}
                placeholder="Colombo"
              />
            </Field>
            <Field label="Province" id="shipping-province" required>
              <Dropdown
                value={data.shippingProvince || ''}
                onChange={(v) => onChange({ ...data, shippingProvince: v, shippingDistrict: '' })}
                options={[{ label: 'Select province', value: '', disabled: true }, ...provinces]}
              />
            </Field>
            <Field label="District" id="shipping-district" required>
              <Dropdown
                value={data.shippingDistrict || ''}
                onChange={(v) => onChange({ ...data, shippingDistrict: v })}
                options={data.shippingProvince ? [{ label: 'Select district', value: '', disabled: true }, ...(districtsByProvince[data.shippingProvince] || []).map(d => ({ label: d, value: d }))] : [{ label: 'Select district', value: '', disabled: true }]}
              />
            </Field>
            <Field label="Country / Region" id="shipping-country" required className="md:col-span-2">
              <input
                id="shipping-country"
                type="text"
                value="Sri Lanka"
                readOnly
                className={inputCls(false)}
              />
            </Field>
            <Field label="Notes (optional)" id="shipping-notes" className="md:col-span-2">
              <textarea
                id="shipping-notes"
                rows={3}
                value={data.shippingNotes || ''}
                onChange={(e) => onChange({ ...data, shippingNotes: e.target.value })}
                className={inputCls(false)}
                placeholder="Delivery instructions (optional)"
              />
            </Field>
          </div>
        )}
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-semibold flex items-center gap-2"><FiUser className="w-4 h-4" />Contact</h4>
          <button type="button" onClick={onEditBilling} className="text-xs font-semibold text-[#0bd964] hover:underline">Change</button>
        </div>
        <div className="text-sm text-gray-700">
          <p>{billing?.firstName} {billing?.lastName}</p>
          <p>{billing?.email}</p>
          <p>{billing?.phone}</p>
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-semibold flex items-center gap-2"><FiHome className="w-4 h-4" />Address</h4>
          <button type="button" onClick={onEditBilling} className="text-xs font-semibold text-[#0bd964] hover:underline">Change</button>
        </div>
        <div className="text-sm text-gray-700">
          <p>{billing?.address1}</p>
          {billing?.address2 && <p>{billing.address2}</p>}
          <p>{billing?.city} {billing?.postal}</p>
          <p>{billing?.country || 'Sri Lanka'}</p>
        </div>
      </section>

      <section className="space-y-3">
  <h4 className="text-md font-semibold flex items-center gap-2"><FiTruck className="w-4 h-4" />Delivery Method</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className={`flex items-center justify-between border-3 p-3 cursor-pointer ${data.deliveryMethod === 'delivery' ? 'border-black' : 'border-gray-300'}`}>
            <span className="text-sm"><span className='font-semibold'>Standard Delivery </span><br /><span className='font-sm'>Charge: LKR 350.00</span></span>
            <RadioBtn name="delivery-method" value="delivery" checked={data.deliveryMethod === 'delivery'} onChange={() => setDeliveryMethod('delivery')} ariaLabel="Delivery" />
          </label>
          <label className={`flex items-center justify-between border-3 p-3 cursor-pointer ${data.deliveryMethod === 'pickup' ? 'border-black' : 'border-gray-300'}`}>
            <span className="text-sm font-semibold">Local pickup</span>
            <RadioBtn name="delivery-method" value="pickup" checked={data.deliveryMethod === 'pickup'} onChange={() => setDeliveryMethod('pickup')} ariaLabel="Local pickup" />
          </label>
        </div>
      </section>
    </div>
  )
}
