import { storageApplications, storageInterviews } from '../storage/storageService';

export const mockApplicationService = {
  getApplications: async () => {
    await new Promise((r) => setTimeout(r, 100));
    return storageApplications.getAll();
  },

  getApplicationsForCandidate: async (candidateId) => {
    await new Promise((r) => setTimeout(r, 100));
    return storageApplications.getByCandidateId(candidateId);
  },

  getCandidateStateForJob: async (candidateId, jobId) => {
    await new Promise((r) => setTimeout(r, 50));
    const app = storageApplications.getByCandidateAndJob(candidateId, jobId);
    if (!app) {
      return {
        isApplied: false,
        applicationId: null,
        appliedAt: null,
        status: null
      };
    }
    return {
      isApplied: true,
      applicationId: app.id,
      appliedAt: app.appliedDate || app.createdAt,
      status: app.status || 'Applied'
    };
  },

  applyForJob: async ({ jobId, candidateId, jobTitle, company, candidateName, candidateEmail, matchPercentage, iqScore, resumeId, candidateProfileSnapshot }) => {
    await new Promise((r) => setTimeout(r, 200));

    // Check duplicate application for candidateId + jobId
    const existing = storageApplications.getByCandidateAndJob(candidateId, jobId);
    if (existing) {
      const err = new Error('You have already applied for this job position.');
      err.code = 'ALREADY_APPLIED';
      err.existingApplication = existing;
      throw err;
    }

    const newApp = {
      id: `app_${Date.now()}`,
      jobId: jobId || 'job_1',
      jobTitle: jobTitle || 'Target Requisition',
      company: company || 'CandidateIQ Enterprise',
      candidateId: candidateId || 'cand_1',
      candidateName: candidateName || 'Alex Johnson',
      candidateEmail: candidateEmail || 'alex@example.com',
      appliedDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      status: 'Applied',
      matchPercentage: matchPercentage || 88,
      iqScore: iqScore || 86,
      resumeId: resumeId || null,
      candidateProfileSnapshot: candidateProfileSnapshot || null,
      timeline: [
        { step: 'Applied', date: new Date().toISOString().split('T')[0], done: true },
        { step: 'AI Resume Screened', date: new Date().toISOString().split('T')[0], done: true },
        { step: 'Shortlisted', date: 'Pending', done: false },
        { step: 'AI Mock Interview', date: 'Pending', done: false },
        { step: 'Final Offer Decision', date: 'Pending', done: false }
      ]
    };
    return storageApplications.saveApplication(newApp);
  },

  updateApplicationStatus: async (appId, status) => {
    await new Promise((r) => setTimeout(r, 150));
    return storageApplications.updateStatus(appId, status);
  },

  // Recruiter Schedule HR or Job Interview for Shortlisted Candidate(s)
  scheduleHRInterview: async ({
    candidateId,
    candidateIds = [],
    candidateName,
    selectedCandidates = [],
    jobId,
    jobTitle,
    company,
    title,
    type = 'HR', // 'HR' or 'FINAL'
    scheduledDate,
    scheduledTime,
    duration = '2 Hours',
    interviewType,
    interviewer,
    instructions,
    additionalDetails,
    meetingLink,
    notes,
    questionBankSnapshot = null,
    evaluationPromptSnapshot = null
  }) => {
    await new Promise((r) => setTimeout(r, 200));
    
    const apps = storageApplications.getAll();
    const primaryCandId = candidateId || (candidateIds.length > 0 ? candidateIds[0] : 'cand_1');
    const app = apps.find(a => a.candidateId === primaryCandId || a.candidateName === candidateName || a.jobId === jobId);

    // Calculate Start Time and End Time ISO
    const dateStr = scheduledDate || new Date().toISOString().split('T')[0];
    const timeStr = scheduledTime || '10:00 AM';
    let [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = (time || '10:00').split(':').map(Number);
    if (modifier) {
      if (modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
      if (modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;
    }
    const start = new Date(dateStr);
    start.setHours(hours || 10, minutes || 0, 0, 0);

    let durMs = 2 * 3600 * 1000;
    if (duration) {
      const numMatch = duration.match(/(\d+)/);
      if (numMatch) {
        const num = parseInt(numMatch[1], 10);
        durMs = duration.toLowerCase().includes('hour') ? num * 3600 * 1000 : num * 60 * 1000;
      }
    }
    const end = new Date(start.getTime() + durMs);

    // Default Question Bank Snapshot if not provided
    const defaultQB = questionBankSnapshot || {
      questionBankId: `qb_${Date.now()}`,
      jobId: jobId || 'job_1',
      questions: [
        {
          questionId: 'q_job_1',
          question: 'Explain how you design resilient distributed caching in high-throughput microservices.',
          type: 'TEXT',
          expectedAnswer: 'Should mention Redis cluster, LRU eviction, cache stampede prevention, and cache-aside or write-through patterns.',
          topic: 'System Architecture'
        },
        {
          questionId: 'q_job_2',
          question: 'Which HTTP status code is most appropriate when a client payload fails validation schema rules?',
          type: 'MCQ',
          options: ['400 Bad Request', '422 Unprocessable Entity', '401 Unauthorized', '500 Internal Server Error'],
          correctOption: '422 Unprocessable Entity',
          expectedAnswer: '422 Unprocessable Entity',
          topic: 'REST API'
        },
        {
          questionId: 'q_job_3',
          question: 'Describe your approach to managing database migrations during zero-downtime blue/green deployments.',
          type: 'VOICE',
          expectedAnswer: 'Explain backward-compatible schema changes (expand/contract pattern), non-blocking index creation, feature flags, and replication sync.',
          topic: 'DevOps & Database'
        }
      ]
    };

    // Default Evaluation Prompt Snapshot
    const defaultPrompt = evaluationPromptSnapshot || {
      promptId: `ep_${Date.now()}`,
      prompt: 'Evaluate candidate responses based on technical correctness, relevance to expected reference answers, clarity, and practical system engineering understanding.'
    };

    const targetCandidateIds = candidateIds.length > 0 ? candidateIds : [primaryCandId];

    const newInterview = {
      id: `${type.toLowerCase()}_int_${Date.now()}`,
      candidateId: primaryCandId,
      candidateIds: targetCandidateIds,
      candidateName: candidateName || 'Alex Johnson',
      selectedCandidates: selectedCandidates.length > 0 ? selectedCandidates : [{ id: primaryCandId, name: candidateName || 'Alex Johnson' }],
      jobId: jobId || 'job_1',
      jobTitle: jobTitle || 'Target Requisition',
      company: company || 'CandidateIQ Enterprise',
      title: title || `${jobTitle || 'Role'} — ${type === 'FINAL' ? 'Job Interview' : 'HR Interview'}`,
      type: type.toUpperCase() === 'FINAL' ? 'FINAL' : 'HR',
      scheduledDate: dateStr,
      scheduledTime: timeStr,
      duration: duration || '2 Hours',
      startTimeISO: start.toISOString(),
      endTimeISO: end.toISOString(),
      interviewType: interviewType || (type === 'FINAL' ? 'Recruiter Job Assessment Round' : 'Technical & HR Evaluation'),
      interviewer: interviewer || 'Recruiter Committee',
      instructions: instructions || 'Please join the virtual interview room within the scheduled window.',
      additionalDetails: additionalDetails || 'Review job requisition responsibilities prior to session.',
      meetingLink: meetingLink || 'https://meet.candidateiq.com/room/default',
      notes: notes || '',
      questionBankSnapshot: defaultQB,
      evaluationPromptSnapshot: defaultPrompt,
      candidateAttempts: [],
      status: 'Scheduled',
      createdAt: new Date().toISOString()
    };

    const saved = storageInterviews.saveInterview(newInterview);

    // Update application status for target candidate(s)
    targetCandidateIds.forEach(cId => {
      const candidateApp = apps.find(a => a.candidateId === cId || a.jobId === jobId);
      if (candidateApp) {
        storageApplications.updateStatus(candidateApp.id, 'Interview');
      }
    });

    return saved;
  },

  // Get HR & Final assigned interviews for candidate
  getHRInterviewsForCandidate: async (candidateId = 'cand_1') => {
    await new Promise((r) => setTimeout(r, 100));
    return storageInterviews.getByCandidateId(candidateId);
  }
};

