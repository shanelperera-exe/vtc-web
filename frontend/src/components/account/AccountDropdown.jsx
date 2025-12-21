import React from 'react'
import { motion } from 'framer-motion'
import { FiLogOut, FiUser, FiSettings, FiPackage, FiLogIn, FiUserPlus } from 'react-icons/fi'
import { RiAccountCircleLine } from 'react-icons/ri'
import AuthButton from '../ui/AuthBtn'
import { AvatarImg } from '../../services/AvatarImg'

export default function AccountDropdown({
    open,
    isLoggedIn = false,
    userName = 'Tim Cook',
    email = 'timc@gmail.com',
    onSignIn,
    onCreateAccount,
    onVisitProfile,
    onAccountSettings,
    onSignOut
}) {
    const containerCls = [
        'absolute right-0 top-[calc(100%+8px)] z-[60] origin-top',
        'transition-all duration-200',
        open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-1.5 pointer-events-none'
    ].join(' ')

    const wrapperVariants = {
        open: { scaleY: 1, opacity: 1, transition: { when: 'beforeChildren', staggerChildren: 0.06 } },
        closed: { scaleY: 0, opacity: 0, transition: { when: 'afterChildren', staggerChildren: 0.06 } },
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
                                seed={email || userName}
                                className="h-10 w-10 rounded-full border border-black/10 object-cover"
                                alt={`Avatar for ${userName}`}
                            />
                            <div className="flex flex-col">
                                <p className="whitespace-nowrap text-sm font-semibold">{userName}</p>
                                <p className="text-xs text-neutral-600">{email}</p>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <AuthButton
                                onClick={onVisitProfile}
                                bgClass="bg-emerald-600 text-white"
                                className="rounded-xl border border-black/10 py-2 text-sm hover:bg-emerald-700"
                            >
                                <span className="inline-flex items-center gap-2">
                                    <FiUser className="text-lg" />
                                    <span>Account</span>
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
                                    <FiPackage className="text-lg" />
                                    <span>My Orders</span>
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
                        <motion.p variants={itemVariants} className="flex items-center gap-2 whitespace-nowrap text-sm font-semibold">
                            <RiAccountCircleLine className="text-xl" />
                            <span>Your Account</span>
                        </motion.p>
                        <motion.p variants={itemVariants} className="mb-2 text-xs text-neutral-600">Sign in or create an account</motion.p>

                        <motion.div variants={itemVariants}>
                            <AuthButton
                                onClick={onSignIn}
                                bgClass="bg-emerald-600 text-white"
                                className="rounded-xl border border-black/10 py-2 text-sm hover:bg-emerald-700"
                            >
                                <span className="inline-flex items-center justify-center gap-2">
                                    <FiLogIn className="text-lg" />
                                    <span>Sign in</span>
                                </span>
                            </AuthButton>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <AuthButton
                                onClick={onCreateAccount}
                                bgClass="bg-black text-white"
                                className="rounded-xl border border-black/10 py-2 text-sm hover:bg-neutral-800"
                            >
                                <span className="inline-flex items-center justify-center gap-2">
                                    <FiUserPlus className="text-lg" />
                                    <span>Create Account</span>
                                </span>
                            </AuthButton>
                        </motion.div>
                    </>
                )}
            </motion.div>
        </div>
    )
}

