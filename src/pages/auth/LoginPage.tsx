import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, AlertCircle, ArrowRight, Moon } from 'lucide-react';

interface LoginPageProps {
  onNavigateToRegister: () => void;
  onNavigateToForgot: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateToRegister,
  onNavigateToForgot
}) => {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (val: string) => {
    if (!val.trim()) {
      return 'Email address is required.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val.trim())) {
      return 'Please enter a valid email address.';
    }
    return '';
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) setEmailError('');
    if (formError) setFormError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (passwordError) setPasswordError('');
    if (formError) setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const emailErr = validateEmail(email);
    const passErr = !password ? 'Password is required.' : '';

    if (emailErr || passErr) {
      if (emailErr) setEmailError(emailErr);
      if (passErr) setPasswordError(passErr);
      setFormError('Please enter both your email address and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login(email, password, rememberMe);
      if (!result.success) {
        setFormError(result.error || 'Invalid email address or password.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred during sign in.';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#030712] text-slate-100 flex items-center justify-center relative overflow-hidden font-sans select-none">
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft radial glow behind the planet */}
        <div className="absolute -left-20 top-1/4 w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[140px]" />
        {/* Soft radial glow behind the login card */}
        <div className="absolute right-10 top-1/3 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[130px]" />
        {/* Deep starry tint */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(14,35,70,0.3)_0%,_rgba(3,7,18,0.95)_75%)]" />
      </div>

      {/* Top right crescent moon icon from reference design */}
      <div className="absolute top-5 right-6 sm:top-8 sm:right-8 z-30 pointer-events-none">
        <Moon className="w-5 h-5 text-sky-300/80 stroke-[1.5]" />
      </div>

      {/* Main 2-column container */}
      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-6 sm:py-10 flex flex-col lg:flex-row items-center justify-between min-h-screen gap-8 lg:gap-10">
        
        {/* Left Side: Futuristic Planet, NOVEXA Branding, and 3D Crypto Coins */}
        <div className="w-full lg:flex-1 flex flex-col items-center lg:items-start justify-center relative">
          {/* Desktop full artwork display */}
          <div className="hidden lg:block w-full max-w-[740px] relative">
            <img
              src="/assets/login/novexa_hero_left.png"
              alt="NOVEXA SOFTWARE - The Next Generation of Digital Assets"
              className="w-full h-auto max-h-[88vh] object-contain drop-shadow-[0_0_60px_rgba(56,189,248,0.18)]"
              loading="eager"
            />
          </div>

          {/* Mobile / Tablet branding banner */}
          <div className="lg:hidden flex flex-col items-center text-center pt-4 pb-2">
            <div className="w-16 h-16 relative flex items-center justify-center mb-3">
              <img
                src="/assets/login/novexa_emblem.png"
                alt="Novexa Logo"
                className="w-16 h-16 object-contain drop-shadow-[0_0_25px_rgba(56,189,248,0.6)]"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-[0.25em] text-white">
              NOVEXA
            </h1>
            <span className="text-xs sm:text-sm font-semibold text-sky-400 tracking-[0.45em] mt-1">
              SOFTWARE
            </span>
            <p className="text-xs text-slate-400 mt-2">
              The Next Generation of Digital Assets.
            </p>
          </div>
        </div>

        {/* Right Side: Glassmorphism Login Card & Binance QR Card */}
        <div className="w-full max-w-[440px] sm:max-w-[460px] flex flex-col items-center gap-5 z-20 pb-4">
          {/* Main Glassmorphism Login Card */}
          <div className="relative w-full rounded-[28px] bg-[#071329]/80 backdrop-blur-2xl border border-sky-400/35 p-6 sm:p-9 shadow-[0_0_50px_rgba(56,189,248,0.18),0_20px_50px_rgba(0,0,0,0.8)]">
            
            {/* Header Emblem & Typography */}
            <div className="flex flex-col items-center text-center mb-6 select-none">
              <div className="w-14 h-14 relative flex items-center justify-center mb-2.5">
                <img
                  src="/assets/login/novexa_emblem.png"
                  alt="Novexa Emblem"
                  className="w-14 h-14 object-contain drop-shadow-[0_0_20px_rgba(56,189,248,0.6)]"
                />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-[0.25em] text-white">
                NOVEXA
              </h2>
              <span className="text-[10px] sm:text-[11px] font-semibold text-sky-400 tracking-[0.45em] mt-1">
                SOFTWARE
              </span>
            </div>

            {/* Validation / Error Banner */}
            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/35 text-rose-200 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Email Field */}
              <div>
                <div
                  className={`relative flex items-center rounded-xl bg-[#091730]/90 border transition-all ${
                    emailError
                      ? 'border-rose-500/60 ring-1 ring-rose-500/30'
                      : 'border-sky-500/30 focus-within:border-sky-400 focus-within:ring-1 focus-within:ring-sky-400/50'
                  }`}
                >
                  <div className="pl-3.5 pr-2 text-sky-400/80 pointer-events-none flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    id="login-email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="Email address"
                    autoComplete="email"
                    className="w-full bg-transparent py-3 pr-3.5 text-xs text-white placeholder-slate-400/70 focus:outline-none font-sans"
                  />
                </div>
                {emailError && (
                  <p className="text-[11px] text-rose-400 mt-1 pl-1">{emailError}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div
                  className={`relative flex items-center rounded-xl bg-[#091730]/90 border transition-all ${
                    passwordError
                      ? 'border-rose-500/60 ring-1 ring-rose-500/30'
                      : 'border-sky-500/30 focus-within:border-sky-400 focus-within:ring-1 focus-within:ring-sky-400/50'
                  }`}
                >
                  <div className="pl-3.5 pr-2 text-sky-400/80 pointer-events-none flex items-center justify-center">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="login-password"
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Password"
                    autoComplete="current-password"
                    className="w-full bg-transparent py-3 pr-10 text-xs text-white placeholder-slate-400/70 focus:outline-none font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-sky-300 transition-colors p-1 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-[11px] text-rose-400 mt-1 pl-1">{passwordError}</p>
                )}
              </div>

              {/* Remember Me Toggle */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-sky-500/30 bg-[#091730] text-sky-500 focus:ring-0 focus:ring-offset-0 accent-sky-500 cursor-pointer"
                  />
                  <span className="text-slate-300 text-xs">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={onNavigateToForgot}
                  className="text-xs text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* Glowing Neon Sign In Button */}
              <button
                id="login-button"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00b4d8] to-[#0077b6] hover:from-[#38bdf8] hover:to-[#0284c7] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(0,180,216,0.5)] hover:shadow-[0_0_35px_rgba(56,189,248,0.7)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-3"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Navigation link to register */}
              <div className="pt-2 text-center text-xs text-slate-400 border-t border-white/5">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={onNavigateToRegister}
                  className="text-sky-400 hover:text-sky-300 font-semibold transition-colors cursor-pointer"
                >
                  Create an account
                </button>
              </div>
            </form>
          </div>

          {/* Binance Scan QR Glass Card matching reference image */}
          <div className="w-full rounded-2xl bg-[#071329]/80 backdrop-blur-2xl border border-sky-400/35 overflow-hidden shadow-[0_0_35px_rgba(56,189,248,0.12)]">
            <img
              src="/assets/login/binance_qr_card.png"
              alt="Binance Scan QR Card"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

      </div>
    </div>
  );
};
