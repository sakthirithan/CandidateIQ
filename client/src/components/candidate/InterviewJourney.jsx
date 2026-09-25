import React, { useState, useEffect } from 'react';
import { evidenceIntelligenceService, VALIDATION_STATES } from '../../services/mockApi/evidenceIntelligenceService';
import {
  Sparkles, Brain, CheckCircle2, Clock, AlertCircle, HelpCircle, ArrowRight,
  TrendingUp, FileText, Zap, RotateCcw, Eye, ChevronRight, MessageSquare, Bot,
  Award, ShieldCheck, Heart, User, Check, RefreshCw, Play
} from 'lucide-react';

function InterviewJourney({ onLaunchTargetedInterview }) {
  const [loading, setLoading] = useState(true);
  const [resumeRecords, setResumeRecords] = useState([]);
  const [currentResume, setCurrentResume] = useState(null);
  const [interviewRecords, setInterviewRecords] = useState([]);
  const [matrixData, setMatrixData] = useState([]);
  const [progressionData, setProgressionData] = useState(null);

  // Modals & Drawers State
  const [selectedWhySkill, setSelectedWhySkill] = useState(null);
  const [viewingInterviewRecord, setViewingInterviewRecord] = useState(null);
  const [reanalyzeModal, setReanalyzeModal] = useState({ isOpen: false, interview: null, targetResumeId: '' });
  const [reanalyzing, setReanalyzing] = useState(false);
  const [reanalysisResult, setReanalysisResult] = useState(null);

  useEffect(() => {
    fetchJourneyData();
  }, []);

  const fetchJourneyData = async () => {
    try {
      setLoading(true);
      const rList = await evidenceIntelligenceService.getResumeRecords('cand_1');
      const latestR = await evidenceIntelligenceService.getLatestResumeRecord('cand_1');
      const iList = await evidenceIntelligenceService.getInterviewRecords('cand_1');

      setResumeRecords(rList);
      setCurrentResume(latestR);
      setInterviewRecords(iList);

      const matrix = evidenceIntelligenceService.calculateClaimEvidenceMatrix(latestR, iList);
      setMatrixData(matrix);

      if (iList.length >= 2) {
        const prog = await evidenceIntelligenceService.getProgressionAnalysis(iList[0].id, iList[1].id);
        setProgressionData(prog);
      }
    } catch (err) {
      console.error('Error fetching interview journey data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteReanalysis = async () => {
    if (!reanalyzeModal.interview || !reanalyzeModal.targetResumeId) return;
    try {
      setReanalyzing(true);
      const newAnalysis = await evidenceIntelligenceService.reanalyzeInterview(
        reanalyzeModal.interview.id,
        reanalyzeModal.targetResumeId
      );
      setReanalysisResult(newAnalysis);
      fetchJourneyData();
    } catch (err) {
      console.error(err);
    } finally {
      setReanalyzing(false);
    }
  };

  // Convert internal validation state to simple friendly user pill
  const getFriendlyStatusPill = (stateKey) => {
    if (stateKey === 'SUPPORTED') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ✓ Shown
        </span>
      );
    }
    if (stateKey === 'PARTIALLY_SUPPORTED' || stateKey === 'UNSUPPORTED') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5 shadow-2xs">
          <Clock className="w-3.5 h-3.5 text-amber-600" /> 🟡 Improve
        </span>
      );
    }
    if (stateKey === 'NOT_TESTED') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" /> ⚪ Not Tested
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1.5">
        <AlertCircle className="w-3.5 h-3.5 text-purple-600" /> ⚠ Needs Attention
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-500 font-outfit">Loading Your Interview Journey...</p>
      </div>
    );
  }

  const latestInterview = interviewRecords[0];
  const weakSkillClaim = matrixData.find((m) => m.validationState === 'UNSUPPORTED' || m.validationState === 'NOT_TESTED' || m.validationState === 'PARTIALLY_SUPPORTED');
  const recommendedSkillName = weakSkillClaim ? weakSkillClaim.skillName : 'System Design';

  return (
    <div className="p-6 md:p-8 space-y-8 select-none max-w-6xl mx-auto font-sans">
      {/* Header Banner & Title */}
      <div className="saas-card p-6 md:p-8 border border-slate-200/90 bg-white shadow-sm space-y-4 rounded-3xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-3xl font-black font-outfit text-slate-950 tracking-tight">My Interview Journey</h1>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> AI Coach Active
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              See how you're progressing from practice to real interviews, align your answers with your profile, and know exactly what to practice next.
            </p>
          </div>

          <button
            onClick={() => onLaunchTargetedInterview && onLaunchTargetedInterview('Technical')}
            className="btn-primary text-xs px-5 py-3 font-bold flex items-center gap-2 shadow-md hover:scale-102 transition-transform"
          >
            <Bot className="w-4 h-4 text-amber-300" /> Start Practice Interview
          </button>
        </div>

        {/* AI COACH CARD BANNER */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 shadow-inner">
              <Brain className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold font-outfit text-sm text-indigo-200 uppercase tracking-wider">Your AI Interview Coach</span>
              </div>
              <p className="text-xs text-slate-200 font-medium leading-relaxed max-w-2xl">
                "You're demonstrating stronger explanation depth in frontend and API questions! Your next best focus area to practice is <strong className="text-amber-300">{recommendedSkillName}</strong> to ensure your profile claims are fully validated."
              </p>
            </div>
          </div>

          <button
            onClick={() => onLaunchTargetedInterview && onLaunchTargetedInterview(recommendedSkillName)}
            className="px-4 py-2.5 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-extrabold text-xs shadow-sm transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-500" /> Practice {recommendedSkillName}
          </button>
        </div>
      </div>

      {/* SECTION 1: LATEST INTERVIEW */}
      {latestInterview && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black font-outfit text-slate-950 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" /> Your Latest Interview
            </h2>
            <span className="text-xs text-slate-400 font-semibold">Completed: {latestInterview.date}</span>
          </div>

          <div className="saas-card p-6 border border-slate-200/90 bg-white space-y-6 rounded-2xl shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-xl font-extrabold font-outfit text-slate-950">{latestInterview.title}</h3>
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                    😊 Good progress
                  </span>
                </div>
                <p className="text-xs text-indigo-600 font-bold">{latestInterview.targetRole}</p>
              </div>

              <button
                onClick={() => setViewingInterviewRecord(latestInterview)}
                className="btn-secondary text-xs px-4 py-2 font-bold flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5 text-indigo-600" /> View Interview Details
              </button>
            </div>

            {/* Strengths & Improvement Bullet Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/70 space-y-2">
                <span className="font-extrabold text-emerald-900 uppercase tracking-wider text-[10px] block flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> You Were Particularly Strong In:
                </span>
                <ul className="space-y-1.5 text-emerald-950 font-medium">
                  <li className="flex items-center gap-2">✓ React state memoization & Context Provider isolation</li>
                  <li className="flex items-center gap-2">✓ Empirical root cause diagnosis for API database latencies</li>
                  <li className="flex items-center gap-2">✓ Cross-team API versioning & developer mentorship</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/70 space-y-2">
                <span className="font-extrabold text-amber-900 uppercase tracking-wider text-[10px] block flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" /> You Could Improve:
                </span>
                <ul className="space-y-1.5 text-amber-950 font-medium">
                  <li className="flex items-center gap-2">→ Explaining Node.js CPU event loop phase queues under heavy load</li>
                  <li className="flex items-center gap-2">→ MongoDB aggregation pipeline memory limits ($match placement)</li>
                  <li className="flex items-center gap-2">→ System Design microservices caching fallbacks</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 2: YOUR PROGRESS & PRACTICE TO REAL INTERVIEW */}
      <section className="space-y-4">
        <h2 className="text-lg font-black font-outfit text-slate-950 uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" /> From Practice to Real Interview
        </h2>

        <div className="saas-card p-6 border border-slate-200/90 bg-white space-y-6 rounded-2xl shadow-sm">
          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center gap-3 text-xs font-semibold text-indigo-950">
            <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
            <span>
              You improved in <strong>4 key technical areas</strong> between your practice rounds and Job Interview! System Design remains your top focus for continuous practice.
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Key Skill Area</th>
                  <th className="p-3.5 text-center">Practice Mock Round</th>
                  <th className="p-3.5 text-center">Job Interview Round</th>
                  <th className="p-3.5 text-right">Progression Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {(progressionData?.progressionData || [
                  { skillName: 'React State Architecture', mockEvidenceState: 'PARTIALLY_SUPPORTED', finalEvidenceState: 'SUPPORTED', trajectory: '🚀 Improved (+25%)' },
                  { skillName: 'Node.js Express & Event Loop', mockEvidenceState: 'PARTIALLY_SUPPORTED', finalEvidenceState: 'SUPPORTED', trajectory: '🚀 Improved (+20%)' },
                  { skillName: 'System Architecture & Scaling', mockEvidenceState: 'UNSUPPORTED', finalEvidenceState: 'PARTIALLY_SUPPORTED', trajectory: '↗ Slight Progress (+15%)' }
                ]).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60">
                    <td className="p-3.5 font-bold text-slate-900 font-outfit text-sm">{row.skillName}</td>
                    <td className="p-3.5 text-center">
                      <div className="flex justify-center">{getFriendlyStatusPill(row.mockEvidenceState)}</div>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex justify-center">{getFriendlyStatusPill(row.finalEvidenceState)}</div>
                    </td>
                    <td className="p-3.5 text-right font-extrabold text-indigo-600 font-outfit">
                      {row.trajectory}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SECTION 3: PROFILE CHECK ("Does Your Interview Support Your Profile?") */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-lg font-black font-outfit text-slate-950 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" /> Does Your Interview Support Your Profile?
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              We compare the skills in your profile against what you've actually demonstrated in interviews.
            </p>
          </div>

          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
            Active Context: {currentResume?.version}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matrixData.map((item, idx) => (
            <div
              key={idx}
              className="saas-card p-5 border border-slate-200/90 bg-white space-y-3.5 rounded-2xl shadow-2xs hover:border-indigo-200 transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <h3 className="text-base font-extrabold font-outfit text-slate-950">{item.skillName}</h3>
                  <span className="text-[11px] text-slate-500 font-semibold block">{item.resumeClaim}</span>
                </div>
                {getFriendlyStatusPill(item.validationState)}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                "{item.observedEvidence}"
              </p>

              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  onClick={() => setSelectedWhySkill(item)}
                  className="text-indigo-600 font-bold hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" /> Why am I seeing this?
                </button>

                {item.validationState !== 'SUPPORTED' && (
                  <button
                    onClick={() => onLaunchTargetedInterview && onLaunchTargetedInterview(item.skillName)}
                    className="btn-primary text-[11px] px-3 py-1.5 font-bold flex items-center gap-1 shadow-xs"
                  >
                    <Zap className="w-3 h-3 text-amber-300" /> Practice This Skill
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: YOUR NEXT STEP 🎯 */}
      <section className="space-y-4">
        <h2 className="text-lg font-black font-outfit text-slate-950 uppercase tracking-wider flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" /> Your Next Step 🎯
        </h2>

        <div className="saas-card p-6 border border-slate-200/90 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 text-white space-y-4 rounded-3xl shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 uppercase tracking-wider">
                Recommended Focus Area
              </span>
              <h3 className="text-xl font-extrabold font-outfit">Practice {recommendedSkillName}</h3>
              <p className="text-xs text-slate-200 font-medium leading-relaxed max-w-2xl">
                Your recent profile check shows that demonstrating deeper architecture decisions for <strong>{recommendedSkillName}</strong> could strengthen your overall interview readiness.
              </p>
            </div>

            <button
              onClick={() => onLaunchTargetedInterview && onLaunchTargetedInterview(recommendedSkillName)}
              className="px-6 py-3 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-black text-xs shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-slate-950 text-slate-950" /> Practice Now
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 5: INTERVIEW HISTORY TIMELINE */}
      <section className="space-y-4">
        <h2 className="text-lg font-black font-outfit text-slate-950 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-600" /> Your Interview Journey History
        </h2>

        <div className="space-y-4">
          {interviewRecords.map((inv, idx) => (
            <div
              key={inv.id}
              className="saas-card p-6 border border-slate-200/90 bg-white space-y-4 rounded-2xl shadow-2xs hover:border-indigo-200 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-black font-mono ${
                    inv.type === 'FINAL' ? 'bg-purple-100 text-purple-800' : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    {inv.type} RECORD
                  </span>
                  <span className="text-xs font-bold text-slate-400">{inv.date}</span>
                </div>
                <h3 className="text-base font-extrabold font-outfit text-slate-950">{inv.title}</h3>
                <p className="text-xs text-indigo-600 font-bold">{inv.targetRole} • Reviewed with {inv.resumeVersionLabel}</p>
              </div>

              <div className="flex items-center gap-3 self-end md:self-auto">
                <button
                  onClick={() => setViewingInterviewRecord(inv)}
                  className="btn-secondary text-xs px-3.5 py-2 font-bold inline-flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-indigo-600" /> View Transcript
                </button>

                <button
                  onClick={() =>
                    setReanalyzeModal({
                      isOpen: true,
                      interview: inv,
                      targetResumeId: currentResume?.id || 'RES-002'
                    })
                  }
                  className="btn-primary text-xs px-4 py-2 font-bold inline-flex items-center gap-1.5 shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-indigo-200" /> Check My Updated Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY AM I SEEING THIS EXPLANATION MODAL */}
      {selectedWhySkill && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="saas-card p-6 border border-slate-200 bg-white max-w-lg w-full rounded-2xl shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold font-outfit text-slate-950">Why am I seeing this status?</h3>
              <button onClick={() => setSelectedWhySkill(null)} className="text-slate-400 hover:text-slate-600 font-bold text-sm">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Your Profile Claim</span>
                <p className="font-bold text-slate-900">{selectedWhySkill.skillName}: {selectedWhySkill.resumeClaim}</p>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-1">
                <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block">What We Saw in Interviews</span>
                <p className="font-medium text-slate-800">{selectedWhySkill.observedEvidence}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-950 font-medium leading-relaxed">
                <strong>AI Coach Explanation:</strong> You listed {selectedWhySkill.skillName} on your resume. Your interviews demonstrate good foundational awareness, but taking a targeted practice interview will help you demonstrate enterprise depth to recruiters.
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button onClick={() => setSelectedWhySkill(null)} className="btn-secondary text-xs px-4 py-2 font-bold">
                Got It
              </button>
              <button
                onClick={() => {
                  const sName = selectedWhySkill.skillName;
                  setSelectedWhySkill(null);
                  if (onLaunchTargetedInterview) onLaunchTargetedInterview(sName);
                }}
                className="btn-primary text-xs px-4 py-2 font-bold inline-flex items-center gap-1.5 shadow-md"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" /> Practice {selectedWhySkill.skillName} Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW TRANSCRIPT MODAL */}
      {viewingInterviewRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="saas-card p-6 border border-slate-200 bg-white max-w-2xl w-full rounded-2xl shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-extrabold font-outfit text-slate-950">{viewingInterviewRecord.title}</h3>
                <span className="text-xs text-indigo-600 font-bold">{viewingInterviewRecord.targetRole} • {viewingInterviewRecord.date}</span>
              </div>
              <button onClick={() => setViewingInterviewRecord(null)} className="text-slate-400 hover:text-slate-600 font-bold text-sm">
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {viewingInterviewRecord.questions?.map((q, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200/90 bg-slate-50 space-y-2.5">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-900 font-outfit">Question {idx + 1}: {q.questionText}</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                      {q.observedLevel || 'Strong'}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-white border border-slate-200 text-slate-700 italic font-medium">
                    "{q.candidateResponse}"
                  </div>

                  <p className="text-[11px] text-slate-500 font-semibold">
                    💡 <strong>AI Coach Feedback:</strong> {q.reasoning || 'Good technical clarity demonstrated.'}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button onClick={() => setViewingInterviewRecord(null)} className="btn-secondary text-xs px-5 py-2 font-bold">
                Close Record Transcript
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RE-ANALYSIS MODAL */}
      {reanalyzeModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="saas-card p-6 border border-slate-200 bg-white max-w-lg w-full rounded-2xl shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold font-outfit text-slate-950">Check My Updated Profile against this Interview</h3>
              <button
                onClick={() => {
                  setReanalyzeModal({ isOpen: false, interview: null, targetResumeId: '' });
                  setReanalysisResult(null);
                }}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed font-medium">
                This interview was originally reviewed using <strong className="text-slate-900">{reanalyzeModal.interview?.resumeVersionLabel}</strong>. Your current profile is <strong className="text-indigo-600">{currentResume?.version}</strong> ({currentResume?.claimedSkills.length} skills).
              </p>

              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-950 font-medium">
                Would you like to check how your updated profile matches this completed interview performance?
              </div>

              {reanalysisResult && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold font-outfit text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> New Profile Analysis Completed ({reanalysisResult.analysisVersion})
                  </div>
                  <div className="text-[11px] text-emerald-800 space-y-1 font-medium">
                    <p>• Profile Alignment: <strong>{reanalysisResult.overallAlignment}</strong></p>
                    <p>• Skills Tested: <strong>{reanalysisResult.evidenceCoverage}</strong></p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setReanalyzeModal({ isOpen: false, interview: null, targetResumeId: '' });
                  setReanalysisResult(null);
                }}
                className="btn-secondary text-xs px-4 py-2 font-bold"
              >
                {reanalysisResult ? 'Done' : 'Cancel'}
              </button>

              {!reanalysisResult && (
                <button
                  onClick={handleExecuteReanalysis}
                  disabled={reanalyzing}
                  className="btn-primary text-xs px-5 py-2 font-bold shadow-md flex items-center gap-2"
                >
                  {reanalyzing ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" /> Check Now
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InterviewJourney;
