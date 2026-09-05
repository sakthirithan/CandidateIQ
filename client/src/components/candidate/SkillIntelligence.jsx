import React, { useState } from 'react';
import {
  Brain, Code, Cpu, Database, Cloud, Server, Sparkles, Layers, Award,
  Plus, Edit2, Trash2, X, CheckCircle2, Filter, Search, ShieldCheck, RefreshCw, BarChart2
} from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const SKILL_CATEGORIES = [
  'All',
  'Programming',
  'Frontend',
  'Backend',
  'Database',
  'Cloud',
  'DevOps',
  'AI/ML',
  'Tools',
  'Soft Skills'
];

const INITIAL_SKILLS = [
  {
    id: 'sk_1',
    name: 'Python',
    category: 'Programming',
    estimatedLevel: 'Expert',
    confidence: 90,
    evidence: 'Validated by 4 GitHub repositories, ML models, & coding assessments',
    source: 'GitHub Analysis'
  },
  {
    id: 'sk_2',
    name: 'React.js',
    category: 'Frontend',
    estimatedLevel: 'Expert',
    confidence: 82,
    evidence: 'Verified across candidate portfolio projects & state management architecture',
    source: 'Resume Parsing'
  },
  {
    id: 'sk_3',
    name: 'Node.js',
    category: 'Backend',
    estimatedLevel: 'Advanced',
    confidence: 78,
    evidence: 'Extracted from microservices API development & Express controllers',
    source: 'Resume Parsing'
  },
  {
    id: 'sk_4',
    name: 'MongoDB',
    category: 'Database',
    estimatedLevel: 'Advanced',
    confidence: 72,
    evidence: 'Demonstrated proficiency in schema indexing & aggregation pipelines',
    source: 'Assessment'
  },
  {
    id: 'sk_5',
    name: 'Docker',
    category: 'DevOps',
    estimatedLevel: 'Intermediate',
    confidence: 40,
    evidence: 'Containerized multi-service MERN application deployments',
    source: 'Manual Entry'
  },
  {
    id: 'sk_6',
    name: 'AWS Cloud',
    category: 'Cloud',
    estimatedLevel: 'Intermediate',
    confidence: 65,
    evidence: 'AWS Certified Solutions Architect & S3/EC2 experience',
    source: 'Resume Parsing'
  },
  {
    id: 'sk_7',
    name: 'PyTorch / Gemini API',
    category: 'AI/ML',
    estimatedLevel: 'Advanced',
    confidence: 85,
    evidence: 'Implemented LLM prompt chains and embeddings pipeline',
    source: 'GitHub Analysis'
  },
  {
    id: 'sk_8',
    name: 'Git & GitHub Actions',
    category: 'Tools',
    estimatedLevel: 'Expert',
    confidence: 88,
    evidence: 'Automated CI/CD workflows and version management',
    source: 'GitHub Analysis'
  },
  {
    id: 'sk_9',
    name: 'Technical Leadership',
    category: 'Soft Skills',
    estimatedLevel: 'Advanced',
    confidence: 80,
    evidence: 'Led cross-functional team of 5 engineers in hackathon win',
    source: 'Manual Entry'
  }
];

