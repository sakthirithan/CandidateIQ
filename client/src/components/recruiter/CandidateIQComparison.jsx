import React, { useState } from 'react';
import { Layers, Sparkles, CheckCircle2, ArrowRightLeft } from 'lucide-react';

function CandidateIQComparison() {
  const candidates = [
    { name: 'Alex Johnson', headline: 'Full Stack MERN Developer', tech: 91, behav: 78, match: 89, exp: 82, int: 86, overall: 86, skills: ['React', 'Node.js', 'MongoDB', 'JS'] },
    { name: 'Sarah Wilson', headline: 'Backend Systems Engineer', tech: 84, behav: 88, match: 79, exp: 85, int: 83, overall: 82, skills: ['Java', 'Spring', 'SQL', 'Docker'] },
    { name: 'John Doe', headline: 'AI & Full Stack Engineer', tech: 92, behav: 81, match: 94, exp: 80, int: 90, overall: 89, skills: ['Python', 'React', 'TensorFlow', 'Node'] }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto select-none">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold font-outfit text-slate-900">Multi-Candidate Comparison Matrix</h2>
          <p className="text-xs text-slate-500">Side-by-side metric comparison across 3 top shortlisted candidates.</p>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="saas-card p-6 border border-slate-200 bg-white space-y-6 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="py-4 px-4 font-bold text-slate-400 uppercase tracking-wider text-left w-48">Metric Dimension</th>
              {candidates.map((c, idx) => (
                <th key={idx} className="py-4 px-4 font-bold text-slate-900 text-center">
                  <div className="space-y-0.5">
                    <span className="text-sm font-outfit text-blue-600 block">{c.name}</span>
                    <span className="text-[10px] text-slate-400 font-medium block">{c.headline}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            <tr>
              <td className="py-3.5 px-4 text-slate-700">Technical Skills Score</td>
              {candidates.map((c, i) => (
                <td key={i} className="py-3.5 px-4 text-center font-mono font-bold text-blue-600">{c.tech} / 100</td>
              ))}
            </tr>

            <tr>
              <td className="py-3.5 px-4 text-slate-700">Behavioural Analytics</td>
              {candidates.map((c, i) => (
                <td key={i} className="py-3.5 px-4 text-center font-mono font-bold text-purple-600">{c.behav} / 100</td>
              ))}
            </tr>

            <tr>
              <td className="py-3.5 px-4 text-slate-700">Job Match Compatibility</td>
              {candidates.map((c, i) => (
                <td key={i} className="py-3.5 px-4 text-center font-mono font-bold text-emerald-600">{c.match}%</td>
              ))}
            </tr>

            <tr>
              <td className="py-3.5 px-4 text-slate-700">Experience Score</td>
              {candidates.map((c, i) => (
                <td key={i} className="py-3.5 px-4 text-center font-mono font-bold text-slate-700">{c.exp} / 100</td>
              ))}
            </tr>

            <tr>
              <td className="py-3.5 px-4 text-slate-700">AI Mock Interview Score</td>
              {candidates.map((c, i) => (
                <td key={i} className="py-3.5 px-4 text-center font-mono font-bold text-amber-600">{c.int} / 100</td>
              ))}
            </tr>

            <tr className="bg-blue-50/60 font-bold">
              <td className="py-4 px-4 text-slate-900">Overall Intelligence Score</td>
              {candidates.map((c, i) => (
                <td key={i} className="py-4 px-4 text-center font-mono text-base font-extrabold text-blue-700">
                  {c.overall} / 100
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Comparison Insights Box */}
      <div className="saas-card p-6 border border-slate-200 space-y-4 bg-white">
        <h3 className="text-base font-bold font-outfit text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" /> Comparison Insights
        </h3>
        <p className="text-xs text-slate-600">
          John Doe holds the highest overall candidate intelligence score (89/100) and direct job match (94%), while Alex Johnson offers strong MERN stack specialization (86/100).
        </p>
      </div>
    </div>
  );
}

export default CandidateIQComparison;
