import React, { useState } from 'react';
import { Settings, User, Lock, Bell, Sparkles, ShieldCheck, Database, CheckCircle2 } from 'lucide-react';

function SettingsPage() {
  const [activeSubTab, setActiveSubTab] = useState('account');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    setSuccessMsg('Settings updated successfully.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto select-none">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold font-outfit text-slate-900">CandidateIQ Platform Settings</h2>
          <p className="text-xs text-slate-500">Manage your profile information, security, notifications, and AI preferences.</p>
        </div>
      </div>

      <div className="saas-card p-6 border border-slate-200 bg-white space-y-6">
        {/* Settings Navigation Tabs */}
        <div className="flex gap-2 border-b border-slate-100 pb-3 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'account', label: 'Account Profile', icon: User },
            { id: 'security', label: 'Security & Auth', icon: Lock },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'ai', label: 'AI Preferences', icon: Sparkles },
            { id: 'privacy', label: 'Privacy & Data', icon: ShieldCheck }
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveSubTab(t.id)}
                className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeSubTab === t.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            );
          })}
        </div>

        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 max-w-lg">
          {activeSubTab === 'account' && (
            <>
              <div className="space-y-1">
                <label className="text-xs text-slate-600 font-semibold">Full Name</label>
                <input
                  type="text"
                  defaultValue="Alex Johnson"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-600 font-semibold">Email Address</label>
                <input
                  type="email"
                  defaultValue="alex.johnson@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-600 font-semibold">Professional Headline</label>
                <input
                  type="text"
                  defaultValue="Full Stack MERN & AI Developer"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </>
          )}

          {activeSubTab === 'security' && (
            <>
              <div className="space-y-1">
                <label className="text-xs text-slate-600 font-semibold">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-600 font-semibold">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </>
          )}

          {activeSubTab === 'ai' && (
            <div className="space-y-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-0" />
                <span className="text-slate-800 font-medium">Enable Gemini AI candidate profile extraction</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-0" />
                <span className="text-slate-800 font-medium">Enable real-time mock interview answer evaluation</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-0" />
                <span className="text-slate-800 font-medium">Show explainable AI recommendation details</span>
              </label>
            </div>
          )}

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all"
          >
            Save Settings Changes
          </button>
        </form>
      </div>
    </div>
  );
}

export default SettingsPage;
