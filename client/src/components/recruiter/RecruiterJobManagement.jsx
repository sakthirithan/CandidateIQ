import React, { useState, useEffect } from 'react';
import { mockJobService } from '../../services/mockApi/jobService';
import {
  Briefcase, Plus, Search, Filter, Edit2, Trash2, CheckCircle2,
  AlertCircle, X, ExternalLink, Users, Eye, Play, PauseCircle, Lock, Sparkles, MapPin, DollarSign, GraduationCap
} from 'lucide-react';

function RecruiterJobManagement() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [activeModal, setActiveModal] = useState(null); // 'create' | 'edit' | 'review_publish' | 'confirm_close'
  const [selectedJob, setSelectedJob] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    department: 'Engineering',
    location: '',
    employmentType: 'Full-Time',
    experience: '2-4 Years',
    education: 'B.S. in Computer Science',
    salary: '$120,000 - $150,000',
    status: 'Published',
    requiredSkills: '',
    preferredSkills: '',
    description: ''
  });

  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await mockJobService.getJobs();
      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Filter Jobs
  const filteredJobs = jobs.filter((j) => {
    const matchesStatus = statusFilter === 'All' || j.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch =
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // 1. Create Job Handlers
  const handleOpenCreateModal = () => {
    setFormData({
      title: '',
      department: 'Engineering',
      location: 'San Francisco, CA / Remote',
      employmentType: 'Full-Time',
      experience: '3+ Years',
      education: 'B.S. in Computer Science or equivalent',
      salary: '$130,000 - $160,000',
      status: 'Published',
      requiredSkills: 'React.js, Node.js, TypeScript, REST APIs',
      preferredSkills: 'Docker, AWS, Gemini API, GraphQL',
      description: 'We are seeking an ambitious software engineer to develop core SaaS backend logic, optimize UI performance, and construct production API microservices.'
    });
    setSelectedJob(null);
    setActiveModal('create');
  };

  // 2. Edit Job Handlers
  const handleOpenEditModal = (job) => {
    setSelectedJob(job);
    setFormData({
      title: job.title || '',
      department: job.department || 'Engineering',
      location: job.location || '',
      employmentType: job.type || job.employmentType || 'Full-Time',
      experience: job.experience || '3+ Years',
      education: job.education || 'B.S. in CS',
      salary: job.salary || '',
      status: job.status || 'Published',
      requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills.join(', ') : job.requiredSkills || '',
      preferredSkills: Array.isArray(job.preferredSkills) ? job.preferredSkills.join(', ') : job.preferredSkills || '',
      description: job.description || ''
    });
    setActiveModal('edit');
  };

  // 3. Save Form (Create & Update)
  const handleSaveJob = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) return;

    const payload = {
      title: formData.title.trim(),
      department: formData.department,
      company: 'CandidateIQ Enterprise',
      location: formData.location.trim() || 'Remote',
      type: formData.employmentType,
      experience: formData.experience,
      education: formData.education,
      salary: formData.salary.trim(),
      status: formData.status,
      requiredSkills: formData.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean),
      preferredSkills: formData.preferredSkills.split(',').map((s) => s.trim()).filter(Boolean),
      description: formData.description.trim()
    };

    if (activeModal === 'create') {
      const created = await mockJobService.createJob(payload);
      setJobs([created, ...jobs]);
      showToast(`Job "${created.title}" successfully created!`);
    } else if (activeModal === 'edit' && selectedJob) {
      const updated = await mockJobService.updateJob(selectedJob.id, payload);
      setJobs(jobs.map((j) => (j.id === selectedJob.id ? { ...j, ...updated } : j)));
      showToast(`Job requisition updated successfully.`);
    }

    setActiveModal(null);
  };

  // 4. Delete Job Handler
  const handleDeleteJob = async (jobId) => {
    await mockJobService.deleteJob(jobId);
    setJobs(jobs.filter((j) => j.id !== jobId));
    showToast(`Job requisition deleted.`, 'info');
  };

  // 5. Publish Flow: Draft -> Review -> Publish
  const handlePublishJob = async (job) => {
    const updated = await mockJobService.updateJob(job.id, { status: 'Published' });
    setJobs(jobs.map((j) => (j.id === job.id ? { ...j, status: 'Published' } : j)));
    showToast(`Job "${job.title}" has been Published! Candidates can now apply.`);
    setActiveModal(null);
  };

  // 6. Close Flow: Published -> Close Job
  const handleCloseJob = async (job) => {
    const updated = await mockJobService.updateJob(job.id, { status: 'Closed' });
    setJobs(jobs.map((j) => (j.id === job.id ? { ...j, status: 'Closed' } : j)));
    showToast(`Job requisition closed.`, 'info');
    setActiveModal(null);
  };

  const getStatusBadge = (status) => {
    const st = (status || 'Published').toLowerCase();
    if (st === 'published' || st === 'active') {
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Published
        </span>
      );
    }
    if (st === 'draft') {
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center gap-1">
          <Edit2 className="w-3 h-3 text-amber-600" /> Draft
        </span>
      );
    }
    if (st === 'paused') {
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 flex items-center gap-1">
          <PauseCircle className="w-3 h-3 text-indigo-600" /> Paused
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
        <Lock className="w-3 h-3 text-slate-400" /> Closed
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 select-none max-w-7xl mx-auto">
      {/* Top Header Banner */}
      <div className="saas-card p-6 md:p-8 border border-slate-200/90 flex flex-wrap justify-between items-center gap-6 bg-white shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold font-outfit text-slate-950 tracking-tight">Recruiter Job Requisitions</h2>
            <span className="badge-pill badge-ai text-[10px]">
              <Sparkles className="w-3 h-3 text-indigo-600" /> Active Job Desk
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Create, manage, publish, and close job postings across your recruitment pipeline.</p>
        </div>

        <button onClick={handleOpenCreateModal} className="btn-primary text-xs font-bold flex items-center gap-1.5 shadow-md">
          <Plus className="w-4 h-4" /> Create New Job
        </button>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center gap-2.5 shadow-sm ${
          notification.type === 'info' ? 'bg-slate-900 text-white border-slate-800' : 'bg-emerald-50 border-emerald-200 text-emerald-900 font-medium'
        }`}>
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Status Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          {['All', 'Published', 'Draft', 'Paused', 'Closed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {st} ({st === 'All' ? jobs.length : jobs.filter((j) => (j.status || 'Published').toLowerCase() === st.toLowerCase()).length})
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search requisition or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-saas pl-8 w-full text-xs"
          />
        </div>
      </div>

      {/* Job Requisitions Table / Cards */}
      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <div key={job.id} className="saas-card p-6 border border-slate-200/80 bg-white hover:border-slate-300 transition-all space-y-4 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-extrabold font-outfit text-slate-950">{job.title}</h3>
                  {getStatusBadge(job.status)}
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-slate-500 font-medium pt-0.5">
                  <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5 text-indigo-600" /> {job.department}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}</span>
                  <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-emerald-600" /> {job.salary}</span>
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-purple-600" /> {job.applicantsCount || 0} Applicants</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {/* Publish Flow Action */}
                {job.status === 'Draft' && (
                  <button
                    onClick={() => handlePublishJob(job)}
                    className="btn-primary text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    <Play className="w-3.5 h-3.5" /> Review & Publish
                  </button>
                )}

                {/* Close Flow Action */}
                {(job.status === 'Published' || job.status === 'Active') && (
                  <button
                    onClick={() => handleCloseJob(job)}
                    className="btn-secondary text-xs text-rose-600 hover:bg-rose-50 border-rose-200"
                  >
                    <Lock className="w-3.5 h-3.5" /> Close Job
                  </button>
                )}

                <button onClick={() => handleOpenEditModal(job)} className="btn-secondary text-xs">
                  <Edit2 className="w-3.5 h-3.5 text-indigo-600" /> Edit
                </button>

                <button onClick={() => handleDeleteJob(job.id)} className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Description & Skill Tags */}
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
        ))}

        {filteredJobs.length === 0 && (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 text-slate-500 text-xs">
            No job requisitions found matching the selected filter status.
          </div>
        )}
      </div>

      {/* CREATE & EDIT JOB MODAL */}
      {activeModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="saas-card p-6 border border-slate-200 w-full max-w-2xl bg-white space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold font-outfit text-slate-900">
                {activeModal === 'create' ? 'Create New Job Requisition' : 'Edit Job Requisition'}
              </h3>
              <button onClick={() => setActiveModal(null)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>

            <form onSubmit={handleSaveJob} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Job Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior MERN Stack & AI Developer"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-saas w-full text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Department</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Engineering, AI Intelligence, Product"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="input-saas w-full text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. San Francisco, CA / Remote"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="input-saas w-full text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Employment Type</label>
                  <select
                    value={formData.employmentType}
                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                    className="input-saas w-full text-xs"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="input-saas w-full text-xs"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                    <option value="Paused">Paused</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Salary Range</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. $130,000 - $160,000"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="input-saas w-full text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Experience Required</label>
                  <input
                    type="text"
                    placeholder="e.g. 3+ Years"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="input-saas w-full text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Education Requirement</label>
                  <input
                    type="text"
                    placeholder="e.g. B.S. in Computer Science"
                    value={formData.education}
                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                    className="input-saas w-full text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Required Skills (Comma separated)</label>
                <input
                  type="text"
                  placeholder="React.js, Node.js, TypeScript, MongoDB"
                  value={formData.requiredSkills}
                  onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                  className="input-saas w-full text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Preferred Skills (Comma separated)</label>
                <input
                  type="text"
                  placeholder="Docker, AWS, Gemini API, Tailwind"
                  value={formData.preferredSkills}
                  onChange={(e) => setFormData({ ...formData, preferredSkills: e.target.value })}
                  className="input-saas w-full text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Job Description & Responsibilities</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detailed description of responsibilities and technical expectations..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-saas w-full resize-none text-xs"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setActiveModal(null)} className="btn-secondary text-xs">Cancel</button>
                <button type="submit" className="btn-primary text-xs font-bold">
                  {activeModal === 'create' ? 'Create Job Requisition' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecruiterJobManagement;
