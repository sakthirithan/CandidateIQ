import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { getCurrentUser } from '../../utils/auth';
import { Sparkles, FileText, Play, RefreshCw, AlertCircle, Brain, Briefcase, Zap } from 'lucide-react';
import CandidateScoreCard from './CandidateScoreCard';
import TechnicalSkillIntelligence from './TechnicalSkillIntelligence';
import MatchedRequisitions from './MatchedRequisitions';

function CandidateIQDashboard({ onNavigate }) {
  const [profile, setProfile] = useState(null);
  const [intelligence, setIntelligence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentUser = getCurrentUser();
  const displayName = currentUser ? currentUser.name : 'Candidate';

  useEffect(() => {
    fetchDashboardIntelligence();
  }, []);

  const fetchDashboardIntelligence = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch Profile for name / target role details
      try {
        const profRes = await api.get('/candidates/profile');
        setProfile(profRes.data.profile);
      } catch (pErr) {
        // Fallback profile if profile not saved yet
        setProfile({ personalInfo: { name: displayName, headline: 'Software Candidate' } });
      }

      // Fetch dynamic Candidate Intelligence Snapshot
      const url = forceRefresh ? '/candidates/me/intelligence?refresh=true' : '/candidates/me/intelligence';
      const intelRes = await api.get(url);
      
      if (intelRes.data && intelRes.data.data) {
        setIntelligence(intelRes.data.data);
      } else {
        throw new Error('Candidate intelligence response format invalid');
      }
    } catch (err) {
      console.error('[CandidateIQDashboard] Failed to fetch candidate intelligence:', err);
      setError('Candidate intelligence couldn\'t be loaded.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-8 select-none max-w-7xl mx-auto animate-pulse">
        {/* Banner Skeleton */}
        <div className="saas-card p-6 md:p-8 h-32 bg-slate-100 rounded-2xl"></div>

        {/* Score Grid Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="saas-card p-5 h-28 bg-slate-100 rounded-2xl"></div>
          ))}
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="saas-card p-6 h-80 bg-slate-100 rounded-2xl"></div>
          <div className="saas-card p-6 h-80 bg-slate-100 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4 my-12 saas-card">
        <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold font-outfit text-slate-950">{error}</h3>
        <p className="text-xs text-slate-500">
          Please check database connectivity or refresh your session.
        </p>
        <button
          onClick={() => fetchDashboardIntelligence(true)}
          className="btn-ai text-xs inline-flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry Loading Intelligence
        </button>
      </div>
    );
  }

  const overall = intelligence?.overallScore || {};
  const resume = intelligence?.resumeQuality || {};
  const tech = intelligence?.technicalScore || {};
  const market = intelligence?.marketJobMatch || {};

  const name = profile?.personalInfo?.name || displayName;
  const headline = profile?.personalInfo?.headline || 'Candidate IQ Active';

  return (
    <div className="p-6 md:p-8 space-y-8 select-none max-w-7xl mx-auto">
      {/* Top Welcome Header Banner */}
      <div className="saas-card p-6 md:p-8 border border-slate-200/90 flex flex-wrap justify-between items-center gap-6 bg-gradient-to-r from-white via-slate-50 to-indigo-50/40 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center text-white text-2xl font-black font-outfit shadow-md shadow-slate-900/15">
            {name.charAt(0)}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold text-slate-950 font-outfit tracking-tight">
                Good day, {name} 👋
              </h2>
              <span className="badge-pill badge-ai text-[10px]">
                <Sparkles className="w-3 h-3 text-indigo-600" /> AI Active
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Profile Target: <span className="text-slate-800 font-semibold">{headline}</span>
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

      {/* Top Stat Score Grid (Dynamic derived scores) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Candidate IQ Score Card */}
        <CandidateScoreCard
          title="Candidate IQ Score"
          value={overall.value}
          max={100}
          confidence={overall.confidence}
          dataAvailable={overall.status === 'calculated'}
          status={overall.status}
          icon={Sparkles}
          accentColor="indigo"
          percentileText={overall.percentileText}
          criteria={overall.breakdown || []}
          lastUpdated={intelligence?.lastUpdated}
          formulaVersion={intelligence?.formulaVersion}
          hoverType="candidate_iq"
        />

        {/* Resume Quality Card */}
        <CandidateScoreCard
          title="Resume Quality"
          value={`${resume.value}%`}
          max={100}
          confidence={resume.confidence}
          dataAvailable={resume.dataAvailable}
          icon={FileText}
          accentColor="blue"
          subtitle={resume.dataAvailable ? `✓ ${resume.criteria?.length || 6} Criteria Analyzed` : 'Resume pending'}
          criteria={resume.criteria || []}
          improvementSuggestion={resume.improvementSuggestion}
          lastUpdated={resume.lastAnalyzed}
          hoverType="resume"
        />

        {/* Technical Score Card */}
        <CandidateScoreCard
          title="Technical Score"
          value={tech.value}
          max={100}
          confidence={tech.confidence}
          dataAvailable={tech.dataAvailable}
          icon={Brain}
          accentColor="purple"
          subtitle={tech.dataAvailable ? `${tech.skillsEvaluatedCount} Verified Skills` : 'Assessments pending'}
          criteria={tech.criteria || []}
          lastUpdated={tech.lastVerified}
          hoverType="technical"
        />

        {/* Market Job Match Card */}
        <CandidateScoreCard
          title="Market Job Match"
          value={market.value}
          confidence={market.confidence}
          dataAvailable={market.dataAvailable}
          icon={Zap}
          accentColor="emerald"
          subtitle={market.dataAvailable ? `${market.matchedJobsCount} Active Requisitions` : 'No active job fit'}
          criteria={market.criteria || []}
          hoverType="match"
        />
      </div>

      {/* Main Grid: Technical Skill Matrix & Top Matched Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TechnicalSkillIntelligence
          skills={intelligence?.technicalSkills || []}
          onNavigate={onNavigate}
        />

        <MatchedRequisitions
          matchedJobs={intelligence?.matchedJobs || []}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
}

export default CandidateIQDashboard;
