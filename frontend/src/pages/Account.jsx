import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { FiLogOut, FiMapPin, FiPackage, FiUser } from 'react-icons/fi'
import Navbar from '../components/layout/Navbar'
import CommonBtn from '../components/ui/CommonBtn'
import { useAuth } from '../context/AuthContext'
import { useEffect } from 'react'

function Account() {
	const navigate = useNavigate()
  const { user, logout, isAuthenticated, loading } = useAuth()

	const linkBase =
		'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors'
	const linkActive = 'bg-black text-white'
	const linkIdle =
		'text-neutral-800 hover:bg-neutral-100 hover:text-neutral-900'

	const handleLogout = async () => {
		try {
			await logout()
			navigate('/')
		} catch (e) {
			console.warn('Logout failed', e)
		}
	}

	useEffect(() => {
		if (!loading && !isAuthenticated) {
			navigate('/login')
		}
	}, [loading, isAuthenticated, navigate])

		return (
			<div className="min-h-screen bg-neutral-50">
				<Navbar />
				<div className="mx-auto max-w-7xl px-4 py-8">
					<div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<h1 className="text-4xl font-semibold tracking-tight text-neutral-900 sm:text-6xl">My Account</h1>
							<p className="mt-1 text-sm text-neutral-600">Manage your details, orders, and addresses</p>
							{user ? (
								<p className="mt-2 text-sm text-neutral-800">
									Signed in as <span className="font-semibold">{user.firstName} {user.lastName}</span>
								</p>
							) : null}
						</div>
					</div>

					<div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
						<aside className="lg:col-span-4 xl:col-span-3">
							<div className="rounded-2xl border border-black/10 bg-white p-2 shadow-sm shadow-black/5 lg:sticky lg:top-24 mb-4">
								<nav className="flex flex-col gap-1">
									<NavLink
										to="accountdetails"
										className={({ isActive }) =>
											`${linkBase} ${isActive ? linkActive : linkIdle}`
										}
									>
										<FiUser className="text-lg" />
										<span>Account Details</span>
									</NavLink>

									<NavLink
										to="orders"
										className={({ isActive }) =>
											`${linkBase} ${isActive ? linkActive : linkIdle}`
										}
									>
										<FiPackage className="text-lg" />
										<span>Orders</span>
									</NavLink>

									<NavLink
										to="addresses"
										className={({ isActive }) =>
											`${linkBase} ${isActive ? linkActive : linkIdle}`
										}
									>
										<FiMapPin className="text-lg" />
										<span>Addresses</span>
									</NavLink>
								</nav>
							</div>

							<CommonBtn
								onClick={handleLogout}
								noShadow
								bgClass="bg-black text-white hover:bg-neutral-800"
								containerClassName="mt-5"
								className="rounded-xl border border-black/10 px-4 py-2 text-sm font-semibold"
								fullWidth
							>
								<span className="inline-flex items-center justify-center gap-2">
									<FiLogOut className="text-lg" />
									<span>Logout</span>
								</span>
							</CommonBtn>
						</aside>

						<main className="lg:col-span-8 xl:col-span-9">
							<div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm shadow-black/5 sm:p-6">
								<Outlet />
							</div>
						</main>
					</div>
				</div>
			</div>
		)
}

export default Account

