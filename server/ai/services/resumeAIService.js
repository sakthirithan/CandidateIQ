const aiOrchestrator = require('../orchestrator/aiOrchestrator');
const resumePrompts = require('../prompts/resumePrompts');
const { FullResumeExtractionSchema } = require('../schemas/resumeSchemas');
const fallbackProvider = require('../providers/fallbackProvider');

/**
 * Resume AI Service
 * Handles full document parsing, dynamic section detection, custom section preservation, and quality scoring.
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

  // Backward compatibility alias
  async extractResumeIntelligence(rawText) {
    return this.extractFullResumeIntelligence(rawText);
  }
}

module.exports = new ResumeAIService();
