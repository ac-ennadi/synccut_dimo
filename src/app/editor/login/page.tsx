'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { OtpInput } from '@/components/OtpInput';
import { 
  Clapperboard, 
  Shield, 
  ArrowRight, 
  Lock, 
  CheckCircle2, 
  UserCheck, 
  RefreshCw, 
  ChevronLeft,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function EditorLoginPage() {
  const router = useRouter();
  const { currentUser, requestMagicLink, verifyCode } = useAuth();
  
  // States: 'input' -> 'sent'
  const [step, setStep] = useState<'input' | 'sent'>('input');
  const [emailInput, setEmailInput] = useState('alex@luminaryfilms.com');
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendSeconds, setResendSeconds] = useState(60);

  // Auto redirect if already logged in as Editor
  useEffect(() => {
    if (currentUser?.role === 'Editor') {
      router.push('/editor');
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

    const res = await requestMagicLink(emailInput.trim(), 'Editor');
    setIsLoading(false);

    if (res.success) {
      setStep('sent');
      setResendSeconds(60);
    } else {
      setErrorMessage(res.error || 'Failed to send studio magic link. Please try again.');
    }
  };

  // Verify OTP code
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = codeToVerify || otpCode;
    if (code.length !== 6) {
      setErrorMessage('Please enter all 6 digits of the studio access code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const res = await verifyCode(emailInput.trim(), code, 'Editor');
    setIsLoading(false);

    if (res.success) {
      router.push('/editor');
    } else {
      setErrorMessage(res.error || 'Invalid or expired studio code. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-center items-center p-4 sm:p-6 transition-colors">
      <div className="w-full max-w-md space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 mb-1">
            <Clapperboard className="w-6 h-6" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
            <Shield className="w-3 h-3" />
            <span>Authorized Studio Personnel Only</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Editor Studio Cockpit
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            Luminary Film Studio • Production Bay & Delivery Pipeline
          </p>
        </div>

        {/* STEP 1: Enter Studio Email */}
        {step === 'input' && (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 backdrop-blur-md p-6 shadow-2xl space-y-5">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-400" />
                <span>Studio Crew Authentication</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Enter your studio credentials to receive an encrypted session token.
              </p>
            </div>

            <form onSubmit={handleSendLink} className="space-y-3.5">
              <div>
                <label htmlFor="editor-email" className="block text-xs font-semibold text-neutral-300 mb-1">
                  Studio Email Address
                </label>
                <input
                  id="editor-email"
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="alex@luminaryfilms.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-700 bg-neutral-950 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-xs sm:text-sm font-bold transition-all shadow-md active:scale-98"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Send Studio Magic Link & Token</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

          </div>
        )}

        {/* STEP 2: "Check Studio Email" Screen */}
        {step === 'sent' && (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 backdrop-blur-md p-6 shadow-2xl space-y-6">
            
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600/10 text-indigo-400 mx-auto border border-indigo-500/20">
                <Lock className="w-7 h-7" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-600 text-[9px] font-bold text-white items-center justify-center">1</span>
                </span>
              </div>
              <h2 className="text-lg font-bold text-white">
                Check Studio Mail
              </h2>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                Encrypted magic link & 6-digit access code dispatched to <strong className="text-white font-mono">{emailInput}</strong>
              </p>
            </div>

            {/* Or enter 6-digit code */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                <span className="h-px bg-neutral-800 flex-1" />
                <span>Or Enter 6-Digit Studio Token</span>
                <span className="h-px bg-neutral-800 flex-1" />
              </div>

              <OtpInput
                value={otpCode}
                onChange={(code) => setOtpCode(code)}
                onComplete={(code) => handleVerifyOtp(code)}
                accentColor="indigo"
                disabled={isLoading}
              />

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                onClick={() => handleVerifyOtp()}
                disabled={isLoading || otpCode.length !== 6}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold disabled:opacity-40 transition-all shadow-md"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Verify Token & Launch Cockpit</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Footer options */}
            <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
              <button
                type="button"
                onClick={() => { setStep('input'); setErrorMessage(null); }}
                className="inline-flex items-center gap-1 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Change email</span>
              </button>

              {resendSeconds > 0 ? (
                <span className="text-[11px] text-neutral-500 font-mono">
                  Resend token in {resendSeconds}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendLink()}
                  className="text-indigo-400 font-semibold hover:underline"
                >
                  Resend studio token
                </button>
              )}
            </div>

          </div>
        )}

        {/* Link to Client Login */}
        <div className="text-center pt-2">
          <Link
            href="/client/login"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-emerald-400 transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Are you a client? <strong>Go to Client Review Portal Login</strong></span>
          </Link>
        </div>

      </div>
    </div>
  );
}
