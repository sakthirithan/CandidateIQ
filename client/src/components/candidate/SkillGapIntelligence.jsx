import React from 'react';
import { BookOpen, CheckCircle2, AlertTriangle, ArrowRight, Sparkles, Target, Zap, ChevronRight } from 'lucide-react';

function SkillGapIntelligence() {
  const skillMatrix = [
    { skill: 'React.js Frontend Architecture', required: 'Must Have', level: 'Strong Proficiency', score: 94, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    { skill: 'Node.js & Express REST APIs', required: 'Must Have', level: 'Strong Proficiency', score: 88, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    { skill: 'TypeScript Enterprise Patterns', required: 'Preferred', level: 'Moderate Fit', score: 72, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
    { skill: 'Docker Containerization', required: 'Must Have', level: 'Skill Gap Detected', score: 45, color: 'text-rose-700 bg-rose-50 border-rose-200' },
    { skill: 'AWS Cloud Hosting Essentials', required: 'Preferred', level: 'Skill Gap Detected', score: 38, color: 'text-rose-700 bg-rose-50 border-rose-200' }
  ];

  const learningPath = [
    { title: '1. Docker & Containerization Blueprint', why: 'Essential requirement for production container deployments in Full Stack roles.', gap: 'Current estimated score: 45/100.', step: 'Complete Dockerized Node/React environment build.' },
    { title: '2. AWS Cloud Practitioner Hosting', why: 'High-value skill for cloud API hosting and auto-scaling infrastructure.', gap: 'No verified cloud deployment projects found.', step: 'Deploy Node.js microservice to AWS EC2 & S3.' },
    { title: '3. Advanced TypeScript Design Patterns', why: 'Preferred for enterprise frontend codebase scalability.', gap: 'Moderate proficiency (72/100).', step: 'Refactor MERN API service layer to strict TypeScript.' }
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 select-none max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="saas-card p-6 md:p-8 border border-slate-200/90 flex flex-wrap justify-between items-center gap-6 bg-white shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold font-outfit text-slate-950 tracking-tight">Target Role Skill Gap Analytics</h2>
            <span className="badge-pill badge-ai text-[10px]">
              <Sparkles className="w-3 h-3 text-indigo-600" /> AI Comparative Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Target Requisition: <span className="text-slate-900 font-semibold">Full Stack MERN & AI Developer (Requisition #REQ-402)</span></p>
        </div>

        <div className="text-right p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 min-w-[170px]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Role Compatibility</span>
          <span className="text-3xl font-black font-outfit text-emerald-600">91% <span className="text-xs font-normal text-slate-400">Match</span></span>
        </div>
      </div>

      {/* Skill Matrix Table */}
      <div className="saas-card p-6 md:p-8 border border-slate-200/80 space-y-5 bg-white shadow-sm">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Target className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold font-outfit text-slate-950">Role Requirements vs Candidate Skills Matrix</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">5 Evaluated Core Skills</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Target Requirement Skill</th>
                <th className="py-3 px-4">Role Requirement</th>
                <th className="py-3 px-4">Candidate Level Status</th>
                <th className="py-3 px-4 text-right">Proficiency Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {skillMatrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-950 font-outfit">{item.skill}</td>
                  <td className="py-3.5 px-4 text-slate-500 font-medium">{item.required}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${item.color}`}>
                      {item.level}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-950 text-right">{item.score} / 100</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommended Career Preparation Path */}
      <div className="saas-card p-6 md:p-8 border border-slate-200/80 space-y-5 bg-white shadow-sm">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold font-outfit text-slate-950">Recommended Skill Preparation Roadmap</h3>
          </div>
          <span className="badge-pill badge-ai text-[10px]">
            AI Curated Steps
          </span>
        </div>

        <div className="space-y-4">
          {learningPath.map((item, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2 hover:bg-slate-50 transition-colors">
              <h4 className="text-sm font-bold text-slate-950 font-outfit">{item.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed"><span className="font-bold text-slate-800">Why it matters:</span> {item.why}</p>
              <p className="text-xs text-slate-500"><span className="font-bold text-slate-700">Current gap:</span> {item.gap}</p>
              <p className="text-xs text-indigo-600 font-bold flex items-center gap-1 pt-1">
                Suggested Action: {item.step} <ChevronRight className="w-3 h-3 text-indigo-500" />
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SkillGapIntelligence;
