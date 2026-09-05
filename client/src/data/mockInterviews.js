export const mockInterviews = [
  {
    id: 'int_1',
    candidateId: 'cand_1',
    jobId: 'job_1',
    jobTitle: 'Senior MERN Stack & AI Engineer',
    type: 'Technical & Behavioural',
    completedDate: '2026-09-04',
    overallScore: 86,
    breakdown: {
      technicalDepth: 88,
      problemSolving: 85,
      communication: 82,
      behaviouralEvidence: 89
    },
    evaluations: [
      {
        questionId: 1,
        question: 'Explain how you optimize React component re-renders when managing global state with Context or Redux.',
        candidateResponse: 'I utilize React.memo alongside useMemo and useCallback hooks to maintain stable function references. Additionally, splitting context providers by read/write frequency prevents unnecessary child tree re-renders.',
        score: 92,
        feedback: 'Excellent explanation of reference equality and context splitting techniques.',
        strengths: ['Reference stability', 'Context splitting'],
        improvements: ['Could mention React 19 useActionState compiler optimizations.']
      },
      {
        questionId: 2,
        question: 'Describe a situation where an API service experienced high latency under load and how you diagnosed it.',
        candidateResponse: 'We analyzed APM traces using MongoDB explain() queries and uncovered missing compound index coverage on candidate status queries. Adding targeted indices reduced DB response time from 1.2s to 45ms.',
        score: 85,
        feedback: 'Strong database performance debugging evidence.',
        strengths: ['Empirical query analysis', 'Index optimization'],
        improvements: ['Add details on Redis cache layer fallback strategies.']
      }
    ]
  }
];
