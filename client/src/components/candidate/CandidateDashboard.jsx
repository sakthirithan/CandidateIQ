import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { User, Award, Code, BookOpen, Layers, CheckCircle, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react';

function CandidateDashboard({ onNavigate }) {
  const [profile, setProfile] = useState(null);
  const [intelligence, setIntelligence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfileAndIntelligence();
  }, []);

  const fetchProfileAndIntelligence = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/candidates/profile');
      setProfile(res.data.profile);

      const intelRes = await api.get('/candidates/me/intelligence');
      if (intelRes.data && intelRes.data.data) {
        setIntelligence(intelRes.data.data);
      }
    } catch (err) {
      console.error('[CandidateDashboard] Intelligence fetch failed:', err);
      setError('Candidate intelligence couldn\'t be loaded.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="glass-card p-6 h-32 bg-slate-900/50 border border-slate-800 rounded-2xl"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6 h-72 bg-slate-900/50 border border-slate-800 rounded-2xl"></div>
          <div className="glass-card p-6 h-72 bg-slate-900/50 border border-slate-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-8 border border-slate-800 text-center space-y-4">
        <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
        <p className="text-slate-300 text-sm">{error}</p>
        <button onClick={fetchProfileAndIntelligence} className="btn-ai text-xs inline-flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    );
  }

  const overall = intelligence?.overallScore || {};
  const resumeQuality = intelligence?.resumeQuality?.value || 0;
  const techScore = intelligence?.technicalScore?.value || 0;
  const jobMatch = intelligence?.marketJobMatch?.value || 0;
  const interviewScore = intelligence?.interviewScore?.value || 0;
  const behaviouralScore = intelligence?.behaviouralScore?.value || 0;
  const technicalSkills = intelligence?.technicalSkills || [];

  return (
    <div className="space-y-8">
      {/* Overview Top Card */}
      <div className="glass-card p-6 border border-slate-800 flex flex-wrap justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold font-outfit shadow-lg shadow-indigo-500/20">
            {profile?.personalInfo?.name?.charAt(0) || 'C'}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-100 font-outfit">{profile?.personalInfo?.name || 'Candidate'}</h2>
            <p className="text-sm text-indigo-400 font-medium">{profile?.personalInfo?.headline || 'Candidate IQ Profile'}</p>
            <p className="text-xs text-slate-400 mt-1">{profile?.personalInfo?.email} • {profile?.personalInfo?.location || 'Verified User'}</p>
          </div>
        </div>

        <div className="flex items-center gap-6 bg-slate-900/80 px-6 py-4 rounded-xl border border-slate-800">
          <div className="text-center">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Unified IQ Score</span>
            <span className="text-3xl font-extrabold font-outfit gradient-text">
              {overall.status === 'calculated' ? `${overall.value}/100` : 'Pending'}
            </span>
          </div>
          <div className="h-10 w-[1px] bg-slate-800"></div>
          <div className="text-center">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Verified Skills</span>
            <span className="text-2xl font-bold text-slate-200 font-outfit">{technicalSkills.length} Tech</span>
          </div>
        </div>
      </div>

      {/* Grid Section: Component Score Breakdown & Skill Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Component Score Framework */}
        <div className="glass-card p-6 border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold text-slate-100 font-outfit flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" /> Multi-Dimensional Candidate Score
          </h3>
          <p className="text-xs text-slate-400">Transparent weighted breakdown across evaluated dimensions.</p>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Technical Competency (30%)</span>
                <span className="text-indigo-400">{techScore}/100</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${techScore}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Technical Mock Interview (20%)</span>
                <span className="text-cyan-400">{interviewScore}/100</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${interviewScore}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Job Compatibility Match (20%)</span>
                <span className="text-emerald-400">{jobMatch}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${jobMatch}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Resume Quality (20%)</span>
                <span className="text-purple-400">{resumeQuality}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${resumeQuality}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Behavioural Evaluation (15%)</span>
                <span className="text-amber-400">{behaviouralScore}/100</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${behaviouralScore}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Skill Analytics */}
        <div className="glass-card p-6 border border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-100 font-outfit flex items-center gap-2">
              <Code className="w-5 h-5 text-cyan-400" /> AI Skill Proficiency Analysis
            </h3>
            <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">
              Verified Evidence
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {technicalSkills.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No parsed technical skills available.</p>
            ) : (
              technicalSkills.slice(0, 5).map((skill, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-200">{skill.name}</span>
                    <span className="text-slate-400 font-mono">
                      {skill.score} / 100 <span className="text-[10px] text-indigo-400 ml-1">({skill.proficiencyLevel})</span>
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full" style={{ width: `${skill.score}%` }}></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CandidateDashboard;
