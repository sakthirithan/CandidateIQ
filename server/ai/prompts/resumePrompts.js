const resumePrompts = {
  extractFullResume: (rawText) => `Analyze the COMPLETE resume document text provided below.
Extract every section and all candidate information without dropping any content.

You MUST extract a JSON object containing TWO top-level keys:
1. "sections": Array containing ALL detected resume sections (Summary, Skills, Work Experience, Education, Projects, Certifications, Publications, Awards, etc.)
2. "candidate": Candidate contact info object

JSON Structure Example:
{
  "sections": [
    {
      "id": "sec_summary",
      "sectionType": "summary",
      "title": "Professional Summary",
      "selected": true,
      "confidence": 0.98,
      "content": "Full summary narrative...",
      "items": [],
      "source": { "pages": [1] }
    },
    {
      "id": "sec_skills",
      "sectionType": "skills",
      "title": "Technical & Core Skills",
      "selected": true,
      "confidence": 0.98,
      "content": null,
      "items": [
        { "category": "Languages", "values": ["JavaScript", "TypeScript", "Python"] },
        { "category": "Frameworks", "values": ["React.js", "Node.js", "Express.js"] },
        { "category": "Databases", "values": ["MongoDB", "Docker", "Git"] }
      ],
      "source": { "pages": [1] }
    },
    {
      "id": "sec_experience",
      "sectionType": "experience",
      "title": "Work Experience",
      "selected": true,
      "confidence": 0.98,
      "content": null,
      "items": [
        {
          "company": "Company Name",
          "position": "Job Title",
          "duration": "2023 - Present",
          "description": "Overview of duties",
          "responsibilities": ["Key achievement 1", "Key achievement 2"],
          "technologies": ["React", "Node.js"]
        }
      ],
      "source": { "pages": [1] }
    },
    {
      "id": "sec_education",
      "sectionType": "education",
      "title": "Education",
      "selected": true,
      "confidence": 0.98,
      "content": null,
      "items": [
        {
          "institution": "University Name",
          "degree": "Degree Name",
          "year": "2024",
          "cgpa": "Grade / CGPA"
        }
      ],
      "source": { "pages": [1] }
    },
    {
      "id": "sec_projects",
      "sectionType": "projects",
      "title": "Projects",
      "selected": true,
      "confidence": 0.98,
      "content": null,
      "items": [
        {
          "name": "Project Name",
          "description": "Project overview",
          "technologies": ["React", "Express", "MongoDB"],
          "url": "https://github.com/example"
        }
      ],
      "source": { "pages": [1] }
    },
    {
      "id": "sec_certifications",
      "sectionType": "certifications",
      "title": "Certifications",
      "selected": true,
      "confidence": 0.98,
      "content": null,
      "items": [
        {
          "name": "Certification Name",
          "issuer": "Issuing Organization",
          "year": "2023"
        }
      ],
      "source": { "pages": [1] }
    },
    {
      "id": "sec_custom_1",
      "sectionType": "custom",
      "title": "Research & Publications / Custom Section",
      "selected": true,
      "confidence": 0.95,
      "content": "Narrative or details for non-standard sections",
      "items": [],
      "source": { "pages": [1] }
    }
  ],
  "candidate": {
    "fullName": "Candidate Full Name",
    "email": "Email Address",
    "phone": "Phone Number",
    "location": "City, Country",
    "headline": "Professional Title / Headline"
  },
  "metadata": {
    "totalSectionsDetected": 7,
    "resumeQualityScore": 88,
    "missingCommonFields": []
  }
}

CRITICAL RULES:
- You MUST populate the "sections" array with EVERY section found in the resume. Do NOT return an empty "sections" array.
- PROJECT EXTRACTION BOUNDARY RULES:
  * Extract EVERY project as an INDEPENDENT object inside the "projects" section items array.
  * Project 1 must NEVER absorb Project 2 or Project 3. Every project MUST have its own name/title, description, about paragraph, and technologies.
  * STOP project extraction when reaching adjacent sections (Education, Experience, Skills, Certifications, Awards).
- Return ONLY valid JSON matching this structure.

Resume Text:
${rawText}
`,

  extractResumeKeywords: (rawText) => `Analyze the candidate's resume content below.
Extract meaningful technical, architectural, and domain keywords SEMANTICALLY from the COMPLETE content.

SEMANTIC EXTRACTION INSTRUCTIONS:
1. Do NOT limit extraction to explicitly labeled "Skills" sections.
2. Extract keywords from:
   - Profile / Summary Paragraphs
   - Project Titles, Descriptions, and About/Explanation Paragraphs
   - Work Experience & Key Responsibilities
   - Technical Skills, Frameworks, Databases, and Tools
3. Include:
   - Core Technologies (e.g. "React", "Node.js", "MongoDB", "Python", "FastAPI")
   - Technical & Architectural Concepts (e.g. "REST API", "Microservices", "Authentication", "Real-Time Communication", "JWT")
   - Domain Concepts & Capabilities (e.g. "Candidate Profiling", "Resume Parsing", "Sentiment Analysis", "Behavioural Analytics", "AI Evaluation")
4. EXCLUDE generic stop words and filler words (e.g. "the", "and", "developed", "using", "project", "application", "built").
5. Only extract concepts that are supported by the actual resume content.

Return ONLY valid JSON matching this exact structure:
{
  "keywords": [
    "React",
    "Node.js",
    "MongoDB",
    "Candidate Profiling",
    "Resume Parsing",
    "REST API",
    "Microservices"
  ]
}

Candidate Resume Text:
${rawText}
`
};

module.exports = resumePrompts;

