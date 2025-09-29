import { useState } from "react"
import CommonBtn from "../ui/CommonBtn"

function AccountDetails() {
  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })

  const [touched, setTouched] = useState({ email: false, phone: false })
  const [errors, setErrors] = useState({ email: "", phone: "" })

  const validateEmail = (email) => {
    if (!email) return "Add a valid email address."
    const re = /[^\s@]+@[^\s@]+\.[^\s@]+/
    return re.test(email) ? "" : "Add a valid email address."
  }

  const validatePhone = (phone) => {
    if (!phone) return "" // optional
    const digits = phone.replace(/\D/g, "")
    return digits.length >= 7 && digits.length <= 15 ? "" : "Add a valid phone number."
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((v) => ({ ...v, [name]: value }))
    // If user starts typing after an error, clear the error and return border to normal
    if ((name === "email" || name === "phone") && touched[name] && errors[name]) {
      setErrors((er) => ({ ...er, [name]: "" }))
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched((t) => ({ ...t, [name]: true }))
    if (name === "email") setErrors((er) => ({ ...er, email: validateEmail(value) }))
    if (name === "phone") setErrors((er) => ({ ...er, phone: validatePhone(value) }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const emailErr = validateEmail(values.email)
    const phoneErr = validatePhone(values.phone)
    setTouched({ email: true, phone: true })
    setErrors({ email: emailErr, phone: phoneErr })
    if (!emailErr && !phoneErr) {
      // Submit or save changes
    }
  }

  const inputBase = "w-full rounded-none border-[3px] border-gray-300 px-3 py-2 outline-none focus:border-[#0bd964]"
  const emailInvalid = touched.email && Boolean(errors.email)
  const phoneInvalid = touched.phone && Boolean(errors.phone)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-4xl font-extrabold text-gray-900">Account Details</h2>
        <p className="mt-1 text-sm text-gray-500">Update your personal information</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-1">
          <label className="text-sm text-gray-700" htmlFor="firstName">First Name</label>
          <input
            id="firstName"
            name="firstName"
            placeholder="John"
            className={inputBase}
            value={values.firstName}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-gray-700" htmlFor="lastName">Last Name</label>
          <input
            id="lastName"
            name="lastName"
            placeholder="Doe"
            className={inputBase}
            value={values.lastName}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm text-gray-700" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="john@example.com"
            className={`${inputBase} ${emailInvalid ? "border-red-500" : ""}`}
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={Boolean(errors.email) && touched.email}
          />
          {touched.email && errors.email ? (
            <p className="text-sm text-red-600">{errors.email}</p>
          ) : null}
        </div>
        <div className="space-y-1">
          <label className="text-sm text-gray-700" htmlFor="phone">Phone</label>
          <input
            id="phone"
            name="phone"
            placeholder="071 123 4567"
            className={`${inputBase} ${phoneInvalid ? "border-red-500" : ""}`}
            value={values.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={Boolean(errors.phone) && touched.phone}
          />
          {touched.phone && errors.phone ? (
            <p className="text-sm text-red-600">{errors.phone}</p>
          ) : null}
        </div>
        <div className="sm:col-span-3 flex justify-center w-40">
          <CommonBtn
            type="submit"
            bgClass="bg-[#09a84e] text-white hover:bg-[#0bd964] hover:text-black"
            containerClassName=""
            className="inline-flex items-center px-4 py-2 text-base w-auto justify-center"
            label="Save Changes"
          />
        </div>
      </form>
    </div>
  )
}

export default AccountDetails
