const aiOrchestrator = require('../../../ai/orchestrator/aiOrchestrator');
const progressEmitter = require('./generationProgressEmitter');
const { z } = require('zod');

/**
 * CandidateIQ Multi-Stage Evidence-Based Mock Interview Evaluator
 * 
 * Pipeline:
 * Question-by-Question Loop → Absolute Context Isolation → Answer State Detection 
 * → Evidence Extraction → Validation Gate → Incremental MongoDB Persistence
 */

// Helper to normalize feedback to strictly 20-25 words
function normalizeFeedbackWordCount(feedbackText, answerState = 'answered', defaultType = 'voice') {
  if (!feedbackText || typeof feedbackText !== 'string' || answerState === 'irrelevant') {
    if (answerState === 'irrelevant') {
      return "Your response does not address the requested technical requirements, diagnostic sequence, or technical scenario objectives.";
    }
    if (answerState === 'unusable') {
      return "Your spoken voice response could not be reliably transcribed or evaluated due to audio distortion or missing speech clarity.";
    }
    if (answerState === 'not_answered') {
      return "No usable response was recorded for this question during the interview, so technical reasoning could not be evaluated.";
    }
    if (defaultType === 'voice') {
      return "Your spoken response demonstrated relevant concepts, but adding concrete implementation details and system trade-offs would strengthen the technical explanation.";
    }
    return "Your written explanation addressed the core problem, but stronger justification of database and scalability trade-offs would demonstrate deeper engineering reasoning.";
  }

  // Clean extra spaces
  const cleaned = feedbackText.replace(/\s+/g, ' ').trim();
  const words = cleaned.split(' ');

  if (words.length >= 20 && words.length <= 25) {
    return cleaned;
  }

  if (words.length > 25) {
    let sentenceCut = words.slice(0, 25).join(' ');
    sentenceCut = sentenceCut.replace(/[,;:]$/, '');
    if (!sentenceCut.endsWith('.')) {
      sentenceCut += '.';
    }
    const truncatedWords = sentenceCut.split(' ');
    if (truncatedWords.length >= 20 && truncatedWords.length <= 25) {
      return sentenceCut;
    }
    return words.slice(0, 22).join(' ') + ' for strong engineering depth.';
  }

  const filler = " demonstrating solid engineering reasoning aligned with the role expectations and candidate experience requirements.";
  const combined = (cleaned + filler).split(' ');
  return combined.slice(0, 23).join(' ') + '.';
}

// Generate dynamic question-specific irrelevant feedback (No context leakage across questions!)
function generateIrrelevantFeedback(questionText, topic) {
  const cleanTopic = (topic || '').trim();
  const summary = cleanTopic ? cleanTopic : (questionText ? questionText.slice(0, 40) + '...' : 'technical scenario');
  const text = `Your response does not address the requested ${summary} technical requirements, diagnostic sequence, or expected scenario objectives.`;
  return normalizeFeedbackWordCount(text, 'irrelevant');
}

// Stage 1: Answer State Detection
function detectAnswerState(questionItem) {
  const transcript = (questionItem.transcript || questionItem.answer || questionItem.userAnswer || '').toString().trim();

  // Case 1: Not Answered
  if (!transcript || transcript.length === 0) {
    return { state: 'not_answered', reason: 'No transcript or answer text provided.' };
  }

  // Case 2: Audio/Transcription Unusable
  if (transcript.length < 5 || /^(na|n\/a|none|test|abcd|asdf|1234)$/i.test(transcript)) {
    return { state: 'unusable', reason: 'Answer text is too short or corrupted to reliably evaluate.' };
  }

  // Common dictation noise patterns
  const containsNoisePhrases = /how are you|thank you for your response|voice response not be|transcript must be|testing 1 2 3|hello hello|delta that dance/i.test(transcript);
  if (containsNoisePhrases) {
    return { state: 'irrelevant', reason: 'Spoken transcript contains dictation/UI noise and does not address technical prompt.' };
  }

  // Case 3: Irrelevance & Domain Keyword Overlap Check
  const stopWords = new Set(['explain', 'would', 'how', 'you', 'your', 'design', 'with', 'that', 'this', 'from', 'when', 'what', 'have', 'about', 'could', 'should', 'there', 'their', 'where', 'which', 'using', 'also', 'considering', 'walk', 'through']);
  
  const questionKeywords = (questionItem.question || questionItem.questionText || '')
    .toLowerCase()
    .split(/\W+/)
    .filter(w => w.length > 3 && !stopWords.has(w));

  const topicKeywords = (questionItem.topic || '')
    .toLowerCase()
    .split(/\W+/)
    .filter(w => w.length > 3 && !stopWords.has(w));

  const expectedSkills = (questionItem.expectedSkills || []).map(s => s.toLowerCase());

  const targetTerms = Array.from(new Set([...questionKeywords, ...topicKeywords, ...expectedSkills]));
  const transcriptLower = transcript.toLowerCase();

  let matchCount = 0;
  targetTerms.forEach(term => {
    if (transcriptLower.includes(term)) matchCount++;
  });

  if (targetTerms.length > 0 && matchCount === 0) {
    return { state: 'irrelevant', reason: 'Response has 0 domain keyword overlap with technical question scenario.' };
  }

  if (matchCount > 0 && matchCount < Math.max(2, Math.ceil(targetTerms.length * 0.35))) {
    return { state: 'partial', reason: 'Response addresses part of the question scenario.' };
  }

  return { state: 'answered', reason: 'Response provided with relevant domain concepts.' };
}

