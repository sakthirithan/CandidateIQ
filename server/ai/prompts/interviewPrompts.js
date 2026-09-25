/**
 * Interview Question & MCQ Generation System Prompts
 */

const interviewPrompts = {
  generateMCQ: (topic, difficulty = 'medium', count = 5) => `
Generate ${count} Multiple Choice Questions for topic: "${topic}" at difficulty level: "${difficulty}".

Return ONLY a valid JSON object matching this format:
{
  "questions": [
    {
      "questionId": "mcq_1",
      "question": "Question text here",
      "options": [
        { "id": "A", "text": "Option A" },
        { "id": "B", "text": "Option B" },
        { "id": "C", "text": "Option C" },
        { "id": "D", "text": "Option D" }
      ],
      "correctAnswer": "B",
      "explanation": "Explanation text",
      "difficulty": "${difficulty}",
      "category": "${topic}"
    }
  ]
}
`,

  generateQuestions: (candidateProfile, job, count = 5) => `
Generate ${count} dynamic interview questions tailored to candidate profile and target job.
Candidate Profile: ${JSON.stringify(candidateProfile)}
Job Title: ${job.title || 'Software Engineer'}

Return ONLY a valid JSON object matching this format:
{
  "questions": [
    {
      "id": 1,
      "category": "technical",
      "question": "Question text here",
      "targetSkill": "Software Engineering",
      "evaluationCriteria": "Demonstrates problem solving and domain depth"
    }
  ]
}
`
};

module.exports = interviewPrompts;
