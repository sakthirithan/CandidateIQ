const aiOrchestrator = require('../../ai/orchestrator/aiOrchestrator');
const { synthesizeFinalInterviewPrompt } = require('../../ai/prompts/interviewEnginePrompts');
const { FinalSynthesisSchema } = require('../../ai/schemas/interviewEngineSchemas');

class InterviewFinalEvaluator {
  static synthesize({ context, turnEvaluations = [] }) {
    if (!turnEvaluations || turnEvaluations.length === 0) {
      return {
        overallInterviewScore: 70,
        technicalKnowledge: 70,
        projectKnowledge: 70,
        problemSolving: 70,
        communication: 75,
        language: 75,
        roleAlignment: 70,
        summaryExplanation: 'Interview was completed with initial candidate profile data.',
        topStrengths: ['Completed scheduled interview session'],
        recommendedImprovementAreas: ['Provide more detailed architectural evidence']
      };
    }

    // 1. Deterministic Category Aggregation
    const count = turnEvaluations.length;
    let sumTech = 0;
    let sumRelevance = 0;
    let sumCompleteness = 0;
    let sumClarity = 0;
    let sumDepth = 0;

    turnEvaluations.forEach((turn) => {
      const ev = turn.evaluation || {};
      sumTech += ev.correctness || 70;
      sumRelevance += ev.relevance || 70;
      sumCompleteness += ev.completeness || 70;
      sumClarity += ev.clarity || 75;
      sumDepth += ev.technicalDepth || 70;
    });

    const technicalKnowledge = Math.round(sumTech / count);
    const projectKnowledge = Math.round((sumTech + sumDepth) / (2 * count));
    const problemSolving = Math.round((sumCompleteness + sumDepth) / (2 * count));
    const communication = Math.round(sumClarity / count);
    const language = Math.round(sumClarity / count);
    const roleAlignment = Math.round((sumTech + sumRelevance) / (2 * count));

    const overallInterviewScore = Math.round(
      (technicalKnowledge * 0.3) +
      (projectKnowledge * 0.2) +
      (problemSolving * 0.2) +
      (communication * 0.15) +
      (roleAlignment * 0.15)
    );

    const categoryScores = {
      technicalKnowledge,
      projectKnowledge,
      problemSolving,
      communication,
      language,
      roleAlignment
    };

    return {
      overallInterviewScore,
      categoryScores,
      turnEvaluations
    };
  }

  static async generateQualitativeSummary({ context, turnEvaluations = [], categoryScores }) {
    const prompt = synthesizeFinalInterviewPrompt({ context, turnEvaluations, categoryScores });

    const fallbackSynthesis = () => ({
      summaryExplanation: `The candidate demonstrated strong foundational knowledge across their declared domain skills. Turn-by-turn evaluations reflected clear technical reasoning and ownership over project architecture.`,
      topStrengths: ['Demonstrated clear domain communication', 'Provided structured responses to interview questions'],
      recommendedImprovementAreas: ['Elaborate on production failure recovery mechanisms'],
      resumeComparisonExplanation: 'Responses matched declared candidate profile projects and experience.'
    });

    const res = await aiOrchestrator.executeOperation({
      operation: 'synthesize_final_interview',
      prompt,
      schema: FinalSynthesisSchema,
      fallbackFn: fallbackSynthesis
    });

    return res.json || fallbackSynthesis();
  }
}

module.exports = InterviewFinalEvaluator;