// MCQ Deterministic Evaluation (No LLM call)
function evaluateMCQ(mcqItem) {
  const userAns = (mcqItem.userAnswer || mcqItem.answer || '').toString().trim().toUpperCase();
  const correctAns = (mcqItem.correctAnswer || '').toString().trim().toUpperCase();

  const userFirstChar = userAns ? userAns.charAt(0) : '';
  const correctFirstChar = correctAns ? correctAns.charAt(0) : '';

  const isAnswered = Boolean(userAns);
  const isCorrect = isAnswered && (userAns === correctAns || userFirstChar === correctFirstChar);

  return {
    answerState: isAnswered ? 'answered' : 'not_answered',
    isCorrect,
    score: isCorrect ? 10 : 0,
    userAnswer: mcqItem.userAnswer || 'Not Answered',
    correctAnswer: mcqItem.correctAnswer || 'N/A'
  };
}

// Zod Schema for Structured AI Evidence Evaluation Output
const EvidenceEvaluationSchema = z.object({
  answerState: z.enum(['answered', 'partial', 'irrelevant', 'unusable', 'not_answered']).default('answered'),
  relevance: z.object({
    score: z.number().min(0).max(10),
    evidence: z.array(z.string())
  }),
  technicalAccuracy: z.object({
    score: z.number().min(0).max(10),
    evidence: z.array(z.string())
  }),
  reasoning: z.object({
    score: z.number().min(0).max(10),
    evidence: z.array(z.string())
  }),
  communication: z.object({
    score: z.number().min(0).max(10),
    evidence: z.array(z.string())
  }),
  tone: z.object({
    label: z.string().default('neutral'),
    evidence: z.array(z.string()).default([])
  }),
  sentiment: z.object({
    label: z.string().default('neutral'),
    evidence: z.array(z.string()).default([])
  }),
  demonstratedEvidence: z.array(z.string()).default([]),
  missingAreas: z.array(z.string()).default([]),
  behaviouralSignals: z.array(z.object({
    signal: z.string(),
    evidence: z.string()
  })).default([]),
  feedback: z.string()
});

