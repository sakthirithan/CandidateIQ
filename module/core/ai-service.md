# Core Module: AI Provider Abstraction

## 1. Overview
Centralized AI Provider service handling Google Gemini 1.5 Flash LLM interactions, prompt formatting, structured JSON output enforcement, and deterministic heuristic fallback rules when API keys are unconfigured.

## 2. Status
✅ IMPLEMENTED

## 3. Implementation Details
- Instantiates `@google/generative-ai` with `GEMINI_API_KEY`.
- `generateJSON(prompt, systemInstruction)` helper enforcing clean JSON responses.
- Structured resume parser (`parseResumeText`).
- Candidate-Job Match analyzer (`analyzeJobMatch`).
- Personalized interview question generator (`generateInterviewQuestions`).
- Interview response evaluator (`evaluateInterviewResponse`).
- Deterministic heuristic fallback implementations for offline key execution.

## 4. Source Files
- [`server/services/aiService.js`](file:///d:/Mini-Project/server/services/aiService.js)
- [`client/src/services/mockApi/interviewService.js`](file:///d:/Mini-Project/client/src/services/mockApi/interviewService.js)
- [`client/src/services/mockApi/matchingService.js`](file:///d:/Mini-Project/client/src/services/mockApi/matchingService.js)
