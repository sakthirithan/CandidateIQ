const { z } = require('zod');

/**
 * Zod Schemas for Dynamic Multi-Section Resume Intelligence
 */

const ResumeSectionItemSchema = z.object({
  category: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  organization: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  institution: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  duration: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  year: z.string().optional().nullable(),
  cgpa: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  responsibilities: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  values: z.array(z.string()).default([]),
  url: z.string().optional().nullable()
});

const DynamicResumeSectionSchema = z.object({
  id: z.string().default(`sec_${Date.now()}`),
  sectionType: z.enum([
    'personal_info', 'summary', 'skills', 'experience', 'education', 
    'projects', 'certifications', 'achievements', 'languages', 
    'research', 'publications', 'volunteer', 'leadership', 'custom'
  ]).default('custom'),
  title: z.string().default('Resume Section'),
  selected: z.boolean().default(true),
  confidence: z.number().min(0).max(1).default(0.95),
  content: z.string().optional().nullable(),
  items: z.array(ResumeSectionItemSchema).default([]),
  source: z.object({
    pages: z.array(z.number()).default([1])
  }).default({ pages: [1] })
});

const FullResumeExtractionSchema = z.object({
  candidate: z.object({
    fullName: z.string().default('Candidate Name'),
    email: z.string().default(''),
    phone: z.string().default(''),
    location: z.string().default(''),
    headline: z.string().default('Software Professional')
  }).default({ fullName: 'Candidate Name', email: '', phone: '', location: '', headline: 'Software Professional' }),
  sections: z.array(DynamicResumeSectionSchema).default([]),
  metadata: z.object({
    totalSectionsDetected: z.number().default(0),
    resumeQualityScore: z.number().min(0).max(100).default(80),
    missingCommonFields: z.array(z.string()).default([])
  }).default({ totalSectionsDetected: 0, resumeQualityScore: 80, missingCommonFields: [] })
});

module.exports = {
  ResumeSectionItemSchema,
  DynamicResumeSectionSchema,
  FullResumeExtractionSchema
};
