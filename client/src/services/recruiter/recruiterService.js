import api from '../api';

export const recruiterService = {
  // Get aggregated recruiter dashboard metrics
  getDashboardStats: async () => {
    const response = await api.get('/analytics/recruiter-dashboard');
    return response.data;
  },

  // Get recruiter's job postings
  getRecruiterJobs: async () => {
    const response = await api.get('/jobs/recruiter/my-jobs');
    return response.data;
  },

  // Create new job posting
  createJob: async (jobData) => {
    const response = await api.post('/jobs', jobData);
    return response.data;
  },

  // Update existing job posting
  updateJob: async (jobId, jobData) => {
    const response = await api.patch(`/jobs/${jobId}`, jobData);
    return response.data;
  },

  // Delete job posting
  deleteJob: async (jobId) => {
    const response = await api.delete(`/jobs/${jobId}`);
    return response.data;
  },

  // Get applicants for a specific job
  getJobApplicants: async (jobId) => {
    const response = await api.get(`/jobs/${jobId}/applicants`);
    return response.data;
  },

  // Get all applications for recruiter's jobs
  getRecruiterApplications: async () => {
    const response = await api.get('/jobs/recruiter/applications');
    return response.data;
  },

  // Update application status (shortlist, reject, under_review)
  updateApplicationStatus: async (applicationId, status) => {
    const response = await api.patch(`/jobs/applications/${applicationId}/status`, { status });
    return response.data;
  },

  // Schedule HR Interview
  scheduleInterview: async (interviewData) => {
    const response = await api.post('/interviews/schedule', interviewData);
    return response.data;
  },

  // Get recruiter's scheduled interviews
  getRecruiterInterviews: async () => {
    const response = await api.get('/interviews/recruiter');
    return response.data;
  },

  // Get job-specific & application-specific intelligence
  getApplicationIntelligence: async (applicationId) => {
    const response = await api.get(`/analytics/application/${applicationId}`);
    return response.data;
  }
};

export default recruiterService;
