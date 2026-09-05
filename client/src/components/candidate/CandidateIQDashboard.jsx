import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { getCurrentUser } from '../../utils/auth';
import { User, Award, Brain, Briefcase, Play, ArrowRight, Sparkles, CheckCircle2, TrendingUp, FileText, Zap, ChevronRight } from 'lucide-react';

function CandidateIQDashboard({ onNavigate }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentUser = getCurrentUser();
  const displayName = currentUser ? currentUser.name : 'Alex Johnson';

  useEffect(() => {
    fetchCandidateData();
  }, []);

  const fetchCandidateData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/candidates/profile');
      setProfile(res.data.profile);
    } catch (err) {
      setProfile({
        personalInfo: { name: displayName, targetRole: 'Senior Full Stack MERN Developer' },
        overallScore: 88,
        technicalScore: 92,
        matchPercentage: 91,
        interviewScore: 87
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 select-none max-w-7xl mx-auto">
      {/* Top Welcome Header Banner */}
      <div className="saas-card p-6 md:p-8 border border-slate-200/90 flex flex-wrap justify-between items-center gap-6 bg-gradient-to-r from-white via-slate-50 to-indigo-50/40 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center text-white text-2xl font-black font-outfit shadow-md shadow-slate-900/15">
            {profile?.personalInfo?.name?.charAt(0) || 'A'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold text-slate-950 font-outfit tracking-tight">
                Good morning, {profile?.personalInfo?.name || 'Alex Johnson'} 👋
              </h2>
              <span className="badge-pill badge-ai text-[10px]">
                <Sparkles className="w-3 h-3 text-indigo-600" /> AI Active
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Target Role: <span className="text-slate-800 font-semibold">{profile?.personalInfo?.targetRole || 'Full Stack MERN & AI Developer'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('resume')}
            className="btn-outline text-xs"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" /> Update Resume
          </button>
          <button
            onClick={() => onNavigate('interview')}
            className="btn-ai text-xs"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Practice AI Interview
          </button>
        </div>
      </div>

      {/* Top Stat Score Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="saas-card p-5 border border-slate-200/80 hover:border-indigo-200 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Candidate IQ Score</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <h3 className="text-3xl font-black font-outfit text-slate-950 mt-2">
            88 <span className="text-xs font-semibold text-slate-400">/ 100</span>
          </h3>
          <span className="text-[10px] text-indigo-600 font-semibold block mt-1.5 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Top 5% Candidate Percentile
          </span>
        </div>

        <div className="saas-card p-5 border border-slate-200/80 hover:border-indigo-200 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Resume Quality</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <h3 className="text-3xl font-black font-outfit text-blue-600 mt-2">86%</h3>
          <span className="text-[10px] text-slate-500 font-medium block mt-1.5">✓ Parsed 18 Core Skills</span>
        </div>

        <div className="saas-card p-5 border border-slate-200/80 hover:border-indigo-200 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Technical Score</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <Brain className="w-3.5 h-3.5" />
            </div>
          </div>
          <h3 className="text-3xl font-black font-outfit text-purple-600 mt-2">
            92 <span className="text-xs font-semibold text-slate-400">/ 100</span>
          </h3>
          <span className="text-[10px] text-purple-600 font-semibold block mt-1.5">Strong MERN Stack Density</span>
        </div>

        <div className="saas-card p-5 border border-slate-200/80 hover:border-indigo-200 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Market Job Match</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Zap className="w-3.5 h-3.5" />
            </div>
          </div>
          <h3 className="text-3xl font-black font-outfit text-emerald-600 mt-2">91% Match</h3>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-1.5">3 Active High-Match Jobs</span>
        </div>
      </div>

      {/* Main Grid: Skill Matrix & Recommended Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill Intelligence Breakdown Card */}
        <div className="saas-card p-6 border border-slate-200/80 space-y-5">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold font-outfit text-slate-950 leading-none">Technical Skill Intelligence</h3>
                <span className="text-[11px] text-slate-400 font-medium">Extracted & AI verified scores</span>
              </div>
            </div>
            <span className="badge-pill badge-ai text-[10px]">
              Verified
            </span>
          </div>

          <div className="space-y-3.5 pt-1">
            {[
              { skill: 'React.js & Frontend Architecture', score: 94, level: 'Expert' },
              { skill: 'Node.js & Express REST APIs', score: 90, level: 'Advanced' },
              { skill: 'MongoDB & Database Schema Design', score: 86, level: 'Advanced' },
              { skill: 'Python AI & Gemini LLM Integration', score: 80, level: 'Intermediate' },
              { skill: 'Docker & Microservices Deployment', score: 65, level: 'Learning Target' }
            ].map((s, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-800">{s.skill}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-indigo-600 font-bold px-1.5 py-0.2 bg-indigo-50 rounded">{s.level}</span>
                    <span className="text-slate-500 font-mono">{s.score}%</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-500"
                    style={{ width: `${s.score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigate('skills')}
            className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-200/80 mt-2"
          >
            Explore Detailed Skill Matrix <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* Recommended Job Match Cards */}
        <div className="saas-card p-6 border border-slate-200/80 space-y-5">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold font-outfit text-slate-950 leading-none">Top Matched Requisitions</h3>
                <span className="text-[11px] text-slate-400 font-medium">Based on your Candidate IQ profile</span>
              </div>
            </div>
            <button onClick={() => onNavigate('jobs')} className="text-xs text-indigo-600 font-bold hover:underline">
              View All Jobs
            </button>
          </div>

          <div className="space-y-3">
            {[
              { title: 'Full Stack MERN Developer', company: 'TechNova Solutions', match: 91, salary: '₹12L - ₹16L LPA', location: 'Hybrid' },
              { title: 'AI & Full Stack Engineer', company: 'DataMind AI Systems', match: 86, salary: '₹14L - ₹18L LPA', location: 'Remote' }
            ].map((j, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-slate-200/80 hover:border-indigo-300 transition-all flex justify-between items-center gap-4 bg-slate-50/50 hover:bg-white group">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900 font-outfit group-hover:text-indigo-600 transition-colors">{j.title}</h4>
                  <p className="text-[11px] text-slate-500 font-medium">{j.company} • {j.location} • {j.salary}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] font-bold block">
                    {j.match}% Match
                  </span>
                  <button
                    onClick={() => onNavigate('jobs')}
                    className="text-[11px] text-indigo-600 font-bold hover:underline mt-1 block"
                  >
                    View Requisition →
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* AI Interview Readiness Highlight Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 border border-indigo-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-bold text-slate-950 font-outfit">AI Mock Interview Studio</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Practice technical & behavioural questions with AI evaluation and real-time audio transcript scoring.
              </p>
            </div>
            <button
              onClick={() => onNavigate('interview')}
              className="btn-ai text-xs shrink-0 w-full sm:w-auto"
            >
              Start Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CandidateIQDashboard;
