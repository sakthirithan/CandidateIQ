import { mockAnalytics } from '../../data/mockAnalytics';

export const mockAnalyticsService = {
  getOverview: async () => {
    await new Promise((r) => setTimeout(r, 150));
    return { ...mockAnalytics };
  },

  queryAssistant: async (prompt) => {
    await new Promise((r) => setTimeout(r, 350));
    const lower = prompt.toLowerCase();

    if (lower.includes('react') || lower.includes('node')) {
      return {
        answer: 'Candidates with strong React and Node.js expertise:\n1. Alex Johnson — Senior Full Stack MERN (IQ: 88, Tech Score: 91/100, 92% Job Match)\n2. John Doe — AI & Full Stack Lead (IQ: 89, Tech Score: 92/100, 94% Job Match)'
      };
    }

    if (lower.includes('highest') || lower.includes('top candidate')) {
      return {
        answer: 'John Doe holds the highest overall CandidateIQ score (89/100) with a 94% compatibility match for Lead AI Architect roles.'
      };
    }

    if (lower.includes('compare')) {
      return {
        answer: 'Comparison Summary:\n- Alex Johnson excels in MERN frontend architecture & component re-render optimization.\n- John Doe excels in Python AI model orchestration & vector database retrieval workflows.'
      };
    }

    if (lower.includes('aws') || lower.includes('docker') || lower.includes('missing')) {
      return {
        answer: 'Skill Gap Warning:\n- John Doe shows limited evidence for production AWS deployments.\n- Alex Johnson has intermediate Docker container experience (75% confidence).'
      };
    }

    return {
      answer: `AI Intelligence Analysis for "${prompt}":\nBased on current applicant records, candidates demonstrate high technical mastery (avg 88/100) across React, Node.js, and Python. Requisition alignment remains above 86%.`
    };
  }
};