// Stage 3: Evidence Validation Gate & Semantic Leak Protection
function validateEvidenceConsistency(evalData, answerState, candidateAnswerText, questionText, topic = '') {
  const result = {
    relevance: { score: 0, evidence: [] },
    technicalAccuracy: { score: 0, evidence: [] },
    reasoning: { score: 0, evidence: [] },
    communication: { score: 0, evidence: [] },
    tone: { label: 'neutral', evidence: [] },
    sentiment: { label: 'neutral', evidence: [] },
    demonstratedEvidence: [],
    missingAreas: [],
    behaviouralSignals: [],
    feedback: '',
    ...evalData
  };

  result.answerState = answerState;

  // RULE 1: Irrelevant Answer Guard
  if (answerState === 'irrelevant') {
    result.relevance = { score: 1, evidence: ['Response does not address the question scenario.'] };
    result.technicalAccuracy = { score: 1, evidence: ['No technical concepts demonstrated for this question.'] };
    result.reasoning = { score: 1, evidence: ['No diagnostic or technical reasoning demonstrated.'] };
    result.communication = { score: Math.min(3, result.communication?.score || 2), evidence: ['Phrasing provided but off-topic.'] };
    result.demonstratedEvidence = [];
    result.missingAreas = [questionText || topic || 'Required scenario topics'];
    result.behaviouralSignals = [];
    result.tone = { label: 'neutral', evidence: [] };
    result.sentiment = { label: 'neutral', evidence: [] };
    result.feedback = generateIrrelevantFeedback(questionText, topic);
    return result;
  }

  // RULE 2: Unusable Answer Guard
  if (answerState === 'unusable') {
    result.relevance = { score: 0, evidence: [] };
    result.technicalAccuracy = { score: 0, evidence: [] };
    result.reasoning = { score: 0, evidence: [] };
    result.communication = { score: 0, evidence: [] };
    result.demonstratedEvidence = [];
    result.missingAreas = [];
    result.behaviouralSignals = [];
    result.feedback = "Your spoken voice response could not be reliably transcribed or evaluated due to audio distortion or missing speech clarity.";
    return result;
  }

  // RULE 3: Empty Evidence Cap (Scores >= 7 require non-empty demonstratedEvidence)
  if ((!result.demonstratedEvidence || result.demonstratedEvidence.length === 0) && (result.technicalAccuracy?.score || 0) >= 7) {
    result.technicalAccuracy.score = 4;
    result.technicalAccuracy.evidence = ['Limited demonstrated evidence found in answer transcript.'];
  }

  // RULE 4: Generic Praise Sanitization
  if ((result.technicalAccuracy?.score || 0) <= 3 && /technically relevant|clearly structured/i.test(result.feedback)) {
    result.feedback = "Your explanation lacked specific technical depth and trade-offs required for this scenario. Focus on providing concrete architectural implementation steps.";
  }

  result.feedback = normalizeFeedbackWordCount(result.feedback, answerState);
  return result;
}

/**
 * Isolated Question-by-Question AI Evaluator
 * ABSOLUTE CONTEXT ISOLATION: Evaluates ONE question only, with zero previous question context
 */
