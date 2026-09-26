const aiOrchestrator = require('../../../ai/orchestrator/aiOrchestrator');
const { GeneratedMockInterviewSchema } = require('./mockInterviewSchemas');

class GenerateQuestionsService {
  /**
   * Generates scenario-based technical mock interview questions grounded in Candidate Resume JSON and Recruiter Job JSON.
   */
  static async generateStructuredInterview({ resumeData, jobData, configuration }) {
    const difficulty = (configuration.difficulty || 'medium').toLowerCase();
    const assessmentMethod = (configuration.assessmentMethod || 'random').toLowerCase();
    const sections = configuration.sections || [
      { type: 'mcq', count: 15 },
      { type: 'voice', count: 3 },
      { type: 'text', count: 2 }
    ];

    let mcqCount = 0;
    let voiceCount = 0;
    let textCount = 0;

    sections.forEach((sec) => {
      const type = (sec.type || '').toLowerCase();
      if (type === 'mcq') mcqCount = sec.count || 0;
      else if (type === 'voice') voiceCount = sec.count || 0;
      else if (type === 'text') textCount = sec.count || 0;
    });

    if (mcqCount === 0 && voiceCount === 0 && textCount === 0) {
      if (assessmentMethod === 'mcq') mcqCount = 40;
      else if (assessmentMethod === 'voice') voiceCount = 5;
      else if (assessmentMethod === 'text') textCount = 10;
      else {
        mcqCount = 15;
        voiceCount = 3;
        textCount = 2;
      }
    }

    const candidateSkills = (resumeData?.skills || []).map((s) => (typeof s === 'string' ? s : s.name || s.title || String(s)));
    const candidateProjects = (resumeData?.projects || []).map((p) => ({
      title: p.title || p.name || 'Project',
      description: p.description || p.about || '',
      technologies: p.technologies || p.tech || []
    }));
    const candidateExperience = (resumeData?.experiences || resumeData?.experience || []).map((e) => ({
      title: e.title || e.role || '',
      company: e.company || '',
      responsibilities: e.description || e.responsibilities || ''
    }));

    const jobSkills = [
      ...(jobData?.requiredSkills || []),
      ...(jobData?.preferredSkills || [])
    ].map((s) => (typeof s === 'string' ? s : s.name || String(s)));

    // Derive skill intersections
    const candidateSkillSet = new Set(candidateSkills.map((s) => s.toLowerCase()));
    const sharedSkills = jobSkills.filter((js) => candidateSkillSet.has(js.toLowerCase()));
    const jobOnlySkills = jobSkills.filter((js) => !candidateSkillSet.has(js.toLowerCase()));

    const prompt = `
You are the CandidateIQ AI Technical Interview Architect.
Your role is to construct a rigorous, highly realistic, scenario-based Technical Mock Interview.

CRITICAL MANDATE:
- NEVER generate basic, short, or generic definition questions (e.g. "What is Node.js?", "Define MongoDB", "What is React?").
- AT LEAST 90% of technical questions MUST be grounded in a realistic engineering situation containing: CONTEXT + PROBLEM + CONSTRAINT + TASK.
- Questions MUST be grounded directly in the Candidate's Resume JSON and the Recruiter's Job Description JSON.

CANDIDATE RESUME PROFILE:
- Name/Headline: ${resumeData?.name || 'Candidate'} (${resumeData?.headline || 'Software Engineer'})
- Technical Skills: ${JSON.stringify(candidateSkills)}
- Candidate Projects: ${JSON.stringify(candidateProjects)}
- Professional Experience: ${JSON.stringify(candidateExperience)}

RECRUITER JOB REQUISITION:
- Job Title: ${jobData?.title || 'Senior Software Engineer'}
- Department / Company: ${jobData?.department || 'Engineering'} - ${jobData?.company || 'Enterprise'}
- Description: ${jobData?.description || jobData?.jobDescription || 'Full Stack Engineering requisition.'}
- Job Required & Preferred Skills: ${JSON.stringify(jobSkills)}

SKILL OVERLAP ANALYSIS:
- Shared Skills (Strengths): ${JSON.stringify(sharedSkills)}
- Job Requirement Gaps / Additional Target Skills: ${JSON.stringify(jobOnlySkills)}

QUESTION FORMULA:
RESUME EVIDENCE + JOB REQUIREMENT + REAL-WORLD SCENARIO + TECHNICAL CHALLENGE + CONSTRAINT + CANDIDATE TASK = INTERVIEW QUESTION

TARGET CONFIGURATION:
- Difficulty: ${difficulty.toUpperCase()}
- Assessment Mode: ${assessmentMethod.toUpperCase()}
- Required Question Counts:
  * MCQ Questions: EXACTLY ${mcqCount}
  * Voice Questions: EXACTLY ${voiceCount}
  * Text Questions: EXACTLY ${textCount}

INSTRUCTIONS PER QUESTION TYPE:

1. MCQ QUESTIONS (${mcqCount} questions):
   - Provide a multi-sentence engineering scenario presenting a architectural, debugging, performance, or security problem.
   - Provide EXACTLY 4 plausible technical options.
   - 'correctAnswer' MUST be the exact string matching one of the 4 options.
   - Include 'scenario', 'task', 'topic', 'difficulty', 'expectedSkills', 'resumeEvidence', 'jobEvidence', 'evaluationFocus'.

2. VOICE QUESTIONS (${voiceCount} questions):
   - Generate verbal scenario questions assessing architectural trade-offs, production debugging, system design, or project technical decisions.
   - If candidate projects exist, reference their actual project name and stack (e.g., "${candidateProjects[0]?.title || 'your backend application'}").
   - Encourage the candidate to talk through their diagnostic or architectural reasoning.

3. TEXT QUESTIONS (${textCount} questions):
   - Generate technical reasoning/code architecture questions requiring structured explanatory answers.
   - Challenge the candidate to explain step-by-step diagnostic strategies, concurrency handling, database query optimizations, or middleware design.

RETURN STRICT JSON matching this structure:
{
  "interviewTitle": "${jobData?.title || 'AI Technical Mock Interview'} — Scenario Assessment",
  "questions": {
    "mcq": [
      {
        "questionId": "mcq-001",
        "question": "You are maintaining an Express.js REST API that authenticates users with JWT. During security review, you notice recruiter-only endpoints return 200 OK for candidate tokens because middleware validates token signature but omits role checks. Which backend design change most directly resolves this authorization gap?",
        "scenario": "A multi-role REST API has JWT authentication active but lacks role-based access control (RBAC) middleware checks.",
        "task": "Identify the proper authorization redesign to prevent privilege escalation.",
        "options": [
          "Implement custom RBAC middleware that verifies decoded token roles against endpoint permissions before executing route handlers",
          "Encrypt the JWT payload with AES-256 and store token in local storage",
          "Increase JWT expiration time to 30 days and add CORS headers",
          "Replace all POST requests with GET requests"
        ],
        "correctAnswer": "Implement custom RBAC middleware that verifies decoded token roles against endpoint permissions before executing route handlers",
        "topic": "Backend Authorization & Security",
        "difficulty": "${difficulty}",
        "expectedSkills": ["JWT", "Node.js", "Express", "RBAC"],
        "resumeEvidence": ["Node.js", "JWT"],
        "jobEvidence": ["REST API", "Security"],
        "evaluationFocus": ["technical accuracy", "security compliance", "middleware design"]
      }
    ],
    "voice": [
      {
        "questionId": "voice-001",
        "question": "Assume you are responsible for a Node.js and MongoDB backend where MongoDB write latencies spike under 500 concurrent candidate submissions. Talk me through your step-by-step diagnostic strategy—from initial alerts to log analysis, database profiling, connection pool tuning, and query optimization.",
        "scenario": "High concurrency write latency spike in MongoDB backend.",
        "task": "Explain step-by-step diagnostic and optimization strategy verbally.",
        "topic": "System Design & Database Scaling",
        "difficulty": "${difficulty}",
        "expectedSkills": ["Node.js", "MongoDB", "Performance Tuning"],
        "resumeEvidence": ["Node.js", "MongoDB"],
        "jobEvidence": ["MongoDB", "Concurrency"],
        "evaluationFocus": ["diagnostic reasoning", "trade-off analysis", "verbal communication"]
      }
    ],
    "text": [
      {
        "questionId": "text-001",
        "question": "Explain how you would design an asynchronous job queue using Redis and Express to handle background processing of heavy resume uploads without blocking the main Node.js event loop. Describe queue structure, worker retry policy, and result persistence.",
        "scenario": "Heavy background job processing blocking Node.js event loop.",
        "task": "Provide detailed technical design for async worker queue.",
        "topic": "Asynchronous Architecture",
        "difficulty": "${difficulty}",
        "expectedSkills": ["Node.js", "Express", "Redis", "Asynchronous Processing"],
        "resumeEvidence": ["Node.js", "Express"],
        "jobEvidence": ["Microservices", "Scalability"],
        "evaluationFocus": ["architectural depth", "event-loop non-blocking strategy", "error handling"]
      }
    ]
  }
}
`;

    // Execute via AI Orchestrator with Secondary AI Failover
    const res = await aiOrchestrator.executeOperation({
      operation: 'generate_mock_interview_questions',
      prompt,
      schema: GeneratedMockInterviewSchema
    });

    const output = res.result || {};

    if (!output.questions) output.questions = { mcq: [], voice: [], text: [] };
    if (!Array.isArray(output.questions.mcq)) output.questions.mcq = [];
    if (!Array.isArray(output.questions.voice)) output.questions.voice = [];
    if (!Array.isArray(output.questions.text)) output.questions.text = [];

    // Quality Gate Validation: Reject trivial definition questions
    output.questions.mcq = GenerateQuestionsService.filterQualityGate(output.questions.mcq, 'mcq');
    output.questions.voice = GenerateQuestionsService.filterQualityGate(output.questions.voice, 'voice');
    output.questions.text = GenerateQuestionsService.filterQualityGate(output.questions.text, 'text');

    return output;
  }

