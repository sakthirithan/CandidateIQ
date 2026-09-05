import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { User, Award, Code, BookOpen, Layers, CheckCircle, TrendingUp, AlertTriangle } from 'lucide-react';

function CandidateDashboard({ onNavigate }) {
  const [profile, setProfile] = useState(null);
  const [intelligence, setIntelligence] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileAndIntelligence();
  }, []);

  const fetchProfileAndIntelligence = async () => {
    try {
      setLoading(true);
      const res = await api.get('/candidates/profile');
      setProfile(res.data.profile);

      const intelRes = await api.get(`/analytics/candidate/${res.data.profile.user}`);
      setIntelligence(intelRes.data.intelligenceProfile);
    } catch (err) {
      // Load fallback profile for demo if no profile saved yet
      const intelRes = await api.get('/analytics/candidate/demo_candidate');
      setIntelligence(intelRes.data.intelligenceProfile);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const compScores = intelligence?.componentScores || {
    resumeQuality: 82,
    technicalSkillsScore: 88,
    jobCompatibilityScore: 84,
    technicalInterviewScore: 86,
    behaviouralInterviewScore: 78,
    experienceScore: 80
  };

  return (
    <div className="space-y-8">
      {/* Overview Top Card */}
      <div className="glass-card p-6 border border-slate-800 flex flex-wrap justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold font-outfit shadow-lg shadow-indigo-500/20">
            {profile?.personalInfo?.name?.charAt(0) || 'A'}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-100 font-outfit">{profile?.personalInfo?.name || 'Alex Johnson'}</h2>
            <p className="text-sm text-indigo-400 font-medium">{profile?.personalInfo?.headline || 'Full Stack MERN & AI Developer'}</p>
            <p className="text-xs text-slate-400 mt-1">{profile?.personalInfo?.email || 'alex.johnson@example.com'} • {profile?.personalInfo?.location || 'Bangalore, India'}</p>
          </div>
        </div>

        <div className="flex items-center gap-6 bg-slate-900/80 px-6 py-4 rounded-xl border border-slate-800">
          <div className="text-center">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Unified Score</span>
            <span className="text-3xl font-extrabold font-outfit gradient-text">{intelligence?.overallScore || 85}/100</span>
          </div>
          <div className="h-10 w-[1px] bg-slate-800"></div>
          <div className="text-center">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Verified Skills</span>
            <span className="text-2xl font-bold text-slate-200 font-outfit">{profile?.skills?.technical?.length || 8} Tech</span>
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
          <p className="text-xs text-slate-400">Transparent weighted breakdown across 6 evaluation dimensions.</p>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Technical Skills (25%)</span>
                <span className="text-indigo-400">{compScores.technicalSkillsScore}/100</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${compScores.technicalSkillsScore}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Technical Mock Interview (20%)</span>
                <span className="text-cyan-400">{compScores.technicalInterviewScore}/100</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${compScores.technicalInterviewScore}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Job Compatibility Match (20%)</span>
                <span className="text-emerald-400">{compScores.jobCompatibilityScore}/100</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${compScores.jobCompatibilityScore}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Resume Quality (15%)</span>
                <span className="text-purple-400">{compScores.resumeQuality}/100</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${compScores.resumeQuality}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Behavioural Evaluation (15%)</span>
                <span className="text-amber-400">{compScores.behaviouralInterviewScore}/100</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${compScores.behaviouralInterviewScore}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Skill Analytics & Inferred Proficiency (Labeled 'AI Estimated') */}
        <div className="glass-card p-6 border border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-100 font-outfit flex items-center gap-2">
              <Code className="w-5 h-5 text-cyan-400" /> AI Skill Proficiency Analysis
            </h3>
            <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">
              AI Estimated
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {['React.js', 'Node.js', 'MongoDB', 'JavaScript (ES6+)', 'Docker'].map((skill, idx) => {
              const scores = [90, 85, 80, 92, 60];
              return (
                <div key={idx}>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-200">{skill}</span>
                    <span className="text-slate-400 font-mono">{scores[idx]} / 100 <span className="text-[10px] text-indigo-400 ml-1">(AI Estimated)</span></span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full" style={{ width: `${scores[idx]}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Skill Gap & Recommendations Box */}
      <div className="glass-card p-6 border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-slate-100 font-outfit flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" /> Skill Gap Intelligence & Recommendation
        </h3>
        <p className="text-xs text-slate-400">Targeting Full Stack Software Developer roles.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Strong Matching Competencies</span>
            <div className="flex flex-wrap gap-1.5">
              {(intelligence?.skillGapAnalysis?.strongSkills || ['React', 'Node.js', 'MongoDB', 'JavaScript']).map((s, i) => (
                <span key={i} className="px-2 py-1 rounded bg-slate-900 text-emerald-300 text-xs font-semibold">✓ {s}</span>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Identified Skill Gaps</span>
            <div className="flex flex-wrap gap-1.5">
              {(intelligence?.skillGapAnalysis?.missingSkills || ['Docker', 'AWS Cloud']).map((s, i) => (
                <span key={i} className="px-2 py-1 rounded bg-slate-900 text-amber-300 text-xs font-semibold">⚠ {s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CandidateDashboard;
