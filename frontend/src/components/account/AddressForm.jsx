import React, { useState } from "react";
import CommonBtn from "../ui/CommonBtn";

const AddressForm = ({ initialValues, onSave, onCancel }) => {
  const [values, setValues] = useState(initialValues);

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
        <label className="text-sm text-gray-700" htmlFor="address">Address</label>
        <input
          id="address"
          name="address"
          className="w-full rounded-none border-[3px] border-gray-300 px-3 py-2 outline-none focus:border-[#0bd964]"
          value={values.address}
          onChange={handleChange}
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm text-gray-700" htmlFor="city">City</label>
        <input
          id="city"
          name="city"
          className="w-full rounded-none border-[3px] border-gray-300 px-3 py-2 outline-none focus:border-[#0bd964]"
          value={values.city}
          onChange={handleChange}
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm text-gray-700" htmlFor="postalCode">Postal Code</label>
        <input
          id="postalCode"
          name="postalCode"
          className="w-full rounded-none border-[3px] border-gray-300 px-3 py-2 outline-none focus:border-[#0bd964]"
          value={values.postalCode}
          onChange={handleChange}
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
