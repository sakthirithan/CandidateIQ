import React, { useState } from 'react';
import { getCurrentUser } from '../../utils/auth';
import { Users, Briefcase, Award, Plus, Search, Filter, CheckCircle2, ChevronRight, BarChart3, Sparkles, TrendingUp, UserCheck } from 'lucide-react';

function RecruiterIQDashboard({ onSelectCandidate, onNavigate }) {
  const [candidateSearch, setCandidateSearch] = useState('');
  const currentUser = getCurrentUser();
  const displayName = currentUser ? currentUser.name : 'Sarah';

  const candidatesList = [
    { name: 'Alex Johnson', role: 'Full Stack MERN Developer', tech: 92, match: 91, interview: 87, overall: 88, status: 'Strong Match' },
    { name: 'Priya Sharma', role: 'AI & Data Science Engineer', tech: 95, match: 88, interview: 92, overall: 91, status: 'Top Talent' },
    { name: 'David Chen', role: 'Backend Systems Engineer', tech: 84, match: 82, interview: 85, overall: 83, status: 'Shortlisted' },
    { name: 'Marcus Vance', role: 'Senior React Developer', tech: 90, match: 86, interview: 88, overall: 87, status: 'Interview Scheduled' }
  ];

  const filteredCandidates = candidatesList.filter(c =>
    c.name.toLowerCase().includes(candidateSearch.toLowerCase()) ||
    c.role.toLowerCase().includes(candidateSearch.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 space-y-8 select-none max-w-7xl mx-auto">
      {/* Recruiter Command Banner Header */}
      <div className="saas-card p-6 md:p-8 border border-slate-200/90 flex flex-wrap justify-between items-center gap-6 bg-gradient-to-r from-white via-slate-50 to-indigo-50/30 relative overflow-hidden shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold font-outfit text-slate-950 tracking-tight">Good morning, {displayName} 👋</h2>
            <span className="badge-pill badge-ai text-[10px]">
              <Sparkles className="w-3 h-3 text-indigo-600" /> HR Command Center
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Real-time candidate intelligence, requisition funnels, and AI evaluation metrics.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('comparison')}
            className="btn-outline text-xs"
          >
            <BarChart3 className="w-3.5 h-3.5 text-indigo-600" /> Multi-Candidate Matrix
          </button>
          <button
            onClick={() => onNavigate('jobs-recruiter')}
            className="btn-primary text-xs"
          >
            <Plus className="w-4 h-4" /> Create Requisition
          </button>
        </div>
      </div>

      {/* Top 4 Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="saas-card p-5 border border-slate-200/80 hover:border-indigo-200 transition-all">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Active Requisitions</span>
          <h3 className="text-3xl font-black font-outfit text-slate-950 mt-1">12</h3>
          <span className="text-[10px] text-slate-500 font-medium block mt-1">Across 4 Tech Departments</span>
        </div>

        <div className="saas-card p-5 border border-slate-200/80 hover:border-indigo-200 transition-all">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-outfit">Total Candidates</span>
          <h3 className="text-3xl font-black font-outfit text-indigo-600 mt-1">248</h3>
          <span className="text-[10px] text-indigo-600 font-bold block mt-1">+18 Verified this week</span>
        </div>

        <div className="saas-card p-5 border border-slate-200/80 hover:border-indigo-200 transition-all">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">AI Mock Interviews</span>
          <h3 className="text-3xl font-black font-outfit text-purple-600 mt-1">34</h3>
          <span className="text-[10px] text-purple-600 font-semibold block mt-1">Evaluated by Gemini AI</span>
        </div>

        <div className="saas-card p-5 border border-slate-200/80 hover:border-indigo-200 transition-all">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Shortlisted Candidates</span>
          <h3 className="text-3xl font-black font-outfit text-emerald-600 mt-1">18</h3>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-1">Ready for HR Final Review</span>
        </div>
      </div>

      {/* Candidate Pipeline Funnel Progress */}
      <div className="saas-card p-6 md:p-8 border border-slate-200/80 space-y-4 bg-white shadow-sm">
        <h3 className="text-base font-bold font-outfit text-slate-950 uppercase tracking-wider">Candidate Hiring Pipeline Funnel</h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs font-semibold">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Applied</span>
            <span className="text-xl font-black font-outfit text-slate-950 mt-1 block">248</span>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
            <span className="text-indigo-700 block text-[10px] uppercase font-bold">AI Screening</span>
            <span className="text-xl font-black font-outfit text-indigo-950 mt-1 block">96</span>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100">
            <span className="text-purple-700 block text-[10px] uppercase font-bold">AI Interview</span>
            <span className="text-xl font-black font-outfit text-purple-950 mt-1 block">34</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
            <span className="text-emerald-700 block text-[10px] uppercase font-bold">Shortlisted</span>
            <span className="text-xl font-black font-outfit text-emerald-950 mt-1 block">18</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 text-white">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Offer Extended</span>
            <span className="text-xl font-black font-outfit mt-1 block">6</span>
          </div>
        </div>
      </div>

      {/* Recent Candidates Database Table */}
      <div className="saas-card p-6 md:p-8 border border-slate-200/80 space-y-6 bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-base font-bold font-outfit text-slate-950 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" /> High-Match Candidate Pool
            </h3>
            <p className="text-xs text-slate-500 font-medium">Ranked by unified Candidate IQ score across technical and interview evidence.</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search candidate or role..."
              value={candidateSearch}
              onChange={(e) => setCandidateSearch(e.target.value)}
              className="input-saas pl-9 text-xs"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Candidate Name</th>
                <th className="py-3 px-4">Applied Requisition</th>
                <th className="py-3 px-4">Tech Score</th>
                <th className="py-3 px-4">Job Match</th>
                <th className="py-3 px-4">Interview</th>
                <th className="py-3 px-4">Unified IQ Score</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredCandidates.map((cand, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-all">
                  <td className="py-3.5 px-4 font-bold text-slate-950 font-outfit flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-xs">
                      {cand.name.charAt(0)}
                    </div>
                    {cand.name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">{cand.role}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">{cand.tech}/100</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">{cand.match}%</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-purple-600">{cand.interview}/100</td>
                  <td className="py-3.5 px-4 font-mono font-black text-slate-950 text-sm">{cand.overall}/100</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onNavigate('candidate-intelligence')}
                      className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-[11px] shadow-2xs transition-all"
                    >
                      View Intelligence
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default RecruiterIQDashboard;
