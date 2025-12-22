import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { XMarkIcon } from '@heroicons/react/24/outline';

const AuthPopup = ({ isOpen, onClose, initialMode = "login" }) => {
	const [mode, setMode] = useState(initialMode);

	// Sync mode with prop when popup opens or initialMode changes
	useEffect(() => {
		if (isOpen) setMode(initialMode);
	}, [initialMode, isOpen]);
	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					onClick={onClose}
					className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 backdrop-blur-sm p-4 cursor-pointer"
				>
					<motion.div
						initial={{ opacity: 0, scale: 0.97, y: 8, rotate: "4deg" }}
						animate={{ opacity: 1, scale: 1, y: 0, rotate: "0deg" }}
						exit={{ opacity: 0, scale: 0.98, y: 6, rotate: "0deg" }}
						transition={{ type: "spring", stiffness: 120, damping: 18 }}
						onClick={(e) => e.stopPropagation()}
						className="relative w-full max-w-3xl cursor-default"
					>
						<div className="relative">
							<div className="relative bg-white/95 p-6 sm:p-8 rounded-2xl overflow-hidden">
								{/* Close button */}
								<button
									onClick={onClose}
									aria-label="Close login popup"
									className="absolute top-2 right-2 inline-flex h-10 w-10 items-center justify-center text-neutral-900 hover:text-neutral-700"
								>
									<XMarkIcon className="h-8 w-8" />
								</button>

								{/* Keep existing Login/Register forms inside the styled card */}
								<div className="w-full">
									{mode === "login" ? (
										<LoginForm compact onCreateAccount={() => setMode("register")} onSubmit={() => onClose && onClose()} />
									) : (
										<RegisterForm compact onSignIn={() => setMode("login")} onSubmit={() => onClose && onClose()} />
									)}
								</div>
							</div>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export default AuthPopup;

