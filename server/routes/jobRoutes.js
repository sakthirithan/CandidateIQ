const express = require('express');
const router = express.Router();
const {
  createJob,
  getJobs,
  getRecruiterJobs,
  getCandidateApplications,
  getJobById,
  updateJob,
  deleteJob,
  applyToJob,
  getJobApplicants,
  getRecruiterApplications,
  updateApplicationStatus,
  saveHREvaluationPrompt,
  getJobKeywords
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getJobs);
router.get('/candidate/my-applications', protect, authorize('candidate'), getCandidateApplications);
router.get('/recruiter/my-jobs', protect, authorize('hr', 'recruiter', 'admin'), getRecruiterJobs);
router.get('/recruiter/applications', protect, authorize('hr', 'recruiter', 'admin'), getRecruiterApplications);
router.get('/:id', getJobById);
router.get('/:id/keywords', getJobKeywords);
router.patch('/:id/hr-prompt', protect, authorize('hr', 'recruiter', 'admin'), saveHREvaluationPrompt);
router.post('/', protect, authorize('hr', 'recruiter', 'admin'), createJob);
router.patch('/:id', protect, authorize('hr', 'recruiter', 'admin'), updateJob);
router.delete('/:id', protect, authorize('hr', 'recruiter', 'admin'), deleteJob);
router.post('/:id/apply', protect, authorize('candidate'), applyToJob);
router.get('/:id/applicants', protect, authorize('hr', 'recruiter', 'admin'), getJobApplicants);
router.patch('/applications/:id/status', protect, authorize('hr', 'recruiter', 'admin'), updateApplicationStatus);

module.exports = router;
