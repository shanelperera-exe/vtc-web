import React, { useEffect, useState } from "react"
import EditBtn from "../ui/EditBtn"
import AddressPopup from "./AddressPopup"
import AddressForm from "./AddressForm"
import CommonBtn from "../ui/CommonBtn"
import DeleteBtn from "../ui/DeleteBtn"
import addressApi from "../../api/addressApi"
import { useAuth } from "../../context/AuthContext"
import { FiPlus } from 'react-icons/fi'

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
		<div className="space-y-5">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h2 className="text-2xl font-semibold text-neutral-900 sm:text-3xl">Addresses</h2>
					<p className="mt-1 text-sm text-neutral-600">Manage your shipping and billing addresses</p>
				</div>
				<CommonBtn
					type="button"
					noShadow
					fullWidth={false}
					bgClass="bg-emerald-600 text-white hover:bg-emerald-700"
					className="inline-flex items-center gap-2 rounded-xl border border-black/10 px-4 py-2 text-sm font-semibold"
					onClick={() => setAddPopupOpen(true)}
				>
					<FiPlus className="text-base" />
					<span>Add new address</span>
				</CommonBtn>
			</div>

			{addresses.length === 0 ? (
				<div className="rounded-2xl border border-black/10 bg-neutral-50 p-6 text-sm text-neutral-700">
					No saved addresses yet. Add a billing or shipping address to speed up checkout.
				</div>
			) : null}

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				{addresses.map((addr, idx) => (
					<div
						key={`${addr.type}-${addr.id ?? idx}`}
						className="relative flex h-full flex-col justify-between rounded-2xl border border-black/10 bg-white p-5 shadow-sm shadow-black/5"
					>
						<div className="absolute right-4 top-4 flex items-center gap-2">
							<EditBtn noShadow onClick={() => handleEdit(idx)} />
							<DeleteBtn noShadow onClick={() => handleDelete(idx)} />
						</div>
						<div className="pr-16">
							<div className="mb-3">
								<span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-800">
									{addr.type}
								</span>
							</div>
							<div className="space-y-1 text-sm">
								<p className="font-semibold text-neutral-900">{addr.name}</p>
								<p className="text-neutral-700">{addr.address1}{addr.address2 ? `, ${addr.address2}` : ''}</p>
								<p className="text-neutral-700">{[addr.city, addr.district].filter(Boolean).join(', ')}</p>
								<p className="text-neutral-700">{[addr.province, addr.postal].filter(Boolean).join(' ')}</p>
								<p className="text-neutral-700">{addr.country || 'Sri Lanka'}</p>
								{addr.phone ? <p className="text-neutral-600">{addr.phone}</p> : null}
							</div>
						</div>
					</div>
				))}
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
					<div className="mb-4 text-center">
						<div className="text-2xl font-semibold text-neutral-900">Add new address</div>
						<div className="mt-1 text-sm text-neutral-600">Choose address type and fill the details</div>
					</div>
					<div className="mb-4 flex items-center justify-center gap-2">
						<button
							type="button"
							className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${newType === 'Billing Address'
								? 'border-black bg-black text-white'
								: 'border-black/10 bg-white text-neutral-900 hover:bg-neutral-100'
							}`}
							onClick={() => setNewType('Billing Address')}
						>
							Billing
						</button>
						<button
							type="button"
							className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${newType === 'Shipping Address'
								? 'border-black bg-black text-white'
								: 'border-black/10 bg-white text-neutral-900 hover:bg-neutral-100'
							}`}
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
