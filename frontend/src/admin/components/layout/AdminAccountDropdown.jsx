import React from 'react'
import { motion } from 'framer-motion'
import { FiLogOut, FiUser, FiSettings, FiHome } from 'react-icons/fi'
import AuthButton from '../../../components/ui/AuthBtn'
import CommonBtn from '../../../components/ui/CommonBtn'

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
		open: { opacity: 1, y: 0 },
		closed: { opacity: 0, y: -8 },
	}

	return (
		<div className={containerCls} aria-hidden={!open}>
			<motion.div
				initial="closed"
				animate={open ? 'open' : 'closed'}
				variants={wrapperVariants}
				style={{ originY: 'top' }}
				className="w-64 border-2 border-neutral-950 bg-white p-4 text-neutral-950 overflow-hidden"
			>
				{isLoggedIn ? (
					<>
						<motion.p variants={itemVariants} className="whitespace-nowrap font-bold">{adminName}</motion.p>
						<motion.p variants={itemVariants} className="mb-2 text-xs text-neutral-600">{email}</motion.p>

						<motion.div variants={itemVariants}>
							<CommonBtn onClick={onVisitDashboard} bgClass="bg-white text-black">
								<span className="inline-flex items-center gap-2">
									<FiHome className="text-lg"/>
									<span>Admin Dashboard</span>
								</span>
							</CommonBtn>
						</motion.div>

						<motion.div variants={itemVariants}>
							<CommonBtn onClick={onAccountSettings} bgClass="bg-gray-400 text-black">
								<span className="inline-flex items-center gap-2">
									<FiSettings className="text-lg" />
									<span>Admin Settings</span>
								</span>
							</CommonBtn>
						</motion.div>

						<motion.button variants={itemVariants} type="button" onClick={onSignOut} className="flex w-full items-center justify-center gap-2 whitespace-nowrap bg-white p-1.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-200 hover:text-neutral-800">
							<FiLogOut className="text-lg" />
							<span>Sign out</span>
						</motion.button>
					</>
				) : (
					<>
						<motion.p variants={itemVariants} className="whitespace-nowrap font-bold">Admin</motion.p>
						<motion.p variants={itemVariants} className="mb-2 text-xs text-neutral-600">Sign in to continue</motion.p>

						<motion.div variants={itemVariants}>
							<AuthButton label="Admin Sign in" onClick={onSignIn} />
						</motion.div>
					</>
				)}
			</motion.div>
		</div>
	)
}
