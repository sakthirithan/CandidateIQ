import React, { useState, useEffect } from 'react';
import { X, FileText, CheckCircle2, Upload, AlertCircle, Sparkles, Building, MapPin, Briefcase, DollarSign, ShieldCheck } from 'lucide-react';
import { getCurrentUser } from '@/utils/auth';
import { formatExperience, formatSalary } from '@/utils/formatters';
import api from '@/services/api';
import { mockApplicationService } from '@/services/mockApi/applicationService';

function ApplicationModal({ job, isOpen, onClose, onSuccess }) {
  const currentUser = getCurrentUser();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    gender: 'Male',
    location: '',
    userType: 'Professional', // 'Professional' | 'Student / Fresher'
    designation: 'Software Developer',
    experience: '2 Years',
    organization: '',
    passingYear: '2024',
    skills: '',
    expectedAmount: 700000,
    expectedCurrency: 'INR',
    expectedPeriod: 'year',
    noticePeriodAnswer: 'Immediate / 15 Days',
    whyFitAnswer: 'Strong hands-on experience in full-stack web development and AI system integration.',
    resumeOption: 'existing', // 'existing' | 'upload'
    resumeFileName: 'Candidate_Resume_2026.pdf',
    termsAccepted: false
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (job && currentUser) {
      const nameParts = (currentUser.name || 'Candidate User').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      setFormData((prev) => ({
        ...prev,
        firstName,
        lastName,
        email: currentUser.email || '',
        mobile: currentUser.phone || '+91 98765 43210',
        location: currentUser.location || job.location || 'Chennai, India',
        organization: currentUser.company || 'Tech Solutions',
        skills: 'React, Node.js, JavaScript, MongoDB, Express'
      }));
    }
  }, [job, currentUser]);

  if (!isOpen || !job) return null;

  const expFormatted = formatExperience(job.experience, job.experienceLevel);
  const salFormatted = formatSalary(job.salary, job.salary);

  // Compute Live Expected Compensation Preview
  const getFormattedExpectedComp = () => {
    const amt = Number(formData.expectedAmount) || 0;
    if (amt <= 0) return 'Not specified';
    const sym = formData.expectedCurrency === 'INR' ? '₹' : (formData.expectedCurrency === 'USD' ? '$' : '€');
    const periodStr = formData.expectedPeriod === 'month' ? '/month' : '';
    if (formData.expectedCurrency === 'INR' && amt >= 100000) {
      const lpa = (amt / 100000).toLocaleString('en-IN', { maximumFractionDigits: 2 });
      return `${sym}${lpa} LPA${periodStr}`;
    }
    return `${sym}${amt.toLocaleString('en-IN')}${periodStr}`;
  };

  const isFormValid =
    formData.firstName.trim() &&
    formData.email.trim() &&
    formData.mobile.trim() &&
    formData.location.trim() &&
    formData.termsAccepted;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      setErrorMsg('Please complete all required details and accept the terms to apply.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();
    const formattedComp = getFormattedExpectedComp();
    const skillList = formData.skills.split(',').map((s) => s.trim()).filter(Boolean);

    const payload = {
      jobId: job._id || job.id,
      resumeSnapshot: {
        resumeId: `res_${Date.now()}`,
        fileName: formData.resumeFileName || 'Candidate_Resume.pdf',
        fileUrl: '',
        capturedAt: new Date()
      },
      candidateSnapshot: {
        name: fullName,
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
        location: formData.location.trim(),
        gender: formData.gender
      },
      professionalSnapshot: {
        userType: formData.userType,
        designation: formData.designation.trim(),
        experience: formData.experience.trim(),
        organization: formData.organization.trim(),
        passingYear: formData.passingYear.trim(),
        skills: skillList
      },
      expectedCompensation: {
        amount: Number(formData.expectedAmount) || 0,
        currency: formData.expectedCurrency,
        period: formData.expectedPeriod,
        formatted: formattedComp
      },
      screeningAnswers: [
        {
          questionId: 'q_notice_period',
          question: 'What is your notice period / availability to join?',
          answer: formData.noticePeriodAnswer.trim()
        },
        {
          questionId: 'q_why_fit',
          question: 'Why are you a good fit for this position?',
          answer: formData.whyFitAnswer.trim()
        }
      ],
      termsAccepted: true
    };

    try {
      let createdApp = null;
      // Dispatch real API endpoint first
      const res = await api.post(`/jobs/${job._id || job.id}/apply`, payload).catch((err) => {
        if (err.response?.status === 400 && err.response?.data?.isApplied) {
          throw err;
        }
        return null;
      });

      if (res?.data?.success && res.data.application) {
        createdApp = res.data.application;
      } else {
        // Fallback service call for offline/mock mode
        createdApp = await mockApplicationService.applyForJob({
          jobId: job._id || job.id,
          candidateId: currentUser?.id || 'cand_1',
          jobTitle: job.title,
          company: job.company || 'CandidateIQ Talent Partner',
          candidateName: fullName,
          candidateEmail: formData.email.trim(),
          matchPercentage: 90,
          iqScore: 88,
          resumeId: `res_${Date.now()}`
        });
      }

      if (onSuccess) {
        onSuccess(createdApp);
      }
      onClose();
    } catch (err) {
      console.error('[Application Modal Error]:', err);
      const message = err.response?.data?.message || err.message || 'Failed to submit application. Please try again.';
      setErrorMsg(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="saas-card bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-auto animate-scale-up max-h-[92vh] flex flex-col">
        {/* Header Requisition Summary Banner (Unstop Style) */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-5 sm:p-6 space-y-2 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <span className="badge-pill bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[10px] font-bold">
              <Sparkles className="w-3 h-3 text-indigo-400" /> Job Application Requisition
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold font-outfit tracking-tight leading-tight">
            Apply for {job.title}
          </h2>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 font-medium pt-1">
            <span className="flex items-center gap-1 font-semibold text-white">
              <Building className="w-3.5 h-3.5 text-indigo-400" /> {job.company || 'CandidateIQ Enterprise'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-purple-300">
              <Briefcase className="w-3.5 h-3.5 text-purple-400" /> {expFormatted}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 font-bold text-emerald-400">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> {salFormatted}
            </span>
          </div>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border-b border-rose-200 text-rose-900 text-xs font-semibold flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body Scrollable */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs font-medium">
          {/* Section 1: Resume Selection */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-600" /> Resume / CV Submission *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label
                className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                  formData.resumeOption === 'existing'
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="resumeOption"
                  value="existing"
                  checked={formData.resumeOption === 'existing'}
                  onChange={() => setFormData({ ...formData, resumeOption: 'existing' })}
                  className="accent-indigo-600"
                />
                <div>
                  <span className="font-bold text-slate-900 block">Use Saved Profile Resume</span>
                  <span className="text-[10px] text-slate-500 block">{formData.resumeFileName}</span>
                </div>
              </label>

              <label
                className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                  formData.resumeOption === 'upload'
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="resumeOption"
                  value="upload"
                  checked={formData.resumeOption === 'upload'}
                  onChange={() => setFormData({ ...formData, resumeOption: 'upload', resumeFileName: 'Uploaded_Resume.pdf' })}
                  className="accent-indigo-600"
                />
                <div className="flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-indigo-600" />
                  <div>
                    <span className="font-bold text-slate-900 block">Upload New Resume</span>
                    <span className="text-[10px] text-slate-500 block">PDF, DOCX up to 5MB</span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Section 2: Basic Details */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Basic Candidate Details
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">First Name *</label>
                <input
                  type="text"
                  required
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="input-saas w-full bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Last Name</label>
                <input
                  type="text"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="input-saas w-full bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-saas w-full bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Mobile Phone *</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="input-saas w-full bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="input-saas w-full bg-white cursor-pointer"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-Binary">Non-Binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Current Location *</label>
              <input
                type="text"
                required
                placeholder="e.g. Chennai, Tamil Nadu, India"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="input-saas w-full bg-white"
              />
            </div>
          </div>

          {/* Section 3: Professional Details */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Professional Background
              </span>
              <div className="flex gap-2 text-[10px] font-bold">
                {['Professional', 'Student / Fresher'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, userType: type })}
                    className={`px-2.5 py-0.5 rounded-lg cursor-pointer ${
                      formData.userType === type
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {formData.userType === 'Professional' ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Current Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Developer"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="input-saas w-full bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Work Experience</label>
                  <input
                    type="text"
                    placeholder="e.g. 3 Years"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="input-saas w-full bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Organization</label>
                  <input
                    type="text"
                    placeholder="e.g. Tech Solutions"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="input-saas w-full bg-white"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Degree / Course</label>
                  <input
                    type="text"
                    placeholder="e.g. B.Tech Computer Science"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="input-saas w-full bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Passing / Graduation Year</label>
                  <input
                    type="text"
                    placeholder="e.g. 2024"
                    value={formData.passingYear}
                    onChange={(e) => setFormData({ ...formData, passingYear: e.target.value })}
                    className="input-saas w-full bg-white"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Relevant Skills (Comma separated)</label>
              <input
                type="text"
                placeholder="React, Node.js, JavaScript, MongoDB, Express"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                className="input-saas w-full bg-white"
              />
            </div>
          </div>

          {/* Section 4: Expected Compensation */}
          <div className="p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-200/60 space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Expected Compensation
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-800">
                Preview: {getFormattedExpectedComp()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Expected Salary Amount</label>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  placeholder="e.g. 700000"
                  value={formData.expectedAmount}
                  onChange={(e) => setFormData({ ...formData, expectedAmount: e.target.value })}
                  className="input-saas w-full bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Currency</label>
                <select
                  value={formData.expectedCurrency}
                  onChange={(e) => setFormData({ ...formData, expectedCurrency: e.target.value })}
                  className="input-saas w-full bg-white cursor-pointer font-semibold"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Period</label>
                <select
                  value={formData.expectedPeriod}
                  onChange={(e) => setFormData({ ...formData, expectedPeriod: e.target.value })}
                  className="input-saas w-full bg-white cursor-pointer font-semibold"
                >
                  <option value="year">Yearly (LPA)</option>
                  <option value="month">Monthly</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: Screening Questions */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Recruiter Screening Questions
            </span>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                1. What is your notice period / availability to join?
              </label>
              <input
                type="text"
                placeholder="e.g. Immediate / 15 Days / 30 Days"
                value={formData.noticePeriodAnswer}
                onChange={(e) => setFormData({ ...formData, noticePeriodAnswer: e.target.value })}
                className="input-saas w-full bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                2. Why are you a great fit for this role?
              </label>
              <textarea
                rows={2}
                placeholder="Briefly state your key strengths..."
                value={formData.whyFitAnswer}
                onChange={(e) => setFormData({ ...formData, whyFitAnswer: e.target.value })}
                className="input-saas w-full bg-white resize-none"
              ></textarea>
            </div>
          </div>

          {/* Section 6: Terms & Conditions Agreement */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="termsCheckbox"
              checked={formData.termsAccepted}
              onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
              className="mt-0.5 accent-indigo-600 cursor-pointer"
            />
            <label htmlFor="termsCheckbox" className="text-[11px] text-slate-700 leading-snug cursor-pointer select-none">
              I confirm that all details provided in this application are true and accurate, and I agree to CandidateIQ's application terms.
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="btn-secondary text-xs px-4 py-2 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || !isFormValid}
              className={`btn-primary text-xs font-bold px-6 py-2.5 flex items-center gap-2 cursor-pointer shadow-md ${
                !isFormValid || submitting ? 'opacity-50 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Submitting Application...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>Submit Application</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ApplicationModal;
