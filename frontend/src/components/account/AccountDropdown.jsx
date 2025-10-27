import React from 'react'
import { motion } from 'framer-motion'
import { FiLogOut, FiUser, FiSettings, FiPackage, FiLogIn, FiUserPlus } from 'react-icons/fi'
import { RiAccountCircleLine } from 'react-icons/ri'
import AuthButton from '../ui/AuthBtn'
import CommonBtn from '../ui/CommonBtn'

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
        'absolute right-[102px] top-[calc(100%+15px)] z-[60] origin-top',
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
                className="w-64 border-2 border-neutral-950 bg-white p-4 text-neutral-950 overflow-hidden rounded-none"
            >
                {isLoggedIn ? (
                    <>
                        <motion.p variants={itemVariants} className="whitespace-nowrap font-bold">{userName}</motion.p>
                        <motion.p variants={itemVariants} className="mb-2 text-xs text-neutral-600">{email}</motion.p>

                        <motion.div variants={itemVariants}>
                            <CommonBtn onClick={onVisitProfile} bgClass="bg-white text-black">
                                <span className="inline-flex items-center gap-2">
                                    <FiUser className="text-lg"/>
                                    <span>Account</span>
                                </span>
                            </CommonBtn>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <CommonBtn onClick={onAccountSettings} bgClass="bg-gray-400 text-black">
                                <span className="inline-flex items-center gap-2">
                                    <FiPackage className="text-lg" />
                                    <span>My Orders</span>
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
                        <motion.p variants={itemVariants} className="whitespace-nowrap font-bold flex items-center gap-2">
                            <RiAccountCircleLine className="text-xl" />
                            <span>Your Account</span>
                        </motion.p>
                        <motion.p variants={itemVariants} className="mb-2 text-xs text-neutral-600">Sign in or create an account</motion.p>

                        <motion.div variants={itemVariants}>
                            <AuthButton onClick={onSignIn} bgClass="bg-emerald-600 text-white">
                                <span className="inline-flex items-center justify-center gap-2">
                                    <FiLogIn className="text-lg" />
                                    <span>Sign in</span>
                                </span>
                            </AuthButton>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <AuthButton onClick={onCreateAccount} bgClass="bg-black text-white">
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

