import { mockInterviews } from '../../data/mockInterviews';

let interviewsStore = [...mockInterviews];
let activeSessions = {};

const getMockQuestions = (type = 'Technical', difficulty = 'Intermediate') => {
  if (type === 'Technical') {
    return [
      {
        questionId: 'q_tech_1',
        category: 'Technical',
        targetSkill: 'React State & Hooks Architecture',
        questionText: `[${difficulty}] How do you architect global state and optimize component re-renders in large-scale React applications?`,
        evaluationCriteria: 'Mentions Context API, Redux/Zustand, useMemo, useCallback, and code-splitting.'
      },
      {
        questionId: 'q_tech_2',
        category: 'Technical',
        targetSkill: 'Node.js Event Loop & Microservices',
        questionText: `[${difficulty}] Explain how Node.js handles asynchronous non-blocking I/O operations and event loop queues.`,
        evaluationCriteria: 'Discusses Event Loop, libuv worker pool, promises, and non-blocking callback queues.'
      },
      {
        questionId: 'q_tech_3',
        category: 'Technical',
        targetSkill: 'Database Performance & Aggregations',
        questionText: `[${difficulty}] How do you design database indexes and optimize slow aggregation queries in high-volume MongoDB/PostgreSQL databases?`,
        evaluationCriteria: 'Covers compound indexes, explain plans, execution stats, and memory limits.'
      }
    ];
  }

  if (type === 'Behavioural') {
    return [
      {
        questionId: 'q_beh_1',
        category: 'Behavioural',
        targetSkill: 'Cross-functional Collaboration',
        questionText: `[${difficulty}] Describe a scenario where you disagreed with a product manager or tech lead on software architecture. How did you resolve it?`,
        evaluationCriteria: 'Uses STAR framework (Situation, Task, Action, Result) with data-backed reasoning.'
      },
      {
        questionId: 'q_beh_2',
        category: 'Behavioural',
        targetSkill: 'Handling Production Outages',
        questionText: `[${difficulty}] Tell me about a time a critical bug was introduced into production. What immediate steps did you take to mitigate and prevent recurrences?`,
        evaluationCriteria: 'Focuses on blameless post-mortems, root cause analysis, and automated CI/CD safeguards.'
      }
    ];
  }

  // Mixed
  return [
    {
      questionId: 'q_mix_1',
      category: 'Technical',
      targetSkill: 'MERN & API Design',
      questionText: `[${difficulty}] How do you structure RESTful API endpoints and error handling middleware in an Express application?`,
      evaluationCriteria: 'Covers REST status codes, central error handlers, and input validation.'
    },
    {
      questionId: 'q_mix_2',
      category: 'Behavioural',
      targetSkill: 'Technical Leadership',
      questionText: `[${difficulty}] How do you mentor junior developers and conduct constructive code reviews?`,
      evaluationCriteria: 'Demonstrates empathy, clear code guidelines, and actionable feedback.'
    },
    {
      questionId: 'q_mix_3',
      category: 'Technical',
      targetSkill: 'System Scaling & Caching',
      questionText: `[${difficulty}] What strategies do you employ for API caching and database load reduction?`,
      evaluationCriteria: 'Mentions Redis, HTTP caching headers, CDN distribution, and query optimization.'
    }
  ];
};

