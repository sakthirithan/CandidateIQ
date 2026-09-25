const aiOrchestrator = require('../orchestrator/aiOrchestrator');
const jobPrompts = require('../prompts/jobPrompts');
const {
  JobDescriptionAnalysisSchema,
  JobMatchSchema,
  ATSAnalysisSchema
} = require('../schemas/jobSchemas');
const fallbackProvider = require('../providers/fallbackProvider');

/**
 * Job Description Intelligence & Matching AI Service
 */

class JobAIService {
  async analyzeJobDescription(jdText) {
    return aiOrchestrator.executeOperation({
      operation: 'jd_analysis',
      prompt: jobPrompts.analyzeJD(jdText),
      schema: JobDescriptionAnalysisSchema,
      fallbackFn: () => fallbackProvider.fallbackJobAnalysis(jdText),
      metadata: { textLength: jdText ? jdText.length : 0 }
    });
  }

  async matchJob(candidateProfile, jobDescription) {
    return aiOrchestrator.executeOperation({
      operation: 'job_match',
      prompt: jobPrompts.matchJob(candidateProfile, jobDescription),
      schema: JobMatchSchema,
      fallbackFn: () => fallbackProvider.fallbackJobMatch(candidateProfile, jobDescription),
      metadata: { jobId: jobDescription._id || jobDescription.id }
    });
  }

  async analyzeATS(candidateProfile, jobDescription) {
    return aiOrchestrator.executeOperation({
      operation: 'ats_analysis',
      prompt: jobPrompts.atsAnalysis(candidateProfile, jobDescription),
      schema: ATSAnalysisSchema,
      fallbackFn: () => fallbackProvider.fallbackATS(candidateProfile, jobDescription),
      metadata: { jobId: jobDescription._id || jobDescription.id }
    });
  }
}

module.exports = new JobAIService();