function SkillIntelligence() {
  const [skills, setSkills] = useState(INITIAL_SKILLS);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNormalizing, setIsNormalizing] = useState(false);
  const [normalizeSuccess, setNormalizeSuccess] = useState(false);

  // Modal State
  const [activeModal, setActiveModal] = useState(null); // 'add' | 'edit'
  const [editingSkillId, setEditingSkillId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Programming',
    estimatedLevel: 'Advanced',
    confidence: 80,
    evidence: '',
    source: 'Manual Entry'
  });

  // Filter skills by Category & Search
  const filteredSkills = skills.filter((s) => {
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.evidence.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate Dynamic Radar Chart Data from Active Skills
  const radarCategories = ['Programming', 'Frontend', 'Backend', 'Database', 'Cloud', 'DevOps', 'AI/ML', 'Tools'];
  const radarData = radarCategories.map((cat) => {
    const catSkills = skills.filter((s) => s.category.includes(cat) || cat.includes(s.category));
    const avgScore = catSkills.length > 0
      ? Math.round(catSkills.reduce((acc, curr) => acc + curr.confidence, 0) / catSkills.length)
      : 60;
    return { category: cat, score: avgScore };
  });

  // Calculate Overall Average Confidence Score
  const overallAvg = Math.round(skills.reduce((acc, curr) => acc + curr.confidence, 0) / (skills.length || 1));

  // 1. Skill Flow: Simulate Normalize & Calculate Mock Confidence
  const handleNormalizeSkills = () => {
    setIsNormalizing(true);
    setNormalizeSuccess(false);
    setTimeout(() => {
      setSkills((prev) =>
        prev.map((s) => ({
          ...s,
          confidence: Math.min(98, Math.max(35, s.confidence + (Math.floor(Math.random() * 7) - 3))),
          evidence: s.evidence.includes('Normalized') ? s.evidence : `${s.evidence} (Normalized via AI Engine)`
        }))
      );
      setIsNormalizing(false);
      setNormalizeSuccess(true);
      setTimeout(() => setNormalizeSuccess(false), 3000);
    }, 800);
  };

  // 2. CRUD - Add Skill
  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      category: selectedCategory !== 'All' ? selectedCategory : 'Programming',
      estimatedLevel: 'Advanced',
      confidence: 80,
      evidence: 'Added via manual entry',
      source: 'Manual Entry'
    });
    setEditingSkillId(null);
    setActiveModal('add');
  };

  const handleOpenEditModal = (skill) => {
    setFormData({
      name: skill.name,
      category: skill.category,
      estimatedLevel: skill.estimatedLevel,
      confidence: skill.confidence,
      evidence: skill.evidence,
      source: skill.source
    });
    setEditingSkillId(skill.id);
    setActiveModal('edit');
  };

  const handleSaveSkill = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (activeModal === 'add') {
      const newSkill = {
        id: `sk_${Date.now()}`,
        name: formData.name.trim(),
        category: formData.category,
        estimatedLevel: formData.estimatedLevel,
        confidence: Number(formData.confidence) || 75,
        evidence: formData.evidence.trim() || 'Verified via skill entry',
        source: formData.source
      };
      setSkills([newSkill, ...skills]);
    } else if (activeModal === 'edit' && editingSkillId) {
      setSkills(skills.map((s) => s.id === editingSkillId ? {
        ...s,
        name: formData.name.trim(),
        category: formData.category,
        estimatedLevel: formData.estimatedLevel,
        confidence: Number(formData.confidence),
        evidence: formData.evidence.trim(),
        source: formData.source
      } : s));
    }

    setActiveModal(null);
  };

  // 3. CRUD - Delete Skill
  const handleDeleteSkill = (skillId) => {
    setSkills(skills.filter((s) => s.id !== skillId));
  };

  const getConfidenceColor = (conf) => {
    if (conf >= 85) return 'bg-emerald-500 text-emerald-700 border-emerald-200';
    if (conf >= 70) return 'bg-indigo-500 text-indigo-700 border-indigo-200';
    if (conf >= 50) return 'bg-amber-500 text-amber-700 border-amber-200';
    return 'bg-rose-500 text-rose-700 border-rose-200';
  };

  return (
    <div className="p-6 md:p-8 space-y-8 select-none max-w-6xl mx-auto">
      {/* Top Header Banner */}
      <div className="saas-card p-6 md:p-8 border border-slate-200/90 flex flex-wrap justify-between items-center gap-6 bg-white shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold font-outfit text-slate-950 tracking-tight">Skill Intelligence Matrix</h2>
            <span className="badge-pill badge-ai text-[10px]">
              <Sparkles className="w-3 h-3 text-indigo-600" /> AI Density Analysis
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Turn candidate skills into structured intelligence with verified confidence scores and evidence callouts.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleNormalizeSkills}
            disabled={isNormalizing}
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${isNormalizing ? 'animate-spin' : ''}`} />
            {isNormalizing ? 'Normalizing...' : 'Normalize & Recalculate'}
          </button>
          <button onClick={handleOpenAddModal} className="btn-primary text-xs font-bold flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Add Skill
          </button>
        </div>
      </div>

      {normalizeSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 font-medium shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Skills successfully normalized! Confidence weights recalculated across 9 categories.</span>
        </div>
      )}

      {/* Radar Chart & High-Level Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Chart (2 cols) */}
        <div className="lg:col-span-2 saas-card p-6 md:p-8 border border-slate-200/80 space-y-4 bg-white shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Brain className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold font-outfit text-slate-950">Multi-Dimensional Skill Radar</h3>
            </div>
            <span className="badge-pill badge-neutral text-[10px]">Dynamic Evaluation</span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#cbd5e1" />
                <PolarAngleAxis dataKey="category" tick={{ fill: '#0f172a', fontSize: 11, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Skill Density" dataKey="score" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Overall Score Summary (1 col) */}
        <div className="saas-card p-6 border border-slate-200/80 space-y-5 bg-white shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-3 flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-indigo-600" /> Overall Skill Density
            </h3>

            <div className="text-center p-6 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-1">
              <span className="text-4xl font-black font-outfit text-slate-950">{overallAvg}%</span>
              <span className="text-xs text-indigo-600 font-bold block">Aggregated Confidence Rating</span>
            </div>

            <div className="space-y-2 pt-2 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Total Tracked Skills</span>
                <span className="font-bold text-slate-950">{skills.length} Skills</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Expert Level Skills</span>
                <span className="font-bold text-emerald-600">{skills.filter(s => s.estimatedLevel === 'Expert').length} Skills</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Primary Category</span>
                <span className="font-bold text-indigo-600">Programming / Frontend</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 font-medium leading-relaxed">
            💡 Confidence ratings are computed using evidence density from GitHub commits, project frequency, and assessment tests.
          </div>
        </div>
      </div>

      {/* Category Filter Pills & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {SKILL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-950 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search skills or evidence..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-saas pl-8 w-full text-xs"
            />
          </div>
        </div>

        {/* Skill Confidence List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSkills.map((skill) => (
            <div key={skill.id} className="saas-card p-5 border border-slate-200/80 space-y-3 bg-white hover:border-indigo-300 transition-all group shadow-sm">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold font-outfit text-slate-950">{skill.name}</h4>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                      {skill.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      skill.estimatedLevel === 'Expert' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      skill.estimatedLevel === 'Advanced' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                      'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {skill.estimatedLevel}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-indigo-600 shrink-0" /> {skill.evidence}
                  </p>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenEditModal(skill)} className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDeleteSkill(skill.id)} className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Confidence Progress Bar */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[11px] text-slate-400 font-mono">Source: {skill.source}</span>
                  <span className="font-extrabold text-slate-900 font-mono">{skill.confidence}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      skill.confidence >= 85 ? 'bg-emerald-500' :
                      skill.confidence >= 70 ? 'bg-indigo-600' :
                      skill.confidence >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${skill.confidence}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}

          {filteredSkills.length === 0 && (
            <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-slate-200/80 text-slate-500 text-xs">
              No skills match the selected filter category or search query.
            </div>
          )}
        </div>
      </div>

      {/* CRUD Modal (Add / Edit Skill) */}
      {activeModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="saas-card p-6 border border-slate-200 w-full max-w-md bg-white space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold font-outfit text-slate-900">
                {activeModal === 'add' ? 'Add Structured Skill' : 'Edit Skill Intelligence'}
              </h3>
              <button onClick={() => setActiveModal(null)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>

            <form onSubmit={handleSaveSkill} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Skill Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Python, React.js, PyTorch"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-saas w-full text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-saas w-full text-xs"
                  >
                    {SKILL_CATEGORIES.filter(c => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Estimated Level</label>
                  <select
                    value={formData.estimatedLevel}
                    onChange={(e) => setFormData({ ...formData, estimatedLevel: e.target.value })}
                    className="input-saas w-full text-xs"
                  >
                    <option value="Expert">Expert</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Beginner">Beginner</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                  <label>Confidence Rating</label>
                  <span className="font-mono text-indigo-600 font-bold">{formData.confidence}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="99"
                  value={formData.confidence}
                  onChange={(e) => setFormData({ ...formData, confidence: e.target.value })}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Evidence Callout</label>
                <input
                  type="text"
                  placeholder="e.g. Validated by 3 GitHub repositories & coding test"
                  value={formData.evidence}
                  onChange={(e) => setFormData({ ...formData, evidence: e.target.value })}
                  className="input-saas w-full text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Data Source</label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="input-saas w-full text-xs"
                >
                  <option value="GitHub Analysis">GitHub Analysis</option>
                  <option value="Resume Parsing">Resume Parsing</option>
                  <option value="Assessment">Assessment Test</option>
                  <option value="Manual Entry">Manual Entry</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setActiveModal(null)} className="btn-secondary text-xs">Cancel</button>
                <button type="submit" className="btn-primary text-xs font-bold">
                  {activeModal === 'add' ? 'Save Skill Object' : 'Update Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SkillIntelligence;
