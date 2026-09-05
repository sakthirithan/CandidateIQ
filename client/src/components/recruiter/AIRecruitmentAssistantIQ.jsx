import React, { useState } from 'react';
import api from '../../services/api';
import { mockAnalyticsService } from '../../services/mockApi/analyticsService';
import { Bot, Send, User, Sparkles, Database } from 'lucide-react';

function AIRecruitmentAssistantIQ() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: 'Hello Sarah! I am your CandidateIQ Recruitment Intelligence Assistant. Try asking:\n- "Show candidates with React and Node.js"\n- "Who has the highest technical interview score?"\n- "Compare Alex Johnson and John Doe"\n- "Which candidates are missing AWS?"'
    }
  ]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userText = query;
    setQuery('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);

    try {
      setLoading(true);
      const res = await api.post('/analytics/ai-assistant', { query: userText });
      setMessages((prev) => [...prev, { sender: 'assistant', text: res.data.answer }]);
    } catch (err) {
      const mockRes = await mockAnalyticsService.queryAssistant(userText);
      setMessages((prev) => [...prev, { sender: 'assistant', text: mockRes.answer }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="saas-card p-6 border border-slate-200 space-y-6 max-w-3xl mx-auto bg-white select-none">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
          <Sparkles className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold font-outfit text-slate-900">Recruitment Intelligence Assistant</h2>
          <p className="text-xs text-slate-500">Query candidate profiles, skills, and match scores in natural language.</p>
        </div>
      </div>

      {/* Messages Window */}
      <div className="space-y-4 min-h-[300px] max-h-[420px] overflow-y-auto p-4 bg-slate-50 rounded-xl border border-slate-200/80">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs shrink-0 font-bold">
                IQ
              </div>
            )}

            <div
              className={`p-3.5 rounded-xl text-xs max-w-md ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white font-medium shadow-xs'
                  : 'bg-white text-slate-800 border border-slate-200 space-y-1 shadow-xs'
              }`}
            >
              {msg.text.split('\n').map((line, lIdx) => (
                <p key={lIdx}>{line}</p>
              ))}

              {/* Embedded Candidate Card Preview */}
              {msg.sender === 'assistant' && idx > 0 && (
                <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] space-y-1">
                  <span className="font-bold text-slate-900 block font-outfit">Candidate Evidence Card: Alex Johnson</span>
                  <span className="text-blue-600 font-semibold block">91% Match • Technical Score: 88/100</span>
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                U
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask AI assistant about candidate scores, skill gaps, or role matches..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 transition-all"
        >
          <Send className="w-3.5 h-3.5" /> Ask AI
        </button>
      </form>
    </div>
  );
}

export default AIRecruitmentAssistantIQ;
