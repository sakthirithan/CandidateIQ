import React, { useState } from 'react';
import { loginUser } from '../../utils/auth';
import { X, Lock, Mail, Eye, EyeOff, Sparkles, AlertCircle, User, Briefcase, ShieldCheck } from 'lucide-react';

function LoginModal({ isOpen, onClose, onLoginSuccess, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = loginUser(email, password);
      setLoading(false);
      if (res.success) {
        onClose();
        if (onLoginSuccess) onLoginSuccess(res.user);
      } else {
        setError(res.message || 'Invalid email or password.');
      }
    }, 250);
  };

  const handleQuickLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    const res = loginUser(demoEmail, demoPass);
    if (res.success) {
      onClose();
      if (onLoginSuccess) onLoginSuccess(res.user);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="saas-card p-6 md:p-8 bg-white border border-slate-200 w-full max-w-md space-y-6 relative shadow-2xl select-none">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-base font-outfit mb-3">
            IQ
          </div>
          <h3 className="text-xl font-bold font-outfit text-slate-950">Welcome Back</h3>
          <p className="text-xs text-slate-500">Sign in to access your CandidateIQ workspace.</p>
        </div>

        {/* Quick Demo Sign-in Pills */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Quick 1-Click Demo Login</span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickLogin('candidate.demo@candidateiq.com', 'password123')}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-indigo-500 text-slate-700 hover:text-indigo-600 font-semibold text-left transition-all flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-indigo-600" /> Candidate Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('recruiter.demo@candidateiq.com', 'password123')}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-indigo-500 text-slate-700 hover:text-indigo-600 font-semibold text-left transition-all flex items-center gap-1.5"
            >
              <Briefcase className="w-3.5 h-3.5 text-indigo-600" /> Recruiter Demo
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-saas pl-9 w-full text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <span className="text-[11px] text-indigo-600 hover:underline cursor-pointer">Forgot?</span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-saas pl-9 pr-9 w-full text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : 'Sign In to Workspace'}
          </button>
        </form>

        <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onSwitchToRegister) onSwitchToRegister();
            }}
            className="text-indigo-600 font-bold hover:underline"
          >
            Register Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
