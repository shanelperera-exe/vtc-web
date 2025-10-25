import React, { useEffect, useState } from "react";
import CommonBtn from "../ui/CommonBtn";
import Dropdown from "../ui/Dropdown";
import { provinces, districtsByProvince } from '../../data/sriLankaLocations'

const AddressForm = ({ initialValues, onSave, onCancel }) => {
  const [values, setValues] = useState(initialValues);

  // Keep internal state in sync when parent changes initialValues (e.g., toggle Billing/Shipping)
  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(values);
  };

  return (
    <form className="space-y-4 p-4" onSubmit={handleSubmit}>
      <div className="space-y-1">
        <label className="text-sm text-gray-700" htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          className="w-full rounded-none border-[3px] border-gray-300 px-3 py-2 outline-none focus:border-[#0bd964]"
          value={values.name}
          onChange={handleChange}
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm text-gray-700" htmlFor="address1">Address line 1</label>
        <input
          id="address1"
          name="address1"
          className="w-full rounded-none border-[3px] border-gray-300 px-3 py-2 outline-none focus:border-[#0bd964]"
          value={values.address1 || ''}
          onChange={handleChange}
          placeholder="House number and street name"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm text-gray-700" htmlFor="address2">Address line 2 (optional)</label>
        <input
          id="address2"
          name="address2"
          className="w-full rounded-none border-[3px] border-gray-300 px-3 py-2 outline-none focus:border-[#0bd964]"
          value={values.address2 || ''}
          onChange={handleChange}
          placeholder="Apartment, suite, unit, etc. (optional)"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm text-gray-700" htmlFor="city">Town / City</label>
        <input
          id="city"
          name="city"
          className="w-full rounded-none border-[3px] border-gray-300 px-3 py-2 outline-none focus:border-[#0bd964]"
          value={values.city || ''}
          onChange={handleChange}
          placeholder="Colombo"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm text-gray-700" htmlFor="postal">Postcode / ZIP</label>
        <input
          id="postal"
          name="postal"
          className="w-full rounded-none border-[3px] border-gray-300 px-3 py-2 outline-none focus:border-[#0bd964]"
          value={values.postal || ''}
          onChange={handleChange}
          placeholder="00000"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm text-gray-700" htmlFor="province">Province</label>
          <Dropdown
            value={values.province || ''}
            onChange={(v) => setValues((s) => ({ ...s, province: v, district: '' }))}
            options={[{ label: 'Select province', value: '', disabled: true }, ...provinces]}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-gray-700" htmlFor="district">District</label>
          <Dropdown
            value={values.district || ''}
            onChange={(v) => setValues((s) => ({ ...s, district: v }))}
            options={values.province ? [{ label: 'Select district', value: '', disabled: true }, ...(districtsByProvince[values.province] || []).map(d => ({ label: d, value: d }))] : [{ label: 'Select district', value: '', disabled: true }]}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm text-gray-700" htmlFor="country">Country / Region</label>
        <input
          id="country"
          name="country"
          type="text"
          readOnly
          value={values.country || 'Sri Lanka'}
          className="w-full rounded-none border-[3px] border-gray-300 px-3 py-2 outline-none focus:border-[#0bd964] bg-gray-50"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm text-gray-700" htmlFor="phone">Phone</label>
        <input
          id="phone"
          name="phone"
          className="w-full rounded-none border-[3px] border-gray-300 px-3 py-2 outline-none focus:border-[#0bd964]"
          value={values.phone}
          onChange={handleChange}
        />
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <CommonBtn
          type="button"
          bgClass="bg-gray-200 text-gray-700 hover:bg-gray-300"
          className="px-4 py-2"
          label="Cancel"
          onClick={onCancel}
          fullWidth={false}
        />
        <CommonBtn
          type="submit"
          bgClass="bg-[#0bd964] text-black hover:bg-[#09a84e] hover:text-white"
          className="px-6 py-2"
          label="Save"
          fullWidth={false}
        />
      </div>
    </form>
  );
};

export default AddressForm;
