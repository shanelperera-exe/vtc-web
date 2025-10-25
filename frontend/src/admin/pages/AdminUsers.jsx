import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import adminUserApi from '../../api/adminUserApi';
import { useNotifications } from '../../components/ui/notificationsContext';
import RoleBadge from '../components/users/RoleBadge';
import StatusBadge from '../components/users/StatusBadge';
import Dropdown from '../../components/ui/Dropdown';
import StatusCard from '../components/users/StatusCard';
import SearchBar from '../../components/ui/SearchBar';
import { FiUsers, FiUser, FiShield, FiCheckCircle, FiSlash, FiEye, FiStar } from 'react-icons/fi';

export default function AdminUsers() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const { notify } = useNotifications();

    useEffect(() => {
        let ignore = false;
        setLoading(true);
        adminUserApi.listUsers({ page: 0, size: 100 })
            .then(page => {
                if (!ignore) setUsers(page.content || []);
            })
            .catch((e) => { if (!ignore) { setUsers([]); notify({ type: 'error', text: e?.message || 'Failed to load users' }); } })
            .finally(() => { if (!ignore) setLoading(false); });
        return () => { ignore = true; };
    }, []);

    const filtered = useMemo(() => {
        const base = users.filter(u => {
            const role = (u.roles || []).find(r => r.includes('MANAGER')) ? 'manager' : (u.roles || []).find(r => r.includes('ADMIN')) ? 'admin' : 'customer';
            const status = u.enabled ? 'active' : 'disabled';
            const roleOk = roleFilter === 'all' || role === roleFilter;
            const statusOk = statusFilter === 'all' || status === statusFilter;
            const searchOk = !search || (
                (u.firstName + ' ' + u.lastName + u.email + u.userCode + u.id).toLowerCase().includes(search.toLowerCase())
            );
            return roleOk && statusOk && searchOk;
        });
        // Sorting
        const sorted = [...base].sort((a, b) => {
            if (sortBy === 'newest' || sortBy === 'oldest') {
                const ta = new Date(a.createdAt).getTime();
                const tb = new Date(b.createdAt).getTime();
                return sortBy === 'newest' ? tb - ta : ta - tb;
            }
            if (sortBy === 'spend-high' || sortBy === 'spend-low') {
                const sa = a.totalSpend || 0;
                const sb = b.totalSpend || 0;
                return sortBy === 'spend-high' ? sb - sa : sa - sb;
            }
            if (sortBy === 'name-asc' || sortBy === 'name-desc') {
                const na = (a.firstName + ' ' + a.lastName).toLowerCase();
                const nb = (b.firstName + ' ' + b.lastName).toLowerCase();
                if (na < nb) return sortBy === 'name-asc' ? -1 : 1;
                if (na > nb) return sortBy === 'name-asc' ? 1 : -1;
                return 0;
            }
            return 0;
        });
        return sorted;
    }, [users, search, roleFilter, statusFilter, sortBy]);

    // Stats
    const totalManagers = users.filter(u => (u.roles || []).includes('ROLE_MANAGER')).length;
    const totalAdmins = users.filter(u => (u.roles || []).includes('ROLE_ADMIN')).length;
    const totalCustomers = users.filter(u => (u.roles || []).includes('ROLE_CUSTOMER')).length;
    const active = users.filter(u => u.enabled).length;
    const disabled = users.filter(u => !u.enabled).length;

    return (
        <div className="w-full">
            {/* Heading */}
            <div className="mt-8 mb-6 px-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <h1 className="text-6xl font-semibold text-black tracking-tight">Users</h1>
                    <p className="text-sm text-gray-600 mt-2">Manage customer and admin accounts, roles, and account states.</p>
                </div>
            </div>
            {/* Stats */}
            <div className="px-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
                <StatusCard label="Total" value={users.length} gradient="from-rose-400 to-rose-600" Icon={FiUsers} compact />
                <StatusCard label="Manager" value={totalManagers} gradient="from-amber-400 to-amber-600" Icon={FiStar} compact />
                <StatusCard label="Admins" value={totalAdmins} gradient="from-purple-400 to-purple-600" Icon={FiShield} compact />
                <StatusCard label="Customers" value={totalCustomers} gradient="from-sky-400 to-sky-600" Icon={FiUser} compact />
                <StatusCard label="Active" value={`${active}/${users.length}`} gradient="from-lime-400 to-green-600" Icon={FiCheckCircle} extra={<span className="text-[10px] font-medium text-white/80">Disabled {disabled}</span>} compact />
            </div>
            {/* Filters + search */}
            <div className="px-8 mb-6 flex flex-col lg:flex-row gap-4 lg:items-center">
                <div className="flex gap-2 flex-wrap w-full md:w-auto">
                    <div className="w-44">
                        <Dropdown
                            value={roleFilter}
                            onChange={(v) => setRoleFilter(v)}
                            tall={true}
                            options={[
                                { label: 'All roles', value: 'all' },
                                { label: (<span className="inline-flex items-center gap-2"><FiStar className="w-4 h-4" />Manager</span>), value: 'manager' },
                                { label: (<span className="inline-flex items-center gap-2"><FiShield className="w-4 h-4" />Admins</span>), value: 'admin' },
                                { label: (<span className="inline-flex items-center gap-2"><FiUser className="w-4 h-4" />Customers</span>), value: 'customer' }
                            ]}
                        />
                    </div>
                    <div className="w-44">
                        <Dropdown
                            value={statusFilter}
                            onChange={(v) => setStatusFilter(v)}
                            tall={true}
                            options={[
                                { label: 'All status', value: 'all' },
                                { label: (<span className="inline-flex items-center gap-2"><FiCheckCircle className="w-4 h-4" />Active</span>), value: 'active' },
                                { label: (<span className="inline-flex items-center gap-2"><FiSlash className="w-4 h-4" />Disabled</span>), value: 'disabled' }
                            ]}
                        />
                    </div>
                </div>
                <div className="flex-1 flex items-center gap-3">
                    <div className="flex-1">
                        <SearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email or id..." width="100%" borderColor="#CBD5E1" showIcon={true} />
                    </div>
                    <div style={{ width: 200 }}>
                        <Dropdown
                            value={sortBy}
                            onChange={(v) => setSortBy(v)}
                            tall={true}
                            options={[
                                { label: 'Newest', value: 'newest' },
                                { label: 'Oldest', value: 'oldest' },
                                { label: 'Total spend (high)', value: 'spend-high' },
                                { label: 'Total spend (low)', value: 'spend-low' },
                                { label: 'Name A → Z', value: 'name-asc' },
                                { label: 'Name Z → A', value: 'name-desc' }
                            ]}
                        />
                    </div>
                </div>
            </div>
            {/* Table */}
            <div className="px-8 pb-20">
                <div className="overflow-x-auto border-2 border-black/10 bg-whit">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 text-gray-700">
                            <tr className="text-left">
                                <Th>ID</Th>
                                <Th>User</Th>
                                <Th>Role</Th>
                                <Th>Status</Th>
                                <Th>Orders</Th>
                                <Th>Total Spend</Th>
                                <Th>Last Login</Th>
                                <Th></Th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><Td colSpan={8} className="py-10 text-center text-gray-500">Loading...</Td></tr>
                            ) : filtered.map(u => {
                                const role = (u.roles || []).find(r => r.includes('MANAGER')) ? 'manager' : (u.roles || []).find(r => r.includes('ADMIN')) ? 'admin' : 'customer';
                                const status = u.enabled ? 'active' : 'disabled';
                                return (
                                    <tr key={u.id} className="border-t border-gray-100 hover:bg-emerald-50/40 transition-colors">
                                        <Td className="text-sm font-medium text-gray-600">{u.userCode || u.id}</Td>
                                        <Td>
                                            <div className="flex flex-col">
                                                <span className="font-medium truncate max-w-[18rem] whitespace-nowrap">{u.firstName} {u.lastName}</span>
                                                <span className="text-xs text-gray-500 truncate max-w-[18rem]">{u.email}</span>
                                            </div>
                                        </Td>
                                        <Td><RoleBadge role={role} /></Td>
                                        <Td><StatusBadge status={status} /></Td>
                                        <Td>{u.orderCount ?? 0}</Td>
                                        <Td>{new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(u.totalSpend ?? 0)}</Td>
                                        <Td>{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : '-'}</Td>
                                        <Td className="text-right w-28">
                                            <button
                                                onClick={() => navigate(`/admin/users/${encodeURIComponent(u.userCode || u.id)}`)}
                                                className="inline-flex items-center gap-2 px-2 py-1 bg-black text-white border-2 border-white hover:bg-white hover:text-black hover:border-2 hover:border-black leading-none transition-colors duration-150"
                                            >
                                                <FiEye className="w-4 h-4" />
                                                <span className="text-sm font-medium">View</span>
                                            </button>
                                        </Td>
                                    </tr>
                                );
                            })}
                            {!loading && filtered.length === 0 && (
                                <tr>
                                    <Td colSpan={8} className="py-10 text-center text-gray-500">No users match your filters.</Td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

const Th = ({ children }) => <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase">{children}</th>;
const Td = ({ children, className = '', ...rest }) => <td className={`px-4 py-3 align-top ${className}`} {...rest}>{children}</td>;
