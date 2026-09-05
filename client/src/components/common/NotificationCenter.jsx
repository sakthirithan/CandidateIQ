import React, { useState } from 'react';
import { Bell, CheckCircle2, Sparkles, AlertCircle, X, Check, Filter } from 'lucide-react';

function NotificationCenter({ isOpen, onClose, userRole }) {
  const [filter, setFilter] = useState('all');

  if (!isOpen) return null;

  const candidateNotifications = [
    { id: 1, type: 'ai', title: 'Resume Analysis Completed', desc: 'Your resume quality score (86/100) and extracted technical skills are updated.', time: '10m ago', unread: true },
    { id: 2, type: 'job', title: 'New Matching Requisition', desc: 'TechNova published "Full Stack MERN Developer" (91% match rating).', time: '1h ago', unread: true },
    { id: 3, type: 'interview', title: 'AI Mock Interview Scorecard', desc: 'Your behavioral interview response analysis and feedback report is ready.', time: '2h ago', unread: false }
  ];

  const recruiterNotifications = [
    { id: 1, type: 'ai', title: 'High-Match Candidate Alert', desc: 'Alex Johnson applied for Full Stack MERN Developer with a 91% AI Match score.', time: '5m ago', unread: true },
    { id: 2, type: 'interview', title: 'Mock Interview Completed', desc: 'John Doe completed AI technical assessment with an 88/100 score.', time: '30m ago', unread: true },
    { id: 3, type: 'system', title: 'Requisition Milestone', desc: 'Full Stack MERN Developer job post reached 25 qualified candidate profiles.', time: '2h ago', unread: false }
  ];

  const baseNotifications = userRole === 'recruiter' ? recruiterNotifications : candidateNotifications;
  const filteredNotifications = filter === 'all' 
    ? baseNotifications 
    : baseNotifications.filter(n => n.type === filter);

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-end z-50 select-none transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white h-full border-l border-slate-200 p-6 space-y-6 shadow-2xl flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold font-outfit text-slate-900 leading-none">Activity Notifications</h3>
                <span className="text-[11px] text-slate-400 font-medium">Real-time platform insights</span>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/70 rounded-xl text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold transition-all ${filter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              All ({baseNotifications.length})
            </button>
            <button
              onClick={() => setFilter('ai')}
              className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold transition-all ${filter === 'ai' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              AI Insights
            </button>
            <button
              onClick={() => setFilter('interview')}
              className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold transition-all ${filter === 'interview' ? 'bg-white text-purple-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Interviews
            </button>
          </div>

          {/* List */}
          <div className="space-y-2.5 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">No notifications for this filter category.</p>
              </div>
            ) : (
              filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    n.unread
                      ? 'bg-gradient-to-r from-indigo-50/50 to-purple-50/30 border-indigo-100 shadow-2xs'
                      : 'bg-slate-50/70 border-slate-200/70 opacity-80'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-1.5">
                      {n.type === 'ai' && <Sparkles className="w-3.5 h-3.5 text-indigo-600" />}
                      {n.type === 'interview' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      {n.type === 'job' && <AlertCircle className="w-3.5 h-3.5 text-blue-600" />}
                      <h4 className="text-xs font-bold text-slate-900 font-outfit">{n.title}</h4>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold">{n.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pl-5">{n.desc}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-3.5 h-3.5" /> Mark All as Read & Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotificationCenter;
