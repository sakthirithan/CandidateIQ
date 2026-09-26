const aiOrchestrator = require('../orchestrator/aiOrchestrator');
const resumePrompts = require('../prompts/resumePrompts');
const { FullResumeExtractionSchema, ResumeKeywordExtractionSchema } = require('../schemas/resumeSchemas');
const fallbackProvider = require('../providers/fallbackProvider');

/**
 * Resume AI Service
 * Handles full document parsing, dynamic section detection, custom section preservation, quality scoring, and keyword extraction.
 */

class ResumeAIService {
  async extractFullResumeIntelligence(rawText) {
    return aiOrchestrator.executeOperation({
      operation: 'resume_parse',
      prompt: resumePrompts.extractFullResume(rawText),
      schema: FullResumeExtractionSchema,
      fallbackFn: () => fallbackProvider.fallbackResume(rawText),
      metadata: { textLength: rawText ? rawText.length : 0 }
    });
  }

  async extractResumeKeywords(rawText) {
    return aiOrchestrator.executeOperation({
      operation: 'resume_keyword_extraction',
      prompt: resumePrompts.extractResumeKeywords(rawText),
      schema: ResumeKeywordExtractionSchema,
      fallbackFn: () => fallbackProvider.fallbackResumeKeywords(rawText),
      metadata: { textLength: rawText ? rawText.length : 0 }
    });
  }

  // Backward compatibility alias
  async extractResumeIntelligence(rawText) {
    return this.extractFullResumeIntelligence(rawText);
  }
}

module.exports = new ResumeAIService();