export const mockInterviewService = {
  getInterviews: async () => {
    await new Promise((r) => setTimeout(r, 150));
    return [...interviewsStore];
  },

  startInterviewSession: async ({ targetJobTitle, interviewType, difficulty }) => {
    await new Promise((r) => setTimeout(r, 200));
    const sessionId = `int_sess_${Date.now()}`;
    const newSession = {
      sessionId,
      targetJobTitle: targetJobTitle || 'Senior MERN Stack & AI Engineer',
      interviewType: interviewType || 'Technical',
      difficulty: difficulty || 'Intermediate',
      state: 'In Progress', // 'Not Started' | 'In Progress' | 'Paused' | 'Completed'
      startedAt: new Date().toISOString(),
      answers: [], // Stores { questionId, answer, timestamp, questionType }
      questions: getMockQuestions(interviewType, difficulty)
    };
    activeSessions[sessionId] = newSession;
    return newSession;
  },

  recordAnswer: async (sessionId, { questionId, answer, questionType }) => {
    await new Promise((r) => setTimeout(r, 150));
    const session = activeSessions[sessionId];
    const answerEntry = {
      questionId,
      answer: answer.trim(),
      timestamp: new Date().toISOString(),
      questionType: questionType || session?.interviewType || 'Technical'
    };
    if (session) {
      session.answers.push(answerEntry);
    }
    return answerEntry;
  },

  pauseInterviewSession: async (sessionId) => {
    await new Promise((r) => setTimeout(r, 100));
    if (activeSessions[sessionId]) {
      activeSessions[sessionId].state = 'Paused';
    }
    return activeSessions[sessionId];
  },

  resumeInterviewSession: async (sessionId) => {
    await new Promise((r) => setTimeout(r, 100));
    if (activeSessions[sessionId]) {
      activeSessions[sessionId].state = 'In Progress';
    }
    return activeSessions[sessionId];
  },

  completeInterviewSession: async (sessionId) => {
    await new Promise((r) => setTimeout(r, 250));
    const session = activeSessions[sessionId];
    if (session) {
      session.state = 'Completed';
      session.completedAt = new Date().toISOString();
      session.overallScore = 83;
      session.scores = {
        technical: 86,
        relevance: 88,
        depth: 79,
        problemSolving: 82,
        communication: 78,
        behaviouralEvidence: 85
      };
      session.summary = `Candidate completed ${session.answers.length} evaluation questions for ${session.targetJobTitle} (${session.interviewType} - ${session.difficulty}).`;
      interviewsStore.unshift(session);
    }
    return session;
  },

  evaluateQAPairs: async (qaList = []) => {
    await new Promise((r) => setTimeout(r, 300));

    if (!qaList || qaList.length === 0) {
      return interviewsStore[0];
    }

    // Dynamic scoring calculation based on response quality metrics
    const totalChars = qaList.reduce((acc, curr) => acc + (curr.answer?.length || 0), 0);
    const avgLen = totalChars / (qaList.length || 1);

    const calcTech = Math.min(95, Math.max(65, Math.round(75 + (avgLen > 100 ? 11 : 5))));
    const calcRel = Math.min(96, Math.max(70, Math.round(80 + (qaList.length > 1 ? 8 : 4))));
    const calcDepth = Math.min(92, Math.max(60, Math.round(70 + (avgLen > 150 ? 9 : 4))));
    const calcProb = Math.min(94, Math.max(65, Math.round(74 + (avgLen > 120 ? 8 : 3))));
    const calcComm = Math.min(90, Math.max(60, Math.round(72 + (avgLen > 80 ? 6 : 2))));
    const calcBeh = Math.min(93, Math.max(65, Math.round(78 + (qaList.length > 2 ? 7 : 3))));

    const overallScore = Math.round((calcTech + calcRel + calcDepth + calcProb + calcComm + calcBeh) / 6);

    const questionAnalysis = qaList.map((item, idx) => {
      const qNum = idx + 1;
      const ansLen = item.answer?.length || 0;
      const score = qNum === 1 ? 88 : qNum === 2 ? 72 : Math.min(95, Math.max(65, Math.round(75 + ansLen / 10)));
      
      return {
        questionId: item.questionId || qNum,
        question: item.question || `Question ${qNum}`,
        candidateResponse: item.answer || 'No response recorded',
        score: score,
        strength: score >= 80 ? 'Strong technical understanding and architectural clarity' : 'Good foundational awareness',
        improvement: score < 80 ? 'Explain implementation details more clearly, including edge case handling and metrics' : 'Include more quantitative system metrics in STAR framework'
      };
    });

    const evaluatedReport = {
      id: `eval_${Date.now()}`,
      completedDate: new Date().toISOString().split('T')[0],
      overallScore,
      scores: {
        technical: calcTech,
        relevance: calcRel,
        depth: calcDepth,
        problemSolving: calcProb,
        communication: calcComm,
        behaviouralEvidence: calcBeh
      },
      evaluations: questionAnalysis,
      behaviouralEvidence: [
        {
          category: 'Evidence of Collaboration',
          details: 'Mentions working with product managers, cross-functional code reviews, and pair-programming onboarding sessions.'
        },
        {
          category: 'Evidence of Ownership',
          details: 'Demonstrates accountability for production deployment monitoring, API migration RFCs, and blameless incident post-mortems.'
        },
        {
          category: 'Evidence of Problem Solving',
          details: 'Uses APM trace logs, MongoDB explain execution stats, and targeted indexing strategies to reduce query latency.'
        }
      ]
    };

    return evaluatedReport;
  },

  submitInterview: async (interviewData) => {
    await new Promise((r) => setTimeout(r, 350));
    const newInterview = {
      id: `int_${Date.now()}`,
      completedDate: new Date().toISOString().split('T')[0],
      overallScore: interviewData.overallScore || 83,
      scores: {
        technical: 86,
        relevance: 88,
        depth: 79,
        problemSolving: 82,
        communication: 78,
        behaviouralEvidence: 85
      },
      ...interviewData
    };
    interviewsStore.unshift(newInterview);
    return newInterview;
  }
};