async function evaluateSingleQuestion({ questionItem, type, resumeData, jobData }) {
  const detection = detectAnswerState(questionItem);
  const textOrTranscript = type === 'voice' 
    ? (questionItem.transcript || questionItem.answer || questionItem.userAnswer || '').toString().trim()
    : (questionItem.userAnswer || questionItem.answer || '').toString().trim();

  // 1. Handle Not Answered
  if (detection.state === 'not_answered') {
    return {
      answerState: 'not_answered',
      relevance: { score: null, evidence: [] },
      technicalAccuracy: { score: null, evidence: [] },
      reasoning: { score: null, evidence: [] },
      communication: { score: null, evidence: [] },
      tone: { label: 'neutral', evidence: [] },
      sentiment: { label: 'neutral', evidence: [] },
      demonstratedEvidence: [],
      missingAreas: [questionItem.question || questionItem.questionText || 'Required prompt'],
      behaviouralSignals: [],
      feedback: `No usable response was recorded for this ${type} question during the interview session.`
    };
  }

  // 2. Handle Unusable
  if (detection.state === 'unusable') {
    return validateEvidenceConsistency({}, 'unusable', textOrTranscript, questionItem.question || questionItem.questionText, questionItem.topic);
  }

  // 3. Handle Irrelevant
  if (detection.state === 'irrelevant') {
    return validateEvidenceConsistency({}, 'irrelevant', textOrTranscript, questionItem.question || questionItem.questionText, questionItem.topic);
  }

  // Sanitize isolated context
  const sanitizedJob = {
    title: jobData?.title || 'Software Engineer',
    skills: (jobData?.requiredSkills || []).slice(0, 6)
  };
  const sanitizedResume = {
    headline: resumeData?.headline || 'Candidate',
    skills: Array.isArray(resumeData?.skills) ? resumeData.skills.slice(0, 6) : []
  };

  // Build ISOLATED prompt for ONLY this question
  const prompt = `You are evaluating ONE interview question only for CandidateIQ.

STRICT CONTRACT:
- You are evaluating ONE question only (${questionItem.questionId}).
- Evaluate ONLY the supplied current question and current candidate response.
- Do NOT reference previous questions.
- Do NOT reference future questions.
- Do NOT reuse previous feedback.
- Do NOT infer candidate performance from other answers.
- The candidate's response is the ONLY evidence of demonstrated performance for this question.
- The question may contain technologies that the candidate never discussed. Those concepts are NOT evidence of candidate knowledge.
- CRITICAL: The "feedback" field MUST BE CONCISELY BETWEEN 20 AND 25 WORDS, SPECIFIC TO THIS QUESTION.

CONTEXT:
TARGET ROLE: ${JSON.stringify(sanitizedJob)}
CANDIDATE PROFILE: ${JSON.stringify(sanitizedResume)}

CURRENT QUESTION ONLY:
Question ID: "${questionItem.questionId}"
Type: "${type}"
Topic: "${questionItem.topic || 'Technical Deep Dive'}"
Difficulty: "${questionItem.difficulty || 'Medium'}"
Expected Skills: ${(questionItem.expectedSkills || []).join(', ')}
Question Text: "${questionItem.question || questionItem.questionText}"

CANDIDATE RESPONSE (RAW EVIDENCE FOR THIS QUESTION ONLY):
"${textOrTranscript}"
${type === 'voice' ? `Voice Performance Signals:
- Duration: ${questionItem.durationSeconds || 0}s
- Word Count: ${questionItem.voiceMetrics?.wordCount || 0}
- Speaking Rate: ${questionItem.voiceMetrics?.wpm || 0} WPM
- Speaking Duration: ${questionItem.voiceMetrics?.speakingDurationSeconds || 0}s
- Silence Duration: ${questionItem.voiceMetrics?.silenceDurationSeconds || 0}s
- Fillers Detected: ${questionItem.voiceMetrics?.fillerCount || 0} (Rate: ${questionItem.voiceMetrics?.fillerRate || 0}%)
- Pauses Recorded: ${questionItem.voiceMetrics?.pauseCount || 0} (Longest Pause: ${questionItem.voiceMetrics?.longestPauseSeconds || 0}s)` : ''}

SCORING GUIDANCE (0 to 10):
0: Unanswered or completely incorrect
1-2: Very limited, irrelevant, or incorrect response
3-4: Limited understanding
5-6: Basic / partially correct answer
7-8: Strong demonstrated understanding with concrete evidence
9-10: Exceptional response with deep architectural evidence

Return JSON matching this schema:
{
  "answerState": "answered" | "partial" | "irrelevant" | "unusable",
  "relevance": { "score": 8, "evidence": ["..."] },
  "technicalAccuracy": { "score": 7, "evidence": ["..."] },
  "reasoning": { "score": 7, "evidence": ["..."] },
  "communication": { "score": 8, "evidence": ["..."] },
  "tone": { "label": "professional", "evidence": ["..."] },
  "sentiment": { "label": "positive", "evidence": ["..."] },
  "demonstratedEvidence": ["..."],
  "missingAreas": ["..."],
  "behaviouralSignals": [
    { "signal": "structured_problem_solving", "evidence": "..." }
  ],
  "feedback": "20-25 words candidate-specific feedback for THIS QUESTION..."
}`;

  const aiRes = await aiOrchestrator.executeOperation({
    operation: `evaluate_${type}_question`,
    prompt,
    schema: EvidenceEvaluationSchema
  });

  const evalData = aiRes.result || aiRes.json;
  if (!evalData) {
    throw new Error(`AI Provider evaluation returned empty response for question ${questionItem.questionId}`);
  }

  return validateEvidenceConsistency(
    evalData, 
    evalData.answerState || detection.state, 
    textOrTranscript, 
    questionItem.question || questionItem.questionText,
    questionItem.topic
  );
}

/**
 * Main Evaluation Orchestrator with Incremental Question-by-Question Persistence
 */
