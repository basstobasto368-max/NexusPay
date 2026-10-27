import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Check,
  X
} from 'lucide-react';

interface RegisterPageProps {
  onNavigateToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigateToLogin }) => {
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);

  // Field errors
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [termsError, setTermsError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password requirements checks
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const isPasswordValid = hasMinLength && hasNumber && hasUppercase;

  const validate = () => {
    let isValid = true;
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmError('');
    setTermsError('');
    setFormError('');

    if (!name.trim()) {
      setNameError('Full name or trading desk ID is required.');
      isValid = false;
    }

    if (!email.trim()) {
      setEmailError('Email address is required.');
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setEmailError('Please enter a valid email address.');
        isValid = false;
      }
    }

    if (!password) {
      setPasswordError('Password is required.');
      isValid = false;
    } else if (!isPasswordValid) {
      setPasswordError('Please meet all password complexity requirements below.');
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmError('Please confirm your password.');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmError('Passwords do not match.');
      isValid = false;
    }

    if (!agreedTerms) {
      setTermsError('You must acknowledge the simulation terms and sandbox notice.');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const result = await register(email, password, name);
    setIsSubmitting(false);

    if (result.success) {
      localStorage.setItem('nexora_show_onboarding_tutorial', 'true');
    } else {
      setFormError(result.error || 'Registration failed. Please try a different email.');
    }
  };

  return (
    <div className="min-h-screen bg-[#090d14] text-slate-100 flex flex-col justify-center items-center px-4 py-8">
      {/* Main Container */}
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 mb-3 shadow-lg shadow-black/40">
            <svg viewBox="0 0 32 32" className="w-6 h-6" fill="none">
              <path
                d="M16 3L27.2583 9.5V22.5L16 29L4.74167 22.5V9.5L16 3Z"
                stroke="url(#regLogoGrad)"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
              <path
                d="M11 20L16 11L21 20M13.5 16H18.5"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="16" cy="11" r="2.2" fill="#10b981" />
              <defs>
                <linearGradient id="regLogoGrad" x1="4" y1="3" x2="28" y2="29">
                  <stop stopColor="#38bdf8" />
                  <stop offset="0.5" stopColor="#6366f1" />
                  <stop offset="1" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <h1 className="text-xl font-bold tracking-wider text-white">
            NOVEXA SOFTWARE
          </h1>
        </div>

        {/* Card */}
        <div className="p-6 sm:p-7 rounded-2xl bg-[#0e1420] border border-white/10 shadow-xl space-y-4">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">Create an Account</h2>
          </div>

          {/* Form Error Banner */}
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Full Name */}
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                Full Name or Desk ID
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (nameError) setNameError('');
                  }}
                  placeholder="e.g. Alexander Vance"
                  className={`w-full bg-[#090d16] border rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none transition-colors ${
                    nameError
                      ? 'border-rose-500/60 focus:border-rose-500'
                      : 'border-white/10 focus:border-cyan-500/60'
                  }`}
                />
              </div>
              {nameError && (
                <div className="text-[11px] text-rose-400 mt-1 font-medium">{nameError}</div>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  placeholder="Enter your email address"
                  className={`w-full bg-[#090d16] border rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none transition-colors ${
                    emailError
                      ? 'border-rose-500/60 focus:border-rose-500'
                      : 'border-white/10 focus:border-cyan-500/60'
                  }`}
                />
              </div>
              {emailError && (
                <div className="text-[11px] text-rose-400 mt-1 font-medium">{emailError}</div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  placeholder="Create a strong password"
                  className={`w-full bg-[#090d16] border rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none transition-colors ${
                    passwordError
                      ? 'border-rose-500/60 focus:border-rose-500'
                      : 'border-white/10 focus:border-cyan-500/60'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 transition-colors p-0.5"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Requirements Badges */}
              <div className="grid grid-cols-3 gap-1.5 mt-2 text-[10px]">
                <div
                  className={`flex items-center gap-1 px-2 py-0.5 rounded ${
                    hasMinLength ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-slate-400'
                  }`}
                >
                  {hasMinLength ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3" />}
                  <span>8+ Chars</span>
                </div>
                <div
                  className={`flex items-center gap-1 px-2 py-0.5 rounded ${
                    hasNumber ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-slate-400'
                  }`}
                >
                  {hasNumber ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3" />}
                  <span>1+ Number</span>
                </div>
                <div
                  className={`flex items-center gap-1 px-2 py-0.5 rounded ${
                    hasUppercase ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-slate-400'
                  }`}
                >
                  {hasUppercase ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3" />}
                  <span>1+ Uppercase</span>
                </div>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (confirmError) setConfirmError('');
                  }}
                  placeholder="Repeat your password"
                  className={`w-full bg-[#090d16] border rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none transition-colors ${
                    confirmError
                      ? 'border-rose-500/60 focus:border-rose-500'
                      : 'border-white/10 focus:border-cyan-500/60'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 transition-colors p-0.5"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmError && (
                <div className="text-[11px] text-rose-400 mt-1 font-medium">{confirmError}</div>
              )}
            </div>

            {/* Terms & Privacy Notice */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => {
                    setAgreedTerms(e.target.checked);
                    if (termsError) setTermsError('');
                  }}
                  className="w-4 h-4 mt-0.5 rounded border-white/10 bg-[#090d16] text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-cyan-500 shrink-0"
                />
                <span className="text-xs text-slate-400 leading-relaxed">
                  I acknowledge that Novexa Software is a simulated portfolio management platform and that all transactions and balances are strictly for testing and education.
                </span>
              </label>
              {termsError && (
                <div className="text-[11px] text-rose-400 mt-1 font-medium">{termsError}</div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-950/40 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Link back to Login */}
          <div className="pt-2 text-center text-xs text-slate-400 border-t border-white/10">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors underline-offset-2 hover:underline cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
