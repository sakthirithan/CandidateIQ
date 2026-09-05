import React, { useState } from 'react';
import api from '../../services/api';
import { mockCandidateService } from '../../services/mockApi/candidateService';
import { getCurrentUser } from '../../utils/auth';
import {
  UploadCloud, FileText, CheckCircle2, Sparkles, Loader2, AlertCircle, ArrowRight,
  Check, ShieldCheck, Edit2, X, Trash2, ExternalLink, RefreshCw, Briefcase, GraduationCap, Code, Award
} from 'lucide-react';

function ResumeIntelligence({ onProfileUpdated, onNavigateToProfile }) {
  const [file, setFile] = useState(null);
  const [fileMeta, setFileMeta] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isStored, setIsStored] = useState(false);

  // Flow step: 'upload' | 'parsing' | 'review' | 'success'
  const [flowStep, setFlowStep] = useState('upload');
  const [parsingProgressStep, setParsingProgressStep] = useState(0);

  const [extractedData, setExtractedData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. File Selection & Validation
  const handleFileChange = (e) => {
    setError('');
    setSuccessMsg('');
    const selected = e.target.files && e.target.files[0];
    if (!selected) return;

    // Validate format
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const validExts = ['.pdf', '.doc', '.docx', '.txt'];
    const fileNameLower = selected.name.toLowerCase();
    const isValidExt = validExts.some((ext) => fileNameLower.endsWith(ext));

    if (!isValidExt && !validTypes.includes(selected.type)) {
      setError('Invalid file format. Please upload a PDF, DOC, DOCX, or TXT file.');
      return;
    }

    // Validate size (5MB)
    if (selected.size > 5 * 1024 * 1024) {
      setError('File size exceeds the 5MB limit. Please upload a smaller resume file.');
      return;
    }

    setFile(selected);
    setIsStored(false);
    setFileMeta({
      name: selected.name,
      size: (selected.size / (1024 * 1024)).toFixed(2) + ' MB',
      type: selected.name.split('.').pop().toUpperCase(),
      uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  };

  // 2. Simulate Upload Progress & Store Mock Resume
  const handleSimulateUpload = (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a valid resume file first.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setError('');

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setIsStored(true);
          return 100;
        }
        return prev + 30;
      });
    }, 200);
  };

  // 3. Trigger Mock AI Parsing Pipeline
  const handleParseResume = async () => {
    setFlowStep('parsing');
    setParsingProgressStep(1);
    setError('');

    // Progressive step indicator simulation
    setTimeout(() => setParsingProgressStep(2), 600);
    setTimeout(() => setParsingProgressStep(3), 1200);
    setTimeout(() => setParsingProgressStep(4), 1800);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      // Try API request first, fallback to mock AI parser if offline
      const res = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }).catch(() => null);

      setTimeout(() => {
        const currentUser = getCurrentUser();
        const parsedResult = res?.data?.extractedData || {
          name: currentUser?.name || 'Alex Johnson',
          email: currentUser?.email || 'alex.johnson@example.com',
          phone: '+1 (555) 234-5678',
          location: 'San Francisco, CA',
          headline: 'Senior Full-Stack Engineer & AI Researcher',
          skills: [
            { name: 'React.js', category: 'Frontend', level: 'Expert' },
            { name: 'Node.js', category: 'Backend', level: 'Advanced' },
            { name: 'TypeScript', category: 'Frontend', level: 'Advanced' },
            { name: 'Python', category: 'AI/ML', level: 'Intermediate' },
            { name: 'GraphQL', category: 'Backend', level: 'Advanced' },
            { name: 'Docker', category: 'DevOps', level: 'Intermediate' }
          ],
          experiences: [
            {
              id: 'exp_parsed_1',
              title: 'Senior Frontend Architect',
              company: 'Acme SaaS Cloud',
              period: '2023 - Present',
              description: 'Architected high-throughput micro-frontend interfaces, reducing web bundle load times by 42% and implementing real-time WebSocket state management.'
            },
            {
              id: 'exp_parsed_2',
              title: 'Full Stack Software Engineer',
              company: 'TechCorp Solutions',
              period: '2021 - 2023',
              description: 'Built scalable REST APIs and React dashboards used by 100,000+ monthly active enterprise users.'
            }
          ],
          education: [
            {
              id: 'edu_parsed_1',
              degree: 'M.S. in Computer Science & AI',
              institution: 'Stanford University',
              year: '2021',
              gpa: '3.9 / 4.0'
            },
            {
              id: 'edu_parsed_2',
              degree: 'B.S. in Software Engineering',
              institution: 'UC Berkeley',
              year: '2019',
              gpa: '3.8 / 4.0'
            }
          ],
          projects: [
            {
              id: 'proj_parsed_1',
              name: 'AI Resume Intelligence Engine',
              tech: 'React, Node.js, Gemini API, TailwindCSS',
              url: 'https://github.com/example/resume-parser',
              description: 'Automated candidate parsing pipeline extracting skills, timeline events, and match confidence scores.'
            }
          ],
          certifications: [
            {
              id: 'cert_parsed_1',
              name: 'AWS Certified Solutions Architect',
              issuer: 'Amazon Web Services',
              year: '2024'
            }
          ]
        };

        setExtractedData(parsedResult);
        setEditFormData(JSON.parse(JSON.stringify(parsedResult)));
        setFlowStep('review');
      }, 2200);
    } catch (err) {
      setError('An error occurred during resume parsing.');
      setFlowStep('upload');
    }
  };

  // 4. Candidate Action: Accept & Confirm Profile Update
  const handleConfirmAndSave = async () => {
    try {
      const finalData = isEditing ? editFormData : extractedData;
      await mockCandidateService.updateCandidate('cand_1', finalData);
      
      setSuccessMsg('Candidate profile successfully updated with parsed resume data!');
      setFlowStep('success');
      if (onProfileUpdated) onProfileUpdated();
    } catch (err) {
      setError('Failed to update candidate profile.');
    }
  };

  // 5. Candidate Action: Reject & Discard Parsed Data
  const handleRejectAndReset = () => {
    setExtractedData(null);
    setEditFormData({});
    setIsEditing(false);
    setFlowStep('upload');
    setError('');
  };

  return (
    <div className="p-6 md:p-8 space-y-8 select-none max-w-5xl mx-auto">
      {/* Alert Notifications */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 shadow-sm">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: UPLOAD & FILE PREVIEW SCREEN */}
      {flowStep === 'upload' && (
        <div className="saas-card p-6 md:p-8 border border-slate-200/90 space-y-6 bg-white shadow-sm">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold font-outfit text-slate-950">Resume Management & Parser</h2>
              <p className="text-xs text-slate-500 font-medium">Upload PDF/DOCX resume to test automated AI profile extraction workflow.</p>
            </div>
          </div>

          <form onSubmit={handleSimulateUpload} className="space-y-5">
            <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-3xl p-8 sm:p-10 text-center bg-slate-50/50 hover:bg-indigo-50/20 transition-all cursor-pointer group">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
                id="resume-drop-input"
                className="hidden"
              />
              <label htmlFor="resume-drop-input" className="cursor-pointer flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
                  <FileText className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-bold text-slate-900 block font-outfit">
                    {file ? file.name : 'Click to browse or drop resume PDF/DOCX file here'}
                  </span>
                  <span className="text-xs text-slate-400 font-medium block">Supported formats: PDF, DOCX, DOC, TXT (Max 5MB)</span>
                </div>
              </label>
            </div>

            {/* Upload Progress Bar */}
            {isUploading && (
              <div className="space-y-1.5 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                <div className="flex justify-between text-xs font-semibold text-indigo-900">
                  <span>Uploading to mock secure store...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-indigo-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-200 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {!isStored && (
              <button
                type="submit"
                disabled={isUploading || !file}
                className="w-full py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs shadow-md disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
              >
                <UploadCloud className="w-4 h-4 text-indigo-400" /> Upload & Store Resume File
              </button>
            )}
          </form>

          {/* Stored Resume Preview Card */}
          {isStored && fileMeta && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs font-outfit">
                    {fileMeta.type}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-950 font-outfit">{fileMeta.name}</h4>
                    <p className="text-[11px] text-slate-500 font-medium">{fileMeta.size} • Uploaded at {fileMeta.uploadedAt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge-pill badge-success text-[10px]">Stored in Mock DB</span>
                  <button
                    onClick={() => { setFile(null); setIsStored(false); }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/60 flex justify-end">
                <button
                  onClick={handleParseResume}
                  className="btn-ai text-xs flex items-center gap-2 px-6 py-2.5 font-bold shadow-md"
                >
                  <Sparkles className="w-4 h-4 text-indigo-300" /> Parse Resume with Mock AI Parser
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: PARSING SIMULATION SCREEN */}
      {flowStep === 'parsing' && (
        <div className="saas-card p-10 border border-slate-200/90 space-y-6 bg-white text-center shadow-sm max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto animate-pulse">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black font-outfit text-slate-950">Mock AI Parser Executing</h3>
            <p className="text-xs text-slate-500 font-medium">Extracting entity models, skill tags, and experience timelines...</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 text-left space-y-3 text-xs">
            <div className={`flex items-center gap-2.5 ${parsingProgressStep >= 1 ? 'text-indigo-950 font-bold' : 'text-slate-400'}`}>
              <CheckCircle2 className={`w-4 h-4 ${parsingProgressStep >= 1 ? 'text-indigo-600' : 'text-slate-300'}`} />
              <span>Step 1: Reading document streams and text contents...</span>
            </div>
            <div className={`flex items-center gap-2.5 ${parsingProgressStep >= 2 ? 'text-indigo-950 font-bold' : 'text-slate-400'}`}>
              <CheckCircle2 className={`w-4 h-4 ${parsingProgressStep >= 2 ? 'text-indigo-600' : 'text-slate-300'}`} />
              <span>Step 2: Extracting Extracted Name, Email, Phone & Headline...</span>
            </div>
            <div className={`flex items-center gap-2.5 ${parsingProgressStep >= 3 ? 'text-indigo-950 font-bold' : 'text-slate-400'}`}>
              <CheckCircle2 className={`w-4 h-4 ${parsingProgressStep >= 3 ? 'text-indigo-600' : 'text-slate-300'}`} />
              <span>Step 3: Parsing Education Background & Work Experience Timeline...</span>
            </div>
            <div className={`flex items-center gap-2.5 ${parsingProgressStep >= 4 ? 'text-indigo-950 font-bold' : 'text-slate-400'}`}>
              <CheckCircle2 className={`w-4 h-4 ${parsingProgressStep >= 4 ? 'text-indigo-600' : 'text-slate-300'}`} />
              <span>Step 4: Structuring Technical Skills Matrix, Projects & Certifications...</span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: REVIEW SCREEN (ACCEPT / EDIT / REJECT) */}
      {flowStep === 'review' && extractedData && (
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="saas-card p-6 border border-slate-200/90 flex flex-wrap justify-between items-center gap-4 bg-white shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold font-outfit text-slate-950">Parsed Resume Review Screen</h3>
                <span className="badge-pill badge-indigo text-[10px]">Mock AI Parser Result</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Review, edit, accept, or reject the extracted candidate identity fields.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleRejectAndReset}
                className="btn-secondary text-xs text-rose-600 hover:bg-rose-50 border-rose-200"
              >
                <X className="w-3.5 h-3.5" /> Reject & Discard
              </button>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn-secondary text-xs"
              >
                <Edit2 className="w-3.5 h-3.5 text-indigo-600" /> {isEditing ? 'Cancel Edit' : 'Edit Extracted Data'}
              </button>
              <button
                onClick={handleConfirmAndSave}
                className="btn-primary text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 font-bold"
              >
                <Check className="w-4 h-4" /> Accept & Update Profile
              </button>
            </div>
          </div>

          {/* Review Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Personal Info & Headline & Skills */}
            <div className="space-y-6">
              {/* Identity Box */}
              <div className="saas-card p-6 border border-slate-200/80 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                  Extracted Identity & Contact
                </h4>
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Extracted Name</label>
                      <input
                        type="text"
                        value={editFormData.name || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        className="input-saas w-full text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Professional Headline</label>
                      <input
                        type="text"
                        value={editFormData.headline || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, headline: e.target.value })}
                        className="input-saas w-full text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Extracted Email</label>
                      <input
                        type="email"
                        value={editFormData.email || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                        className="input-saas w-full text-xs"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Extracted Name</span>
                      <span className="font-extrabold text-slate-950 text-base font-outfit">{extractedData.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Headline</span>
                      <span className="font-bold text-indigo-600">{extractedData.headline}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Extracted Email</span>
                      <span className="font-medium text-slate-700">{extractedData.email}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Technical Skills Box */}
              <div className="saas-card p-6 border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <Code className="w-4 h-4 text-indigo-600" /> Extracted Technical Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(extractedData.skills || []).map((skill, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-900 border border-indigo-100 text-xs font-bold">
                      {skill.name || skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Column 2 & 3: Experience, Education, Projects & Certifications */}
            <div className="lg:col-span-2 space-y-6">
              {/* Experience Box */}
              <div className="saas-card p-6 border border-slate-200/80 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-indigo-600" /> Extracted Experience Timeline
                </h4>
                <div className="space-y-3">
                  {(extractedData.experiences || []).map((exp, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <div className="flex justify-between items-center">
                        <h5 className="text-xs font-bold text-slate-950 font-outfit">{exp.title}</h5>
                        <span className="text-[11px] font-semibold text-slate-500">{exp.period}</span>
                      </div>
                      <p className="text-xs text-indigo-600 font-bold">{exp.company}</p>
                      <p className="text-xs text-slate-600 leading-relaxed pt-1">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education & Projects Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Education */}
                <div className="saas-card p-6 border border-slate-200/80 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-emerald-600" /> Extracted Education
                  </h4>
                  {(extractedData.education || []).map((edu, idx) => (
                    <div key={idx} className="space-y-0.5 text-xs">
                      <span className="font-bold text-slate-900 block font-outfit">{edu.degree}</span>
                      <span className="text-slate-500 block">{edu.institution} • {edu.year}</span>
                    </div>
                  ))}
                </div>

                {/* Certifications */}
                <div className="saas-card p-6 border border-slate-200/80 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-purple-600" /> Extracted Certifications
                  </h4>
                  {(extractedData.certifications || []).map((cert, idx) => (
                    <div key={idx} className="space-y-0.5 text-xs">
                      <span className="font-bold text-slate-900 block font-outfit">{cert.name}</span>
                      <span className="text-slate-500 block">{cert.issuer} ({cert.year})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: SUCCESS CONFIRMATION SCREEN */}
      {flowStep === 'success' && (
        <div className="saas-card p-10 border border-slate-200/90 space-y-6 bg-white text-center shadow-sm max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black font-outfit text-slate-950">Candidate Profile Updated!</h3>
            <p className="text-xs text-slate-500 font-medium">The parsed resume metadata was saved to your profile record.</p>
          </div>

          <div className="pt-4 flex justify-center gap-3">
            <button
              onClick={() => setFlowStep('upload')}
              className="btn-secondary text-xs"
            >
              Upload Another Resume
            </button>
            <button
              onClick={() => {
                if (onNavigateToProfile) onNavigateToProfile();
              }}
              className="btn-primary text-xs font-bold"
            >
              View Updated Candidate Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResumeIntelligence;
