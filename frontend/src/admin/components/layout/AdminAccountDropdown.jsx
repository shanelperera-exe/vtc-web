import React from 'react'
import { motion } from 'framer-motion'
import { FiLogOut, FiSettings, FiHome, FiLogIn } from 'react-icons/fi'
import AuthButton from '../../../components/ui/AuthBtn'
import { AvatarImg } from '../../../services/AvatarImg'

export default function AdminAccountDropdown({
	open,
	isLoggedIn = false,
	adminName = 'Administrator',
	email = 'admin@example.com',
	onSignIn,
	onVisitDashboard,
	onAccountSettings,
	onSignOut,
}) {
	const containerCls = [
		'absolute right-0 top-[calc(100%+10px)] z-[60] origin-top',
		'transition-all duration-200',
		open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-1.5 pointer-events-none'
	].join(' ')

	const wrapperVariants = {
		open: { scaleY: 1, opacity: 1, transition: { when: 'beforeChildren', staggerChildren: 0.08 } },
		closed: { scaleY: 0, opacity: 0, transition: { when: 'afterChildren', staggerChildren: 0.08 } },
	}
	const itemVariants = {
		open: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 30 } },
		closed: { opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.12 } },
	}

	return (
		<div className={containerCls} aria-hidden={!open}>
			<motion.div
				initial="closed"
				animate={open ? 'open' : 'closed'}
				variants={wrapperVariants}
				style={{ originY: 'top' }}
				className="w-72 overflow-hidden rounded-2xl border border-black/10 bg-white p-3.5 text-neutral-950 shadow-lg shadow-black/5"
			>
				{isLoggedIn ? (
					<>
						<motion.div variants={itemVariants} className="mb-3 flex items-center gap-3">
							<AvatarImg
								seed={email || adminName}
								className="h-10 w-10 rounded-full border border-black/10 object-cover"
								alt={`Avatar for ${adminName}`}
							/>
							<div className="flex flex-col">
								<p className="whitespace-nowrap text-sm font-semibold">{adminName}</p>
								<p className="text-xs text-neutral-600">{email}</p>
							</div>
						</motion.div>

						<motion.div variants={itemVariants}>
							<AuthButton
								onClick={onVisitDashboard}
								bgClass="bg-emerald-600 text-white"
								className="rounded-xl border border-black/10 py-2 text-sm hover:bg-emerald-700"
							>
								<span className="inline-flex items-center gap-2">
									<FiHome className="text-lg"/>
									<span>Admin Dashboard</span>
								</span>
							</AuthButton>
						</motion.div>

						<motion.div variants={itemVariants}>
							<AuthButton
								onClick={onAccountSettings}
								bgClass="bg-black text-white"
								className="rounded-xl border border-black/10 py-2 text-sm hover:bg-neutral-800"
							>
								<span className="inline-flex items-center gap-2">
									<FiSettings className="text-lg" />
									<span>Admin Settings</span>
								</span>
							</AuthButton>
						</motion.div>

						<motion.button
							variants={itemVariants}
							type="button"
							onClick={onSignOut}
							className="flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-transparent bg-white px-3 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
						>
							<FiLogOut className="text-lg" />
							<span>Sign out</span>
						</motion.button>
					</>
				) : (
					<>
						<motion.p variants={itemVariants} className="whitespace-nowrap text-sm font-semibold">Admin</motion.p>
						<motion.p variants={itemVariants} className="mb-2 text-xs text-neutral-600">Sign in to continue</motion.p>

						<motion.div variants={itemVariants}>
							<AuthButton
								onClick={onSignIn}
								bgClass="bg-emerald-600 text-white"
								className="rounded-xl border border-black/10 py-2 text-sm hover:bg-emerald-700"
							>
								<span className="inline-flex items-center justify-center gap-2">
									<FiLogIn className="text-lg" />
									<span>Admin Sign in</span>
								</span>
							</AuthButton>
						</motion.div>
					</>
				)}
			</motion.div>
		</div>
	)
}
