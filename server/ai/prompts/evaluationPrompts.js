/**
 * Response & Unified Evaluation System Prompts
 */

const evaluationPrompts = {
  evaluateTextAnswer: (question, candidateAnswer) => `
Evaluate the candidate's interview response against the target question context.
Question: "${question.question || question.questionText}"
Category: "${question.category || 'technical'}"
Target Skill: "${question.targetSkill || 'General'}"
Candidate Answer: "${candidateAnswer}"

Analyze technical correctness, relevance, completeness, reasoning, clarity, grammar, and vocabulary.

Return ONLY valid JSON:
{
  "score": number (0-100),
  "technicalCorrectness": number (0-100),
  "relevance": number (0-100),
  "completeness": number (0-100),
  "reasoning": number (0-100),
  "clarity": number (0-100),
  "grammar": number (0-100),
  "vocabulary": number (0-100),
  "communicationQuality": number (0-100),
  "feedback": "string",
  "strengths": ["string"],
  "improvements": ["string"]
}
`,

  speechToTextMock: (audioMeta) => `
Process audio metadata and return structured Speech-to-Text transcript envelope.

Return ONLY valid JSON:
{
  "transcript": "string",
  "language": "en",
  "confidence": number (0-1),
  "durationSeconds": number,
  "segments": [
    { "start": number, "end": number, "text": "string" }
  ]
}
`
};

module.exports = evaluationPrompts;
