import React, { useState, useEffect } from 'react';
import { mockCandidateService } from '../../services/mockApi/candidateService';
import { mockJobService } from '../../services/mockApi/jobService';
import { matchingService } from '../../services/mockApi/matchingService';
import { mockCandidates } from '../../data/mockCandidates';
import { mockJobs } from '../../data/mockJobs';
import ResponsibleAIDisclaimer from '../common/ResponsibleAIDisclaimer';
import {
  ArrowRightLeft,
  Sparkles,
  Award,
  CheckCircle2,
  Brain,
  Layers,
  Briefcase,
  UserCheck,
  TrendingUp,
  FileText,
  Zap,
  Plus,
  BarChart3,
  RefreshCw
} from 'lucide-react';

function CandidateIQComparison() {
  const [allCandidates, setAllCandidates] = useState(mockCandidates);
  const [jobs, setJobs] = useState(mockJobs);
  const [selectedJob, setSelectedJob] = useState(mockJobs[0]);
  const [loading, setLoading] = useState(false);

  // 3 Candidate Slots for Side-by-Side Comparison Flow
  const [candidateAId, setCandidateAId] = useState('cand_1');
  const [candidateBId, setCandidateBId] = useState('cand_3');
  const [candidateCId, setCandidateCId] = useState('cand_2');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cands, jobList] = await Promise.all([
        mockCandidateService.getCandidates(),
        mockJobService.getJobs()
      ]);

      setAllCandidates(cands || []);
      setJobs(jobList || []);
      if (jobList && jobList.length > 0) {
        setSelectedJob(jobList[0]);
      }

      if (cands && cands.length >= 3) {
        setCandidateAId(cands[0]?.id || 'cand_1');
        setCandidateBId(cands[2]?.id || 'cand_3');
        setCandidateCId(cands[1]?.id || 'cand_2');
      }
    } catch (err) {
      console.error('Error loading candidate comparison data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Find candidate objects
  const candidateA = allCandidates.find((c) => c.id === candidateAId) || allCandidates[0];
  const candidateB = allCandidates.find((c) => c.id === candidateBId) || allCandidates[2] || allCandidates[0];
  const candidateC = allCandidates.find((c) => c.id === candidateCId) || allCandidates[1] || allCandidates[0];

  const targetJobObj = selectedJob || { title: 'Senior MERN Stack & AI Engineer' };

  // Calculate Intelligence Profiles using Module 13 Engine
  const profileA = matchingService.calculateCandidateIntelligenceProfile(candidateA, targetJobObj);
  const profileB = matchingService.calculateCandidateIntelligenceProfile(candidateB, targetJobObj);
  const profileC = matchingService.calculateCandidateIntelligenceProfile(candidateC, targetJobObj);

  const getCandidateMetrics = (cand, profile) => {
    return {
      technical: cand?.scores?.technical || profile?.scores?.technical || 85,
      behavioural: cand?.scores?.behavioural || profile?.scores?.behavioural || 78,
      jobMatch: cand?.scores?.jobMatch || profile?.scores?.jobMatch || 86,
      experience: cand?.scores?.experience || profile?.scores?.experience || 80,
      interview: cand?.scores?.interview || profile?.scores?.interview || 84,
      overall: cand?.overallScore || profile?.overallScore || 84
    };
  };

  const metricsA = getCandidateMetrics(candidateA, profileA);
  const metricsB = getCandidateMetrics(candidateB, profileB);
  const metricsC = getCandidateMetrics(candidateC, profileC);

  // Highlighting Maximum Metric helper
  const getMaxCandidateLabel = (key) => {
    const valA = metricsA[key];
    const valB = metricsB[key];
    const valC = metricsC[key];
    const maxVal = Math.max(valA, valB, valC);

    const winners = [];
    if (valA === maxVal) winners.push('A');
    if (valB === maxVal) winners.push('B');
    if (valC === maxVal) winners.push('C');
    return { maxVal, winners };
  };

  // Generate Explainable Comparison Insights dynamically
  const generateExplainableBullets = (slotKey, candidate, metrics, otherMetrics1, otherMetrics2) => {
    const bullets = [];

    if (metrics.technical >= Math.max(otherMetrics1.technical, otherMetrics2.technical)) {
      bullets.push(`+ Highest technical score (${metrics.technical}/100)`);
    }
    if (metrics.behavioural >= Math.max(otherMetrics1.behavioural, otherMetrics2.behavioural)) {
      bullets.push(`+ Stronger behavioural evidence (${metrics.behavioural}/100)`);
    }
    if (metrics.jobMatch >= Math.max(otherMetrics1.jobMatch, otherMetrics2.jobMatch)) {
      bullets.push(`+ Highest job compatibility (${metrics.jobMatch}% Match)`);
    }
    if (metrics.experience >= Math.max(otherMetrics1.experience, otherMetrics2.experience)) {
      bullets.push(`+ Better experience & tenure (${metrics.experience}/100)`);
    }
    if (metrics.interview >= Math.max(otherMetrics1.interview, otherMetrics2.interview)) {
      bullets.push(`+ Strong interview performance (${metrics.interview}/100)`);
    }

    if (bullets.length === 0) {
      bullets.push(`+ Balanced score profile across engineering dimensions (${metrics.overall}/100)`);
      bullets.push(`+ Verified portfolio & active candidate application status`);
    } else if (bullets.length === 1) {
      bullets.push(`+ Verified skills aligned with target requisition`);
    }

    return bullets;
  };

  const bulletsA = generateExplainableBullets('A', candidateA, metricsA, metricsB, metricsC);
  const bulletsB = generateExplainableBullets('B', candidateB, metricsB, metricsA, metricsC);
  const bulletsC = generateExplainableBullets('C', candidateC, metricsC, metricsA, metricsB);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 select-none max-w-7xl mx-auto">
      {/* Top Banner Header */}
      <div className="saas-card p-6 md:p-8 border border-slate-200/90 flex flex-wrap justify-between items-center gap-6 bg-white shadow-sm">
        <div className="space-y-1.5 flex-1 min-w-[280px]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
              <ArrowRightLeft className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold font-outfit text-slate-950 tracking-tight">
                  Module 16 — Candidate Comparison Matrix
                </h1>
                <span className="badge-pill badge-primary text-[10px]">
                  <Sparkles className="w-3 h-3 text-indigo-400" /> Explainable Analytics
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Transparent side-by-side evaluation using candidate intelligence scoring data across 6 core metrics.
              </p>
            </div>
          </div>
        </div>

        {/* Target Requisition Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target Job:</label>
          <select
            value={selectedJob?.id || ''}
            onChange={(e) => {
              const j = jobs.find((item) => item.id === e.target.value);
              if (j) setSelectedJob(j);
            }}
            className="input-saas text-xs bg-white py-2 px-3 font-semibold text-slate-800 cursor-pointer"
          >
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* FLOW STEP 1: CANDIDATE SELECTION CARDS */}
      <div className="saas-card p-6 border border-slate-200/80 bg-white space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-indigo-600" /> Select 3 Candidates for Side-by-Side Comparison
          </span>
          <span className="text-[10px] text-indigo-600 font-bold uppercase">Dynamic Metric Engine</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Candidate Slot A */}
          <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-600 text-white font-outfit">
                Candidate A
              </span>
              <span className="text-xs font-mono font-bold text-indigo-700">IQ: {metricsA.overall}/100</span>
            </div>
            <select
              value={candidateAId}
              onChange={(e) => setCandidateAId(e.target.value)}
              className="w-full bg-white border border-indigo-200 text-slate-900 text-xs font-bold rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              {allCandidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.headline?.substring(0, 24)}...
                </option>
              ))}
            </select>
            <div className="text-[11px] text-slate-500 font-medium">
              <p className="font-bold text-slate-900">{candidateA?.name}</p>
              <p className="truncate text-indigo-600 font-semibold">{candidateA?.headline}</p>
            </div>
          </div>

          {/* Candidate Slot B */}
          <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-600 text-white font-outfit">
                Candidate B
              </span>
              <span className="text-xs font-mono font-bold text-purple-700">IQ: {metricsB.overall}/100</span>
            </div>
            <select
              value={candidateBId}
              onChange={(e) => setCandidateBId(e.target.value)}
              className="w-full bg-white border border-purple-200 text-slate-900 text-xs font-bold rounded-xl p-2.5 focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
            >
              {allCandidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.headline?.substring(0, 24)}...
                </option>
              ))}
            </select>
            <div className="text-[11px] text-slate-500 font-medium">
              <p className="font-bold text-slate-900">{candidateB?.name}</p>
              <p className="truncate text-purple-600 font-semibold">{candidateB?.headline}</p>
            </div>
          </div>

          {/* Candidate Slot C */}
          <div className="p-4 rounded-2xl bg-cyan-50/40 border border-cyan-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-600 text-white font-outfit">
                Candidate C
              </span>
              <span className="text-xs font-mono font-bold text-cyan-700">IQ: {metricsC.overall}/100</span>
            </div>
            <select
              value={candidateCId}
              onChange={(e) => setCandidateCId(e.target.value)}
              className="w-full bg-white border border-cyan-200 text-slate-900 text-xs font-bold rounded-xl p-2.5 focus:ring-2 focus:ring-cyan-500/20 cursor-pointer"
            >
              {allCandidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.headline?.substring(0, 24)}...
                </option>
              ))}
            </select>
            <div className="text-[11px] text-slate-500 font-medium">
              <p className="font-bold text-slate-900">{candidateC?.name}</p>
              <p className="truncate text-cyan-600 font-semibold">{candidateC?.headline}</p>
            </div>
          </div>
        </div>
      </div>

      {/* FLOW STEP 2: TRANSPARENT COMPARISON METRIC MATRIX TABLE */}
      <div className="saas-card p-6 border border-slate-200/90 bg-white space-y-6 shadow-sm overflow-x-auto">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold font-outfit text-slate-950 uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" /> Multi-Candidate Evaluation Table
          </h3>
          <span className="text-[10px] text-slate-400 font-medium">Same data as Candidate Intelligence Module</span>
        </div>

        <table className="w-full text-left border-collapse text-xs select-none">
          <thead>
            <tr className="border-b border-slate-200/90 bg-slate-50/70">
              <th className="py-4 px-4 font-extrabold text-slate-500 uppercase tracking-wider text-left w-52 font-outfit">
                Metric Dimension
              </th>
              <th className="py-4 px-4 font-bold text-slate-950 text-center">
                <div className="space-y-0.5">
                  <span className="text-xs font-extrabold font-outfit text-indigo-600 block">{candidateA?.name || 'Candidate A'}</span>
                  <span className="text-[10px] text-slate-400 font-medium block">Candidate A</span>
                </div>
              </th>
              <th className="py-4 px-4 font-bold text-slate-950 text-center">
                <div className="space-y-0.5">
                  <span className="text-xs font-extrabold font-outfit text-purple-600 block">{candidateB?.name || 'Candidate B'}</span>
                  <span className="text-[10px] text-slate-400 font-medium block">Candidate B</span>
                </div>
              </th>
              <th className="py-4 px-4 font-bold text-slate-950 text-center">
                <div className="space-y-0.5">
                  <span className="text-xs font-extrabold font-outfit text-cyan-600 block">{candidateC?.name || 'Candidate C'}</span>
                  <span className="text-[10px] text-slate-400 font-medium block">Candidate C</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {/* 1. Technical */}
            <tr className="hover:bg-slate-50/50 transition-colors">
              <td className="py-4 px-4 font-semibold text-slate-800 flex items-center gap-2">
                <Brain className="w-4 h-4 text-indigo-500" /> Technical
              </td>
              <td className={`py-4 px-4 text-center font-mono font-bold ${getMaxCandidateLabel('technical').winners.includes('A') ? 'text-indigo-600 text-sm font-black' : 'text-slate-700'}`}>
                {metricsA.technical}
                {getMaxCandidateLabel('technical').winners.includes('A') && <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] bg-indigo-100 text-indigo-800 font-sans font-bold">TOP</span>}
              </td>
              <td className={`py-4 px-4 text-center font-mono font-bold ${getMaxCandidateLabel('technical').winners.includes('B') ? 'text-purple-600 text-sm font-black' : 'text-slate-700'}`}>
                {metricsB.technical}
                {getMaxCandidateLabel('technical').winners.includes('B') && <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] bg-purple-100 text-purple-800 font-sans font-bold">TOP</span>}
              </td>
              <td className={`py-4 px-4 text-center font-mono font-bold ${getMaxCandidateLabel('technical').winners.includes('C') ? 'text-cyan-600 text-sm font-black' : 'text-slate-700'}`}>
                {metricsC.technical}
                {getMaxCandidateLabel('technical').winners.includes('C') && <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] bg-cyan-100 text-cyan-800 font-sans font-bold">TOP</span>}
              </td>
            </tr>

            {/* 2. Behavioural */}
            <tr className="hover:bg-slate-50/50 transition-colors">
              <td className="py-4 px-4 font-semibold text-slate-800 flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-500" /> Behavioural
              </td>
              <td className={`py-4 px-4 text-center font-mono font-bold ${getMaxCandidateLabel('behavioural').winners.includes('A') ? 'text-indigo-600 text-sm font-black' : 'text-slate-700'}`}>
                {metricsA.behavioural}
                {getMaxCandidateLabel('behavioural').winners.includes('A') && <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] bg-indigo-100 text-indigo-800 font-sans font-bold">TOP</span>}
              </td>
              <td className={`py-4 px-4 text-center font-mono font-bold ${getMaxCandidateLabel('behavioural').winners.includes('B') ? 'text-purple-600 text-sm font-black' : 'text-slate-700'}`}>
                {metricsB.behavioural}
                {getMaxCandidateLabel('behavioural').winners.includes('B') && <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] bg-purple-100 text-purple-800 font-sans font-bold">TOP</span>}
              </td>
              <td className={`py-4 px-4 text-center font-mono font-bold ${getMaxCandidateLabel('behavioural').winners.includes('C') ? 'text-cyan-600 text-sm font-black' : 'text-slate-700'}`}>
                {metricsC.behavioural}
                {getMaxCandidateLabel('behavioural').winners.includes('C') && <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] bg-cyan-100 text-cyan-800 font-sans font-bold">TOP</span>}
              </td>
            </tr>

            {/* 3. Job Match */}
            <tr className="hover:bg-slate-50/50 transition-colors">
              <td className="py-4 px-4 font-semibold text-slate-800 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-500" /> Job Match
              </td>
              <td className={`py-4 px-4 text-center font-mono font-bold ${getMaxCandidateLabel('jobMatch').winners.includes('A') ? 'text-indigo-600 text-sm font-black' : 'text-slate-700'}`}>
                {metricsA.jobMatch}
                {getMaxCandidateLabel('jobMatch').winners.includes('A') && <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] bg-indigo-100 text-indigo-800 font-sans font-bold">TOP</span>}
              </td>
              <td className={`py-4 px-4 text-center font-mono font-bold ${getMaxCandidateLabel('jobMatch').winners.includes('B') ? 'text-purple-600 text-sm font-black' : 'text-slate-700'}`}>
                {metricsB.jobMatch}
                {getMaxCandidateLabel('jobMatch').winners.includes('B') && <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] bg-purple-100 text-purple-800 font-sans font-bold">TOP</span>}
              </td>
              <td className={`py-4 px-4 text-center font-mono font-bold ${getMaxCandidateLabel('jobMatch').winners.includes('C') ? 'text-cyan-600 text-sm font-black' : 'text-slate-700'}`}>
                {metricsC.jobMatch}
                {getMaxCandidateLabel('jobMatch').winners.includes('C') && <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] bg-cyan-100 text-cyan-800 font-sans font-bold">TOP</span>}
              </td>
            </tr>

            {/* 4. Experience */}
            <tr className="hover:bg-slate-50/50 transition-colors">
              <td className="py-4 px-4 font-semibold text-slate-800 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-500" /> Experience
              </td>
              <td className={`py-4 px-4 text-center font-mono font-bold ${getMaxCandidateLabel('experience').winners.includes('A') ? 'text-indigo-600 text-sm font-black' : 'text-slate-700'}`}>
                {metricsA.experience}
                {getMaxCandidateLabel('experience').winners.includes('A') && <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] bg-indigo-100 text-indigo-800 font-sans font-bold">TOP</span>}
              </td>
              <td className={`py-4 px-4 text-center font-mono font-bold ${getMaxCandidateLabel('experience').winners.includes('B') ? 'text-purple-600 text-sm font-black' : 'text-slate-700'}`}>
                {metricsB.experience}
                {getMaxCandidateLabel('experience').winners.includes('B') && <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] bg-purple-100 text-purple-800 font-sans font-bold">TOP</span>}
              </td>
              <td className={`py-4 px-4 text-center font-mono font-bold ${getMaxCandidateLabel('experience').winners.includes('C') ? 'text-cyan-600 text-sm font-black' : 'text-slate-700'}`}>
                {metricsC.experience}
                {getMaxCandidateLabel('experience').winners.includes('C') && <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] bg-cyan-100 text-cyan-800 font-sans font-bold">TOP</span>}
              </td>
            </tr>

            {/* 5. Interview */}
            <tr className="hover:bg-slate-50/50 transition-colors">
              <td className="py-4 px-4 font-semibold text-slate-800 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" /> Interview
              </td>
              <td className={`py-4 px-4 text-center font-mono font-bold ${getMaxCandidateLabel('interview').winners.includes('A') ? 'text-indigo-600 text-sm font-black' : 'text-slate-700'}`}>
                {metricsA.interview}
                {getMaxCandidateLabel('interview').winners.includes('A') && <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] bg-indigo-100 text-indigo-800 font-sans font-bold">TOP</span>}
              </td>
              <td className={`py-4 px-4 text-center font-mono font-bold ${getMaxCandidateLabel('interview').winners.includes('B') ? 'text-purple-600 text-sm font-black' : 'text-slate-700'}`}>
                {metricsB.interview}
                {getMaxCandidateLabel('interview').winners.includes('B') && <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] bg-purple-100 text-purple-800 font-sans font-bold">TOP</span>}
              </td>
              <td className={`py-4 px-4 text-center font-mono font-bold ${getMaxCandidateLabel('interview').winners.includes('C') ? 'text-cyan-600 text-sm font-black' : 'text-slate-700'}`}>
                {metricsC.interview}
                {getMaxCandidateLabel('interview').winners.includes('C') && <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] bg-cyan-100 text-cyan-800 font-sans font-bold">TOP</span>}
              </td>
            </tr>

            {/* 6. Overall Intelligence Score */}
            <tr className="bg-slate-900 text-white font-bold">
              <td className="py-4 px-4 text-slate-100 font-outfit text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" /> Overall Intelligence
              </td>
              <td className="py-4 px-4 text-center font-mono text-base font-black text-indigo-300">
                {metricsA.overall} <span className="text-[10px] text-slate-400 font-normal">/ 100</span>
              </td>
              <td className="py-4 px-4 text-center font-mono text-base font-black text-purple-300">
                {metricsB.overall} <span className="text-[10px] text-slate-400 font-normal">/ 100</span>
              </td>
              <td className="py-4 px-4 text-center font-mono text-base font-black text-cyan-300">
                {metricsC.overall} <span className="text-[10px] text-slate-400 font-normal">/ 100</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* FLOW STEP 3: EXPLAINABLE COMPARISON INSIGHTS */}
      <div className="saas-card p-6 md:p-8 border border-slate-200/90 bg-white space-y-6 shadow-sm">
        <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
          <h3 className="text-base font-extrabold font-outfit text-slate-950 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" /> Explainable Comparison Insights
          </h3>
          <span className="text-xs text-indigo-600 font-bold">Evidence Callouts</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Candidate A Card */}
          <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200/90 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-bold font-outfit text-indigo-950">{candidateA?.name || 'Candidate A'}</h4>
                <p className="text-[11px] text-indigo-700 font-semibold">{candidateA?.headline}</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-600 text-white font-outfit">
                {metricsA.overall}/100
              </span>
            </div>

            <div className="space-y-2 pt-2 border-t border-indigo-100/80 text-xs font-semibold text-indigo-950">
              {bulletsA.map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-indigo-100">
                  <span className="text-indigo-600 font-black">+</span>
                  <span className="text-[11px] leading-relaxed">{bullet.substring(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Candidate B Card */}
          <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-200/90 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-bold font-outfit text-purple-950">{candidateB?.name || 'Candidate B'}</h4>
                <p className="text-[11px] text-purple-700 font-semibold">{candidateB?.headline}</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-600 text-white font-outfit">
                {metricsB.overall}/100
              </span>
            </div>

            <div className="space-y-2 pt-2 border-t border-purple-100/80 text-xs font-semibold text-purple-950">
              {bulletsB.map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-purple-100">
                  <span className="text-purple-600 font-black">+</span>
                  <span className="text-[11px] leading-relaxed">{bullet.substring(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Candidate C Card */}
          <div className="p-5 rounded-2xl bg-cyan-50/50 border border-cyan-200/90 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-bold font-outfit text-cyan-950">{candidateC?.name || 'Candidate C'}</h4>
                <p className="text-[11px] text-cyan-700 font-semibold">{candidateC?.headline}</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-cyan-600 text-white font-outfit">
                {metricsC.overall}/100
              </span>
            </div>

            <div className="space-y-2 pt-2 border-t border-cyan-100/80 text-xs font-semibold text-cyan-950">
              {bulletsC.map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-cyan-100">
                  <span className="text-cyan-600 font-black">+</span>
                  <span className="text-[11px] leading-relaxed">{bullet.substring(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Responsible AI Disclaimer Component */}
      <ResponsibleAIDisclaimer />
    </div>
  );
}

export default CandidateIQComparison;
