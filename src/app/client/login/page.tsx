'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { OtpInput } from '@/components/OtpInput';
import { 
  UserCheck, 
  ArrowRight, 
  Mail, 
  CheckCircle2, 
  Shield, 
  RefreshCw, 
  ChevronLeft,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function ClientLoginPage() {
  const router = useRouter();
  const { currentUser, requestMagicLink, verifyCode } = useAuth();
  
  // States: 'input' -> 'sent'
  const [step, setStep] = useState<'input' | 'sent'>('input');
  const [emailInput, setEmailInput] = useState('sarah@mainstreetcowork.com');
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendSeconds, setResendSeconds] = useState(30);

  // Auto redirect if already logged in as Client
  useEffect(() => {
    if (currentUser?.role === 'Client') {
      router.push('/client');
    }
  }, [currentUser, router]);

  // Resend timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'sent' && resendSeconds > 0) {
      timer = setInterval(() => {
        setResendSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendSeconds]);

  // Request Magic Link / OTP
  const handleSendLink = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!emailInput.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    const res = await requestMagicLink(emailInput.trim(), 'Client');
    setIsLoading(false);

    if (res.success) {
      setStep('sent');
      setResendSeconds(30);
    } else {
      setErrorMessage(res.error || 'Failed to send magic link. Please try again.');
    }
  };

  // Verify OTP code
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = codeToVerify || otpCode;
    if (code.length !== 6) {
      setErrorMessage('Please enter all 6 digits of the verification code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const res = await verifyCode(emailInput.trim(), code, 'Client');
    setIsLoading(false);

    if (res.success) {
      router.push('/client');
    } else {
      setErrorMessage(res.error || 'Invalid or expired code. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col justify-center items-center p-4 sm:p-6 transition-colors">
      <div className="w-full max-w-md space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm mb-1">
            <UserCheck className="w-6 h-6" />
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Luminary Film Studio
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 dark:text-neutral-50">
            Client Review Portal
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            Main Street Co-Working Promo • Active Commercial Production
          </p>
        </div>

        {/* STEP 1: Enter Email */}
        {step === 'input' && (
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-500" />
                <span>Passwordless Magic Link & Code</span>
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Enter your registered client email to receive a secure login token.
              </p>
            </div>

            <form onSubmit={handleSendLink} className="space-y-3.5">
              <div>
                <label htmlFor="client-email" className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Client Work Email
                </label>
                <input
                  id="client-email"
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="name@mainstreetcowork.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-98"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Send Magic Link & Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

          </div>
        )}

        {/* STEP 2: "Check Your Inbox" Screen */}
        {step === 'sent' && (
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm space-y-6">
            
            {/* Inbox header */}
            <div className="text-center space-y-2">
              <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto">
                <Mail className="w-7 h-7" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 text-[9px] font-bold text-white items-center justify-center">1</span>
                </span>
              </div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Check Your Inbox
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto">
                We sent a secure magic link and 6-digit access code to <strong className="text-neutral-900 dark:text-neutral-200">{emailInput}</strong>
              </p>
            </div>

            {/* Or enter 6-digit code */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                <span className="h-px bg-neutral-200 dark:border-neutral-800 flex-1" />
                <span>Or Enter 6-Digit Code</span>
                <span className="h-px bg-neutral-200 dark:border-neutral-800 flex-1" />
              </div>

              <OtpInput
                value={otpCode}
                onChange={(code) => setOtpCode(code)}
                onComplete={(code) => handleVerifyOtp(code)}
                accentColor="emerald"
                disabled={isLoading}
              />

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                onClick={() => handleVerifyOtp()}
                disabled={isLoading || otpCode.length !== 6}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-800 dark:hover:bg-white text-white dark:text-neutral-900 text-xs sm:text-sm font-bold disabled:opacity-40 transition-all shadow-xs"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Verify Code & Enter Portal</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Footer options: Resend timer & Change email */}
            <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
              <button
                type="button"
                onClick={() => { setStep('input'); setErrorMessage(null); }}
                className="inline-flex items-center gap-1 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Change email</span>
              </button>

              {resendSeconds > 0 ? (
                <span className="text-[11px] text-neutral-400 font-mono">
                  Resend code in {resendSeconds}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendLink()}
                  className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                >
                  Resend magic link
                </button>
              )}
            </div>

          </div>
        )}

        {/* Link to Editor Login */}
        <div className="text-center pt-2">
          <Link
            href="/signup"
            className="block mb-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            New client? Create an account
          </Link>
          <Link
            href="/editor/login"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Studio Team Member? <strong>Go to Editor Cockpit Login</strong></span>
          </Link>
        </div>

      </div>
    </div>
  );
}
