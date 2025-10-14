import React, { useMemo, useState } from "react";
import zxcvbn from 'zxcvbn';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { validateEmail, validatePassword, validateName } from '../../utils/validation';
import useDebounce from '../../hooks/useDebounce';
import AuthButton from "../ui/AuthBtn";
import Checkbox from "../ui/Checkbox";
import { useAuth } from '../../context/AuthContext';

const RegisterForm = ({ onSubmit, onShowAllAuth, onSignIn, primaryBtnClass, secondaryBtnClass = "bg-neutral-600 text-white", compact = false }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ firstName: false, lastName: false, email: false, password: false });
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);
  const { register: registerUser, authError } = useAuth() || {};

  const debouncedPassword = useDebounce(password, 350);
  const emailErr = validateEmail(email);
  const pwErr = validatePassword(password);
  const strength = useMemo(() => debouncedPassword ? zxcvbn(debouncedPassword) : null, [debouncedPassword]);
  const strengthScore = strength?.score ?? 0; // 0-4
  const strengthLabels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const fnErr = validateName(firstName, 'First name');
  const lnErr = validateName(lastName, 'Last name');
  const formInvalid = Boolean(emailErr || pwErr || fnErr || lnErr || !agree);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ firstName: true, lastName: true, email: true, password: true });
    if (formInvalid) return;
    setSubmitting(true); setLocalError(null);
    const payload = { firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), password };
    try {
      if (registerUser) await registerUser(payload);
      onSubmit?.(payload);
    } catch (err) { setLocalError(err.message || 'Registration failed'); }
    finally { setSubmitting(false); }
  };

  const containerCls = `mx-auto w-full max-w-xl sm:max-w-2xl md:max-w-3xl ${compact ? 'p-6' : 'p-8'}`;
  const headingCls = `${compact ? 'mb-1 text-3xl' : 'mb-2 text-4xl'} text-center font-bold uppercase`;
  const subHeadingCls = `${compact ? 'mb-5' : 'mb-8'} text-center text-sm text-neutral-500`;
  const blockGap = compact ? 'mt-3' : 'mt-4';
  const sectionGap = compact ? 'gap-3' : 'gap-4';

  return (
    <div className={containerCls}>
      <h3 className={headingCls}>Create account</h3>
      <p className={subHeadingCls}>Sign up to get started</p>

      <form onSubmit={handleSubmit}>
        <div className={`grid grid-cols-1 md:grid-cols-2 ${sectionGap}`}>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="reg-first-name">First name*</label>
            <input
              id="reg-first-name"
              type="text"
              required
              placeholder="Jane"
              onBlur={() => setTouched(t => ({ ...t, firstName: true }))}
              className={`w-full rounded border-[1px] p-2 outline-[#0bd964] transition-colors placeholder:italic focus:border-[#0bd964] ${touched.firstName && fnErr ? 'border-rose-500' : 'border-neutral-300'}`}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            {touched.firstName && fnErr && <p className="mt-1 text-xs text-rose-600" role="alert">{fnErr}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="reg-last-name">Last name*</label>
            <input
              id="reg-last-name"
              type="text"
              required
              placeholder="Doe"
              onBlur={() => setTouched(t => ({ ...t, lastName: true }))}
              className={`w-full rounded border-[1px] p-2 outline-[#0bd964] transition-colors placeholder:italic focus:border-[#0bd964] ${touched.lastName && lnErr ? 'border-rose-500' : 'border-neutral-300'}`}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            {touched.lastName && lnErr && <p className="mt-1 text-xs text-rose-600" role="alert">{lnErr}</p>}
          </div>
        </div>

        <div className={blockGap}>
          <label className="mb-1 block text-sm font-medium" htmlFor="reg-email">Email*</label>
          <input
            id="reg-email"
            type="email"
            required
            placeholder="jane.doe@email.com"
            onBlur={() => setTouched(t => ({ ...t, email: true }))}
            className={`w-full rounded border-[1px] p-2 outline-[#0bd964] transition-colors placeholder:italic focus:border-[#0bd964] ${touched.email && emailErr ? 'border-rose-500' : 'border-neutral-300'}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {touched.email && emailErr && <p className="mt-1 text-xs text-rose-600" role="alert">{emailErr}</p>}
        </div>

        <div className={blockGap}>
          <label className="mb-1 block text-sm font-medium" htmlFor="reg-password">Password*</label>
          <div className="relative">
            <input
              id="reg-password"
              type={showPw ? 'text' : 'password'}
              required
              minLength={8}
              maxLength={150}
              placeholder="••••••••••••"
              autoComplete="new-password"
              onBlur={() => setTouched(t => ({ ...t, password: true }))}
              className={`w-full pr-11 rounded border p-2 outline-[#0bd964] transition-colors placeholder:italic focus:border-[#0bd964] ${touched.password && pwErr ? 'border-rose-500' : 'border-neutral-300'}`}
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
          {touched.password && pwErr && <p className="mt-1 text-xs text-rose-600" role="alert">{pwErr}</p>}
          {password && !pwErr && (
            <div className="mt-2" aria-live="polite">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-neutral-200 rounded overflow-hidden">
                  <div className={`h-full transition-all duration-300 ${strengthScore <=1 ? 'bg-rose-500' : strengthScore===2 ? 'bg-amber-500' : strengthScore===3 ? 'bg-lime-500' : 'bg-emerald-600'}`} style={{ width: ((strengthScore+1)/5)*100 + '%' }} />
                </div>
                <span className="text-xs font-medium text-neutral-700 min-w-16 text-right">{strengthLabels[strengthScore]}</span>
              </div>
              {strength && strength.feedback.warning && <p className="mt-1 text-[10px] text-amber-600">{strength.feedback.warning}</p>}
              {strength && strength.feedback.suggestions?.length > 0 && (
                <ul className="mt-1 text-[10px] text-neutral-600 list-disc ml-4 space-y-0.5">
                  {strength.feedback.suggestions.slice(0,2).map((s,i)=>(<li key={i}>{s}</li>))}
                </ul>
              )}
            </div>
          )}
        </div>

  <label className={`${blockGap} flex items-start gap-2 text-sm text-neutral-700 ${compact ? 'mb-3' : 'mb-4'}`}>
          <Checkbox
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            ariaLabel="Agree to terms and policies"
          />
          <span className="ml-1">
            By signing up, you confirm that you agree to our terms, license agreement and privacy policy.
          </span>
        </label>

        <div aria-live="assertive" className="min-h-[1rem]">
          {(localError || authError) && (
            <div className="mb-3 text-sm text-red-600" role="alert">{localError || authError}</div>
          )}
        </div>
  <AuthButton type="submit" label={submitting ? 'Creating...' : 'Create Account'} bgClass={primaryBtnClass} disabled={formInvalid || submitting} />

  <div className={`${compact ? 'mt-5' : 'mt-6'} text-center text-sm text-neutral-600`}>Already have an account?</div>
        <AuthButton
          type="button"
          label="Sign In"
          onClick={onSignIn ?? onShowAllAuth}
          containerClassName="mt-1"
          bgClass={secondaryBtnClass}
        />
      </form>

      <div className="mt-6 flex flex-col items-center justify-center gap-2 text-xs text-neutral-700">
        <div className="font-medium">
          <a className="hover:underline" href="/components/license" rel="nofollow" target="_blank">License</a>
          <span className="mx-2 inline-block">|</span>
          <a className="hover:underline" href="/privacy.html" rel="nofollow" target="_blank">Privacy Policy</a>
          <span className="mx-2 inline-block">|</span>
          <a className="hover:underline" href="/terms.html" rel="nofollow" target="_blank">Terms</a>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
