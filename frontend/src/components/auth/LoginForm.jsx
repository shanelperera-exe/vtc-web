import React, { useState } from "react";
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { validateEmail, validatePassword } from '../../utils/validation';
import AuthButton from "../ui/AuthBtn";
import ForgotPasswordPopup from "./ForgotPasswordPopup";
import { useAuth } from '../../context/AuthContext';

const LoginForm = ({ onSubmit, onForgotPassword, onShowAllAuth, onCreateAccount, primaryBtnClass, secondaryBtnClass = "bg-red-400 text-white", compact = false }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [touched, setTouched] = useState({ email: false, password: false });
    const [submitting, setSubmitting] = useState(false);
    const [localError, setLocalError] = useState(null);
    const { login, authError } = useAuth() || {};

    const [forgotOpen, setForgotOpen] = useState(false)

    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    const formInvalid = Boolean(emailErr || passwordErr);
    const [showPw, setShowPw] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setTouched({ email: true, password: true });
        if (formInvalid) return;
        setSubmitting(true); setLocalError(null);
        try {
            if (login) {
                await login({ email, password });
            }
            onSubmit?.({ email, password });
        } catch (err) {
            setLocalError(err.message || 'Login failed');
        } finally { setSubmitting(false); }
    };

    const containerCls = `mx-auto w-full max-w-xl sm:max-w-2xl md:max-w-3xl ${compact ? 'p-6' : 'p-8'}`;
    const headingCls = `${compact ? 'mb-1 text-3xl' : 'mb-2 text-4xl'} text-center font-bold uppercase`;
    const subHeadingCls = `${compact ? 'mb-5' : 'mb-8'} text-center text-sm text-neutral-500`;
    const fieldBlockCls = compact ? 'mb-3' : 'mb-4';

    return (
        <div className={containerCls}>
            <h3 className={headingCls} >Sign in</h3>
            <p className={subHeadingCls}>Sign in to your account</p>

            <form onSubmit={handleSubmit}>
                <div className={fieldBlockCls}>
                    <label className="mb-1 block text-sm font-medium" htmlFor="auth-user-email">
                        Email*
                    </label>
                    <input
                        id="auth-user-email"
                        type="email"
                        required
                        placeholder="cool.fella@gmail.com"
                        onBlur={() => setTouched(t => ({ ...t, email: true }))}
                        className={`w-full rounded border-[1px] p-2 outline-[#0bd964] transition-colors placeholder:italic focus:border-[#0bd964] ${touched.email && emailErr ? 'border-rose-500' : 'border-neutral-300'}`}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    {touched.email && emailErr && <p className="mt-1 text-xs text-rose-600" role="alert">{emailErr}</p>}
                </div>

                <div className={fieldBlockCls}>
                    <label className="mb-1 block text-sm font-medium" htmlFor="auth-user-password">
                        Password*
                    </label>
                    <div className="relative">
                        <input
                            id="auth-user-password"
                            type={showPw ? 'text' : 'password'}
                            required
                            minLength={8}
                            maxLength={150}
                            placeholder="••••••••••••"
                            onBlur={() => setTouched(t => ({ ...t, password: true }))}
                            className={`w-full pr-11 rounded border p-2 outline-[#0bd964] transition-colors placeholder:italic focus:border-[#0bd964] ${touched.password && passwordErr ? 'border-rose-500' : 'border-neutral-300'}`}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            aria-label={showPw ? 'Hide password' : 'Show password'}
                            aria-pressed={showPw}
                            onClick={() => setShowPw(s => !s)}
                            className="absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500 hover:text-neutral-700 focus:outline-none"
                        >
                            {showPw ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                    </div>
                    {touched.password && passwordErr && <p className="mt-1 text-xs text-rose-600" role="alert">{passwordErr}</p>}
                    <button
                        type="button"
                        className="text-xs italic text-[#0bd964] hover:underline mt-1"
                        onClick={() => {
                            // Prefer local popup; if parent passed handler, still call it
                            setForgotOpen(true)
                            if (onForgotPassword) onForgotPassword()
                        }}
                    >
                        Forgot your password?
                    </button>
                </div>

                <div aria-live="assertive" className="min-h-[1rem]">
                    {(localError || authError) && (
                        <div className="mb-3 text-sm text-red-600" role="alert">{localError || authError}</div>
                    )}
                </div>
                <AuthButton type="submit" label={submitting ? 'Signing In...' : 'Sign In'} disabled={submitting || formInvalid} bgClass={primaryBtnClass}
                />
                <div className={`${compact ? 'mt-5' : 'mt-6'} text-center text-sm text-neutral-600`}>Don't have an account?</div>
                <AuthButton
                    type="button"
                    label="Create an Account"
                    onClick={onCreateAccount ?? onShowAllAuth}
                    containerClassName="mt-1"
                    bgClass={secondaryBtnClass}
                />
            </form>

            <ForgotPasswordPopup
                isOpen={forgotOpen}
                onClose={() => setForgotOpen(false)}
                onBackToLogin={() => setForgotOpen(false)}
            />

            <div className="mt-6 flex flex-col items-center justify-center gap-2 text-xs text-neutral-700">
                <div className="font-medium">
                    <a className="hover:underline" href="/components/license" rel="nofollow" target="_blank">
                        License
                    </a>
                    <span className="mx-2 inline-block">|</span>
                    <a className="hover:underline" href="/privacy.html" rel="nofollow" target="_blank">
                        Privacy Policy
                    </a>
                    <span className="mx-2 inline-block">|</span>
                    <a className="hover:underline" href="/terms.html" rel="nofollow" target="_blank">
                        Terms
                    </a>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;

