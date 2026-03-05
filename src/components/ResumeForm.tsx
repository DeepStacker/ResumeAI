'use client';

import React, { useState, useCallback, useRef } from 'react';
import {
  Briefcase, User, MapPin, GraduationCap, Code, FileText, Send, Upload,
  Sparkles, ChevronRight, ChevronLeft, X, Check, Loader2, Plus, Trash2,
  Globe, Mail, Phone, Linkedin, Github, Target, ClipboardList, Languages, Award
} from 'lucide-react';
import {
  ResumeData, ResumeTemplate, WorkEntry, ProjectEntry, EducationEntry,
  createWorkEntry, createProjectEntry, createEducationEntry, emptyResumeData
} from '@/types/resume';

interface ResumeFormProps {
  onSubmit: (data: ResumeData) => void;
  isLoading: boolean;
}

const STEPS = [
  { id: 0, title: 'Start',       icon: Upload,         desc: 'Upload existing resume or start fresh' },
  { id: 1, title: 'Personal',    icon: User,           desc: 'Contact details and online profiles' },
  { id: 2, title: 'Target & JD', icon: Target,         desc: 'Target role and optional job description for ATS' },
  { id: 3, title: 'Skills',      icon: Code,           desc: 'Technical and soft skills' },
  { id: 4, title: 'Experience',  icon: Briefcase,      desc: 'Work history with achievement bullets' },
  { id: 5, title: 'Projects',    icon: Globe,          desc: 'Notable projects and contributions' },
  { id: 6, title: 'Education',   icon: GraduationCap,  desc: 'Degrees, certifications, and courses' },
  { id: 7, title: 'Review',      icon: Send,           desc: 'Summary, extras, template, and generate' },
];

const TEMPLATES: { id: ResumeTemplate; name: string; desc: string }[] = [
  { id: 'professional', name: 'Professional', desc: 'Clean, traditional corporate layout' },
  { id: 'modern',       name: 'Modern',       desc: 'Contemporary with accent sections' },
  { id: 'minimal',      name: 'Minimal',      desc: 'Simple, highly ATS-parseable' },
];

