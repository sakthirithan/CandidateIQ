import { mockJobs } from '../../data/mockJobs';

let jobsStore = [...mockJobs];

export const mockJobService = {
  getJobs: async () => {
    await new Promise((r) => setTimeout(r, 150));
    return [...jobsStore];
  },

  getJobById: async (id) => {
    await new Promise((r) => setTimeout(r, 100));
    return jobsStore.find((j) => j.id === id) || jobsStore[0];
  },

  createJob: async (jobData) => {
    await new Promise((r) => setTimeout(r, 250));
    const newJob = {
      id: `job_${Date.now()}`,
      postedDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      applicantsCount: 0,
      matchPercentage: 85,
      ...jobData
    };
    jobsStore.unshift(newJob);
    return newJob;
  },

  updateJob: async (id, updatedFields) => {
    await new Promise((r) => setTimeout(r, 200));
    jobsStore = jobsStore.map((j) => (j.id === id ? { ...j, ...updatedFields } : j));
    return jobsStore.find((j) => j.id === id);
  },

  deleteJob: async (id) => {
    await new Promise((r) => setTimeout(r, 200));
    jobsStore = jobsStore.filter((j) => j.id !== id);
    return { success: true, id };
  }
};
