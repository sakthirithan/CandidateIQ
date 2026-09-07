import React, { useState, useEffect, useRef } from 'react';
import { mockCandidateService } from '../../services/mockApi/candidateService';
import { mockJobService } from '../../services/mockApi/jobService';
import { mockApplicationService } from '../../services/mockApi/applicationService';
import { matchingService } from '../../services/mockApi/matchingService';
import ResponsibleAIDisclaimer from '../common/ResponsibleAIDisclaimer';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Search,
  Award,
  HelpCircle,
  BarChart3,
  CheckCircle2,
  Brain,
  Layers,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Zap,
  Filter,
  Check,
  ChevronRight
} from 'lucide-react';

function AIRecruitmentAssistantIQ({ onNavigate }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  const chatBottomRef = useRef(null);

  // Initial Conversation Messages
  const [messages, setMessages] = useState([
    {
      id: 'msg_1',
      sender: 'assistant',
      timestamp: 'Just now',
      type: 'text',
      content: 'Hello! I am your CandidateIQ Recruitment Intelligence Assistant. I am directly connected to your central candidate pool, job requisitions, and matching engine.\n\nTry asking me natural data queries like:',
      suggestions: [
        'Show candidates with React and Node.js',
        'Who has the highest technical score?',
        'Why does Alex Johnson have 89% match?',
        'How many active candidates are shortlisted?'
      ]
    }
  ]);

  useEffect(() => {
    loadMockData();
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const loadMockData = async () => {
    try {
      const [candList, jobList, appList] = await Promise.all([
        mockCandidateService.getCandidates(),
        mockJobService.getJobs(),
        mockApplicationService.getApplications()
      ]);
      setCandidates(candList || []);
      setJobs(jobList || []);
      setApplications(appList || []);
    } catch (err) {
      console.error('Error loading assistant data:', err);
    }
  };

  // INTENT INTERPRETATION & MOCK DATA QUERY ENGINE (MODULE 17 CORE)
  const processNaturalLanguageQuery = (userInput) => {
    const q = userInput.toLowerCase().trim();

    // 1. INTENT: Explainable Score Deep-Dive (e.g., "Why does Candidate A have 86% match?" or "Why Alex Johnson match")
    if (q.includes('why') || q.includes('explain') || q.includes('reason') || q.includes('match score')) {
      const targetCand = candidates.find((c) =>
        q.includes(c.name.toLowerCase()) || q.includes(c.name.split(' ')[0].toLowerCase())
      ) || candidates[0];

      const targetJob = jobs[0] || { title: 'Senior MERN Stack & AI Engineer' };
      const matchRes = matchingService.calculateMatch(targetCand, targetJob);

      return {
        type: 'explanation',
        candidate: targetCand,
        jobTitle: targetJob.title,
        matchPercentage: targetCand.scores?.jobMatch || matchRes.overallMatch || 89,
        strongMatches: matchRes.explainability?.strongMatches || ['React.js', 'Node.js', 'MongoDB', 'REST APIs'],
        missingSkills: matchRes.explainability?.missingSkills || ['AWS Cloud', 'Docker Containerization'],
        evidence: matchRes.explainability?.evidence || [
          '3 MERN full-stack projects verified in candidate portfolio.',
          'Relevant engineering tenure aligned with target requisition.',
          'Academic background in Computer Science matches requirements.'
        ],
        text: `Here is the explainable match score breakdown for ${targetCand.name}:`
      };
    }

    // 2. INTENT: Metric Leaderboard / Highest Score (e.g., "Who has the highest technical score?" / "Highest overall score")
    if (q.includes('highest') || q.includes('top') || q.includes('best') || q.includes('leaderboard')) {
      let metricKey = 'technical';
      let metricLabel = 'Technical Score';

      if (q.includes('behaviour') || q.includes('soft')) {
        metricKey = 'behavioural';
        metricLabel = 'Behavioural Score';
      } else if (q.includes('interview')) {
        metricKey = 'interview';
        metricLabel = 'AI Interview Score';
      } else if (q.includes('overall') || q.includes('iq')) {
        metricKey = 'overall';
        metricLabel = 'Overall IQ Score';
      } else if (q.includes('match')) {
        metricKey = 'jobMatch';
        metricLabel = 'Job Compatibility Match';
      }

      const sorted = [...candidates].sort((a, b) => {
        const valA = metricKey === 'overall' ? (a.overallScore || 88) : (a.scores?.[metricKey] || 85);
        const valB = metricKey === 'overall' ? (b.overallScore || 88) : (b.scores?.[metricKey] || 85);
        return valB - valA;
      });

      const topWinner = sorted[0] || candidates[0];
      const topScore = metricKey === 'overall' ? (topWinner.overallScore || 88) : (topWinner.scores?.[metricKey] || 91);

      return {
        type: 'leaderboard',
        metricLabel,
        winner: topWinner,
        winnerScore: topScore,
        rankedList: sorted.slice(0, 3),
        text: `Identified metric target: ${metricLabel}.\nSorted candidate pool dynamically. ${topWinner.name} holds the highest ${metricLabel} (${topScore}/100).`
      };
    }

    // 3. INTENT: Skill Search (e.g., "Show candidates with React and Node.js" / "Find Python candidates")
    if (q.includes('candidate') || q.includes('show') || q.includes('find') || q.includes('react') || q.includes('node') || q.includes('python')) {
      const extractedSkills = [];
      if (q.includes('react')) extractedSkills.push('React');
      if (q.includes('node')) extractedSkills.push('Node.js');
      if (q.includes('python')) extractedSkills.push('Python');
      if (q.includes('mongo')) extractedSkills.push('MongoDB');
      if (q.includes('typescript')) extractedSkills.push('TypeScript');
      if (q.includes('docker')) extractedSkills.push('Docker');

      const matchedCands = candidates.filter((c) => {
        if (extractedSkills.length === 0) return true;
        const cSkills = (c.skills || []).map((s) => (typeof s === 'string' ? s : s.name).toLowerCase());
        return extractedSkills.every((reqS) => cSkills.some((cs) => cs.includes(reqS.toLowerCase())));
      });

      const displayList = matchedCands.length > 0 ? matchedCands : candidates;

      return {
        type: 'candidateList',
        skillsQueried: extractedSkills.length > 0 ? extractedSkills : ['React', 'Node.js'],
        results: displayList,
        text: `Interpreted intent: Search Candidate Data by Skill Tags [${extractedSkills.length > 0 ? extractedSkills.join(', ') : 'React, Node.js'}]. Found ${displayList.length} matching candidate profiles:`
      };
    }

    // 4. INTENT: Pipeline & Application Status Queries
    if (q.includes('shortlist') || q.includes('app') || q.includes('status') || q.includes('pipeline')) {
      const shortlisted = applications.filter((a) => a.status?.toLowerCase() === 'shortlisted');
      const total = applications.length;

      return {
        type: 'pipeline',
        shortlistedCount: shortlisted.length || 1,
        totalApplications: total || 3,
        shortlistedApps: shortlisted,
        text: `Retrieved central recruitment pipeline data. There are currently ${shortlisted.length || 1} shortlisted candidate(s) out of ${total || 3} total applications.`
      };
    }

    // Default Fallback Intelligent Query Result
    return {
      type: 'candidateList',
      skillsQueried: ['React.js', 'Full Stack'],
      results: candidates.slice(0, 2),
      text: `Interpreted intent for query "${userInput}":\nQueried mock candidate pool. Here are the top matching candidates with relevant engineering credentials:`
    };
  };

  const handleSendMessage = (textToSend) => {
    const promptText = textToSend || query;
    if (!promptText.trim()) return;

    const userMsg = {
      id: `msg_${Date.now()}_u`,
      sender: 'user',
      timestamp: 'Just now',
      type: 'text',
      content: promptText
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    // Simulate intent processing delay
    setTimeout(() => {
      const parsedData = processNaturalLanguageQuery(promptText);

      const assistantMsg = {
        id: `msg_${Date.now()}_a`,
        sender: 'assistant',
        timestamp: 'Just now',
        ...parsedData
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setLoading(false);
    }, 450);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 select-none max-w-5xl mx-auto">
      {/* Top Banner Header */}
      <div className="saas-card p-6 md:p-8 border border-slate-200/90 flex flex-wrap justify-between items-center gap-6 bg-white shadow-sm">
        <div className="space-y-1.5 flex-1 min-w-[280px]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold font-outfit text-slate-950 tracking-tight">
                  Module 17 — AI Recruitment Assistant
                </h1>
                <span className="badge-pill badge-primary text-[10px]">
                  <Sparkles className="w-3 h-3 text-indigo-400" /> Mock Data-Aware Assistant
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Query recruitment data in natural language. Interprets skill searches, calculates metric leaderboards, and generates score explainability.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMessages([messages[0]])}
          className="btn-saas px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-indigo-600" /> Clear Chat History
        </button>
      </div>

      {/* Main Chat Interface */}
      <div className="saas-card border border-slate-200/90 bg-white shadow-sm flex flex-col min-h-[580px] max-h-[720px] rounded-2xl overflow-hidden">
        {/* Chat Messages Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'assistant' && (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-center font-black font-outfit text-xs shadow-md shrink-0">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                </div>
              )}

              <div className={`space-y-3 max-w-2xl ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                {/* Message Text Bubble */}
                <div
                  className={`p-4 rounded-2xl text-xs font-medium leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-slate-950 text-white shadow-sm rounded-tr-none'
                      : 'bg-white text-slate-900 border border-slate-200/90 shadow-sm rounded-tl-none space-y-2'
                  }`}
                >
                  {msg.content?.split('\n').map((line, lIdx) => (
                    <p key={lIdx}>{line}</p>
                  ))}

                  {/* Suggestion Chips inside initial message */}
                  {msg.suggestions && (
                    <div className="pt-2 flex flex-wrap gap-2">
                      {msg.suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleSendMessage(sug)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200/80 font-semibold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-indigo-600" /> {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* STRUCTURED RESPONSE TYPE 1: SKILL SEARCH CANDIDATE CARDS */}
                {msg.type === 'candidateList' && msg.results && (
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <Filter className="w-3.5 h-3.5 text-indigo-600" /> Matching Candidates Found ({msg.results.length})
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {msg.results.map((cand) => (
                        <div key={cand.id} className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-xs font-bold font-outfit text-slate-950">{cand.name}</h4>
                              <p className="text-[10px] text-indigo-600 font-semibold truncate max-w-[160px]">{cand.headline}</p>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                              IQ: {cand.overallScore || 88}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {(cand.skills || []).slice(0, 3).map((sk, skIdx) => (
                              <span key={skIdx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[9px] font-medium">
                                {typeof sk === 'string' ? sk : sk.name}
                              </span>
                            ))}
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px]">
                            <span className="text-emerald-600 font-mono font-bold">Match: {cand.scores?.jobMatch || 89}%</span>
                            {onNavigate && (
                              <button
                                onClick={() => onNavigate('candidates-recruiter')}
                                className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                              >
                                View Profile <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STRUCTURED RESPONSE TYPE 2: METRIC LEADERBOARD CARD */}
                {msg.type === 'leaderboard' && msg.winner && (
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white border border-indigo-500/20 shadow-md space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-400" />
                        <span className="text-xs font-extrabold font-outfit uppercase tracking-wider text-indigo-300">
                          {msg.metricLabel} Winner
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-extrabold uppercase font-outfit">
                        Top Rank #1
                      </span>
                    </div>

                    <div className="flex items-center gap-4 pt-1">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white font-bold font-outfit text-xl border border-white/10">
                        {msg.winner.name.charAt(0)}
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-base font-extrabold font-outfit text-white">{msg.winner.name}</h4>
                        <p className="text-xs text-indigo-200 font-semibold">{msg.winner.headline}</p>
                      </div>
                      <div className="ml-auto text-right">
                        <span className="text-2xl font-black font-outfit text-emerald-400">{msg.winnerScore}</span>
                        <span className="text-[10px] text-slate-300 font-medium block">/ 100 Score</span>
                      </div>
                    </div>

                    {/* Ranked Top List */}
                    <div className="pt-3 border-t border-white/10 space-y-2">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Full Candidate Ranking</span>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        {msg.rankedList.map((c, rIdx) => (
                          <div key={c.id} className="p-2 rounded-xl bg-white/5 border border-white/10">
                            <span className="text-[9px] text-indigo-300 font-bold block">#{rIdx + 1} {c.name.split(' ')[0]}</span>
                            <span className="font-mono font-bold text-white text-xs">{c.scores?.technical || c.overallScore || 88}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* STRUCTURED RESPONSE TYPE 3: EXPLAINABLE SCORE DEEP-DIVE CARD */}
                {msg.type === 'explanation' && msg.candidate && (
                  <div className="p-5 rounded-2xl bg-white border border-indigo-200/90 shadow-sm space-y-4 text-xs">
                    <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="text-sm font-bold font-outfit text-slate-950">{msg.candidate.name} — Match Explanation</h4>
                        <p className="text-[11px] text-indigo-600 font-semibold">Target Job: {msg.jobTitle}</p>
                      </div>
                      <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-black text-sm font-outfit">
                        {msg.matchPercentage}% Match
                      </span>
                    </div>

                    {/* Strong Matches & Missing Skills */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1.5">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase block flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" /> Strong Skill Matches
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {msg.strongMatches.map((s, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-white text-emerald-950 font-bold text-[10px] border border-emerald-200">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100 space-y-1.5">
                        <span className="text-[10px] font-bold text-rose-800 uppercase block">
                          Missing Skill Gaps
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {msg.missingSkills.map((s, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-white text-rose-950 font-bold text-[10px] border border-rose-200">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Evidence Callouts */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Verified Evidence Callouts</span>
                      {msg.evidence.map((ev, evIdx) => (
                        <p key={evIdx} className="text-slate-700 font-medium flex items-center gap-1.5 text-[11px]">
                          <span className="text-indigo-600 font-black">•</span> {ev}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* STRUCTURED RESPONSE TYPE 4: PIPELINE SUMMARY */}
                {msg.type === 'pipeline' && (
                  <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900 font-outfit">Recruitment Pipeline Summary</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {msg.totalApplications} Total Applicants
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-center font-outfit">
                      <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-950">
                        <span className="text-[10px] font-bold text-cyan-700 uppercase block">Shortlisted</span>
                        <span className="text-xl font-black text-cyan-900">{msg.shortlistedCount}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-950">
                        <span className="text-[10px] font-bold text-indigo-700 uppercase block">Total Applications</span>
                        <span className="text-xl font-black text-indigo-900">{msg.totalApplications}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 font-extrabold flex items-center justify-center text-xs shadow-xs shrink-0">
                  U
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center font-bold text-xs">
                <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
              </div>
              <div className="p-3 rounded-2xl bg-white border border-slate-200 text-xs font-semibold text-slate-500 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></div>
                Analyzing recruitment database & interpreting intent...
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Preset Intent Suggestion Bar */}
        <div className="p-3 bg-slate-100/70 border-t border-slate-200/80 flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 px-2">
            Quick Intents:
          </span>
          <button
            onClick={() => handleSendMessage('Show candidates with React and Node.js')}
            className="px-3 py-1 rounded-xl bg-white border border-slate-200/90 text-slate-700 font-semibold hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-900 shrink-0 cursor-pointer transition-all"
          >
            Show React & Node.js candidates
          </button>
          <button
            onClick={() => handleSendMessage('Who has the highest technical score?')}
            className="px-3 py-1 rounded-xl bg-white border border-slate-200/90 text-slate-700 font-semibold hover:bg-purple-50 hover:border-purple-200 hover:text-purple-900 shrink-0 cursor-pointer transition-all"
          >
            Who has highest technical score?
          </button>
          <button
            onClick={() => handleSendMessage('Why does Alex Johnson have 89% match?')}
            className="px-3 py-1 rounded-xl bg-white border border-slate-200/90 text-slate-700 font-semibold hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-900 shrink-0 cursor-pointer transition-all"
          >
            Why does Alex Johnson have 89% match?
          </button>
        </div>

        {/* Input Bar Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-4 bg-white border-t border-slate-100 flex items-center gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Ask AI assistant... e.g. "Show candidates with React", "Who has highest technical score?"'
              className="w-full bg-slate-50 border border-slate-200/90 rounded-2xl pl-11 pr-4 py-3 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 hover:from-slate-900 hover:to-indigo-900 text-white font-bold text-xs flex items-center gap-2 disabled:opacity-40 transition-all shadow-md cursor-pointer shrink-0"
          >
            <Send className="w-3.5 h-3.5 text-indigo-400" /> Ask AI
          </button>
        </form>
      </div>

      {/* Responsible AI Disclaimer Component */}
      <ResponsibleAIDisclaimer />
    </div>
  );
}

export default AIRecruitmentAssistantIQ;
