import { mockApplications } from '../../data/mockApplications';

let applicationsStore = [...mockApplications];

export const mockApplicationService = {
  getApplications: async () => {
    await new Promise((r) => setTimeout(r, 150));
    return [...applicationsStore];
  },

  applyForJob: async ({ jobId, candidateId, jobTitle, company, candidateName, candidateEmail, matchPercentage, iqScore }) => {
    await new Promise((r) => setTimeout(r, 300));
    const newApp = {
      id: `app_${Date.now()}`,
      jobId,
      jobTitle,
      company,
      candidateId,
      candidateName,
      candidateEmail,
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'Applied',
      matchPercentage: matchPercentage || 88,
      iqScore: iqScore || 86,
      timeline: [
        { step: 'Applied', date: new Date().toISOString().split('T')[0], done: true },
        { step: 'AI Resume Screened', date: new Date().toISOString().split('T')[0], done: true },
        { step: 'Shortlisted', date: 'Pending', done: false },
        { step: 'AI Mock Interview', date: 'Pending', done: false },
        { step: 'Final Offer Decision', date: 'Pending', done: false }
      ]
    };
    applicationsStore.unshift(newApp);
    return newApp;
  },

  updateApplicationStatus: async (appId, status) => {
    await new Promise((r) => setTimeout(r, 200));
    applicationsStore = applicationsStore.map((app) => {
      if (app.id === appId) {
        const updatedTimeline = app.timeline.map((item) => {
          if (item.step.toLowerCase().includes(status.toLowerCase())) {
            return { ...item, date: new Date().toISOString().split('T')[0], done: true };
          }
          return item;
        });
        return { ...app, status, timeline: updatedTimeline };
      }
      return app;
    });
    return applicationsStore.find((a) => a.id === appId);
  }
};
