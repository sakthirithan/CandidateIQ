import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { getCurrentUser } from '../../utils/auth';
import { Sparkles, FileText, Play, RefreshCw, AlertCircle, Brain, Zap } from 'lucide-react';
import CandidateScoreCard from './CandidateScoreCard';
import TechnicalSkillIntelligence from './TechnicalSkillIntelligence';
import MatchedRequisitions from './MatchedRequisitions';
import CandidateIntelligenceSummaryCard from '../common/CandidateIntelligenceSummaryCard';
import InterviewTimelineCard from '../common/InterviewTimelineCard';
import AIRecommendedActionsCard from '../common/AIRecommendedActionsCard';
import RightIntelligencePanel from '../common/RightIntelligencePanel';

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

      try {
        const profRes = await api.get('/candidates/profile');
        setProfile(profRes.data.profile);
      } catch (pErr) {
        setProfile({ personalInfo: { name: displayName, headline: 'Senior Full Stack & AI Engineer' } });
      }

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
        <div className="saas-card p-6 md:p-8 h-36 bg-slate-100 rounded-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="saas-card p-5 h-32 bg-slate-100 rounded-2xl"></div>
          <div className="saas-card p-5 h-32 bg-slate-100 rounded-2xl"></div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="saas-card p-5 h-28 bg-slate-100 rounded-2xl"></div>
          ))}
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
  const headline = profile?.personalInfo?.headline || 'Senior Full Stack & AI Architect';

  return (
    <div className="p-6 md:p-8 space-y-6 select-none max-w-7xl mx-auto">
      {/* 1. Candidate Intelligence Summary Hero Header */}
      <CandidateIntelligenceSummaryCard
        candidateName={name}
        headline={headline}
        candidateIQScore={overall.value || 84}
        resumeMatchPct={resume.value || 88}
        interviewEvidencePct={tech.value || 81}
        skillCoveragePct={market.value || 76}
        onViewIntelligence={() => onNavigate('skills')}
      />

      {/* 2. Timeline Activity & AI Recommended Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InterviewTimelineCard
          onActionClick={() => onNavigate('hr-interviews')}
        />
        <AIRecommendedActionsCard
          onNavigate={onNavigate}
        />
      </div>

      {/* 3. Stat Score Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* 4. Main 2-Column Section: Technical Skill Matrix & Right Contextual Intelligence Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TechnicalSkillIntelligence
            skills={intelligence?.technicalSkills || []}
            onNavigate={onNavigate}
          />
          <MatchedRequisitions
            matchedJobs={intelligence?.matchedJobs || []}
            onNavigate={onNavigate}
          />
        </div>

        <div className="lg:col-span-1">
          <RightIntelligencePanel
            onViewAnalysis={() => onNavigate('skills')}
          />
        </div>
      </div>
    </div>
  );
}

export default CandidateIQDashboard;

