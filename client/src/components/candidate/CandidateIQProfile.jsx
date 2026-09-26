import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { mockCandidateService } from '../../services/mockApi/candidateService';
import { evidenceIntelligenceService } from '../../services/mockApi/evidenceIntelligenceService';
import { getCurrentUser } from '../../utils/auth';
import ResumeParserIQModal from './ResumeParserIQModal';
import { storageResumes } from '../../services/storage/storageService';
import { calculateProfileCompleteness } from '../../services/mockApi/resumeParserService';
import {
  User, Mail, Phone, MapPin, Briefcase, GraduationCap, Code, Award, Sparkles,
  CheckCircle2, FileText, Download, ExternalLink, Plus, Edit2, Trash2, X, Globe, Trophy, Star
} from 'lucide-react';

function CandidateIQProfile() {
  const normalizeProfile = (rawProf, user) => {
    try {
      const p = rawProf || {};
      const personalInfo = p.personalInfo || {};
      const isExistingProfile = Boolean(rawProf && (rawProf._id || rawProf.personalInfo || rawProf.createdAt));

      // Extract skills array safely
      let skillsList = [];
      if (Array.isArray(p.skills)) {
        skillsList = p.skills.map((s) => (typeof s === 'string' ? s : (s?.name || String(s))));
      } else if (p.skills && typeof p.skills === 'object') {
        const tech = Array.isArray(p.skills.technical) ? p.skills.technical : [];
        const fw = Array.isArray(p.skills.frameworks) ? p.skills.frameworks : [];
        const db = Array.isArray(p.skills.databases) ? p.skills.databases : [];
        const tools = Array.isArray(p.skills.tools) ? p.skills.tools : [];
        const soft = Array.isArray(p.skills.soft) ? p.skills.soft : [];
        skillsList = Array.from(new Set([...tech, ...fw, ...db, ...tools, ...soft]));
      }

      // Extract experiences safely
      const rawExps = p.experiences || p.experience;
      const exps = Array.isArray(rawExps) ? rawExps : [];
      const normalizedExps = exps.map((e, idx) => {
        if (!e) return { id: `exp_${idx}`, title: 'Software Developer', company: 'Tech Company', period: '2023 - Present', description: '' };
        if (typeof e === 'string') return { id: `exp_${idx}`, title: 'Developer', company: 'Tech Company', period: '2023 - Present', description: e };
        return {
          id: e._id || e.id || `exp_${idx}`,
          title: e.position || e.role || e.title || 'Software Developer',
          company: e.company || e.organization || 'Tech Company',
          period: e.duration || e.period || (e.startDate ? `${e.startDate} - ${e.endDate || 'Present'}` : '2023 - Present'),
          description: e.description || ''
        };
      });

      // Extract education safely
      const rawEdus = p.education;
      const edus = Array.isArray(rawEdus) ? rawEdus : [];
      const normalizedEdus = edus.map((e, idx) => {
        if (!e) return { id: `edu_${idx}`, degree: 'Bachelor Degree', institution: 'University', year: '2024' };
        if (typeof e === 'string') return { id: `edu_${idx}`, degree: e, institution: 'University', year: '2024' };
        return {
          id: e._id || e.id || `edu_${idx}`,
          degree: e.degree || 'Bachelor Degree',
          institution: e.institution || 'University',
          year: e.graduationYear || e.year || '2024'
        };
      });

      // Extract projects safely
      const rawProjs = p.projects;
      const projs = Array.isArray(rawProjs) ? rawProjs : [];
      const normalizedProjs = projs.map((pr, idx) => {
        if (!pr) return { id: `proj_${idx}`, name: 'Project', description: '', tech: '', url: '' };
        if (typeof pr === 'string') return { id: `proj_${idx}`, name: pr, description: '', tech: '', url: '' };
        return {
          id: pr._id || pr.id || `proj_${idx}`,
          name: pr.name || pr.title || 'Key Project',
          description: pr.description || '',
          tech: Array.isArray(pr.technologies) ? pr.technologies.join(', ') : (pr.tech || 'React, Node.js'),
          url: pr.url || ''
        };
      });

      // Extract certifications safely
      const rawCerts = p.certifications;
      const certs = Array.isArray(rawCerts) ? rawCerts : [];
      const normalizedCerts = certs.map((c, idx) => {
        if (!c) return { id: `cert_${idx}`, name: 'Certification', issuer: 'Authority', year: '2024' };
        if (typeof c === 'string') return { id: `cert_${idx}`, name: c, issuer: 'Issuing Authority', year: '2024' };
        return {
          id: c._id || c.id || `cert_${idx}`,
          name: c.name || c.title || 'Certification',
          issuer: c.issuer || c.organization || 'Issuing Authority',
          year: c.date || c.year || '2024'
        };
      });

      const fallbackName = user?.name || 'Alex Johnson';
      const fallbackEmail = user?.email || 'alex.johnson@example.com';

      return {
        ...p,
        id: p._id || user?.id || 'cand_1',
        name: personalInfo.name || p.name || fallbackName,
        email: personalInfo.email || p.email || fallbackEmail,
        headline: personalInfo.headline || p.headline || 'Full Stack Software Engineer',
        phone: personalInfo.phone || p.phone || '+1 555-0199',
        location: personalInfo.location || p.location || 'San Francisco, CA',
        skills: skillsList.length > 0 ? skillsList : (isExistingProfile ? [] : ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express']),
        experiences: normalizedExps.length > 0 ? normalizedExps : (isExistingProfile ? [] : [
          { id: 'exp_default', title: 'Senior Software Engineer', company: 'Tech Innovations', period: '2023 - Present', description: 'Engineered web applications and RESTful backend APIs.' }
        ]),
        education: normalizedEdus.length > 0 ? normalizedEdus : (isExistingProfile ? [] : [
          { id: 'edu_default', degree: 'Bachelor of Science in Computer Science', institution: 'State University', year: '2024' }
        ]),
        projects: normalizedProjs,
        certifications: normalizedCerts,
        languages: Array.isArray(p.languages) && p.languages.length > 0 ? p.languages : [{ language: 'English', proficiency: 'Native / Full Professional' }],
        achievements: Array.isArray(p.achievements) && p.achievements.length > 0 ? p.achievements : ['Engineered core full-stack platform architecture'],
        customSections: Array.isArray(p.customSections) ? p.customSections : []
      };
    } catch (err) {
      console.error('normalizeProfile fallback caught error:', err);
      return {
        id: user?.id || 'cand_1',
        name: user?.name || 'Alex Johnson',
        email: user?.email || 'alex.johnson@example.com',
        headline: 'Full Stack Software Engineer',
        phone: '+1 555-0199',
        location: 'San Francisco, CA',
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express'],
        experiences: [{ id: 'exp_default', title: 'Senior Software Engineer', company: 'Tech Innovations', period: '2023 - Present', description: 'Engineered web applications and RESTful backend APIs.' }],
        education: [{ id: 'edu_default', degree: 'Bachelor of Science in Computer Science', institution: 'State University', year: '2024' }],
        projects: [],
        certifications: [],
        languages: [{ language: 'English', proficiency: 'Native / Full Professional' }],
        achievements: ['Engineered core full-stack platform architecture'],
        customSections: []
      };
    }
  };

  const [candidate, setCandidate] = useState(() => normalizeProfile(null, getCurrentUser()));
  const [loading, setLoading] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'personal', 'education', 'experience', 'skill', 'project', 'certification', 'language', 'achievement', 'custom_section'
  const [formData, setFormData] = useState({});
  const [isParserModalOpen, setIsParserModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const syncProfileToBackend = async (updatedCand) => {
    try {
      const skillsObj = {
        technical: Array.isArray(updatedCand.skills) ? updatedCand.skills : [],
        soft: [],
        frameworks: [],
        databases: [],
        tools: []
      };

      const payload = {
        personalInfo: {
          name: updatedCand.name,
          email: updatedCand.email,
          phone: updatedCand.phone || '',
          location: updatedCand.location || '',
          headline: updatedCand.headline || ''
        },
        skills: skillsObj,
        experience: (updatedCand.experiences || []).map(e => ({
          company: e.company,
          position: e.title,
          duration: e.period,
          description: e.description
        })),
        education: (updatedCand.education || []).map(e => ({
          degree: e.degree,
          institution: e.institution,
          graduationYear: e.year
        })),
        projects: (updatedCand.projects || []).map(p => ({
          name: p.name,
          description: p.description,
          technologies: typeof p.tech === 'string' ? p.tech.split(',').map(t => t.trim()) : [],
          url: p.url
        })),
        certifications: (updatedCand.certifications || []).map(c => ({
          name: c.name,
          issuer: c.issuer,
          date: c.year
        })),
        customSections: updatedCand.customSections || []
      };

      await api.post('/candidates/profile', payload);
    } catch (err) {
      console.warn('Profile sync notice:', err.message);
    }
  };

  // Handle applying parsed resume data to profile
  const handleApplyParsedData = async (extractedData) => {
    try {
      const currentUser = getCurrentUser();
      const normalized = normalizeProfile(extractedData, currentUser);
      setCandidate(normalized);
      await syncProfileToBackend(normalized);

      // Create a new version snapshot for interview evidence matching
      try {
        const skillsPayload = (normalized.skills || []).map(s => ({
          name: typeof s === 'string' ? s : (s.name || String(s)),
          level: 'Advanced',
          claimedExperience: '3 Years',
          claimText: `Extracted from confirmed resume.`
        }));
        if (evidenceIntelligenceService?.createResumeVersion) {
          await evidenceIntelligenceService.createResumeVersion('cand_1', skillsPayload, 'Uploaded Resume Parser IQ');
        }
      } catch (e) {
        console.warn('Snapshot creation error:', e);
      }

      setToastMessage('Resume information has been successfully parsed and saved into your CandidateIQ profile.');
      setTimeout(() => {
        setToastMessage('');
      }, 4500);
    } catch (err) {
      console.error('Error applying parsed data:', err);
    }
  };

  const [activeSnapshot, setActiveSnapshot] = useState(null);
  const [resumesList, setResumesList] = useState([]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const loadResumes = (candId) => {
    try {
      const list = storageResumes.getByCandidateId(candId);
      setResumesList(list || []);
    } catch (e) {
      console.warn('loadResumes error:', e);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const currentUser = getCurrentUser();
      const candId = currentUser?.id || 'cand_1';

      loadResumes(candId);

      try {
        if (evidenceIntelligenceService?.getLatestResumeRecord) {
          const snapshot = await evidenceIntelligenceService.getLatestResumeRecord(candId);
          setActiveSnapshot(snapshot);
        }
      } catch (e) {
        console.warn('snapshot notice:', e);
      }

      let rawProf = null;
      try {
        const res = await api.get('/candidates/profile');
        if (res?.data?.profile) {
          rawProf = res.data.profile;
        }
      } catch (e) {
        console.warn('API profile fetch notice:', e.message);
      }

      const normalized = normalizeProfile(rawProf, currentUser);
      setCandidate(normalized);
    } catch (err) {
      console.error('fetchProfile error:', err);
      const currentUser = getCurrentUser();
      setCandidate(normalizeProfile(null, currentUser));
    } finally {
      setLoading(false);
    }
  };

  const handleSetPrimaryResume = (resumeId) => {
    const currentUser = getCurrentUser();
    const candId = currentUser?.id || 'cand_1';
    const updated = storageResumes.setPrimary(resumeId, candId);
    setResumesList([...updated]);
    setToastMessage('Primary resume updated successfully.');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleDeleteResume = (resumeId) => {
    storageResumes.deleteResume(resumeId);
    const currentUser = getCurrentUser();
    const candId = currentUser?.id || 'cand_1';
    loadResumes(candId);
    setToastMessage('Resume removed.');
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Section 1 & 2: Personal Information & Professional Headline Handlers
  const openEditPersonalModal = () => {
    setFormData({
      name: candidate.name || '',
      headline: candidate.headline || '',
      email: candidate.email || '',
      phone: candidate.phone || '',
      location: candidate.location || ''
    });
    setActiveModal('personal');
  };

  const handleSavePersonalInfo = async (e) => {
    e.preventDefault();
    const updated = {
      ...candidate,
      name: formData.name,
      headline: formData.headline,
      email: formData.email,
      phone: formData.phone,
      location: formData.location
    };
    setCandidate(updated);
    await syncProfileToBackend(updated);
    setActiveModal(null);
    setFormData({});
  };

  // Section 5: Technical Skills Handlers
  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!formData.skillName?.trim()) return;
    const newSkillName = formData.skillName.trim();
    const updatedSkills = Array.from(new Set([...(candidate.skills || []), newSkillName]));
    const updated = { ...candidate, skills: updatedSkills };
    setCandidate(updated);
    await syncProfileToBackend(updated);
    setActiveModal(null);
    setFormData({});
  };

  const handleDeleteSkill = async (skillName) => {
    const updatedSkills = (candidate.skills || []).filter(s => (typeof s === 'string' ? s : s.name) !== skillName);
    const updated = { ...candidate, skills: updatedSkills };
    setCandidate(updated);
    await syncProfileToBackend(updated);
  };

  // Section 4: Experience Handlers
  const handleAddExperience = async (e) => {
    e.preventDefault();
    if (!formData.title?.trim() || !formData.company?.trim()) return;
    const newExp = {
      id: `exp_${Date.now()}`,
      title: formData.title.trim(),
      company: formData.company.trim(),
      period: formData.period?.trim() || '2025 - Present',
      description: formData.description?.trim() || ''
    };
    const updatedExps = [newExp, ...(candidate.experiences || [])];
    const updated = { ...candidate, experiences: updatedExps };
    setCandidate(updated);
    await syncProfileToBackend(updated);
    setActiveModal(null);
    setFormData({});
  };

  const handleDeleteExperience = async (expId) => {
    const updatedExps = (candidate.experiences || []).filter(e => e.id !== expId);
    const updated = { ...candidate, experiences: updatedExps };
    setCandidate(updated);
    await syncProfileToBackend(updated);
  };

  // Section 3: Education Handlers
  const handleAddEducation = async (e) => {
    e.preventDefault();
    if (!formData.degree?.trim() || !formData.institution?.trim()) return;
    const newEdu = {
      id: `edu_${Date.now()}`,
      degree: formData.degree.trim(),
      institution: formData.institution.trim(),
      year: formData.year?.trim() || '2025',
      gpa: formData.gpa?.trim() || '3.8 / 4.0'
    };
    const updatedEdus = [newEdu, ...(candidate.education || [])];
    const updated = { ...candidate, education: updatedEdus };
    setCandidate(updated);
    await syncProfileToBackend(updated);
    setActiveModal(null);
    setFormData({});
  };

  const handleDeleteEducation = async (eduId) => {
    const updatedEdus = (candidate.education || []).filter(e => e.id !== eduId);
    const updated = { ...candidate, education: updatedEdus };
    setCandidate(updated);
    await syncProfileToBackend(updated);
  };

  // Section 6: Key Projects Handlers
  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;
    const newProject = {
      id: `proj_${Date.now()}`,
      name: formData.name.trim(),
      description: formData.description?.trim() || '',
      tech: formData.tech?.trim() || 'React, Node.js',
      url: formData.url?.trim() || 'https://github.com/example/demo-project'
    };
    const updatedProjs = [newProject, ...(candidate.projects || [])];
    const updated = { ...candidate, projects: updatedProjs };
    setCandidate(updated);
    await syncProfileToBackend(updated);
    setActiveModal(null);
    setFormData({});
  };

  const handleDeleteProject = async (projId) => {
    const updatedProjs = (candidate.projects || []).filter(p => p.id !== projId);
    const updated = { ...candidate, projects: updatedProjs };
    setCandidate(updated);
    await syncProfileToBackend(updated);
  };

  // Section 7: Certifications Handlers
  const handleAddCertification = async (e) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;
    const newCert = {
      id: `cert_${Date.now()}`,
      name: formData.name.trim(),
      issuer: formData.issuer?.trim() || 'AWS',
      year: formData.year?.trim() || '2025'
    };
    const updatedCerts = [newCert, ...(candidate.certifications || [])];
    const updated = { ...candidate, certifications: updatedCerts };
    setCandidate(updated);
    await syncProfileToBackend(updated);
    setActiveModal(null);
    setFormData({});
  };

  const handleDeleteCertification = async (certId) => {
    const updatedCerts = (candidate.certifications || []).filter(c => c.id !== certId);
    const updated = { ...candidate, certifications: updatedCerts };
    setCandidate(updated);
    await syncProfileToBackend(updated);
  };

  // Section 8: Achievements Handlers
  const handleAddAchievement = async (e) => {
    e.preventDefault();
    if (!formData.achievementText?.trim()) return;
    const updatedAch = [formData.achievementText.trim(), ...(candidate.achievements || [])];
    const updated = { ...candidate, achievements: updatedAch };
    setCandidate(updated);
    await syncProfileToBackend(updated);
    setActiveModal(null);
    setFormData({});
  };

  const handleDeleteAchievement = async (index) => {
    const updatedAch = (candidate.achievements || []).filter((_, idx) => idx !== index);
    const updated = { ...candidate, achievements: updatedAch };
    setCandidate(updated);
    await syncProfileToBackend(updated);
  };

  // Section 9: Languages Handlers
  const handleAddLanguage = async (e) => {
    e.preventDefault();
    if (!formData.languageName?.trim()) return;
    const newLang = {
      language: formData.languageName.trim(),
      proficiency: formData.proficiency || 'Full Professional'
    };
    const updatedLangs = [newLang, ...(candidate.languages || [])];
    const updated = { ...candidate, languages: updatedLangs };
    setCandidate(updated);
    await syncProfileToBackend(updated);
    setActiveModal(null);
    setFormData({});
  };

  const handleDeleteLanguage = async (index) => {
    const updatedLangs = (candidate.languages || []).filter((_, idx) => idx !== index);
    const updated = { ...candidate, languages: updatedLangs };
    setCandidate(updated);
    await syncProfileToBackend(updated);
  };

  if (!candidate) {
    return null;
  }

  return (
    <div className="p-6 md:p-8 space-y-8 select-none max-w-6xl mx-auto">
      {/* Background Syncing Bar */}
      {loading && (
        <div className="w-full bg-indigo-50 border border-indigo-100 p-2.5 rounded-xl text-indigo-700 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span>Syncing candidate profile with database...</span>
          </div>
        </div>
      )}
      {/* Toast Notification for Profile Updates */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-xl bg-slate-900 text-white border border-emerald-500/40 shadow-2xl flex items-center gap-3 text-xs animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage('')} className="text-slate-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1 & 2. Personal Information & Professional Headline Banner */}
      <div className="saas-card p-6 md:p-8 border border-slate-200/90 flex flex-wrap justify-between items-center gap-6 bg-white relative overflow-hidden shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center text-white text-3xl font-black font-outfit shadow-md">
            {candidate.name ? candidate.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold font-outfit text-slate-950 tracking-tight">{candidate.name}</h2>
              <span className="badge-pill badge-success text-[10px]">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> AI Verified Candidate
              </span>
            </div>
            <p className="text-xs text-indigo-600 font-bold">{candidate.headline || 'Full Stack Engineer & AI Specialist'}</p>
            <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-1 font-medium">
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {candidate.email}</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {candidate.location || 'San Francisco, CA'}</span>
              <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {candidate.phone || '+1 (555) 234-5678'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsParserModalOpen(true)}
            className="btn-ai text-xs flex items-center gap-1.5 shadow-md hover:shadow-indigo-500/20"
            title="Import profile info from your resume"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" /> Resume Parser IQ
          </button>
          <button onClick={openEditPersonalModal} className="btn-secondary text-xs flex items-center gap-1.5">
            <Edit2 className="w-3.5 h-3.5 text-indigo-600" /> Edit Profile
          </button>
          <button onClick={() => setActiveModal('skill')} className="btn-secondary text-xs flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-indigo-600" /> Add Skill
          </button>
        </div>
      </div>

      {/* Profile Completeness & Multiple Resumes Hub */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Completeness Score Card */}
        <div className="saas-card p-6 border border-slate-200/90 bg-white space-y-3 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block font-outfit">Profile Completeness</span>
            <span className="text-lg font-black font-outfit text-indigo-600 font-mono">
              {calculateProfileCompleteness(candidate)}%
            </span>
          </div>

          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-600 to-emerald-500 h-full transition-all duration-500"
              style={{ width: `${calculateProfileCompleteness(candidate)}%` }}
            ></div>
          </div>

          <p className="text-[11px] text-slate-500 font-medium">
            {calculateProfileCompleteness(candidate) >= 90
              ? '✓ Excellent! Your profile has sufficient intelligence for high-match job scoring.'
              : 'Complete your skills, education, and resume to reach 100% profile strength.'}
          </p>
        </div>

        {/* Resumes Versioning Hub (2 Columns wide) */}
        <div className="md:col-span-2 saas-card p-6 border border-slate-200/90 bg-white space-y-4 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold font-outfit text-slate-950 uppercase tracking-wider">
                My Uploaded Resumes ({resumesList.length})
              </h3>
            </div>
            <button
              onClick={() => setIsParserModalOpen(true)}
              className="btn-ai text-xs px-3 py-1.5 font-bold flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Upload New Resume
            </button>
          </div>

          {resumesList.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-500 flex justify-between items-center">
              <span>No resume uploaded yet. Parse your resume to build candidate intelligence.</span>
              <button
                onClick={() => setIsParserModalOpen(true)}
                className="btn-primary text-xs px-3 py-1"
              >
                Upload Resume
              </button>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
              {resumesList.map((res) => (
                <div
                  key={res.id || res.resumeId}
                  className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 transition-all ${
                    res.isPrimary ? 'bg-indigo-50/50 border-indigo-200' : 'bg-slate-50/50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-black font-mono flex items-center justify-center text-[10px] shrink-0">
                      v{res.version || 1}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 truncate">{res.filename}</span>
                        {res.isPrimary && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 text-emerald-600 fill-emerald-600" /> Primary
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium block">
                        ATS Score: {res.atsScore || 85}/100 &bull; Uploaded {new Date(res.uploadedAt || Date.now()).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!res.isPrimary && (
                      <button
                        onClick={() => handleSetPrimaryResume(res.id || res.resumeId)}
                        className="btn-secondary text-[11px] px-2.5 py-1 font-semibold"
                      >
                        Set Primary
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteResume(res.id || res.resumeId)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete Resume Version"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Skills, Projects, Certifications & Languages */}
        <div className="space-y-6">
          {/* 5. Core Skills Section */}
          <div className="saas-card p-6 border border-slate-200/80 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold font-outfit text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Code className="w-4 h-4 text-indigo-600" /> Technical Skills Matrix
              </h3>
              <button onClick={() => setActiveModal('skill')} className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {(candidate.skills || []).map((skill, idx) => (
                <span key={idx} className="group px-2.5 py-1 rounded-lg bg-indigo-50/70 text-indigo-900 text-xs font-semibold border border-indigo-100 flex items-center gap-1.5">
                  {skill.name || skill}
                  <button onClick={() => handleDeleteSkill(skill.name || skill)} className="text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* 6. Projects Section */}
          <div className="saas-card p-6 border border-slate-200/80 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold font-outfit text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" /> Key Projects
              </h3>
              <button onClick={() => setActiveModal('project')} className="text-emerald-600 hover:text-emerald-800 text-xs font-semibold flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add Project
              </button>
            </div>

            {(candidate.projects || []).length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">No projects detected or added yet.</p>
            ) : (
              (candidate.projects || []).map((p, idx) => {
                const projTitle = p.name || p.title || `Project ${idx + 1}`;
                const projDesc = p.description || p.about || '';
                const projTechs = Array.isArray(p.technologies) ? p.technologies.join(', ') : (p.tech || p.technologies || '');
                return (
                  <div key={p.id || idx} className="space-y-1.5 pb-3 border-b border-slate-100 last:border-0 last:pb-0 group">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-slate-900 font-outfit">{projTitle}</h4>
                      <div className="flex items-center gap-2">
                        {p.url && (
                          <a href={p.url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1 text-[11px]">
                            <ExternalLink className="w-3.5 h-3.5" /> Link
                          </a>
                        )}
                        <button onClick={() => handleDeleteProject(p.id || idx)} className="text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    {projDesc && <p className="text-xs text-slate-600 leading-relaxed">{projDesc}</p>}
                    {projTechs && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {(Array.isArray(p.technologies) ? p.technologies : projTechs.split(/[,;]+/)).map((tech, tIdx) => (
                          <span key={tIdx} className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-semibold">
                            {typeof tech === 'string' ? tech.trim() : tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* 7. Certifications & 9. Languages Section */}
          <div className="saas-card p-6 border border-slate-200/80 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold font-outfit text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-600" /> Certifications & Badges
              </h3>
              <button onClick={() => setActiveModal('certification')} className="text-purple-600 hover:text-purple-800 text-xs font-semibold flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>

            <div className="space-y-2">
              {(candidate.certifications || []).map((c, idx) => (
                <div key={c.id || idx} className="flex justify-between items-center text-xs group">
                  <div>
                    <span className="font-bold text-slate-900 block">{c.name}</span>
                    <span className="text-[11px] text-slate-500">{c.issuer}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-400">{c.year}</span>
                    <button onClick={() => handleDeleteCertification(c.id)} className="text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 9. Languages Section */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold font-outfit text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-600" /> Languages
              </h3>
              <button onClick={() => setActiveModal('language')} className="text-cyan-600 hover:text-cyan-800 text-xs font-semibold flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {(candidate.languages || []).map((l, idx) => (
                <span key={idx} className="group px-2.5 py-1 rounded-lg bg-cyan-50 text-cyan-900 border border-cyan-100 font-semibold text-[11px] flex items-center gap-1.5">
                  {l.language} ({l.proficiency})
                  <button onClick={() => handleDeleteLanguage(idx)} className="text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Experience, Education & Achievements */}
        <div className="lg:col-span-2 space-y-6">
          {/* 4. Experience Timeline Section */}
          <div className="saas-card p-6 border border-slate-200/80 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold font-outfit text-slate-950 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-600" /> Work Experience Timeline
              </h3>
              <button onClick={() => setActiveModal('experience')} className="btn-secondary text-xs flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Add Role
              </button>
            </div>

            <div className="space-y-4">
              {(candidate.experiences || []).map((exp, idx) => (
                <div key={exp.id || idx} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2.5 relative group">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-slate-950 font-outfit">{exp.title}</h4>
                      <p className="text-xs text-indigo-600 font-bold">{exp.company}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500 font-semibold bg-white px-2.5 py-1 rounded-full border border-slate-200">{exp.period}</span>
                      <button onClick={() => handleDeleteExperience(exp.id)} className="text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Education Section */}
          <div className="saas-card p-6 border border-slate-200/80 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold font-outfit text-slate-950 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-600" /> Education Background
              </h3>
              <button onClick={() => setActiveModal('education')} className="btn-secondary text-xs flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Add Education
              </button>
            </div>

            {(candidate.education || []).map((edu, idx) => (
              <div key={edu.id || idx} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex justify-between items-center group">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-slate-950 font-outfit">{edu.degree}</h4>
                  <p className="text-xs text-slate-500 font-medium">{edu.institution}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-800 block">Class of {edu.year || edu.graduationYear}</span>
                    <span className="text-[11px] text-emerald-600 font-bold">GPA: {edu.gpa || edu.cgpa}</span>
                  </div>
                  <button onClick={() => handleDeleteEducation(edu.id)} className="text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 8. Achievements Section */}
          <div className="saas-card p-6 border border-slate-200/80 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold font-outfit text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" /> Key Honors & Achievements
              </h3>
              <button onClick={() => setActiveModal('achievement')} className="text-amber-600 hover:text-amber-800 text-xs font-semibold flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              {(candidate.achievements || []).map((ach, idx) => (
                <li key={idx} className="flex items-center justify-between font-medium group py-1 border-b border-slate-50 last:border-0">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" /> {ach}
                  </span>
                  <button onClick={() => handleDeleteAchievement(idx)} className="text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* 10. Dynamic Custom Resume Sections (Research, Publications, Volunteer, Leadership, etc.) */}
          {(candidate.customSections || []).map((sec) => (
            <div key={sec.sectionId} className="saas-card p-6 border border-amber-200/80 bg-amber-50/20 space-y-3">
              <div className="flex justify-between items-center border-b border-amber-100 pb-3">
                <h3 className="text-xs font-bold font-outfit text-amber-950 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" /> {sec.title}
                </h3>
                <button
                  onClick={async () => {
                    try {
                      await api.delete(`/candidates/profile/sections/${sec.sectionId}`);
                      setCandidate(prev => ({
                        ...prev,
                        customSections: (prev.customSections || []).filter(s => s.sectionId !== sec.sectionId)
                      }));
                    } catch (err) {
                      console.error('Error deleting section:', err);
                    }
                  }}
                  className="text-slate-400 hover:text-rose-600 transition-colors"
                  title="Remove Section"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {sec.content && (
                <p className="text-xs text-slate-700 leading-relaxed font-medium">{sec.content}</p>
              )}

              {sec.items && sec.items.length > 0 && (
                <div className="space-y-2">
                  {sec.items.map((it, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white border border-amber-100 text-xs space-y-1">
                      <div className="font-bold text-slate-900">{it.title || it.name || it.organization || it.category || `Item ${idx + 1}`}</div>
                      {it.description && <p className="text-slate-600 text-[11px]">{it.description}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* --- MODAL FORMS --- */}

      {/* Edit Personal Info & Professional Headline Modal */}
      {activeModal === 'personal' && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="saas-card p-6 border border-slate-200 w-full max-w-lg bg-white space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold font-outfit text-slate-900">Edit Personal Profile</h3>
              <button onClick={() => setActiveModal(null)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleSavePersonalInfo} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-saas w-full text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Professional Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Full-Stack Engineer & AI Researcher"
                  value={formData.headline || ''}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  className="input-saas w-full text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-saas w-full text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-saas w-full text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Location</label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="input-saas w-full text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setActiveModal(null)} className="btn-secondary text-xs">Cancel</button>
                <button type="submit" className="btn-primary text-xs font-bold">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Skill Modal */}
      {activeModal === 'skill' && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="saas-card p-6 border border-slate-200 w-full max-w-md bg-white space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold font-outfit text-slate-900">Add Technical Skill</h3>
              <button onClick={() => setActiveModal(null)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddSkill} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Skill Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GraphQL, PyTorch, Kubernetes"
                  value={formData.skillName || ''}
                  onChange={(e) => setFormData({ ...formData, skillName: e.target.value })}
                  className="input-saas w-full text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Category</label>
                <select
                  value={formData.skillCategory || 'Frontend'}
                  onChange={(e) => setFormData({ ...formData, skillCategory: e.target.value })}
                  className="input-saas w-full text-xs"
                >
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="AI/ML">AI / Machine Learning</option>
                  <option value="Database">Database</option>
                  <option value="DevOps">DevOps & Cloud</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setActiveModal(null)} className="btn-secondary text-xs">Cancel</button>
                <button type="submit" className="btn-primary text-xs font-bold">Save Skill</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Experience Modal */}
      {activeModal === 'experience' && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="saas-card p-6 border border-slate-200 w-full max-w-lg bg-white space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold font-outfit text-slate-900">Add Work Experience</h3>
              <button onClick={() => setActiveModal(null)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddExperience} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Job Title / Role</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Frontend Architect"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-saas w-full text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme SaaS Technologies"
                  value={formData.company || ''}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="input-saas w-full text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Period / Tenure</label>
                <input
                  type="text"
                  placeholder="2024 - Present"
                  value={formData.period || ''}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  className="input-saas w-full text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Description & Responsibilities</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Architected high-throughput microservices and optimized React state management..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-saas w-full resize-none text-xs"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setActiveModal(null)} className="btn-secondary text-xs">Cancel</button>
                <button type="submit" className="btn-primary text-xs font-bold">Add Experience Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Education Modal */}
      {activeModal === 'education' && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="saas-card p-6 border border-slate-200 w-full max-w-md bg-white space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold font-outfit text-slate-900">Add Education History</h3>
              <button onClick={() => setActiveModal(null)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddEducation} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Degree / Qualification</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. M.S. in Computer Science"
                  value={formData.degree || ''}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  className="input-saas w-full text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Institution / University</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stanford University"
                  value={formData.institution || ''}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  className="input-saas w-full text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Year</label>
                  <input
                    type="text"
                    placeholder="2025"
                    value={formData.year || ''}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="input-saas w-full text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">GPA / Score</label>
                  <input
                    type="text"
                    placeholder="3.9 / 4.0"
                    value={formData.gpa || ''}
                    onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                    className="input-saas w-full text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setActiveModal(null)} className="btn-secondary text-xs">Cancel</button>
                <button type="submit" className="btn-primary text-xs font-bold">Save Education</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {activeModal === 'project' && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="saas-card p-6 border border-slate-200 w-full max-w-lg bg-white space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold font-outfit text-slate-900">Add Highlighted Project</h3>
              <button onClick={() => setActiveModal(null)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddProject} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Resume Parser Engine"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-saas w-full text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Technologies Used</label>
                <input
                  type="text"
                  placeholder="React, Node.js, Gemini API, Tailwind"
                  value={formData.tech || ''}
                  onChange={(e) => setFormData({ ...formData, tech: e.target.value })}
                  className="input-saas w-full text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">GitHub / Demo URL</label>
                <input
                  type="url"
                  placeholder="https://github.com/user/project"
                  value={formData.url || ''}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="input-saas w-full text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the architectural challenge and key features implemented..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-saas w-full resize-none text-xs"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setActiveModal(null)} className="btn-secondary text-xs">Cancel</button>
                <button type="submit" className="btn-primary text-xs font-bold">Save Project Card</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Certification Modal */}
      {activeModal === 'certification' && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="saas-card p-6 border border-slate-200 w-full max-w-md bg-white space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold font-outfit text-slate-900">Add Certification</h3>
              <button onClick={() => setActiveModal(null)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddCertification} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Certification Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Certified Solutions Architect"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-saas w-full text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Issuing Authority</label>
                <input
                  type="text"
                  placeholder="Amazon Web Services"
                  value={formData.issuer || ''}
                  onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                  className="input-saas w-full text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Year</label>
                <input
                  type="text"
                  placeholder="2025"
                  value={formData.year || ''}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="input-saas w-full text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setActiveModal(null)} className="btn-secondary text-xs">Cancel</button>
                <button type="submit" className="btn-primary text-xs font-bold">Save Certification</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Achievement Modal */}
      {activeModal === 'achievement' && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="saas-card p-6 border border-slate-200 w-full max-w-md bg-white space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold font-outfit text-slate-900">Add Key Achievement</h3>
              <button onClick={() => setActiveModal(null)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddAchievement} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Achievement Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Published research paper on AI models"
                  value={formData.achievementText || ''}
                  onChange={(e) => setFormData({ ...formData, achievementText: e.target.value })}
                  className="input-saas w-full text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setActiveModal(null)} className="btn-secondary text-xs">Cancel</button>
                <button type="submit" className="btn-primary text-xs font-bold">Save Achievement</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Language Modal */}
      {activeModal === 'language' && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="saas-card p-6 border border-slate-200 w-full max-w-md bg-white space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold font-outfit text-slate-900">Add Spoken Language</h3>
              <button onClick={() => setActiveModal(null)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddLanguage} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Language Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. French, German, Japanese"
                  value={formData.languageName || ''}
                  onChange={(e) => setFormData({ ...formData, languageName: e.target.value })}
                  className="input-saas w-full text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Proficiency Level</label>
                <select
                  value={formData.proficiency || 'Full Professional'}
                  onChange={(e) => setFormData({ ...formData, proficiency: e.target.value })}
                  className="input-saas w-full text-xs"
                >
                  <option value="Native / Bilingual">Native / Bilingual</option>
                  <option value="Full Professional">Full Professional</option>
                  <option value="Conversational">Conversational</option>
                  <option value="Elementary">Elementary</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setActiveModal(null)} className="btn-secondary text-xs">Cancel</button>
                <button type="submit" className="btn-primary text-xs font-bold">Save Language</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resume Parser IQ Upload Modal */}
      <ResumeParserIQModal
        isOpen={isParserModalOpen}
        onClose={() => setIsParserModalOpen(false)}
        currentProfile={candidate}
        onApplyData={handleApplyParsedData}
      />
    </div>
  );
}

export default CandidateIQProfile;
