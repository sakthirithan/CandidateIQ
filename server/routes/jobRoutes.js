const express = require('express');
const router = express.Router();
const { createJob, getJobs, getJobById, applyToJob, getJobApplicants } = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getJobs);
router.get('/:id', getJobById);
router.post('/', protect, authorize('recruiter', 'admin'), createJob);
router.post('/:id/apply', protect, authorize('candidate'), applyToJob);
router.get('/:id/applicants', protect, authorize('recruiter', 'admin'), getJobApplicants);

module.exports = router;
