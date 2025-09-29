import React, { useState } from "react"
import EditBtn from "../ui/EditBtn"
import AddressPopup from "./AddressPopup"
import AddressForm from "./AddressForm"
import CommonBtn from "../ui/CommonBtn"
import DeleteBtn from "../ui/DeleteBtn"

const addressData = [
	{
		type: "Shipping Address",
		name: "John Doe",
		address: "123 Galle Road",
		city: "Colombo 04, Sri Lanka",
		postalCode: "00400",
		phone: "071 123 4567",
	},
	{
		type: "Billing Address",
		name: "John Doe",
		address: "123 Galle Road",
		city: "Colombo 04, Sri Lanka",
		postalCode: "00400",
		phone: "071 123 4567",
	},
]

function Addresses() {
	const [popupIdx, setPopupIdx] = useState(null)
	const [addresses, setAddresses] = useState(addressData)
	const [addPopupOpen, setAddPopupOpen] = useState(false)

	const handleEdit = (idx) => setPopupIdx(idx)
	const handleClose = () => {
		setPopupIdx(null)
		setAddPopupOpen(false)
	}
	const handleSave = (newAddr) => {
		setAddresses((prev) =>
			prev.map((a, i) => (i === popupIdx ? { ...a, ...newAddr } : a))
		)
		setPopupIdx(null)
	}
	const handleAdd = (newAddr) => {
		setAddresses((prev) => [...prev, newAddr])
		setAddPopupOpen(false)
	}
	const handleDelete = (idx) => {
		setAddresses((prev) => prev.filter((_, i) => i !== idx));
	}

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-4xl font-extrabold text-gray-900">Addresses</h2>
				<p className="mt-1 text-sm text-gray-500">
					Manage your shipping and billing addresses
				</p>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				{addresses.map((addr, idx) => (
										 <div key={addr.type} className="border-3 border-gray-200 p-4 flex flex-col justify-between h-full relative">
												 {/* Overlayed buttons at top right for all address types */}
																		 <div className="absolute top-4 right-4 flex flex-col items-end gap-0.5 z-20">
																			 <EditBtn onClick={() => handleEdit(idx)} />
																			 {addr.type === "Other Address" && (
																				 <DeleteBtn onClick={() => handleDelete(idx)} />
																			 )}
																		 </div>
												 <div>
														 <div className="mb-3">
																 <h3 className="text-sm font-medium text-gray-900">{addr.type}</h3>
														 </div>
														 <p className="text-sm text-gray-700">{addr.name}</p>
														 <p className="text-sm text-gray-700">{addr.address}</p>
														 <p className="text-sm text-gray-700">{addr.city}</p>
														 <p className="text-sm text-gray-700">Postal Code: {addr.postalCode}</p>
														 <p className="text-sm text-gray-500">{addr.phone}</p>
												 </div>
										 </div>
				))}
			</div>

			<div className="sm:col-span-3 flex justify-center w-60">
				<CommonBtn
					type="button"
					bgClass="bg-[#09a84e] text-white hover:bg-[#0bd964] hover:text-black font-bold"
					containerClassName=""
					className="inline-flex items-center px-4 py-2 text-base w-auto justify-center font-bold group"
					label={
						<>
							<svg
								className="h-5 w-5 mr-2 inline-block transition-transform duration-200 group-hover:rotate-180"
								fill="none"
								stroke="currentColor"
								strokeWidth="3"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M12 4v16m8-8H4"
								/>
							</svg>
							<span className="font-bold">Add New Address</span>
						</>
					}
					onClick={() => setAddPopupOpen(true)}
				/>
			</div>

			{popupIdx !== null && (
				   <AddressPopup onClose={handleClose}>
					   <div className="mb-4 text-2xl font-bold text-center">
						   Edit {addresses[popupIdx]?.type || "Address"}
					   </div>
					   <AddressForm
						   initialValues={addresses[popupIdx]}
						   onSave={handleSave}
						   onCancel={handleClose}
					   />
				   </AddressPopup>
			)}

			{addPopupOpen && (
				<AddressPopup isOpen={addPopupOpen} onClose={handleClose}>
					<div className="mb-4 text-2xl font-extrabold text-center">Add New Address</div>
					<AddressForm
						initialValues={{
							type: "Other Address",
							name: "",
							address: "",
							city: "",
							postalCode: "",
							phone: ""
						}}
						onSave={handleAdd}
						onCancel={handleClose}
					/>
				</AddressPopup>
			)}
		</div>
	)
}

export default Addresses
