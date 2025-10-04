import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { User, Package, MapPin, LogOut } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import CommonBtn from '../components/ui/CommonBtn'

function Account() {
	const navigate = useNavigate()

	const linkBase =
		'flex items-center gap-3 px-3 py-2 transition-colors'
	const linkActive = 'bg-gray-900 text-white'
	const linkIdle =
		'text-gray-900 hover:bg-gray-100 hover:text-gray-900'

	const handleLogout = () => {
		try {
			localStorage.removeItem('authToken')
			localStorage.removeItem('user')
		} catch {}
		navigate('/')
	}

		return (
			<div className="min-h-screen bg-gray-50">
				<Navbar />
				<div className="mx-auto max-w-7xl px-4 py-8">
				<div className="mb-6 flex items-end justify-between">
					<div>
						<h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight uppercase text-gray-900">My Account</h1>
						<p className="mt-1 text-sm text-gray-500">Manage your details, orders, and addresses</p>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
					<aside className="lg:col-span-1">
						<div className="border-3 border-gray-900 bg-white p-2 shadow-sm">
							<nav className="flex flex-col gap-1">
								<NavLink
									to="accountdetails"
									className={({ isActive }) =>
										`${linkBase} ${isActive ? linkActive : linkIdle}`
									}
								>
									<User className="h-5 w-5" />
									<span>Account Details</span>
								</NavLink>

								<NavLink
									to="orders"
									className={({ isActive }) =>
										`${linkBase} ${isActive ? linkActive : linkIdle}`
									}
								>
									<Package className="h-5 w-5" />
									<span>Orders</span>
								</NavLink>

								<NavLink
									to="addresses"
									className={({ isActive }) =>
										`${linkBase} ${isActive ? linkActive : linkIdle}`
									}
								>
									<MapPin className="h-5 w-5" />
									<span>Addresses</span>
								</NavLink>

						</nav>
					</div>
					{/* Logout button right under the aside box */}
					<CommonBtn
						onClick={handleLogout}
						bgClass="bg-red-700 text-white hover:bg-red-800"
						containerClassName="mt-3"
					>
						<span className="inline-flex items-center justify-center gap-2">
							<LogOut className="h-5 w-5" />
							<span>Logout</span>
						</span>
					</CommonBtn>
					</aside>

					<main className="lg:col-span-3">
						<div className="border-3 border-gray-900 bg-white p-6 shadow-sm">
							<Outlet />
						</div>
					</main>
				</div>
			</div>
		</div>
	)
}

export default Account