async function evaluateMockInterview(interviewDoc, force = false, progressCallback = null) {
  const mockInterviewId = interviewDoc._id.toString();

  // Prevent concurrent duplicate evaluations unless forced
  if (!force && interviewDoc.evaluation?.status === 'evaluating') {
    return interviewDoc.evaluation;
  }

  // Idempotency: if completed and not forced, return existing evaluation
  if (!force && interviewDoc.evaluation && interviewDoc.evaluation.status === 'completed') {
    return interviewDoc.evaluation;
  }

  // Initialize Evaluation Status Header in Document
  interviewDoc.evaluation = interviewDoc.evaluation || {};
  interviewDoc.evaluation.status = 'evaluating';
  interviewDoc.evaluation.startedAt = interviewDoc.evaluation.startedAt || new Date();

  const mcqQuestions = interviewDoc.mock_interview_questions?.mcq || [];
  const voiceQuestions = interviewDoc.mock_interview_questions?.voice || [];
  const textQuestions = interviewDoc.mock_interview_questions?.text || [];

  const allQuestionItems = [
    ...mcqQuestions.map(q => ({ item: q, type: 'mcq' })),
    ...voiceQuestions.map(q => ({ item: q, type: 'voice' })),
    ...textQuestions.map(q => ({ item: q, type: 'text' }))
  ];

  const totalQuestions = allQuestionItems.length;
  let completedCount = 0;
  let failedCount = 0;

  interviewDoc.evaluation.totalQuestions = totalQuestions;
  interviewDoc.evaluation.completedQuestions = completedCount;
  interviewDoc.evaluation.failedQuestions = failedCount;

  // Save initial evaluating state to MongoDB
  await interviewDoc.save();

  const resumeData = interviewDoc.sourceSnapshot?.resume || {};
  const jobData = interviewDoc.sourceSnapshot?.job || {};

  // QUESTION-BY-QUESTION ITERATIVE EVALUATION LOOP
  for (let idx = 0; idx < allQuestionItems.length; idx++) {
    const { item, type } = allQuestionItems[idx];
    const questionNumber = idx + 1;
    const qId = item.questionId || `q_${questionNumber}`;

    // Skip if already completed and not forced (Resumable evaluation)
    if (!force && item.evaluationStatus === 'completed' && item.evaluation) {
      completedCount++;
      continue;
    }

    // Mark current question as evaluating
    item.evaluationStatus = 'evaluating';
    interviewDoc.evaluation.currentQuestion = questionNumber;
    interviewDoc.evaluation.currentQuestionId = qId;
    interviewDoc.evaluation.currentQuestionType = type;
    interviewDoc.evaluation.currentTopic = item.topic || type.toUpperCase();

    // Emit real-time progress: question_started
    const startPayload = {
      type: 'question_started',
      stage: 'EVALUATING_QUESTION',
      mockInterviewId,
      questionNumber,
      totalQuestions,
      completedQuestions: completedCount,
      questionId: qId,
      questionType: type,
      topic: item.topic || type.toUpperCase(),
      progress: Math.round((completedCount / totalQuestions) * 100)
    };

    if (progressCallback) progressCallback(startPayload);
    progressEmitter.updateProgress(mockInterviewId, startPayload);

    let evalRes = null;
    let evalStatus = 'completed';

    try {
      if (type === 'mcq') {
        evalRes = evaluateMCQ(item);
      } else {
        evalRes = await evaluateSingleQuestion({ questionItem: item, type, resumeData, jobData });
      }
    } catch (err) {
      console.error(`[EVALUATION] Question ${qId} evaluation failed:`, err.message);
      evalStatus = 'failed';
      evalRes = {
        answerState: 'unusable',
        evaluationStatus: 'failed',
        feedback: `Evaluation for this question encountered an error: ${err.message}`
      };
      failedCount++;
    }

    item.evaluationStatus = evalStatus;
    item.evaluation = evalRes;

    if (evalStatus === 'completed') {
      completedCount++;
    }

    // Sync flat questions array for backward compatibility
    if (interviewDoc.questions && interviewDoc.questions.length > 0) {
      const flatMatch = interviewDoc.questions.find((q) => String(q.questionId) === String(qId) || String(q._id) === String(qId));
      if (flatMatch) {
        flatMatch.evaluation = {
          technicalScore: evalRes.technicalAccuracy?.score !== null && evalRes.technicalAccuracy?.score !== undefined ? evalRes.technicalAccuracy.score * 10 : (evalRes.isCorrect ? 100 : 0),
          communicationScore: evalRes.communication?.score !== null && evalRes.communication?.score !== undefined ? evalRes.communication.score * 10 : null,
          problemSolvingScore: evalRes.reasoning?.score !== null && evalRes.reasoning?.score !== undefined ? evalRes.reasoning.score * 10 : null,
          relevanceScore: evalRes.relevance?.score !== null && evalRes.relevance?.score !== undefined ? evalRes.relevance.score * 10 : null,
          feedback: evalRes.feedback || 'Evaluated by CandidateIQ',
          behaviouralEvidence: (evalRes.behaviouralSignals || []).map(s => typeof s === 'string' ? s : s.signal),
          keyStrengths: evalRes.demonstratedEvidence || [],
          areasForImprovement: evalRes.missingAreas || []
        };
      }
    }

    // INCREMENTAL DATABASE PERSISTENCE AFTER EACH QUESTION
    interviewDoc.evaluation.completedQuestions = completedCount;
    interviewDoc.evaluation.failedQuestions = failedCount;
    interviewDoc.markModified('mock_interview_questions');
    interviewDoc.markModified('questions');
    interviewDoc.markModified('evaluation');

    await interviewDoc.save();

    // Emit real-time progress: question_completed
    const completePayload = {
      type: 'question_completed',
      stage: 'QUESTION_COMPLETED',
      mockInterviewId,
      questionNumber,
      totalQuestions,
      completedQuestions: completedCount,
      failedQuestions: failedCount,
      questionId: qId,
      questionType: type,
      status: evalStatus,
      scores: {
        technical: evalRes.technicalAccuracy?.score ?? (evalRes.isCorrect ? 10 : 0),
        communication: evalRes.communication?.score ?? null
      },
      progress: Math.round((completedCount / totalQuestions) * 100)
    };

    if (progressCallback) progressCallback(completePayload);
    progressEmitter.updateProgress(mockInterviewId, completePayload);
  }

  // FINAL AGGREGATION LAST (Derived ONLY from persisted question evaluations)
  const mcqResults = mcqQuestions.map(q => q.evaluation).filter(Boolean);
  const voiceResults = voiceQuestions.map(q => q.evaluation).filter(Boolean);
  const textResults = textQuestions.map(q => q.evaluation).filter(Boolean);

  const answeredMCQs = mcqResults.filter(m => m.answerState === 'answered');
  let totalMcqScore = null;
  if (answeredMCQs.length > 0) {
    const correctCount = answeredMCQs.filter((r) => r.isCorrect).length;
    totalMcqScore = Math.round((correctCount / answeredMCQs.length) * 100);
  }

  let voiceTechSum = 0, voiceCommSum = 0, voiceReasonSum = 0;
  let voiceValidCount = 0;
  voiceResults.forEach((v) => {
    if (v.answerState !== 'not_answered' && v.answerState !== 'unusable' && v.technicalAccuracy?.score !== null && v.technicalAccuracy?.score !== undefined) {
      voiceTechSum += (v.technicalAccuracy?.score || 0) * 10;
      voiceCommSum += (v.communication?.score || 0) * 10;
      voiceReasonSum += (v.reasoning?.score || 0) * 10;
      voiceValidCount++;
    }
  });

  let textTechSum = 0, textCommSum = 0, textReasonSum = 0;
  let textValidCount = 0;
  textResults.forEach((t) => {
    if (t.answerState !== 'not_answered' && t.answerState !== 'unusable' && t.technicalAccuracy?.score !== null && t.technicalAccuracy?.score !== undefined) {
      textTechSum += (t.technicalAccuracy?.score || 0) * 10;
      textCommSum += (t.communication?.score || 0) * 10;
      textReasonSum += (t.reasoning?.score || 0) * 10;
      textValidCount++;
    }
  });

  const techScoresList = [];
  if (totalMcqScore !== null) techScoresList.push(totalMcqScore);
  if (voiceValidCount > 0) techScoresList.push(Math.round(voiceTechSum / voiceValidCount));
  if (textValidCount > 0) techScoresList.push(Math.round(textTechSum / textValidCount));
  const technicalScore = techScoresList.length > 0 ? Math.round(techScoresList.reduce((a, b) => a + b, 0) / techScoresList.length) : null;

  const commScoresList = [];
  if (voiceValidCount > 0) commScoresList.push(Math.round(voiceCommSum / voiceValidCount));
  if (textValidCount > 0) commScoresList.push(Math.round(textCommSum / textValidCount));
  const communicationScore = commScoresList.length > 0 ? Math.round(commScoresList.reduce((a, b) => a + b, 0) / commScoresList.length) : null;

  const reasonScoresList = [];
  if (voiceValidCount > 0) reasonScoresList.push(Math.round(voiceReasonSum / voiceValidCount));
  if (textValidCount > 0) reasonScoresList.push(Math.round(textReasonSum / textValidCount));
  const reasoningScore = reasonScoresList.length > 0 ? Math.round(reasonScoresList.reduce((a, b) => a + b, 0) / reasonScoresList.length) : null;

  const behaviouralScore = (communicationScore !== null && reasoningScore !== null)
    ? Math.round((communicationScore * 0.5) + (reasoningScore * 0.5))
    : (communicationScore ?? reasoningScore ?? null);

  let overallScore = null;
  if (technicalScore !== null) {
    const weights = [];
    weights.push(technicalScore * 0.45);
    if (reasoningScore !== null) weights.push(reasoningScore * 0.25);
    if (communicationScore !== null) weights.push(communicationScore * 0.20);
    if (behaviouralScore !== null) weights.push(behaviouralScore * 0.10);

    const totalWeight = 0.45 + (reasoningScore !== null ? 0.25 : 0) + (communicationScore !== null ? 0.20 : 0) + (behaviouralScore !== null ? 0.10 : 0);
    overallScore = Math.round(weights.reduce((a, b) => a + b, 0) / totalWeight);
  }

  const allStrengths = [];
  const allImprovements = [];
  [...voiceResults, ...textResults].forEach((r) => {
    if (r.demonstratedEvidence) allStrengths.push(...r.demonstratedEvidence);
    if (r.missingAreas) allImprovements.push(...r.missingAreas);
  });

  const uniqueStrengths = Array.from(new Set(allStrengths)).slice(0, 4);
  const uniqueImprovements = Array.from(new Set(allImprovements)).slice(0, 4);

  const overallEvaluation = {
    status: 'completed',
    evaluationVersion: 'mock-review-v2',
    totalQuestions,
    completedQuestions: completedCount,
    failedQuestions: failedCount,
    overallScore,
    technicalScore,
    communicationScore,
    reasoningScore,
    behaviouralScore,
    sentimentSummary: 'Evidence-based analysis of candidate responses.',
    strengths: uniqueStrengths,
    improvements: uniqueImprovements,
    finalFeedback: overallScore !== null
      ? `Candidate scored ${overallScore}/100 based on demonstrated technical evidence across ${completedCount} evaluated question scenarios.`
      : `Evaluation completed based on available response evidence.`,
    evaluatedAt: new Date(),
    startedAt: interviewDoc.evaluation?.startedAt || interviewDoc.createdAt,
    completedAt: new Date()
  };

  interviewDoc.evaluation = overallEvaluation;
  interviewDoc.overallEvaluation = {
    overallInterviewScore: overallScore,
    technicalProficiency: technicalScore,
    behaviouralCompetency: behaviouralScore,
    communicationClarity: communicationScore,
    problemSolvingRating: reasoningScore,
    summaryExplanation: overallEvaluation.finalFeedback,
    topStrengths: uniqueStrengths,
    recommendedImprovementAreas: uniqueImprovements
  };

  interviewDoc.markModified('mock_interview_questions');
  interviewDoc.markModified('questions');
  interviewDoc.markModified('evaluation');
  interviewDoc.markModified('overallEvaluation');

  await interviewDoc.save();

  const finalPayload = {
    type: 'evaluation_completed',
    stage: 'COMPLETED',
    mockInterviewId,
    progress: 100,
    evaluation: overallEvaluation
  };

  if (progressCallback) progressCallback(finalPayload);
  progressEmitter.updateProgress(mockInterviewId, finalPayload);

  return overallEvaluation;
}

module.exports = {
  detectAnswerState,
  evaluateMCQ,
  evaluateSingleQuestion,
  evaluateMockInterview,
  validateEvidenceConsistency,
  normalizeFeedbackWordCount,
  generateIrrelevantFeedback
};
