import React, { useEffect, useState } from 'react';
import { FiSave, FiCheck, FiAlertCircle } from 'react-icons/fi';

export default function SaveBtn({ onSave, className = '' }) {
    const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'

    useEffect(() => {
        let t;
        if (status === 'success') t = setTimeout(() => setStatus('idle'), 1500);
        if (status === 'error') t = setTimeout(() => setStatus('idle'), 2500);
        return () => clearTimeout(t);
    }, [status]);

    const handleClick = async (e) => {
        if (status === 'loading') return;
        setStatus('loading');
        try {
            if (onSave) {
                await onSave(e);
            } else {
                await new Promise((res) => setTimeout(res, 1000));
            }
            setStatus('success');
        } catch (err) {
            console.error('SaveBtn onSave error:', err);
            setStatus('error');
        }
    };

    const base = 'relative inline-flex items-center gap-2 px-3 py-1.5 border-0 text-md font-semibold text-white rounded-none shadow-sm transition-all focus:outline-none';
    const classes = {
        idle: `${base} bg-black border-2 hover:bg-white hover:text-black hover:border-black`,
        loading: `${base} bg-black border-2 hover:bg-white hover:text-black opacity-90 cursor-wait`,
        success: `${base} bg-[#0AD763] border-2 border-black hover:text-black`,
        error: `${base} bg-red-600 border-2 border-black`,
    };

    const isBusy = status === 'loading';

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={isBusy}
            aria-busy={isBusy}
            aria-live="polite"
            className={`${classes[status]} ${className}`}
        >
            <span className="inline-flex items-center gap-2">
                {/* invisible width-reserver (keeps layout width stable) */}
                <span className="invisible flex items-center gap-2">
                    <FiSave className="w-5 h-5" />
                    <span>Save changes</span>
                </span>

                {/* visible content — absolutely positioned relative to the button via flex + relative container */}
                <span className="absolute left-0 right-0 flex items-center justify-center pointer-events-none">
                    {status === 'loading' ? (
                        <>
                            <svg className="w-5 h-5 animate-spin mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                            </svg>
                            <span>Saving</span>
                        </>
                    ) : status === 'success' ? (
                        <FiCheck className="w-5 h-5" />
                    ) : status === 'error' ? (
                        <FiAlertCircle className="w-5 h-5" />
                    ) : (
                        <>
                            <FiSave className="w-5 h-5 mr-2" />
                            <span>Save Changes</span>
                        </>
                    )}
                </span>
            </span>
        </button>
    );
}

