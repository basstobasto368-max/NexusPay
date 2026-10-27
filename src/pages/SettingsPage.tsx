import React, { useState } from 'react';
import { useCrypto, PORTFOLIO_TIER_CONFIG, PortfolioTier } from '../context/CryptoContext';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Sliders,
  DollarSign,
  Bell,
  Volume2,
  VolumeX,
  RotateCcw,
  PlusCircle,
  Shield,
  Check,
  AlertTriangle,
  Zap,
  Save,
  LogOut,
  Play,
  HelpCircle,
  Info,
  ShieldCheck,
  Layers
} from 'lucide-react';

interface SettingsPageProps {
  onOpenTutorial?: () => void;
  onNavigate?: (page: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onOpenTutorial,
  onNavigate
}) => {
  const {
    settings,
    updateSettings,
    resetAllDemoData,
    addSimulatedCash,
    formatCurrency,
    addToast,
    portfolioTier,
    setPortfolioScale,
    hideBalance,
    toggleHideBalance
  } = useCrypto();
  const { user, logout } = useAuth();

  const [userName, setUserName] = useState(user?.name || settings.userName);
  const [userEmail, setUserEmail] = useState(user?.email || settings.userEmail);
  const [customGrantStr, setCustomGrantStr] = useState('25000');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({ userName, userEmail });
    addToast('success', 'Profile Updated', 'User preferences saved successfully.');
  };

  const handleApplyDemoGrant = () => {
    const val = parseFloat(customGrantStr);
    if (!isNaN(val) && val > 0) {
      addSimulatedCash(val);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Settings Header */}
      <div className="p-4 rounded-2xl bg-[#0f1523] border border-white/5">
        <h2 className="font-bold text-base text-white">Platform Settings & Simulation Preferences</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Customize currency display, portfolio scale tiers, audio haptics, tutorial replay, and security parameters
        </p>
      </div>

      {/* Tutorial Replay Card (Requested in Section 3 & 11) */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-purple-950/30 border border-cyan-500/20 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
              Interactive Tutorial
            </span>
          </div>
          <h3 className="font-bold text-base text-white">
            Welcome to NEXORA CRYPTO — Getting Started Video
          </h3>
          <p className="text-xs text-slate-300">
            Replay the complete 10-chapter instructional onboarding walkthrough anytime.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenTutorial && (
            <button
              onClick={onOpenTutorial}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-cyan-950/40 flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Launch Video Tutorial</span>
            </button>
          )}

          {onNavigate && (
            <button
              onClick={() => onNavigate('help')}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold transition-colors"
            >
              Help Center
            </button>
          )}
        </div>
      </div>

      {/* Portfolio Scale Tier Card ($2.5M, $85M, $1.25B, $9.8B) */}
      <div className="p-6 rounded-3xl bg-[#0f1523] border border-white/5 shadow-xl space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-white/5">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Large Portfolio Balances & Tier Scaling</h3>
            <p className="text-xs text-slate-400">
              Scale evaluation models to multi-million and multi-billion institutional sizes
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
          {(['starter', 'pro', 'institutional', 'sovereign', 'prime'] as PortfolioTier[]).map((tierKey) => {
            const config = PORTFOLIO_TIER_CONFIG[tierKey];
            const isSelected = portfolioTier === tierKey;
            return (
              <button
                key={tierKey}
                type="button"
                onClick={() => setPortfolioScale(tierKey)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-b from-cyan-500/20 to-blue-600/20 border-cyan-500/50 text-white shadow-lg shadow-cyan-950/40'
                    : 'bg-[#0a0e17] border-white/5 text-slate-400 hover:text-white hover:border-white/10'
                }`}
              >
                <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase">
                  {tierKey}
                </div>
                <div className="text-sm font-bold font-mono text-white mt-1">
                  {tierKey === 'starter' && '$100,000'}
                  {tierKey === 'pro' && '$2,500,000'}
                  {tierKey === 'institutional' && '$85,000,000'}
                  {tierKey === 'sovereign' && '$1,250,000,000'}
                  {tierKey === 'prime' && '$9,800,000,000'}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 leading-snug">
                  {config.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Profile Section */}
      <div className="p-6 rounded-3xl bg-[#0f1523] border border-white/5 shadow-xl space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-white/5">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Profile & Identity</h3>
            <p className="text-xs text-slate-400">Your simulated institutional account profile</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-[#0a0e17] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full bg-[#0a0e17] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={() => logout()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out of Current Session</span>
            </button>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-950/40 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      </div>

      {/* Currency & Display Preferences */}
      <div className="p-6 rounded-3xl bg-[#0f1523] border border-white/5 shadow-xl space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-white/5">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Display & Currency Settings</h3>
            <p className="text-xs text-slate-400">Set primary reporting currency and interface density</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Default Reporting Currency
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(
                [
                  { code: 'USD', label: 'US Dollar ($)' },
                  { code: 'EUR', label: 'Euro (€)' },
                  { code: 'GBP', label: 'British Pound (£)' },
                  { code: 'JPY', label: 'Japanese Yen (¥)' }
                ] as const
              ).map((curr) => (
                <button
                  key={curr.code}
                  type="button"
                  onClick={() => updateSettings({ currency: curr.code })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    settings.currency === curr.code
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-md shadow-cyan-950/30'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold text-xs">{curr.code}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{curr.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 space-y-3">
            {/* Balance Masking Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Hide Portfolio Balances by Default</div>
                <div className="text-[11px] text-slate-400">
                  Mask balance figures with privacy asterisks until clicked
                </div>
              </div>
              <button
                type="button"
                onClick={toggleHideBalance}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  hideBalance ? 'bg-cyan-500 justify-end' : 'bg-white/10 justify-start'
                }`}
              >
                <div className="bg-white w-4 h-4 rounded-full shadow-md" />
              </button>
            </div>

            {/* Live Ticks Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Dynamic Market Fluctuation Engine</div>
                <div className="text-[11px] text-slate-400">
                  Simulate realistic micro-price movements every few seconds
                </div>
              </div>
              <button
                type="button"
                onClick={() => updateSettings({ autoTick: !settings.autoTick })}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  settings.autoTick ? 'bg-cyan-500 justify-end' : 'bg-white/10 justify-start'
                }`}
              >
                <div className="bg-white w-4 h-4 rounded-full shadow-md" />
              </button>
            </div>

            {/* Sound Effects Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Web Audio Interaction Feedback</div>
                <div className="text-[11px] text-slate-400">
                  Subtle synthesized audio cues when executing simulated trades and swaps
                </div>
              </div>
              <button
                type="button"
                onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  settings.soundEnabled ? 'bg-cyan-500 justify-end' : 'bg-white/10 justify-start'
                }`}
              >
                <div className="bg-white w-4 h-4 rounded-full shadow-md" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Demo Grants & Reset */}
      <div className="p-6 rounded-3xl bg-[#0f1523] border border-white/5 shadow-xl space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-white/5">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Sandbox Funding & Reset</h3>
            <p className="text-xs text-slate-400">Grant test funds or restore initial clean slate</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Custom Cash Grant */}
          <div className="p-4 rounded-xl bg-[#0a0e17] border border-white/5 space-y-2">
            <div className="text-xs font-bold text-white">Inject Custom Simulated Capital</div>
            <div className="text-[11px] text-slate-400">
              Add mock liquidity to practice high-volume trade sizing
            </div>

            <div className="flex items-center gap-3 pt-1">
              <div className="relative flex-1">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400">$</span>
                <input
                  type="number"
                  value={customGrantStr}
                  onChange={(e) => setCustomGrantStr(e.target.value)}
                  className="w-full bg-[#111726] border border-white/10 rounded-xl pl-7 pr-3 py-2 text-xs font-mono text-white focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleApplyDemoGrant}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-md shadow-emerald-950/40 cursor-pointer"
              >
                Grant Demo USD
              </button>
            </div>
          </div>

          {/* Reset All Data Button */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <div>
              <div className="text-xs font-bold text-rose-300">Reset Demo Data to Original Defaults</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Restores original portfolio holdings, initial starter balances, and default transaction logs.
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset State</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#111726] border border-white/10 rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Confirm Reset</h3>
                <p className="text-xs text-slate-400">Restore factory demonstration data</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This action will reset your simulated balances, holdings, and transaction history back to the original portfolio state. Are you sure you want to proceed?
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowResetConfirm(false);
                  resetAllDemoData();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-rose-950/40 cursor-pointer"
              >
                Yes, Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
