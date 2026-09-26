import React, { useState, useEffect, useCallback } from 'react';
import recruiterService from '../../services/recruiter/recruiterService';
import { formatExperience, formatSalary } from '../../utils/formatters';
import {
  Briefcase, Plus, Search, Edit2, Trash2, CheckCircle2,
  X, Users, Play, Lock, Sparkles, MapPin, DollarSign,
  AlertTriangle, RefreshCw, Clock
} from 'lucide-react';

function RecruiterJobManagement() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Form Modal State
  const [activeModal, setActiveModal] = useState(null); // 'create' | 'edit'
  const [selectedJob, setSelectedJob] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    department: 'Engineering',
    location: '',
    employmentType: 'Full-time',
    education: "Bachelor's Degree in CS or related field",
    status: 'published',
    requiredSkills: '',
    preferredSkills: '',
    description: '',
    expMin: 2,
    expMax: 5,
    expUnit: 'years',
    salMin: 400000,
    salMax: 800000,
    salCurrency: 'INR',
    salPeriod: 'year'
  });

  // Confirmation Action Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    actionType: null, // 'create' | 'edit' | 'publish' | 'close' | 'delete'
    pendingPayload: null,
    targetJob: null,
    submitting: false
  });

  // Toast Notification
  const [notification, setNotification] = useState(null);

  const showToast = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await recruiterService.getRecruiterJobs();
      if (res.success && Array.isArray(res.jobs)) {
        setJobs(res.jobs);
      }
    } catch (err) {
      console.error('[Recruiter Jobs] Error fetching jobs from database:', err);
      setError('Failed to load recruiter job postings from database.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Filter Jobs
  const filteredJobs = jobs.filter((j) => {
    const matchesStatus = statusFilter === 'All' || (j.status || '').toLowerCase() === statusFilter.toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      (j.title || '').toLowerCase().includes(query) ||
      (j.department || '').toLowerCase().includes(query) ||
      (j.location || '').toLowerCase().includes(query);

    return matchesStatus && matchesSearch;
  });

  // Form Handlers
  const handleOpenCreateModal = () => {
    setFormData({
      title: '',
      department: 'Engineering',
      location: 'Remote / Hybrid',
      employmentType: 'Full-time',
      education: "Bachelor's Degree in CS or equivalent",
      status: 'published',
      requiredSkills: 'React, Node.js, JavaScript, MongoDB',
      preferredSkills: 'Docker, AWS, Express',
      description: 'We are seeking a skilled engineer to join our team to lead scalable module development, API integration, and AI features.',
      hrEvaluationPrompt: 'Evaluate candidates for this role based on their technical knowledge, project experience, communication, and ability to explain their work.',
      expMin: 2,
      expMax: 5,
      expUnit: 'years',
      salMin: 400000,
      salMax: 800000,
      salCurrency: 'INR',
      salPeriod: 'year'
    });
    setSelectedJob(null);
    setActiveModal('create');
  };

  const handleOpenEditModal = (job) => {
    setSelectedJob(job);
    setFormData({
      title: job.title || '',
      department: job.department || 'Engineering',
      location: job.location || '',
      employmentType: job.employmentType || 'Full-time',
      education: job.education || "Bachelor's Degree",
      status: job.status || 'published',
      requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills.join(', ') : job.requiredSkills || '',
      preferredSkills: Array.isArray(job.preferredSkills) ? job.preferredSkills.join(', ') : job.preferredSkills || '',
      description: job.description || '',
      hrEvaluationPrompt: job.hrEvaluationPrompt || job.evaluation?.hrPrompt || 'Evaluate candidates for this role based on their technical knowledge, project experience, communication, and ability to explain their work.',
      expMin: job.experience?.min !== undefined ? job.experience.min : 2,
      expMax: job.experience?.max !== undefined ? job.experience.max : 5,
      expUnit: job.experience?.unit || 'years',
      salMin: job.salary?.min !== undefined ? job.salary.min : 400000,
      salMax: job.salary?.max !== undefined ? job.salary.max : 800000,
      salCurrency: job.salary?.currency || 'INR',
      salPeriod: job.salary?.period || 'year'
    });
    setActiveModal('edit');
  };

  // Submit Form -> Trigger Confirmation Dialog with Validation
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      showToast('Please fill in job title and description.', 'error');
      return;
    }

    // Frontend Validation
    const expMin = Number(formData.expMin);
    const expMax = Number(formData.expMax);
    if (isNaN(expMin) || expMin < 0) {
      showToast('Minimum experience must be a non-negative number.', 'error');
      return;
    }
    if (isNaN(expMax) || expMax < expMin) {
      showToast('Maximum experience must be greater than or equal to minimum experience.', 'error');
      return;
    }

    const salMin = Number(formData.salMin);
    const salMax = Number(formData.salMax);
    if (isNaN(salMin) || salMin < 0) {
      showToast('Minimum salary must be a non-negative number.', 'error');
      return;
    }
    if (isNaN(salMax) || salMax < salMin) {
      showToast('Maximum salary must be greater than or equal to minimum salary.', 'error');
      return;
    }

    const payload = {
      title: formData.title.trim(),
      department: formData.department.trim(),
      location: formData.location.trim() || 'Remote',
      employmentType: formData.employmentType,
      education: formData.education,
      status: formData.status,
      requiredSkills: formData.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean),
      preferredSkills: formData.preferredSkills.split(',').map((s) => s.trim()).filter(Boolean),
      description: formData.description.trim(),
      hrEvaluationPrompt: (formData.hrEvaluationPrompt || '').trim(),
      experience: {
        min: expMin,
        max: expMax,
        unit: formData.expUnit
      },
      salary: {
        min: salMin,
        max: salMax,
        currency: formData.salCurrency,
        period: formData.salPeriod
      }
    };

    const formattedExpText = formatExperience(payload.experience);
    const formattedSalText = formatSalary(payload.salary);

    if (activeModal === 'create') {
      setConfirmModal({
        isOpen: true,
        title: 'Create Job Requisition?',
        message: `Please confirm job posting details below:`,
        actionType: 'create',
        pendingPayload: payload,
        targetJob: null,
        formattedDetails: {
          title: payload.title,
          experience: formattedExpText,
          salary: formattedSalText,
          location: payload.location
        },
        submitting: false
      });
    } else if (activeModal === 'edit' && selectedJob) {
      setConfirmModal({
        isOpen: true,
        title: 'Save Changes to Job Requisition?',
        message: `Please confirm updated job posting details below:`,
        actionType: 'edit',
        pendingPayload: payload,
        targetJob: selectedJob,
        formattedDetails: {
          title: payload.title,
          experience: formattedExpText,
          salary: formattedSalText,
          location: payload.location
        },
        submitting: false
      });
    }
  };

  // Action Confirmation Handlers
  const handleConfirmAction = async () => {
    setConfirmModal((prev) => ({ ...prev, submitting: true }));

    try {
      if (confirmModal.actionType === 'create') {
        const res = await recruiterService.createJob(confirmModal.pendingPayload);
        if (res.success) {
          showToast(`Job requisition "${res.job.title}" created successfully!`);
          setActiveModal(null);
          fetchJobs();
        }
      } else if (confirmModal.actionType === 'edit' && confirmModal.targetJob) {
        const jobId = confirmModal.targetJob._id || confirmModal.targetJob.id;
        const res = await recruiterService.updateJob(jobId, confirmModal.pendingPayload);
        if (res.success) {
          showToast(`Job requisition updated successfully.`);
          setActiveModal(null);
          fetchJobs();
        }
      } else if (confirmModal.actionType === 'publish' && confirmModal.targetJob) {
        const jobId = confirmModal.targetJob._id || confirmModal.targetJob.id;
        const res = await recruiterService.updateJob(jobId, { status: 'published' });
        if (res.success) {
          showToast(`Job "${confirmModal.targetJob.title}" published! Candidates can now apply.`);
          fetchJobs();
        }
      } else if (confirmModal.actionType === 'close' && confirmModal.targetJob) {
        const jobId = confirmModal.targetJob._id || confirmModal.targetJob.id;
        const res = await recruiterService.updateJob(jobId, { status: 'closed' });
        if (res.success) {
          showToast(`Job requisition closed.`, 'info');
          fetchJobs();
        }
      } else if (confirmModal.actionType === 'delete' && confirmModal.targetJob) {
        const jobId = confirmModal.targetJob._id || confirmModal.targetJob.id;
        const res = await recruiterService.deleteJob(jobId);
        if (res.success) {
          showToast(`Job posting deleted from database.`, 'info');
          fetchJobs();
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed.', 'error');
    } finally {
      setConfirmModal({
        isOpen: false,
        title: '',
        message: '',
        actionType: null,
        pendingPayload: null,
        targetJob: null,
        formattedDetails: null,
        submitting: false
      });
    }
  };

  // High-Impact Trigger Handlers with Mandatory Confirmation Dialogs
  const handlePublishClick = (job) => {
    setConfirmModal({
      isOpen: true,
      title: 'Publish Job Posting',
      message: `Publish "${job.title}"? Candidates will be able to discover and apply for this position.`,
      actionType: 'publish',
      pendingPayload: null,
      targetJob: job,
      submitting: false
    });
  };

  const handleCloseClick = (job) => {
    setConfirmModal({
      isOpen: true,
      title: 'Close Job Requisition',
      message: `Close job posting "${job.title}"? New candidate applications will be disabled.`,
      actionType: 'close',
      pendingPayload: null,
      targetJob: job,
      submitting: false
    });
  };

  const handleDeleteClick = (job) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Job Requisition',
      message: `Permanently delete job "${job.title}" from MongoDB? This action cannot be undone.`,
      actionType: 'delete',
      pendingPayload: null,
      targetJob: job,
      submitting: false
    });
  };

  const getStatusBadge = (status) => {
    const st = (status || 'published').toLowerCase();
    if (st === 'published' || st === 'active') {
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Published
        </span>
      );
    }
    if (st === 'draft') {
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
          <Edit2 className="w-3 h-3 text-amber-600" /> Draft
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
        <Lock className="w-3 h-3 text-slate-400" /> Closed
      </span>
    );
  };

  return (
    <div className="p-6 md:p-8 space-y-8 select-none max-w-7xl mx-auto">
      {/* Top Header Banner */}
      <div className="saas-card p-6 md:p-8 border border-slate-200/90 flex flex-wrap justify-between items-center gap-6 bg-white shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold font-outfit text-slate-950 tracking-tight">
              Recruiter Job Requisitions Desk
            </h2>
            <span className="badge-pill badge-primary text-[10px]">
              <Sparkles className="w-3 h-3 text-indigo-400" /> MongoDB Live
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Create, manage, publish, and close job postings across your recruitment pipeline with database persistence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchJobs}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="btn-primary text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create New Job
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center gap-2.5 shadow-sm animate-fade-in ${
            notification.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-900 font-semibold'
              : notification.type === 'info'
              ? 'bg-slate-900 text-white border-slate-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900 font-medium'
          }`}
        >
          {notification.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          )}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Status Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          {['All', 'published', 'draft', 'closed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {st} ({st === 'All' ? jobs.length : jobs.filter((j) => (j.status || 'published').toLowerCase() === st).length})
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search title, department, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-saas pl-8 w-full text-xs"
          />
        </div>
      </div>

      {/* Job Requisitions Table / Cards */}
      {error ? (
        <div className="p-6 text-center bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-medium space-y-2">
          <AlertTriangle className="w-6 h-6 text-rose-600 mx-auto" />
          <p>{error}</p>
        </div>
      ) : loading ? (
        <div className="py-12 flex justify-center items-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => {
            const isDraft = (job.status || '').toLowerCase() === 'draft';
            const isPublished = (job.status || '').toLowerCase() === 'published';
            const expFormatted = formatExperience(job.experience, job.experienceLevel);
            const salFormatted = formatSalary(job.salary, job.salary);

            return (
              <div
                key={job._id || job.id}
                className="saas-card p-6 border border-slate-200/80 bg-white hover:border-slate-300 transition-all space-y-4 shadow-sm"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-extrabold font-outfit text-slate-950">{job.title}</h3>
                      {getStatusBadge(job.status)}
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500 font-medium pt-0.5">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-indigo-600" /> {job.department || 'Engineering'}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location || 'Remote'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-purple-600" /> {expFormatted}
                      </span>
                      <span className="flex items-center gap-1 font-bold text-emerald-700">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> {salFormatted}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {isDraft && (
                      <button
                        onClick={() => handlePublishClick(job)}
                        className="btn-primary text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" /> Publish
                      </button>
                    )}

                    {isPublished && (
                      <button
                        onClick={() => handleCloseClick(job)}
                        className="btn-secondary text-xs text-rose-600 hover:bg-rose-50 border-rose-200 cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5" /> Close Job
                      </button>
                    )}

                    <button onClick={() => handleOpenEditModal(job)} className="btn-secondary text-xs cursor-pointer">
                      <Edit2 className="w-3.5 h-3.5 text-indigo-600" /> Edit
                    </button>

                    <button
                      onClick={() => handleDeleteClick(job)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                      title="Delete Job"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{job.description}</p>

                <div className="flex flex-wrap gap-4 text-xs pt-1">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Required Skills</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(job.requiredSkills || []).map((sk, idx) => (
                        <span key={idx} className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-900 text-[11px] font-semibold border border-indigo-100">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {job.preferredSkills && job.preferredSkills.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Preferred Skills</span>
                      <div className="flex flex-wrap gap-1.5">
                        {(job.preferredSkills || []).map((sk, idx) => (
                          <span key={idx} className="px-2.5 py-0.5 rounded-lg bg-purple-50 text-purple-900 text-[11px] font-semibold border border-purple-100">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredJobs.length === 0 && (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 text-slate-500 text-xs font-medium">
              No job requisitions found matching current search and filter options.
            </div>
          )}
        </div>
      )}

      {/* CREATE & EDIT JOB MODAL */}
      {activeModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="saas-card p-6 border border-slate-200 w-full max-w-2xl bg-white space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto rounded-2xl animate-scale-up">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold font-outfit text-slate-900">
                {activeModal === 'create' ? 'Create New Job Requisition' : 'Edit Job Requisition'}
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-medium">
              {/* Job Information Header */}
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
                Job Information
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Job Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Frontend React Developer"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-saas w-full bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Department *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Engineering, Product, AI Intelligence"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="input-saas w-full bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chennai, Remote / Hybrid"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="input-saas w-full bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Employment Type</label>
                  <select
                    value={formData.employmentType}
                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                    className="input-saas w-full bg-white font-semibold text-slate-800 cursor-pointer"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="input-saas w-full bg-white font-semibold text-slate-800 cursor-pointer"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              {/* Experience Required Section */}
              <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" /> Experience Required
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold font-mono">
                    Preview: {formatExperience({ min: Number(formData.expMin), max: Number(formData.expMax), unit: formData.expUnit })}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Minimum Experience</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      required
                      placeholder="e.g. 2"
                      value={formData.expMin}
                      onChange={(e) => setFormData({ ...formData, expMin: e.target.value })}
                      className="input-saas w-full bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Maximum Experience</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      required
                      placeholder="e.g. 5"
                      value={formData.expMax}
                      onChange={(e) => setFormData({ ...formData, expMax: e.target.value })}
                      className="input-saas w-full bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Experience Unit</label>
                    <select
                      value={formData.expUnit}
                      onChange={(e) => setFormData({ ...formData, expUnit: e.target.value })}
                      className="input-saas w-full bg-white font-semibold text-slate-800 cursor-pointer"
                    >
                      <option value="years">Years</option>
                      <option value="months">Months</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Salary Section */}
              <div className="p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-200/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Salary Compensation
                  </span>
                  <span className="text-[10px] text-emerald-800 font-bold font-mono">
                    Preview: {formatSalary({ min: Number(formData.salMin), max: Number(formData.salMax), currency: formData.salCurrency, period: formData.salPeriod })}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Minimum Salary</label>
                    <input
                      type="number"
                      min="0"
                      step="10000"
                      required
                      placeholder="e.g. 400000"
                      value={formData.salMin}
                      onChange={(e) => setFormData({ ...formData, salMin: e.target.value })}
                      className="input-saas w-full bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Maximum Salary</label>
                    <input
                      type="number"
                      min="0"
                      step="10000"
                      required
                      placeholder="e.g. 800000"
                      value={formData.salMax}
                      onChange={(e) => setFormData({ ...formData, salMax: e.target.value })}
                      className="input-saas w-full bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Currency</label>
                    <select
                      value={formData.salCurrency}
                      onChange={(e) => setFormData({ ...formData, salCurrency: e.target.value })}
                      className="input-saas w-full bg-white font-semibold text-slate-800 cursor-pointer"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Salary Period</label>
                    <select
                      value={formData.salPeriod}
                      onChange={(e) => setFormData({ ...formData, salPeriod: e.target.value })}
                      className="input-saas w-full bg-white font-semibold text-slate-800 cursor-pointer"
                    >
                      <option value="year">Yearly (LPA)</option>
                      <option value="month">Monthly</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Required Skills (Comma separated)</label>
                <input
                  type="text"
                  required
                  placeholder="React, Node.js, JavaScript, MongoDB"
                  value={formData.requiredSkills}
                  onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                  className="input-saas w-full bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Preferred Skills (Comma separated)</label>
                <input
                  type="text"
                  placeholder="Docker, AWS, Express"
                  value={formData.preferredSkills}
                  onChange={(e) => setFormData({ ...formData, preferredSkills: e.target.value })}
                  className="input-saas w-full bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Job Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detailed description of role responsibilities and requirements..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-saas w-full resize-none bg-white"
                ></textarea>
              </div>

              {/* HR Evaluation Prompt & Context Isolation Banner */}
              <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" /> HR Candidate Evaluation Prompt
                  </span>
                  <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">
                    Actual Interviews Only
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-purple-200/80 text-[11px] text-purple-950 font-medium flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Architectural Isolation Guard:</span> This HR Evaluation Prompt will be used <strong>only during actual recruiter candidate interviews</strong>. It will <strong>never influence candidate mock interviews or mock question generation</strong>.
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">Custom Recruiter HR Evaluation Prompt</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Evaluate candidates for this role based on technical knowledge, project experience, communication, and ability to explain architectural trade-offs."
                    value={formData.hrEvaluationPrompt}
                    onChange={(e) => setFormData({ ...formData, hrEvaluationPrompt: e.target.value })}
                    className="input-saas w-full resize-none bg-white text-xs"
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setActiveModal(null)} className="btn-secondary text-xs px-4 py-2 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs font-bold px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer">
                  {activeModal === 'create' ? 'Continue to Confirmation' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION ACTION MODAL WITH STRUCTURED SUMMARY */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="saas-card p-6 bg-white border border-slate-200 max-w-md w-full rounded-2xl shadow-xl space-y-4 animate-scale-up">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl ${
                  confirmModal.actionType === 'delete' || confirmModal.actionType === 'close'
                    ? 'bg-rose-100 text-rose-600'
                    : 'bg-indigo-100 text-indigo-600'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold font-outfit text-slate-950">{confirmModal.title}</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">{confirmModal.message}</p>

            {/* Structured Summary for Job Creation & Editing */}
            {confirmModal.formattedDetails && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-400 font-medium">Job Title:</span>
                  <span className="font-extrabold text-slate-900 font-outfit">{confirmModal.formattedDetails.title}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-400 font-medium">Experience:</span>
                  <span className="font-bold text-indigo-700">{confirmModal.formattedDetails.experience}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-400 font-medium">Salary:</span>
                  <span className="font-bold text-emerald-700">{confirmModal.formattedDetails.salary}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Location:</span>
                  <span className="font-semibold text-slate-800">{confirmModal.formattedDetails.location}</span>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
              <button
                onClick={() =>
                  setConfirmModal({
                    isOpen: false,
                    title: '',
                    message: '',
                    actionType: null,
                    pendingPayload: null,
                    targetJob: null,
                    formattedDetails: null,
                    submitting: false
                  })
                }
                disabled={confirmModal.submitting}
                className="btn-secondary text-xs px-3.5 py-1.5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={confirmModal.submitting}
                className={`text-xs px-4 py-1.5 rounded-xl font-bold text-white shadow-xs flex items-center gap-1.5 cursor-pointer ${
                  confirmModal.actionType === 'delete' || confirmModal.actionType === 'close'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {confirmModal.submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecruiterJobManagement;
