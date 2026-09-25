/**
 * Job Description Intelligence & Matching Prompts
 */

const jobPrompts = {
  analyzeJD: (jobDescriptionText) => `
Analyze the provided Job Description text and extract deep, structured job intelligence.

Return ONLY valid JSON:
{
  "title": "string",
  "company": "string",
  "department": "string",
  "seniority": "Junior" | "Mid-Level" | "Senior" | "Lead",
  "requiredSkills": ["string"],
  "preferredSkills": ["string"],
  "technicalSkills": ["string"],
  "softSkills": ["string"],
  "experienceRequirements": {
    "minYears": number,
    "maxYears": number,
    "description": "string"
  },
  "educationRequirements": ["string"],
  "responsibilities": ["string"],
  "keywords": ["string"],
  "technologies": ["string"],
  "interviewTopics": ["string"]
}

JOB DESCRIPTION TEXT:
"""
${jobDescriptionText}
"""
`,

  matchJob: (candidateProfile, job) => `
Compare candidate profile against job description requirements.
Candidate Profile: ${JSON.stringify(candidateProfile)}
Job Posting: ${JSON.stringify(job)}

Return ONLY valid JSON:
{
  "overallMatch": number (0-100),
  "technicalMatch": number (0-100),
  "experienceMatch": number (0-100),
  "educationMatch": number (0-100),
  "projectRelevance": number (0-100),
  "strongMatches": ["string"],
  "missingSkills": ["string"],
  "requirementGaps": ["string"],
  "areasRequiringValidation": ["string"],
  "explanation": "string",
  "recommendation": "string"
}
`,

  atsAnalysis: (candidateProfile, job) => `
Perform automated applicant tracking system (ATS) scan on candidate profile against target job.
Candidate Profile: ${JSON.stringify(candidateProfile)}
Job Posting: ${JSON.stringify(job)}

Return ONLY valid JSON:
{
  "overallScore": number (0-100),
  "breakdown": {
    "skillMatch": number (0-100),
    "experienceMatch": number (0-100),
    "educationMatch": number (0-100),
    "keywordMatch": number (0-100),
    "projectRelevance": number (0-100)
  },
  "matchedRequirements": ["string"],
  "missingRequirements": ["string"],
  "recommendations": ["string"],
  "explanation": "string"
}
`
};

module.exports = jobPrompts;