export default function ResumeForm({ onSubmit, isLoading }: ResumeFormProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<ResumeData>(emptyResumeData);

  // AI suggestions
  const [suggestions, setSuggestions] = useState<Record<string, string>>({});
  const [loadingSuggestion, setLoadingSuggestion] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  // Upload
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Skill input
  const [skillInput, setSkillInput] = useState('');
  const [certInput, setCertInput] = useState('');
  const [langInput, setLangInput] = useState('');

  // --- Helpers ---
  const updatePersonal = (field: string, value: string) => {
    setData(d => ({ ...d, personal: { ...d.personal, [field]: value } }));
  };

  const updateField = (field: keyof ResumeData, value: unknown) => {
    setData(d => ({ ...d, [field]: value }));
  };

  // --- Skills ---
  const addChip = (arr: string[], setArr: (v: string[]) => void, input: string, setInput: (v: string) => void) => {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (!arr.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      setArr([...arr, trimmed]);
    }
    setInput('');
  };

  const removeChip = (arr: string[], setArr: (v: string[]) => void, idx: number) => {
    setArr(arr.filter((_, i) => i !== idx));
  };

  // --- Work Entries ---
  const addWorkEntry = () => updateField('experience', [...data.experience, createWorkEntry()]);
  const removeWorkEntry = (id: string) => updateField('experience', data.experience.filter(e => e.id !== id));
  const updateWork = (id: string, field: keyof WorkEntry, value: unknown) => {
    updateField('experience', data.experience.map(e => e.id === id ? { ...e, [field]: value } : e));
  };
  const addBullet = (id: string) => {
    updateField('experience', data.experience.map(e =>
      e.id === id ? { ...e, bullets: [...e.bullets, ''] } : e
    ));
  };
  const updateBullet = (entryId: string, bulletIdx: number, value: string) => {
    updateField('experience', data.experience.map(e =>
      e.id === entryId ? { ...e, bullets: e.bullets.map((b, i) => i === bulletIdx ? value : b) } : e
    ));
  };
  const removeBullet = (entryId: string, bulletIdx: number) => {
    updateField('experience', data.experience.map(e =>
      e.id === entryId ? { ...e, bullets: e.bullets.filter((_, i) => i !== bulletIdx) } : e
    ));
  };

  // --- Project Entries ---
  const addProject = () => updateField('projects', [...data.projects, createProjectEntry()]);
  const removeProject = (id: string) => updateField('projects', data.projects.filter(p => p.id !== id));
  const updateProject = (id: string, field: keyof ProjectEntry, value: string) => {
    updateField('projects', data.projects.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  // --- Education Entries ---
  const addEdu = () => updateField('education', [...data.education, createEducationEntry()]);
  const removeEdu = (id: string) => updateField('education', data.education.filter(e => e.id !== id));
  const updateEdu = (id: string, field: keyof EducationEntry, value: string) => {
    updateField('education', data.education.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  // --- AI Suggestions ---
  const fetchSuggestion = async (field: string, value: string) => {
    setLoadingSuggestion(field);
    try {
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, value, target_role: data.targetRole }),
      });
      const result = await res.json();
      if (result.suggestion) setSuggestions(p => ({ ...p, [field]: result.suggestion }));
    } catch { /* silent */ }
    setLoadingSuggestion(null);
  };

  const applySuggestion = (field: string) => {
    const s = suggestions[field];
    if (!s) return;
    if (field === 'skills') {
      const newSkills = s.split(',').map(sk => sk.trim()).filter(sk => sk);
      updateField('skills', [...new Set([...data.skills, ...newSkills])]);
    } else if (field === 'summary') {
      updateField('summary', s);
    }
    dismissSuggestion(field);
  };

  const dismissSuggestion = (field: string) => {
    setSuggestions(p => { const c = { ...p }; delete c[field]; return c; });
  };

  const generateSummary = async () => {
    setSummaryLoading(true);
    try {
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          field: 'summary',
          value: JSON.stringify({
            name: data.personal.fullName,
            role: data.targetRole,
            skills: data.skills.join(', '),
            experience: data.experience.map(e => `${e.jobTitle} at ${e.company}`).join('; '),
            education: data.education.map(e => `${e.degree} from ${e.institution}`).join('; '),
          }),
          target_role: data.targetRole,
        }),
      });
      const result = await res.json();
      if (result.suggestion) updateField('summary', result.suggestion);
    } catch { /* silent */ }
    setSummaryLoading(false);
  };

  // Debounced skill suggestion
  const onSkillsChange = (newSkills: string[]) => {
    updateField('skills', newSkills);
    const val = newSkills.join(', ');
    if (val.length > 10) {
      if (debounceTimers.current['skills']) clearTimeout(debounceTimers.current['skills']);
      debounceTimers.current['skills'] = setTimeout(() => fetchSuggestion('skills', val), 2000);
    }
  };

  // --- Upload ---
  const processFile = async (file: File) => {
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.txt', '.md', '.pdf', '.docx'].includes(ext)) {
      setUploadMsg('Unsupported format. Use PDF, DOCX, TXT, or MD.');
      return;
    }
    setIsUploading(true);
    setUploadMsg(null);
    setUploadedFile(file.name);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/parse-resume', { method: 'POST', body: fd });
      const result = await res.json();
      if (result.parsed) {
        const p = result.parsed;
        setData(d => ({
          ...d,
          personal: {
            fullName: p.fullName || p.name || d.personal.fullName,
            email: p.email || d.personal.email,
            phone: p.phone || d.personal.phone,
            location: p.location || d.personal.location,
            linkedin: p.linkedin || d.personal.linkedin,
            github: p.github || d.personal.github,
            portfolio: p.portfolio || d.personal.portfolio,
          },
          summary: p.summary || d.summary,
          targetRole: p.targetRole || p.target_role || d.targetRole,
          skills: p.skills ? (Array.isArray(p.skills) ? p.skills : p.skills.split(',').map((s: string) => s.trim()).filter(Boolean)) : d.skills,
          experience: p.experience && Array.isArray(p.experience) && p.experience.length > 0
            ? p.experience.map((e: any) => ({
                id: crypto.randomUUID(),
                jobTitle: e.jobTitle || e.title || '',
                company: e.company || '',
                location: e.location || '',
                startDate: e.startDate || '',
                endDate: e.endDate || '',
                bullets: Array.isArray(e.bullets) ? e.bullets : (e.description ? [e.description] : ['']),
              }))
            : d.experience,
          projects: p.projects && Array.isArray(p.projects)
            ? p.projects.map((pr: any) => ({
                id: crypto.randomUUID(),
                name: pr.name || '',
                techStack: pr.techStack || pr.tech || '',
                description: pr.description || '',
                link: pr.link || '',
              }))
            : d.projects,
          education: p.education && Array.isArray(p.education) && p.education.length > 0
            ? p.education.map((ed: any) => ({
                id: crypto.randomUUID(),
                degree: ed.degree || '',
                institution: ed.institution || '',
                year: ed.year || '',
                gpa: ed.gpa || '',
              }))
            : d.education,
          certifications: p.certifications && Array.isArray(p.certifications) ? p.certifications : d.certifications,
          languages: p.languages && Array.isArray(p.languages) ? p.languages : d.languages,
        }));
        setUploadMsg('✅ Resume parsed! Review each section below.');
        setStep(1);
      } else {
        setUploadMsg(result.error || 'Could not parse.');
        setUploadedFile(null);
      }
    } catch {
      setUploadMsg('Upload failed.');
      setUploadedFile(null);
    }
    setIsUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(data);
  };

  const nextStep = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  const canProceed = useCallback((s: number): boolean => {
    switch (s) {
      case 1: return data.personal.fullName.trim().length > 0 && (data.personal.email.trim().length > 0 || data.personal.phone.trim().length > 0);
      case 2: return data.targetRole.trim().length > 0;
      default: return true;
    }
  }, [data]);

  const filledCount = [
    data.personal.fullName, data.personal.email || data.personal.phone,
    data.targetRole, data.skills.length > 0 ? 'y' : '',
    data.experience.some(e => e.jobTitle) ? 'y' : '',
    data.education.some(e => e.degree) ? 'y' : '',
  ].filter(Boolean).length;
  const progress = Math.round((filledCount / 6) * 100);
  const isLastStep = step === STEPS.length - 1;

  // --- Suggestion Bubble ---
  const SuggestionBubble = ({ field }: { field: string }) => {
    if (loadingSuggestion === field) {
      return <div className="ai-suggestion-bubble loading"><Loader2 size={14} className="spin-icon" /><span>AI is thinking...</span></div>;
    }
    if (!suggestions[field]) return null;
    return (
      <div className="ai-suggestion-bubble animate-fade-in">
        <div className="ai-suggestion-header"><Sparkles size={14} /><span>AI Suggestion</span><button onClick={() => dismissSuggestion(field)} className="suggestion-dismiss" type="button"><X size={12} /></button></div>
        <p className="ai-suggestion-text">{suggestions[field]}</p>
        <button onClick={() => applySuggestion(field)} className="suggestion-apply-btn" type="button"><Check size={14} /> Apply</button>
      </div>
    );
  };

  return (
    <div className="form-panel glass-panel animate-fade-in">
      {step > 0 && (
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          <span className="progress-bar-label">{progress}%</span>
        </div>
      )}

      <div className="stepper">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <button key={s.id} className={`stepper-item ${step === i ? 'active' : ''} ${step > i ? 'done' : ''}`} onClick={() => setStep(i)} type="button">
              <div className="stepper-icon">{step > i ? <Check size={12} /> : <Icon size={12} />}</div>
              <span className="stepper-label">{s.title}</span>
            </button>
          );
        })}
      </div>

      <div className="step-header">
        <h2 className="step-title">{React.createElement(STEPS[step].icon, { size: 20, color: 'var(--primary)' })} {STEPS[step].title}</h2>
        <p className="step-desc">{STEPS[step].desc}</p>
      </div>

      <form onSubmit={handleSubmit}>

        {/* === STEP 0: Upload === */}
        {step === 0 && (
          <div className="animate-fade-in">
            <div className="upload-zone" onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
              onDragLeave={e => e.currentTarget.classList.remove('drag-over')}
              onDrop={handleDrop}>
              {isUploading ? <Loader2 size={36} className="spin-icon" color="var(--primary)" /> : <div className="upload-zone-icon-wrap"><Upload size={28} /></div>}
              <p className="upload-zone-title">{isUploading ? 'Parsing...' : 'Drop your resume here'}</p>
              <p className="upload-zone-sub">PDF, DOCX, TXT, or MD</p>
              {uploadedFile && !isUploading && <div className="upload-file-badge"><FileText size={12} /> {uploadedFile}</div>}
              <input ref={fileRef} type="file" accept=".txt,.md,.pdf,.docx" onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); }} style={{ display: 'none' }} />
            </div>
            {uploadMsg && <div className={`upload-message animate-fade-in ${uploadMsg.startsWith('✅') ? 'success' : 'error'}`}>{uploadMsg}</div>}
            <div className="divider-or"><span>OR</span></div>
            <button type="button" onClick={nextStep} className="btn-primary full-width"><FileText size={16} /> Start from Scratch</button>
          </div>
        )}

        {/* === STEP 1: Personal === */}
        {step === 1 && (
          <div className="step-content animate-fade-in">
            <div className="form-grid">
              <div className="input-group">
                <label className="input-label"><User size={14} /> Full Name <span className="required">*</span></label>
                <input type="text" value={data.personal.fullName} onChange={e => updatePersonal('fullName', e.target.value)} className="input-field" placeholder="Jane Doe" required />
              </div>
              <div className="input-group">
                <label className="input-label"><Mail size={14} /> Email <span className="required">*</span></label>
                <input type="email" value={data.personal.email} onChange={e => updatePersonal('email', e.target.value)} className="input-field" placeholder="jane@example.com" />
              </div>
            </div>
            <div className="form-grid">
              <div className="input-group">
                <label className="input-label"><Phone size={14} /> Phone</label>
                <input type="tel" value={data.personal.phone} onChange={e => updatePersonal('phone', e.target.value)} className="input-field" placeholder="+1 234 567 8900" />
              </div>
              <div className="input-group">
                <label className="input-label"><MapPin size={14} /> Location</label>
                <input type="text" value={data.personal.location} onChange={e => updatePersonal('location', e.target.value)} className="input-field" placeholder="San Francisco, CA" />
              </div>
            </div>
            <div className="form-grid">
              <div className="input-group">
                <label className="input-label"><Linkedin size={14} /> LinkedIn</label>
                <input type="url" value={data.personal.linkedin} onChange={e => updatePersonal('linkedin', e.target.value)} className="input-field" placeholder="linkedin.com/in/janedoe" />
              </div>
              <div className="input-group">
                <label className="input-label"><Github size={14} /> GitHub</label>
                <input type="url" value={data.personal.github} onChange={e => updatePersonal('github', e.target.value)} className="input-field" placeholder="github.com/janedoe" />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label"><Globe size={14} /> Portfolio / Website</label>
              <input type="url" value={data.personal.portfolio} onChange={e => updatePersonal('portfolio', e.target.value)} className="input-field" placeholder="https://janedoe.dev" />
            </div>
          </div>
        )}

        {/* === STEP 2: Target & JD === */}
        {step === 2 && (
          <div className="step-content animate-fade-in">
            <div className="input-group">
              <label className="input-label"><Target size={14} /> Target Job Title <span className="required">*</span></label>
              <input type="text" value={data.targetRole} onChange={e => updateField('targetRole', e.target.value)} className="input-field" placeholder="Senior Software Engineer" required />
              <p className="field-hint">AI uses this to tailor content and ATS keywords.</p>
            </div>
            <div className="input-group">
              <label className="input-label"><ClipboardList size={14} /> Job Description <span className="badge-optional">optional</span></label>
              <textarea value={data.jobDescription} onChange={e => updateField('jobDescription', e.target.value)} className="input-field jd-textarea" rows={6} placeholder="Paste the full job description here for maximum ATS optimization..." />
              <p className="field-hint">Pasting a JD lets AI extract keywords and score your resume against the role.</p>
            </div>
          </div>
        )}

        {/* === STEP 3: Skills === */}
        {step === 3 && (
          <div className="step-content animate-fade-in">
            <div className="input-group">
              <label className="input-label"><Code size={14} /> Skills {loadingSuggestion === 'skills' && <Loader2 size={13} className="spin-icon inline-loader" />}</label>
              <div className="skill-input-row">
                <input type="text" value={skillInput} onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addChip(data.skills, v => onSkillsChange(v), skillInput, setSkillInput); } }}
                  className="input-field" placeholder="Type a skill and press Enter" />
                <button type="button" onClick={() => addChip(data.skills, v => onSkillsChange(v), skillInput, setSkillInput)} className="btn-icon"><Plus size={16} /></button>
              </div>
              {data.skills.length > 0 && (
                <div className="skill-chips">
                  {data.skills.map((s, i) => (
                    <span key={i} className="skill-chip">{s}<button type="button" onClick={() => removeChip(data.skills, v => updateField('skills', v), i)} className="chip-remove"><X size={11} /></button></span>
                  ))}
                </div>
              )}
              <SuggestionBubble field="skills" />
            </div>
          </div>
        )}

        {/* === STEP 4: Experience === */}
        {step === 4 && (
          <div className="step-content animate-fade-in">
            {data.experience.map((entry, idx) => (
              <div key={entry.id} className="entry-card">
                <div className="entry-card-header">
                  <span className="entry-card-number">#{idx + 1}</span>
                  {data.experience.length > 1 && (
                    <button type="button" onClick={() => removeWorkEntry(entry.id)} className="entry-remove-btn"><Trash2 size={14} /></button>
                  )}
                </div>
                <div className="form-grid">
                  <div className="input-group">
                    <label className="input-label-sm">Job Title</label>
                    <input type="text" value={entry.jobTitle} onChange={e => updateWork(entry.id, 'jobTitle', e.target.value)} className="input-field" placeholder="Software Engineer" />
                  </div>
                  <div className="input-group">
                    <label className="input-label-sm">Company</label>
                    <input type="text" value={entry.company} onChange={e => updateWork(entry.id, 'company', e.target.value)} className="input-field" placeholder="Google" />
                  </div>
                </div>
                <div className="form-grid form-grid-3">
                  <div className="input-group">
                    <label className="input-label-sm">Location</label>
                    <input type="text" value={entry.location} onChange={e => updateWork(entry.id, 'location', e.target.value)} className="input-field" placeholder="Mountain View, CA" />
                  </div>
                  <div className="input-group">
                    <label className="input-label-sm">Start</label>
                    <input type="text" value={entry.startDate} onChange={e => updateWork(entry.id, 'startDate', e.target.value)} className="input-field" placeholder="Jan 2022" />
                  </div>
                  <div className="input-group">
                    <label className="input-label-sm">End</label>
                    <input type="text" value={entry.endDate} onChange={e => updateWork(entry.id, 'endDate', e.target.value)} className="input-field" placeholder="Present" />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label-sm">Achievement Bullets</label>
                  {entry.bullets.map((b, bi) => (
                    <div key={bi} className="bullet-row">
                      <span className="bullet-marker">▸</span>
                      <input type="text" value={b} onChange={e => updateBullet(entry.id, bi, e.target.value)} className="input-field bullet-input" placeholder="Accomplished X by doing Y, resulting in Z..." />
                      {entry.bullets.length > 1 && <button type="button" onClick={() => removeBullet(entry.id, bi)} className="bullet-remove"><X size={12} /></button>}
                    </div>
                  ))}
                  <button type="button" onClick={() => addBullet(entry.id)} className="add-inline-btn"><Plus size={14} /> Add bullet</button>
                </div>
              </div>
            ))}
            <button type="button" onClick={addWorkEntry} className="btn-secondary full-width"><Plus size={16} /> Add Work Experience</button>
          </div>
        )}

        {/* === STEP 5: Projects === */}
        {step === 5 && (
          <div className="step-content animate-fade-in">
            {data.projects.length === 0 && (
              <div className="empty-section-hint">
                <Globe size={24} color="var(--primary)" style={{ opacity: 0.4 }} />
                <p>No projects yet. Add your notable projects to stand out.</p>
              </div>
            )}
            {data.projects.map((proj, idx) => (
              <div key={proj.id} className="entry-card">
                <div className="entry-card-header">
                  <span className="entry-card-number">#{idx + 1}</span>
                  <button type="button" onClick={() => removeProject(proj.id)} className="entry-remove-btn"><Trash2 size={14} /></button>
                </div>
                <div className="form-grid">
                  <div className="input-group">
                    <label className="input-label-sm">Project Name</label>
                    <input type="text" value={proj.name} onChange={e => updateProject(proj.id, 'name', e.target.value)} className="input-field" placeholder="AI Resume Builder" />
                  </div>
                  <div className="input-group">
                    <label className="input-label-sm">Tech Stack</label>
                    <input type="text" value={proj.techStack} onChange={e => updateProject(proj.id, 'techStack', e.target.value)} className="input-field" placeholder="React, Next.js, Python" />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label-sm">Description</label>
                  <textarea value={proj.description} onChange={e => updateProject(proj.id, 'description', e.target.value)} className="input-field" rows={2} placeholder="Built a full-stack application that..." />
                </div>
                <div className="input-group">
                  <label className="input-label-sm">Link</label>
                  <input type="url" value={proj.link} onChange={e => updateProject(proj.id, 'link', e.target.value)} className="input-field" placeholder="https://github.com/..." />
                </div>
              </div>
            ))}
            <button type="button" onClick={addProject} className="btn-secondary full-width"><Plus size={16} /> Add Project</button>
          </div>
        )}

        {/* === STEP 6: Education === */}
        {step === 6 && (
          <div className="step-content animate-fade-in">
            {data.education.map((edu, idx) => (
              <div key={edu.id} className="entry-card">
                <div className="entry-card-header">
                  <span className="entry-card-number">#{idx + 1}</span>
                  {data.education.length > 1 && <button type="button" onClick={() => removeEdu(edu.id)} className="entry-remove-btn"><Trash2 size={14} /></button>}
                </div>
                <div className="form-grid">
                  <div className="input-group">
                    <label className="input-label-sm">Degree / Program</label>
                    <input type="text" value={edu.degree} onChange={e => updateEdu(edu.id, 'degree', e.target.value)} className="input-field" placeholder="B.S. Computer Science" />
                  </div>
                  <div className="input-group">
                    <label className="input-label-sm">Institution</label>
                    <input type="text" value={edu.institution} onChange={e => updateEdu(edu.id, 'institution', e.target.value)} className="input-field" placeholder="Stanford University" />
                  </div>
                </div>
                <div className="form-grid">
                  <div className="input-group">
                    <label className="input-label-sm">Year</label>
                    <input type="text" value={edu.year} onChange={e => updateEdu(edu.id, 'year', e.target.value)} className="input-field" placeholder="2020" />
                  </div>
                  <div className="input-group">
                    <label className="input-label-sm">GPA (optional)</label>
                    <input type="text" value={edu.gpa} onChange={e => updateEdu(edu.id, 'gpa', e.target.value)} className="input-field" placeholder="3.9/4.0" />
                  </div>
                </div>
              </div>
            ))}
            <button type="button" onClick={addEdu} className="btn-secondary full-width"><Plus size={16} /> Add Education</button>
          </div>
        )}

        {/* === STEP 7: Review & Generate === */}
        {step === 7 && (
          <div className="step-content animate-fade-in">
            {/* Summary */}
            <div className="input-group">
              <div className="label-row">
                <label className="input-label"><Sparkles size={14} /> Professional Summary</label>
                <button type="button" onClick={generateSummary} disabled={summaryLoading} className="ai-autofill-btn">
                  {summaryLoading ? <><Loader2 size={13} className="spin-icon" /> Generating...</> : <><Sparkles size={13} /> AI Auto-fill</>}
                </button>
              </div>
              <textarea value={data.summary} onChange={e => updateField('summary', e.target.value)} className="input-field" rows={3} placeholder="A results-driven software engineer with 5+ years..." />
              <p className="field-hint">Click &quot;AI Auto-fill&quot; to generate from your data, or write your own.</p>
            </div>

            {/* Certifications */}
            <div className="input-group">
              <label className="input-label"><Award size={14} /> Certifications</label>
              <div className="skill-input-row">
                <input type="text" value={certInput} onChange={e => setCertInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addChip(data.certifications, v => updateField('certifications', v), certInput, setCertInput); } }}
                  className="input-field" placeholder="AWS Certified Solutions Architect" />
                <button type="button" onClick={() => addChip(data.certifications, v => updateField('certifications', v), certInput, setCertInput)} className="btn-icon"><Plus size={16} /></button>
              </div>
              {data.certifications.length > 0 && (
                <div className="skill-chips">{data.certifications.map((c, i) => (
                  <span key={i} className="skill-chip cert-chip">{c}<button type="button" onClick={() => removeChip(data.certifications, v => updateField('certifications', v), i)} className="chip-remove"><X size={11} /></button></span>
                ))}</div>
              )}
            </div>

            {/* Languages */}
            <div className="input-group">
              <label className="input-label"><Languages size={14} /> Languages</label>
              <div className="skill-input-row">
                <input type="text" value={langInput} onChange={e => setLangInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addChip(data.languages, v => updateField('languages', v), langInput, setLangInput); } }}
                  className="input-field" placeholder="English (Native), Hindi (Fluent)" />
                <button type="button" onClick={() => addChip(data.languages, v => updateField('languages', v), langInput, setLangInput)} className="btn-icon"><Plus size={16} /></button>
              </div>
              {data.languages.length > 0 && (
                <div className="skill-chips">{data.languages.map((l, i) => (
                  <span key={i} className="skill-chip lang-chip">{l}<button type="button" onClick={() => removeChip(data.languages, v => updateField('languages', v), i)} className="chip-remove"><X size={11} /></button></span>
                ))}</div>
              )}
            </div>

            {/* Template Selector */}
            <div className="input-group">
              <label className="input-label">Resume Template</label>
              <div className="template-grid">
                {TEMPLATES.map(t => (
                  <button key={t.id} type="button" className={`template-card ${data.template === t.id ? 'active' : ''}`} onClick={() => updateField('template', t.id)}>
                    <span className="template-card-name">{t.name}</span>
                    <span className="template-card-desc">{t.desc}</span>
                    {data.template === t.id && <Check size={16} className="template-check" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="step-nav">
          {step > 0 && <button type="button" onClick={prevStep} className="btn-secondary"><ChevronLeft size={16} /> Back</button>}
          <div style={{ flex: 1 }} />
          {step > 0 && !isLastStep && <button type="button" onClick={nextStep} disabled={!canProceed(step)} className="btn-primary">Next <ChevronRight size={16} /></button>}
          {isLastStep && (
            <button type="submit" disabled={isLoading || !canProceed(1) || !canProceed(2)} className="btn-primary generate-btn">
              {isLoading ? <><Loader2 size={16} className="spin-icon" /> Generating...</> : <><Send size={16} /> Generate Resume</>}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export type { ResumeData };
