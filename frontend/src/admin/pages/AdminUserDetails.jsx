import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import adminUserApi from '../../api/adminUserApi';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../components/ui/notificationsContext';
import RoleBadge from '../components/users/RoleBadge';
import StatusBadge from '../components/users/StatusBadge';
import Dropdown from '../../components/ui/Dropdown';
import { FiShield, FiUser, FiCheckCircle, FiSlash, FiArrowLeft, FiSave, FiStar, FiTrash2, FiInfo, FiSettings, FiBarChart2, FiShoppingBag, FiClock, FiRefreshCw, FiTruck, FiXCircle, FiArrowRight } from 'react-icons/fi';
import { AvatarImg } from '../../services/AvatarImg';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';

// Role hierarchy: manager > admin > customer. Only manager can change roles (promote/demote admins).
const roleOptions = ['manager', 'admin', 'customer'];
const statusOptions = ['active', 'disabled'];

export default function AdminUserDetails() {
	const { userCode } = useParams();
	const navigate = useNavigate();
	const { user: currentUser } = useAuth();
	const [user, setUser] = useState(null);
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [billingAddrs, setBillingAddrs] = useState([]);
	const [shippingAddrs, setShippingAddrs] = useState([]);
	const roleFromDto = (u) => (u?.roles || []).includes('ROLE_MANAGER') ? 'manager' : (u?.roles || []).includes('ROLE_ADMIN') ? 'admin' : 'customer';
	const [role, setRole] = useState('customer');
	const [status, setStatus] = useState('active');

	useEffect(() => {
		let ignore = false;
		async function load() {
			setLoading(true);
			try {
				const u = await adminUserApi.getUserByCode(userCode);
				if (ignore) return;
				setUser(u);
				setRole(roleFromDto(u));
				setStatus(u.enabled ? 'active' : 'disabled');
				const page = await adminUserApi.getUserOrdersByCode(userCode, { page: 0, size: 100 });
				if (!ignore) setOrders(page.content || []);
				if (!ignore && u?.id) {
					try {
						const [b, s] = await Promise.all([
							adminUserApi.getUserBillingAddresses(u.id),
							adminUserApi.getUserShippingAddresses(u.id),
						]);
						if (!ignore) {
							setBillingAddrs(Array.isArray(b) ? b : []);
							setShippingAddrs(Array.isArray(s) ? s : []);
						}
					} catch { /* ignore for now */ }
				}
			} finally {
				if (!ignore) setLoading(false);
			}
		}
		load();
		return () => { ignore = true; };
	}, [userCode]);

	const isCurrentManager = (currentUser?.roles || []).includes('ROLE_MANAGER');
	const isCurrentAdmin = (currentUser?.roles || []).includes('ROLE_ADMIN');
	const isViewingSelf = currentUser?.userCode && user?.userCode ? (currentUser.userCode === user?.userCode) : (currentUser?.id?.toString() === user?.id?.toString());
	const { notify } = useNotifications();
	const managerExists = false; // not computed client-side now
	const anotherManagerExists = false;
	const canEditRole = isCurrentManager; // Only manager can change roles
	const roleEditDisabledReason = !isCurrentManager ? 'Only the manager can modify roles.' : undefined;

	if (loading) {
		return (
			<div className="px-8 mt-16">
				<h1 className="text-4xl font-bold mb-2 text-black tracking-tight">Loading user…</h1>
				<p className="text-sm text-gray-600">Fetching profile, addresses, and orders.</p>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="px-8 mt-16">
				<h1 className="text-4xl font-bold mb-2 text-black tracking-tight">User not found</h1>
				<p className="text-sm text-gray-600 mb-4">This user may have been deleted or the link is invalid.</p>
				<button
					onClick={() => navigate(-1)}
					className="inline-flex items-center gap-2 rounded-lg px-4 py-2 border border-black/10 bg-white text-sm font-semibold text-black hover:bg-black hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
				>
					<FiArrowLeft className="w-4 h-4" />
					<span>Go back</span>
				</button>
			</div>
		);
	}

	const totalSpend = user.totalSpend || 0;

	// Derived stats for full-width User stats section
	const orderCount = user.orderCount ?? (Array.isArray(orders) ? orders.length : 0);
	const lastLoginDate = user.lastLogin ? new Date(user.lastLogin) : null;
	const createdDate = user.createdAt ? new Date(user.createdAt) : null;
	const daysSinceSignup = createdDate ? Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
	const ordersWithDates = Array.isArray(orders) ? orders : [];
	const last30dCount = ordersWithDates.filter(o => o?.placedAt && (Date.now() - new Date(o.placedAt).getTime()) <= 30 * 24 * 60 * 60 * 1000).length;
	const avgItemsPerOrder = ordersWithDates.length ? (ordersWithDates.reduce((sum, o) => sum + (o?.items ? o.items.length : 0), 0) / ordersWithDates.length) : 0;
	const lastOrder = ordersWithDates.length ? new Date(Math.max(...ordersWithDates.map(o => o?.placedAt ? new Date(o.placedAt).getTime() : 0))) : null;

	return (
		<div className="w-full pb-24">
			<div className="mt-8 mb-6 px-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
				<div>
					<h1 className="text-5xl md:text-6xl font-medium text-black tracking-tight"><span className='font-semibold'>User Details:</span> {user.firstName} {user.lastName}</h1>
					<p className="text-sm text-gray-600 mt-2">Manage account role, status & view order history.</p>
				</div>
				<div className="flex gap-3">
					<button
						onClick={() => navigate('/admin/users')}
						className="inline-flex items-center gap-2 rounded-lg px-4 py-2 border border-black/10 bg-white text-sm font-semibold text-black hover:bg-black hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
					>
						<FiArrowLeft className="w-4 h-4" />
						<span>Back to users</span>
					</button>
				</div>
			</div>

			<div className="px-8 grid grid-cols-12 gap-8 mb-16 items-start">
				{/* Customer details gradient card */}
				<section aria-labelledby="customer-details-heading" className="col-span-12 md:col-span-6">
					<h2 id="customer-details-heading" className="text-3xl font-semibold mb-6">
						<span className="inline-flex items-center gap-2">
							<FiUser className="w-6 h-6 text-emerald-700" />
							<span>Customer details</span>
						</span>
					</h2>
					<div
						className="relative overflow-hidden rounded-xl border border-black/10 shadow-sm p-6 pb-6 md:pb-8 min-h-[320px] bg-gradient-to-r from-white to-emerald-400/30"
					>
						{(user.firstName && user.lastName) && (
							<div className="absolute top-6 right-6 flex flex-col items-end">
								<AvatarImg
									seed={user.firstName + ' ' + user.lastName}
									alt={`Avatar for ${user.firstName} ${user.lastName}`}
									className="w-45 h-45 md:w-50 md:h-50 rounded-xl border-2 border-black bg-white shadow-sm"
								/>
								<div className="mt-3 text-xs font-semibold text-black/70 text-right space-y-1">
									<div>USER CODE: <span className="font-bold text-black">{user.userCode || user.id}</span></div>
									<div>CREATED: <span className="font-bold text-black">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</span></div>
									<div>LAST LOGIN: <span className="font-bold text-black">{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : '-'}</span></div>
								</div>
							</div>
						)}

						{/* Content wrapper with right padding to avoid avatar overlap and pull right column left */}
						<div className="pr-0 md:pr-64 lg:pr-72 xl:pr-80">
							<div className="text-sm text-gray-900 mb-4">
								<div className="font-semibold text-xl text-black">
									<div className="flex items-center gap-2">
										<span className="truncate max-w-[60%] whitespace-nowrap">{user.firstName} {user.lastName}</span>
									</div>
									<div className="mt-1 mb-2 flex items-center gap-2">
										<RoleBadge role={role} />
										<StatusBadge status={status} />
									</div>
								</div>
								<div className="mb-1 text-gray-800">Email: <span className="font-semibold">{user.email}</span></div>
								<div className="text-gray-800">Phone: <span className="font-semibold">{user.phone ?? '-'}</span></div>
							</div>

							<div className="text-sm text-gray-900">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
									<div>
										<div className="text-xs font-semibold uppercase tracking-wide text-black/60 mb-2">Billing addresses</div>
										{billingAddrs.length > 0 ? (
											<div className="space-y-2">
												{billingAddrs.map((a, idx) => (
													<address key={`bill-${a.id || idx}`} className="not-italic text-xs rounded-lg border border-black/10 bg-white/70 p-3">
														<div>{a.name || '-'}</div>
														<div>{a.line1}{a.line2 ? `, ${a.line2}` : ''}</div>
														<div>{[a.city, a.district].filter(Boolean).join(', ')}</div>
														<div>{[a.province, a.postalCode].filter(Boolean).join(' ')}</div>
														<div>{a.country || 'Sri Lanka'}</div>
														{a.phone && <div className="text-gray-600 text-xs">{a.phone}</div>}
													</address>
												))}
											</div>
										) : (
											<div className="text-xs text-gray-500 italic">No billing addresses on file</div>
										)}
									</div>
									<div>
										<div className="text-xs font-semibold uppercase tracking-wide text-black/60 mb-2 whitespace-nowrap">Shipping addresses</div>
										{shippingAddrs.length > 0 ? (
											<div className="space-y-2">
												{shippingAddrs.map((a, idx) => (
													<address key={`ship-${a.id || idx}`} className="not-italic text-xs rounded-lg border border-black/10 bg-white/70 p-3">
														<div>{a.name || '-'}</div>
														<div>{a.line1}{a.line2 ? `, ${a.line2}` : ''}</div>
														<div>{[a.city, a.district].filter(Boolean).join(', ')}</div>
														<div>{[a.province, a.postalCode].filter(Boolean).join(' ')}</div>
														<div>{a.country || 'Sri Lanka'}</div>
														{a.phone && <div className="text-gray-600 text-xs">{a.phone}</div>}
													</address>
												))}
											</div>
										) : (
											<div className="text-xs text-gray-500 italic">No shipping addresses on file</div>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Account controls & metrics */}
				<section className="col-span-12 md:col-span-6 flex flex-col gap-8">
					<h3 className="text-3xl font-semibold  -mb-2">
						<span className="inline-flex items-center gap-2">
							<FiSettings className="w-6 h-6 text-emerald-700" />
							<span>Account controls</span>
						</span>
					</h3>
					<div className="rounded-xl bg-white border border-black/10 shadow-sm p-6 min-h-[320px]">
						<div className="flex flex-col md:flex-row md:items-start gap-8">
							<div className="w-44">
								<label className="block text-xs font-semibold uppercase tracking-wide mb-1">Role</label>
								<div className="w-full">
									<Dropdown
										value={role}
										onChange={(v) => setRole(v)}
										options={roleOptions.map(r => {
											const label = r === 'manager'
												? (<span className="inline-flex items-center gap-2"><FiStar className="w-4 h-4" />Manager</span>)
												: r === 'admin'
													? (<span className="inline-flex items-center gap-2"><FiShield className="w-4 h-4" />Admin</span>)
													: (<span className="inline-flex items-center gap-2"><FiUser className="w-4 h-4" />Customer</span>);
											const disabled = !canEditRole || (r === 'manager' && anotherManagerExists && role !== 'manager');
											const title = !canEditRole ? roleEditDisabledReason : (r === 'manager' && anotherManagerExists && role !== 'manager') ? 'There can only be one manager.' : undefined;
											return { label, value: r, disabled, title };
										})}
									/>
								</div>
							</div>
							<div className="w-44">
								<label className="block text-xs font-semibold uppercase tracking-wide mb-1">Status</label>
								<div className="w-full">
									<Dropdown
										value={status}
										onChange={(v) => setStatus(v)}
										options={statusOptions.map(s => ({ label: s === 'active' ? (<span className="inline-flex items-center gap-2"><FiCheckCircle className="w-4 h-4" />Active</span>) : (<span className="inline-flex items-center gap-2"><FiSlash className="w-4 h-4" />Disabled</span>), value: s }))}
									/>
								</div>
							</div>
						</div>
						<div className="mt-6 flex flex-col gap-4">
							<div className="flex gap-3">
								<button
									onClick={async () => {
										setSaving(true);
										try {
											const desiredEnabled = status === 'active';
											if (desiredEnabled !== user.enabled) {
												const u = await adminUserApi.updateStatus(user.id, desiredEnabled);
												setUser(u);
												notify({ type: 'success', text: `User ${desiredEnabled ? 'activated' : 'disabled'}` });
											}
											if (isCurrentManager) {
												const desiredRoles = role === 'manager' ? ['MANAGER'] : role === 'admin' ? ['ADMIN'] : ['CUSTOMER'];
												const u = await adminUserApi.updateRoles(user.id, desiredRoles);
												setUser(u);
												notify({ type: 'success', text: 'Roles updated' });
											}
										} catch (e) {
											notify({ type: 'error', text: e?.message || 'Failed to save changes' });
										} finally { setSaving(false); }
									}}
									className="inline-flex items-center gap-2 rounded-lg px-4 py-2 bg-emerald-700 hover:bg-black text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
									disabled={saving || (!isCurrentManager && (role !== roleFromDto(user)) && role !== 'customer')}
								>
									<FiSave className="w-4 h-4" />
									<span>Save changes</span>
								</button>
								{status === 'active' ? (
									<button onClick={() => setStatus('disabled')} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 bg-white text-rose-700 border border-rose-300 hover:bg-rose-50 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white">
										<FiSlash className="w-4 h-4" />
										<span>Disable</span>
									</button>
								) : (
									<button onClick={() => setStatus('active')} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-300 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white">
										<FiCheckCircle className="w-4 h-4" />
										<span>Activate</span>
									</button>
								)}
							</div>
							{!isCurrentManager && (
								<p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg inline-flex">Only the manager can modify user roles.</p>
							)}
							{isViewingSelf && role === 'manager' && (
								<p className="text-xs text-emerald-700">You are the platform manager. You may delegate by promoting an admin, which will demote you automatically (future backend logic).</p>
							)}

							{/* Delete user panel inside account controls */}
							{(isCurrentManager || (isCurrentAdmin && role === 'customer')) && !isViewingSelf && (
								<div className="mt-4 border-t border-black/10 pt-4 mb-[3px]">
									<div className="rounded-lg border border-rose-200 bg-rose-50/40 p-4">
										<h5 className="text-md font-semibold mb-2 text-rose-800">Delete account</h5>
										<p className="text-xs text-rose-900/70 mb-3 flex items-start gap-2">
										<FiInfo className="w-4 h-4 text-rose-900/70 mt-0.5" />
										<span><span className="font-semibold">Note:</span> Permanently remove this user's account. Reviews and orders will be preserved but the account will be deleted.</span>
									</p>
									<div>
										<button
											onClick={() => setDeleteOpen(true)}
												className="inline-flex items-center gap-2 rounded-lg px-4 py-2 border border-rose-300 bg-white text-rose-800 hover:bg-rose-700 hover:text-white hover:border-rose-700 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
										>
											<FiTrash2 className="w-4 h-4" />
											<span>Delete user</span>
										</button>
									</div>
									</div>
								</div>
							)}
						</div>
					</div>
				</section>
			</div>

				{/* Full-width User stats */}
				<section aria-labelledby="user-stats-heading" className="px-8 mb-16">
					<h4 id="user-stats-heading" className="text-3xl font-semibold mb-2">
						<span className="inline-flex items-center gap-2">
							<FiBarChart2 className="w-6 h-6 text-emerald-700" />
							<span>User stats</span>
						</span>
					</h4>
					<div className="rounded-xl bg-white border border-black/10 shadow-sm p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
						<Metric label="Orders" value={orderCount} />
						<Metric label="Total spend" value={new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(totalSpend)} />
						<Metric label="Avg order" value={orderCount ? new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(totalSpend / orderCount) : new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(0)} />
						<Metric label="Orders (30d)" value={last30dCount} />
						<Metric label="Avg items/order" value={avgItemsPerOrder ? avgItemsPerOrder.toFixed(1) : '0.0'} />
						<Metric label="Last login" value={lastLoginDate ? lastLoginDate.toLocaleDateString() : '-'} />
						<Metric label="Days since signup" value={createdDate ? daysSinceSignup : '-'} />
						<Metric label="Last order" value={lastOrder && lastOrder.getTime() > 0 ? lastOrder.toLocaleDateString() : '-'} />
					</div>
				</section>

			{/* Order history */}
			<section aria-labelledby="order-history-heading" className="px-8 mb-24">
				<h2 id="order-history-heading" className="text-3xl font-semibold mb-4">
					<span className="inline-flex items-center gap-2">
						<FiShoppingBag className="w-6 h-6 text-emerald-700" />
						<span>Order history</span>
					</span>
				</h2>
				<div className="rounded-xl border border-black/10 bg-white shadow-sm overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
						<thead className="bg-gray-50 text-gray-700">
							<tr className="text-left">
								<Th>Order No.</Th>
								<Th>Date</Th>
								<Th>Status</Th>
								<Th>Items</Th>
								<Th>Total</Th>
								<Th></Th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100">
							{orders.length === 0 && (
								<tr><Td colSpan={6} className="py-10 text-center text-gray-500">No orders yet.</Td></tr>
							)}
							{orders.map(o => (
								<tr key={o.id} className="hover:bg-emerald-50/40 transition-colors">
								<Td className="text-sm">{o.orderNumber ? `#${o.orderNumber}` : `#${o.id}`}</Td>
									<Td>{o.placedAt ? new Date(o.placedAt).toLocaleDateString() : '-'}</Td>
								<Td><OrderStatus status={o.status} /></Td>
									<Td>{o.items ? o.items.length : 0}</Td>
									<Td>{new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(o.total)}</Td>
								<Td>
									<Link
										className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 border border-emerald-700 text-emerald-800 hover:bg-emerald-700 hover:text-white text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
										to={`/admin/orders/${o.orderNumber || o.id}`}
									>
										<span>View order</span>
										<FiArrowRight className="w-4 h-4" />
									</Link>
								</Td>
								</tr>
							))}
						</tbody>
					</table>
						</div>
				</div>
			</section>

			{/* Delete confirmation modal */}
			<Dialog open={deleteOpen} onClose={() => (deleting ? null : setDeleteOpen(false))} className="relative z-[60]">
				<DialogBackdrop className="fixed inset-0 bg-black/30" />
				<div className="fixed inset-0 z-[61] flex items-center justify-center p-4">
					<DialogPanel className="w-full max-w-md bg-white rounded-xl border border-black/10 shadow-xl overflow-hidden">
						<div className="p-5">
							<DialogTitle className="text-2xl font-bold text-gray-900">Delete user?</DialogTitle>
							<p className="mt-2 text-sm text-gray-700">This will permanently delete the account for <span className="font-semibold">{user?.firstName} {user?.lastName}</span> ({user?.email}). This action cannot be undone.</p>
							<div className="mt-6 flex justify-end gap-3">
								<button
									onClick={() => setDeleteOpen(false)}
									className="rounded-lg px-4 py-2 border border-black/10 bg-white text-gray-800 hover:bg-gray-50 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
									disabled={deleting}
								>
									Cancel
								</button>
								<button
									onClick={async () => {
										if (deleting) return;
										setDeleting(true);
										try {
											await adminUserApi.deleteUser(user.id);
											notify({ type: 'success', text: 'User deleted' });
											setDeleteOpen(false);
											navigate('/admin/users');
										} catch (e) {
											notify({ type: 'error', text: e?.message || 'Failed to delete user' });
										} finally {
											setDeleting(false);
										}
									}}
									className="rounded-lg px-4 py-2 bg-rose-700 text-white border border-rose-800 hover:bg-rose-800 text-sm font-semibold transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
									disabled={deleting}
								>
									{deleting ? 'Deleting…' : 'Delete'}
								</button>
							</div>
						</div>
					</DialogPanel>
				</div>
			</Dialog>
		</div>
	);
}

const Th = ({ children }) => <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase whitespace-nowrap">{children}</th>;
const Td = ({ children, className = '', ...rest }) => <td className={`px-4 py-3 align-top text-gray-800 ${className}`} {...rest}>{children}</td>;

// Status badge style aligned with OrderDetails status badge
const getStatusBadgeMeta = (status) => {
	const s = String(status || '').toLowerCase();
	if (s.includes('cancel')) return { classes: 'bg-red-100 text-red-700', Icon: FiXCircle };
	if (s.includes('deliver')) return { classes: 'bg-green-100 text-green-700', Icon: FiCheckCircle };
	if (s.includes('ship')) return { classes: 'bg-purple-100 text-purple-700', Icon: FiTruck };
	if (s.includes('process')) return { classes: 'bg-blue-100 text-blue-700', Icon: FiRefreshCw };
	if (s.includes('pending')) return { classes: 'bg-yellow-100 text-yellow-700', Icon: FiClock };
	if (s.includes('placed')) return { classes: 'bg-teal-100 text-teal-800', Icon: FiCheck };
	if (s.includes('refund')) return { classes: 'bg-red-100 text-red-700', Icon: FiXCircle };
	return { classes: 'bg-gray-100 text-gray-700', Icon: FiClock };
};

const OrderStatus = ({ status }) => {
	const { classes, Icon } = getStatusBadgeMeta(status);
	return (
		<span className={`px-2 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 ${classes}`}>
			<Icon className="w-3.5 h-3.5" />
			<span className="capitalize">{String(status || '')}</span>
		</span>
	);
};

function Metric({ label, value }) {
	return (
		<div className="flex flex-col gap-1 rounded-lg border border-black/10 bg-gray-50 p-3">
			<span className="text-xs font-semibold uppercase tracking-wide text-black/60">{label}</span>
			<span className="text-2xl font-semibold text-black">{value}</span>
		</div>
	);
}
