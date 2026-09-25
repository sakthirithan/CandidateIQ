const aiOrchestrator = require('../orchestrator/aiOrchestrator');
const evaluationPrompts = require('../prompts/evaluationPrompts');
const {
  TextAnswerEvaluationSchema,
  SpeechToTextSchema,
  UnifiedInterviewEvaluationSchema
} = require('../schemas/evaluationSchemas');
const fallbackProvider = require('../providers/fallbackProvider');

/**
 * Text Evaluation, Speech-to-Text, and Unified Evaluation AI Service
 */

class EvaluationAIService {
  async evaluateTextAnswer(question, answer) {
    return aiOrchestrator.executeOperation({
      operation: 'evaluate_text_answer',
      prompt: evaluationPrompts.evaluateTextAnswer(question, answer),
      schema: TextAnswerEvaluationSchema,
      fallbackFn: () => fallbackProvider.fallbackTextEval(question, answer),
      metadata: { questionCategory: question ? question.category : 'technical' }
    });
  }

  async processSpeechToText(audioMeta = {}) {
    return aiOrchestrator.executeOperation({
      operation: 'speech_to_text',
      prompt: null, // Audio processing handled cleanly with envelope fallback
      schema: SpeechToTextSchema,
      fallbackFn: () => fallbackProvider.fallbackSTT(audioMeta),
      metadata: { durationSeconds: audioMeta.durationSeconds || 0 }
    });
  }

  async generateUnifiedEvaluation(evaluations = []) {
    return aiOrchestrator.executeOperation({
      operation: 'interview_evaluation',
      prompt: null,
      schema: UnifiedInterviewEvaluationSchema,
      fallbackFn: () => fallbackProvider.fallbackUnified(evaluations),
      metadata: { evaluationCount: evaluations.length }
    });
  }
}

module.exports = new EvaluationAIService();
