import React from 'react';
import { getCurrentUser, updateUser } from '../../utils/auth';
import {
  LayoutDashboard,
  User,
  FileText,
  Brain,
  Briefcase,
  Layers,
  Sparkles,
  Award,
  BookOpen,
  MessageSquare,
  BarChart3,
  Users,
  Settings,
  ShieldCheck,
  Zap,
  ChevronDown,
  Bot
} from 'lucide-react';

function Sidebar({ activeTab, setActiveTab, userRole, setUserRole, onRoleChange }) {
  const currentUser = getCurrentUser() || { name: 'User', role: userRole || 'candidate' };
  const initials = currentUser.name ? currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

  const isDemoAccount = Boolean(
    !currentUser ||
    currentUser.isDemo ||
    currentUser.email?.includes('demo') ||
    currentUser.id?.includes('demo') ||
    currentUser.email === 'candidate.demo@candidateiq.com' ||
    currentUser.email === 'recruiter.demo@candidateiq.com' ||
    currentUser.email === 'admin@candidateiq.com'
  );

  const effectiveRole = currentUser.role || userRole || 'candidate';
  const isCandidate = effectiveRole === 'candidate';
  const isRecruiter = effectiveRole === 'hr' || effectiveRole === 'recruiter';
  const isAdmin = effectiveRole === 'admin';

  const getNavButtonClass = (tabName, isAi = false) => {
    const isActive = activeTab === tabName;
    if (isActive) {
      return isAi 
        ? "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20 transition-all"
        : "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 text-white shadow-sm transition-all";
    }
    return "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 transition-all";
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between min-h-screen sticky top-0 h-screen z-40 select-none shadow-sm">
      {/* Top Header Logo */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('landing')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center text-white font-black font-outfit shadow-md shadow-slate-900/15 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-lg font-outfit text-slate-900 tracking-tight">Candidate</span>
              <span className="font-black text-lg font-outfit text-indigo-600">IQ</span>
            </div>
            <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase block -mt-1">AI Intelligence SaaS</span>
          </div>
        </div>
      </div>

      {/* Role Switcher Selector / Locked Role Badge */}
      <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500 font-medium text-[11px]">Workspace Role</span>
        {isDemoAccount ? (
          <select
            value={isRecruiter ? 'recruiter' : isAdmin ? 'admin' : 'candidate'}
            onChange={(e) => {
              const val = e.target.value;
              const targetRole = val === 'recruiter' ? 'hr' : val;
              updateUser({ role: targetRole });
              if (onRoleChange) {
                onRoleChange(targetRole);
              } else if (setUserRole) {
                setUserRole(targetRole);
              }
              const nextTab = targetRole === 'candidate' ? 'dashboard' : targetRole === 'admin' ? 'admin-dashboard' : 'recruiter-dashboard';
              setActiveTab(nextTab);
            }}
            className="bg-white border border-slate-200 text-slate-800 font-semibold rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-[11px] cursor-pointer shadow-2xs"
          >
            <option value="candidate">Candidate Demo</option>
            <option value="recruiter">Recruiter HR Demo</option>
            <option value="admin">System Admin</option>
          </select>
        ) : (
          <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[11px] border border-indigo-100 capitalize">
            {isRecruiter ? 'HR Recruiter' : isCandidate ? 'Candidate' : 'Admin'}
          </span>
        )}
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {isCandidate && (
          <>
            <div className="space-y-1">
              <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Core Candidate Suite</span>
              
              <button onClick={() => setActiveTab('dashboard')} className={getNavButtonClass('dashboard')}>
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="w-4 h-4" /> Overview Dashboard
                </div>
              </button>

              <button onClick={() => setActiveTab('profile')} className={getNavButtonClass('profile')}>
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4" /> My Profile
                </div>
              </button>

              <button onClick={() => setActiveTab('resume')} className={getNavButtonClass('resume')}>
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4" /> Resume Parser IQ
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">AI</span>
              </button>

              <button onClick={() => setActiveTab('skills')} className={getNavButtonClass('skills')}>
                <div className="flex items-center gap-3">
                  <Brain className="w-4 h-4" /> Skill Matrix
                </div>
              </button>

              <button onClick={() => setActiveTab('jobs')} className={getNavButtonClass('jobs')}>
                <div className="flex items-center gap-3">
                  <Briefcase className="w-4 h-4" /> Job Discovery
                </div>
              </button>

              <button onClick={() => setActiveTab('applications')} className={getNavButtonClass('applications')}>
                <div className="flex items-center gap-3">
                  <Layers className="w-4 h-4" /> Tracker
                </div>
              </button>
            </div>

            <div className="space-y-1 pt-3 border-t border-slate-100">
              <span className="px-3 text-[10px] font-bold text-indigo-600 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-indigo-500" /> AI Intelligence Studio
              </span>

              <button onClick={() => setActiveTab('interview')} className={getNavButtonClass('interview', true)}>
                <div className="flex items-center gap-3">
                  <Bot className="w-4 h-4" /> AI Mock Interview
                </div>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-white/20 text-white">LIVE</span>
              </button>

              <button onClick={() => setActiveTab('interview-evaluation')} className={getNavButtonClass('interview-evaluation', true)}>
                <div className="flex items-center gap-3">
                  <Award className="w-4 h-4" /> Interview Evaluation
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500 text-white">M11</span>
              </button>

              <button onClick={() => setActiveTab('skill-gaps')} className={getNavButtonClass('skill-gaps', true)}>
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4" /> Skill Gap Analysis
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500 text-white">M12</span>
              </button>

            </div>
          </>
        )}

        {isRecruiter && (
          <>
            <div className="space-y-1">
              <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Recruiter Workspace</span>

              <button onClick={() => setActiveTab('recruiter-dashboard')} className={getNavButtonClass('recruiter-dashboard')}>
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="w-4 h-4" /> Talent Command Center
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-600 text-white">M14</span>
              </button>


              <button onClick={() => setActiveTab('jobs-recruiter')} className={getNavButtonClass('jobs-recruiter')}>
                <div className="flex items-center gap-3">
                  <Briefcase className="w-4 h-4" /> Active Requisitions
                </div>
              </button>

              <button onClick={() => setActiveTab('candidates-recruiter')} className={getNavButtonClass('candidates-recruiter')}>
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4" /> Candidate Pool
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-600 text-white">M15</span>
              </button>

            </div>

            <div className="space-y-1 pt-3 border-t border-slate-100">
              <span className="px-3 text-[10px] font-bold text-indigo-600 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-indigo-500" /> Hiring Intelligence
              </span>

              <button onClick={() => setActiveTab('candidate-intelligence')} className={getNavButtonClass('candidate-intelligence', true)}>
                <div className="flex items-center gap-3">
                  <Zap className="w-4 h-4" /> Candidate Intelligence
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-600 text-white">M13</span>
              </button>


              <button onClick={() => setActiveTab('interview-evaluation')} className={getNavButtonClass('interview-evaluation', true)}>
                <div className="flex items-center gap-3">
                  <Award className="w-4 h-4" /> Interview Analytics
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500 text-white">M11</span>
              </button>

              <button onClick={() => setActiveTab('comparison')} className={getNavButtonClass('comparison', true)}>
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-4 h-4" /> Candidate Comparison
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500 text-white">M16</span>
              </button>

              <button onClick={() => setActiveTab('assistant')} className={getNavButtonClass('assistant', true)}>
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4" /> AI Recruitment Assistant
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-600 text-white">M17</span>
              </button>
            </div>

          </>
        )}

        {isAdmin && (
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Admin Control</span>
            <button onClick={() => setActiveTab('admin-dashboard')} className={getNavButtonClass('admin-dashboard')}>
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4" /> System Administration
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-900 text-white">M18</span>
            </button>
          </div>
        )}
      </nav>

      {/* Footer Settings & Account */}
      <div className="p-3 border-t border-slate-100 space-y-2 bg-slate-50/50">
        <button onClick={() => setActiveTab('settings')} className={getNavButtonClass('settings')}>
          <div className="flex items-center gap-3">
            <Settings className="w-4 h-4" /> System Settings
          </div>
        </button>

        <div className="pt-2 flex items-center gap-3 border-t border-slate-200/60 px-1">
          <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center font-bold text-xs text-white shadow-xs font-outfit">
            {initials}
          </div>
          <div className="flex-1 truncate">
            <span className="text-xs font-bold text-slate-800 block truncate">
              {currentUser.name}
            </span>
            <span className="text-[10px] text-indigo-600 font-semibold block truncate uppercase tracking-wider">
              {currentUser.role === 'hr' ? 'HR Recruiter' : currentUser.role}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
