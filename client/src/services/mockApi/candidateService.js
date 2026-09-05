import { mockCandidates } from '../../data/mockCandidates';

let candidateStore = [...mockCandidates];

export const mockCandidateService = {
  getCandidates: async () => {
    await new Promise((r) => setTimeout(r, 150));
    return [...candidateStore];
  },

  getCandidateById: async (id) => {
    await new Promise((r) => setTimeout(r, 100));
    return candidateStore.find((c) => c.id === id) || candidateStore[0];
  },

  updateCandidate: async (id, updatedData) => {
    await new Promise((r) => setTimeout(r, 200));
    candidateStore = candidateStore.map((c) =>
      c.id === id ? { ...c, ...updatedData } : c
    );
    return candidateStore.find((c) => c.id === id);
  },

  addSkill: async (candidateId, newSkill) => {
    await new Promise((r) => setTimeout(r, 150));
    const cand = candidateStore.find((c) => c.id === candidateId);
    if (cand) {
      cand.skills.push(newSkill);
    }
    return cand;
  },

  deleteSkill: async (candidateId, skillName) => {
    await new Promise((r) => setTimeout(r, 150));
    const cand = candidateStore.find((c) => c.id === candidateId);
    if (cand) {
      cand.skills = cand.skills.filter((s) => s.name !== skillName);
    }
    return cand;
  },

  addExperience: async (candidateId, exp) => {
    await new Promise((r) => setTimeout(r, 150));
    const cand = candidateStore.find((c) => c.id === candidateId);
    if (cand) {
      cand.experiences.push({ ...exp, id: `exp_${Date.now()}` });
    }
    return cand;
  },

  deleteExperience: async (candidateId, expId) => {
    await new Promise((r) => setTimeout(r, 150));
    const cand = candidateStore.find((c) => c.id === candidateId);
    if (cand) {
      cand.experiences = cand.experiences.filter((e) => e.id !== expId);
    }
    return cand;
  }
};
