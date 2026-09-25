const aiOrchestrator = require('../orchestrator/aiOrchestrator');
const interviewPrompts = require('../prompts/interviewPrompts');
const {
  MCQResponseSchema,
  QuestionResponseSchema
} = require('../schemas/interviewSchemas');
const fallbackProvider = require('../providers/fallbackProvider');

/**
 * Interview Question & MCQ Generation AI Service
 */

class InterviewAIService {
  async generateMCQs(topic, difficulty = 'medium', count = 5) {
    const response = await aiOrchestrator.executeOperation({
      operation: 'generate_mcq',
      prompt: interviewPrompts.generateMCQ(topic, difficulty, count),
      schema: MCQResponseSchema,
      fallbackFn: async () => ({ questions: fallbackProvider.fallbackMCQ(topic, difficulty, count) }),
      metadata: { topic, difficulty, count }
    });

    if (response.result && Array.isArray(response.result.questions)) {
      response.result = response.result.questions;
    }
    return response;
  }

  async generateQuestions(candidateProfile, job, count = 5) {
    const response = await aiOrchestrator.executeOperation({
      operation: 'generate_questions',
      prompt: interviewPrompts.generateQuestions(candidateProfile, job, count),
      schema: QuestionResponseSchema,
      fallbackFn: async () => ({ questions: fallbackProvider.fallbackQuestions(candidateProfile, job, count) }),
      metadata: { jobTitle: job ? job.title : 'Software Engineer', count }
    });

    if (response.result && Array.isArray(response.result.questions)) {
      response.result = response.result.questions;
    }
    return response;
  }
}

module.exports = new InterviewAIService();