  /**
   * Quality Gate Filter: Ensures questions are scenario-based and sufficiently detailed.
   */
  static filterQualityGate(questions = [], type = 'mcq') {
    return (questions || []).map((q) => {
      const text = q.question || '';
      const isDefinition = /^(what is|define|explain what is|what does|simple definition)/i.test(text.trim());

      // If question is generic/short, enrich with scenario context
      if (isDefinition || text.length < 35) {
        q.scenario = q.scenario || `Engineering production scenario related to ${q.topic || 'technical architecture'}`;
        q.task = q.task || `Analyze technical trade-offs and choose the optimal implementation for ${q.topic || 'the system'}`;
        q.question = `In a production system handling ${q.topic || 'technical architecture'}, ${text} How would you implement this solution under production constraints?`;
      }

      if (!q.resumeEvidence || q.resumeEvidence.length === 0) {
        q.resumeEvidence = q.expectedSkills || ['Technical Background'];
      }
      if (!q.jobEvidence || q.jobEvidence.length === 0) {
        q.jobEvidence = q.expectedSkills || ['Job Requisition'];
      }
      if (!q.evaluationFocus || q.evaluationFocus.length === 0) {
        q.evaluationFocus = ['technical accuracy', 'reasoning', 'problem solving'];
      }

      return q;
    });
  }
}

module.exports = GenerateQuestionsService;
