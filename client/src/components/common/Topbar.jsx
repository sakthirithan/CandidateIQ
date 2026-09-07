import React from 'react';
import ProfileMenu from './ProfileMenu';
import { Search, Bell, Sparkles, User, ShieldCheck, Command } from 'lucide-react';

function Topbar({ activeTab, userRole, onOpenAuth, onOpenNotifications, unreadCount, onOpenSettings, onNavigateToProfile, onLogout, onOpenSearch }) {
  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Candidate Overview Dashboard';
      case 'profile': return 'My Professional Profile';
      case 'resume': return 'AI Resume Intelligence & Parsing';
      case 'skills': return 'Skill Intelligence Matrix';
      case 'jobs': return 'Job Marketplace & Compatibility';
      case 'applications': return 'My Job Applications Tracker';
      case 'interview': return 'AI Dynamic Mock Interview Room';
      case 'interview-results': return 'Interview Intelligence Report';
      case 'skill-gaps': return 'Target Role Skill Gap Analysis';
      case 'recruiter-dashboard': return 'Recruiter Command Center';
      case 'candidates-recruiter': return 'Candidate Pool Database';
      case 'candidate-intelligence': return 'Candidate Intelligence Profile';
      case 'comparison': return 'Multi-Candidate Comparison Matrix';
      case 'assistant': return 'AI Recruitment Assistant';
      case 'admin-dashboard': return 'Admin Management Center';
      case 'settings': return 'Account & Platform Settings';
      default: return 'CandidateIQ Platform';
    }
  };

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-6 md:px-8 flex items-center justify-between shadow-2xs">
      {/* Page Title & Breadcrumb */}
      <div>
        <h1 className="text-base md:text-lg font-bold font-outfit text-slate-900 tracking-tight">{getPageTitle()}</h1>
        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <span>CandidateIQ</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-600 font-semibold capitalize">{activeTab.replace('-', ' ')}</span>
        </div>
      </div>

      {/* Global Search & Action Controls */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Global Search Input */}
        <div
          onClick={onOpenSearch}
          className="relative w-56 md:w-72 hidden sm:block cursor-pointer group"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 absolute left-3 top-2.5 transition-colors" />
          <input
            type="text"
            readOnly
            onClick={onOpenSearch}
            placeholder="Search candidates, skills, jobs... (Cmd+K)"
            className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-9 pr-12 py-1.5 text-xs text-slate-700 placeholder-slate-400 cursor-pointer focus:outline-none group-hover:border-indigo-300 transition-all shadow-2xs"
          />
          <div className="absolute right-2.5 top-2 flex items-center gap-0.5 text-[10px] text-slate-400 font-semibold bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-2xs">
            <Command className="w-2.5 h-2.5" /> K
          </div>
        </div>

        {/* AI Engine Status Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50/80 border border-indigo-100 text-indigo-700 text-xs font-semibold shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
          </span>
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span className="text-[11px]">Gemini 2.0 AI Active</span>
        </div>

        {/* Notification Bell Drawer Trigger */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 transition-all focus:outline-none"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white animate-pulse"></span>
          )}
        </button>

        <div className="h-5 w-[1px] bg-slate-200"></div>

        {/* Dynamic Profile Menu */}
        <ProfileMenu
          onOpenSettings={onOpenSettings}
          onNavigateToProfile={onNavigateToProfile}
          onLogoutSuccess={onLogout}
        />
      </div>
    </header>
  );
}

export default Topbar;
