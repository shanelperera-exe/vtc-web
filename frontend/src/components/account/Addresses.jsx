import React, { useEffect, useState } from "react"
import EditBtn from "../ui/EditBtn"
import AddressPopup from "./AddressPopup"
import AddressForm from "./AddressForm"
import CommonBtn from "../ui/CommonBtn"
import DeleteBtn from "../ui/DeleteBtn"
import addressApi from "../../api/addressApi"
import { useAuth } from "../../context/AuthContext"

function Addresses() {
	const [popupIdx, setPopupIdx] = useState(null)
	const [addresses, setAddresses] = useState([])
	const [addPopupOpen, setAddPopupOpen] = useState(false)
	const [newType, setNewType] = useState('Billing Address')
	const { isAuthenticated } = useAuth() || {}

	// Load addresses on mount when authenticated
	useEffect(() => {
		let mounted = true
		async function load() {
			if (!isAuthenticated) return
			try {
				const [billing, shipping] = await Promise.all([
					addressApi.listBilling(),
					addressApi.listShipping(),
				])
				// Normalize into a single list for display
				const b = (billing || []).map(a => ({
					id: a.id,
					type: 'Billing Address',
					name: a.name || '',
					address1: a.line1 || '',
					address2: a.line2 || '',
					city: a.city || '',
					province: a.province || '',
					district: a.district || '',
					postal: a.postalCode || '',
					country: a.country || 'Sri Lanka',
					phone: a.phone || '',
					company: a.company || ''
				}))
				const s = (shipping || []).map(a => ({
					id: a.id,
					type: 'Shipping Address',
					name: a.name || '',
					address1: a.line1 || '',
					address2: a.line2 || '',
					city: a.city || '',
					province: a.province || '',
					district: a.district || '',
					postal: a.postalCode || '',
					country: a.country || 'Sri Lanka',
					phone: a.phone || '',
					company: a.company || ''
				}))
				if (mounted) setAddresses([...b, ...s])
			} catch {
				// fallback to empty list
				if (mounted) setAddresses([])
			}
		}
		load()
		return () => { mounted = false }
	}, [isAuthenticated])

	const handleEdit = (idx) => setPopupIdx(idx)
	const handleClose = () => {
		setPopupIdx(null)
		setAddPopupOpen(false)
		setNewType('Billing Address')
	}
	const handleSave = async (newAddr) => {
		try {
			const isBilling = (addresses[popupIdx]?.type || '').toLowerCase().includes('billing')
			const id = addresses[popupIdx]?.id
			const dto = {
				name: newAddr.name || '',
				phone: newAddr.phone || '',
				company: newAddr.company || '',
				line1: newAddr.address1 || newAddr.address || '',
				line2: newAddr.address2 || '',
				city: newAddr.city || '',
				province: newAddr.province || '',
				district: newAddr.district || '',
				postalCode: newAddr.postal || newAddr.postalCode || '',
				country: newAddr.country || 'Sri Lanka',
			}
			const updated = isBilling ? await addressApi.updateBilling(id, dto) : await addressApi.updateShipping(id, dto)
			// reflect in UI
			setAddresses(prev => prev.map((a, i) => i === popupIdx ? {
				...a,
				...newAddr,
				id: updated?.id ?? a.id,
				address1: newAddr.address1 || newAddr.address || a.address1,
				postal: newAddr.postal || newAddr.postalCode || a.postal,
			} : a))
		} catch (e) {
			alert(e?.message || 'Failed to update address')
		} finally {
			setPopupIdx(null)
		}
	}

	const handleAdd = async (newAddr) => {
		try {
			const isBilling = (newAddr?.type || '').toLowerCase().includes('billing')
			const dto = {
				name: newAddr.name || '',
				phone: newAddr.phone || '',
				company: newAddr.company || '',
				line1: newAddr.address1 || newAddr.address || '',
				line2: newAddr.address2 || '',
				city: newAddr.city || '',
				province: newAddr.province || '',
				district: newAddr.district || '',
				postalCode: newAddr.postal || newAddr.postalCode || '',
				country: newAddr.country || 'Sri Lanka',
			}
			const created = isBilling ? await addressApi.createBilling(dto) : await addressApi.createShipping(dto)
			setAddresses(prev => [...prev, {
				...newAddr,
				id: created?.id,
				address1: newAddr.address1 || newAddr.address || '',
				postal: newAddr.postal || newAddr.postalCode || '',
			}])
		} catch (e) {
			alert(e?.message || 'Failed to add address')
		} finally {
			setAddPopupOpen(false)
		}
	}

	const handleDelete = async (idx) => {
		try {
			const a = addresses[idx]
			if (!a?.id) { setAddresses(prev => prev.filter((_, i) => i !== idx)); return }
			const isBilling = (a?.type || '').toLowerCase().includes('billing')
			if (isBilling) await addressApi.deleteBilling(a.id)
			else await addressApi.deleteShipping(a.id)
			setAddresses(prev => prev.filter((_, i) => i !== idx))
		} catch (e) {
			alert(e?.message || 'Failed to delete address')
		}
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
									 <div key={`${addr.type}-${addr.id ?? idx}`} className="border-3 border-gray-200 p-4 flex flex-col justify-between h-full relative">
												 {/* Overlayed buttons at top right for all address types */}
																		 <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-20">
																			 <EditBtn noShadow onClick={() => handleEdit(idx)} />
																			 <DeleteBtn noShadow onClick={() => handleDelete(idx)} />
																		 </div>
												 <div>
														 <div className="mb-3">
																 <h3 className="text-sm font-medium text-gray-900">{addr.type}</h3>
														 </div>
														 <p className="text-sm text-gray-700">{addr.name}</p>
														 <p className="text-sm text-gray-700">{addr.address1}{addr.address2 ? `, ${addr.address2}` : ''}</p>
														 <p className="text-sm text-gray-700">{[addr.city, addr.district].filter(Boolean).join(', ')}</p>
														 <p className="text-sm text-gray-700">{[addr.province, addr.postal].filter(Boolean).join(' ')}</p>
														 <p className="text-sm text-gray-700">{addr.country || 'Sri Lanka'}</p>
														 <p className="text-sm text-gray-500">{addr.phone}</p>
												 </div>
										 </div>
				))}
			</div>

			<div className="sm:col-span-3 flex justify-center w-60">
				<CommonBtn
					type="button"
					noShadow
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
					<div className="flex items-center justify-center gap-2 mb-4">
						<button
							type="button"
							className={`px-3 py-1 border-3 ${newType === 'Billing Address' ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300'}`}
							onClick={() => setNewType('Billing Address')}
						>
							Billing
						</button>
						<button
							type="button"
							className={`px-3 py-1 border-3 ${newType === 'Shipping Address' ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300'}`}
							onClick={() => setNewType('Shipping Address')}
						>
							Shipping
						</button>
					</div>
					<AddressForm
						key={newType}
						initialValues={{
							type: newType,
							name: "",
							address1: "",
							address2: "",
							city: "",
							province: "",
							district: "",
							postal: "",
							country: "Sri Lanka",
							phone: "",
							company: "",
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
