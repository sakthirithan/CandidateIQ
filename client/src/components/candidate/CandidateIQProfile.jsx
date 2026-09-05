import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { mockCandidateService } from '../../services/mockApi/candidateService';
import { getCurrentUser } from '../../utils/auth';
import {
  User, Mail, Phone, MapPin, Briefcase, GraduationCap, Code, Award, Sparkles,
  CheckCircle2, FileText, Download, ExternalLink, Plus, Edit2, Trash2, X, Globe, Trophy
} from 'lucide-react';

function CandidateIQProfile() {
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null); // 'personal', 'education', 'experience', 'skill', 'project', 'certification', 'language', 'achievement'
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/candidates/profile');
      const currentUser = getCurrentUser();
      const prof = res.data.profile;
      if (currentUser) {
        prof.name = currentUser.name || prof.name;
        prof.email = currentUser.email || prof.email;
      }
      setCandidate(prof);
    } catch (err) {
      const mockCand = await mockCandidateService.getCandidateById('cand_1');
      const currentUser = getCurrentUser();
      setCandidate({
        ...mockCand,
        name: currentUser?.name || mockCand.name || 'Alex Johnson',
        email: currentUser?.email || mockCand.email || 'alex.johnson@example.com',
        achievements: mockCand.achievements || [
          'Ranked Top 5% in Global Hackathon 2025',
          'Author of popular open-source React UI utility package'
        ],
        languages: mockCand.languages || [
          { language: 'English', proficiency: 'Full Professional' },
          { language: 'Spanish', proficiency: 'Conversational' }
        ]
      });
    } finally {
      setLoading(false);
    }
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

  const handleSavePersonalInfo = (e) => {
    e.preventDefault();
    setCandidate((prev) => ({
      ...prev,
      name: formData.name,
      headline: formData.headline,
      email: formData.email,
      phone: formData.phone,
      location: formData.location
    }));
    setActiveModal(null);
    setFormData({});
  };

  // Section 5: Technical Skills Handlers
  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!formData.skillName?.trim()) return;
    const updated = await mockCandidateService.addSkill(candidate.id, {
      name: formData.skillName.trim(),
      level: formData.skillLevel || 'Advanced',
      category: formData.skillCategory || 'Frontend',
      confidence: 90
    });
    setCandidate({ ...updated });
    setActiveModal(null);
    setFormData({});
  };

  const handleDeleteSkill = async (skillName) => {
    const updated = await mockCandidateService.deleteSkill(candidate.id, skillName);
    setCandidate({ ...updated });
  };

  // Section 4: Experience Handlers
  const handleAddExperience = async (e) => {
    e.preventDefault();
    if (!formData.title?.trim() || !formData.company?.trim()) return;
    const updated = await mockCandidateService.addExperience(candidate.id, {
      title: formData.title.trim(),
      company: formData.company.trim(),
      period: formData.period?.trim() || '2025 - Present',
      description: formData.description?.trim() || ''
    });
    setCandidate({ ...updated });
    setActiveModal(null);
    setFormData({});
  };

  const handleDeleteExperience = async (expId) => {
    const updated = await mockCandidateService.deleteExperience(candidate.id, expId);
    setCandidate({ ...updated });
  };

  // Section 3: Education Handlers
  const handleAddEducation = (e) => {
    e.preventDefault();
    if (!formData.degree?.trim() || !formData.institution?.trim()) return;
    const newEdu = {
      id: `edu_${Date.now()}`,
      degree: formData.degree.trim(),
      institution: formData.institution.trim(),
      year: formData.year?.trim() || '2025',
      gpa: formData.gpa?.trim() || '3.8 / 4.0'
    };
    setCandidate((prev) => ({
      ...prev,
      education: [newEdu, ...(prev.education || [])]
    }));
    setActiveModal(null);
    setFormData({});
  };

  const handleDeleteEducation = (eduId) => {
    setCandidate((prev) => ({
      ...prev,
      education: (prev.education || []).filter((e) => e.id !== eduId)
    }));
  };

  // Section 6: Key Projects Handlers
  const handleAddProject = (e) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;
    const newProject = {
      id: `proj_${Date.now()}`,
      name: formData.name.trim(),
      description: formData.description?.trim() || '',
      tech: formData.tech?.trim() || 'React, Node.js',
      url: formData.url?.trim() || 'https://github.com/example/demo-project'
    };
    setCandidate((prev) => ({
      ...prev,
      projects: [newProject, ...(prev.projects || [])]
    }));
    setActiveModal(null);
    setFormData({});
  };

  const handleDeleteProject = (projId) => {
    setCandidate((prev) => ({
      ...prev,
      projects: (prev.projects || []).filter((p) => p.id !== projId)
    }));
  };

  // Section 7: Certifications Handlers
  const handleAddCertification = (e) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;
    const newCert = {
      id: `cert_${Date.now()}`,
      name: formData.name.trim(),
      issuer: formData.issuer?.trim() || 'AWS',
      year: formData.year?.trim() || '2025'
    };
    setCandidate((prev) => ({
      ...prev,
      certifications: [newCert, ...(prev.certifications || [])]
    }));
    setActiveModal(null);
    setFormData({});
  };

  const handleDeleteCertification = (certId) => {
    setCandidate((prev) => ({
      ...prev,
      certifications: (prev.certifications || []).filter((c) => c.id !== certId)
    }));
  };

  // Section 8: Achievements Handlers
  const handleAddAchievement = (e) => {
    e.preventDefault();
    if (!formData.achievementText?.trim()) return;
    setCandidate((prev) => ({
      ...prev,
      achievements: [formData.achievementText.trim(), ...(prev.achievements || [])]
    }));
    setActiveModal(null);
    setFormData({});
  };

  const handleDeleteAchievement = (index) => {
    setCandidate((prev) => ({
      ...prev,
      achievements: (prev.achievements || []).filter((_, idx) => idx !== index)
    }));
  };

  // Section 9: Languages Handlers
  const handleAddLanguage = (e) => {
    e.preventDefault();
    if (!formData.languageName?.trim()) return;
    const newLang = {
      language: formData.languageName.trim(),
      proficiency: formData.proficiency || 'Full Professional'
    };
    setCandidate((prev) => ({
      ...prev,
      languages: [newLang, ...(prev.languages || [])]
    }));
    setActiveModal(null);
    setFormData({});
  };

  const handleDeleteLanguage = (index) => {
    setCandidate((prev) => ({
      ...prev,
      languages: (prev.languages || []).filter((_, idx) => idx !== index)
    }));
  };

  if (loading || !candidate) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 select-none max-w-6xl mx-auto">
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
          <button onClick={openEditPersonalModal} className="btn-secondary text-xs flex items-center gap-1.5">
            <Edit2 className="w-3.5 h-3.5 text-indigo-600" /> Edit Profile
          </button>
          <button onClick={() => setActiveModal('skill')} className="btn-ai text-xs flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Add Skill
          </button>
        </div>
      </div>

      {/* Grid Layout for Profile Sections */}
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

            {(candidate.projects || []).map((p, idx) => (
              <div key={p.id || idx} className="space-y-1.5 pb-3 border-b border-slate-100 last:border-0 last:pb-0 group">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-900 font-outfit">{p.name}</h4>
                  <div className="flex items-center gap-2">
                    {p.url && (
                      <a href={p.url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button onClick={() => handleDeleteProject(p.id)} className="text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{p.description}</p>
                <div className="text-[11px] font-medium text-slate-500">{p.tech}</div>
              </div>
            ))}
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
    </div>
  );
}

export default CandidateIQProfile;
