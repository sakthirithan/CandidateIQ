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
- For any custom / non-standard section (e.g. Research, Publications, Open Source, Leadership, Volunteer, Awards), set sectionType to "custom" or "research" / "publications" and populate title & content or items.
- Return ONLY valid JSON matching this structure.

Resume Text:
${rawText}
`
};

module.exports = resumePrompts;

