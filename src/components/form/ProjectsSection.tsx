import React from 'react';
import { Trash2, Plus, Loader2, Sparkles, Globe } from 'lucide-react';
import { useResumeStore } from '@/store/useResumeStore';
import { DebouncedInput, DebouncedTextarea } from '@/components/DebouncedInput';

export function ProjectsSection({
  handleRewriteProjectDesc,
  loadingSuggestion
}: {
  handleRewriteProjectDesc: (id: string, desc: string) => void;
  loadingSuggestion: string | null;
}) {
  const { data, updateProject, addProject, removeProject } = useResumeStore();

  return (
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
              <DebouncedInput
                type="text"
                value={proj.name}
                onChangeValue={(val) => updateProject(proj.id, 'name', val)}
                className="input-field"
                placeholder="AI Resume Builder"
                delay={250}
              />
            </div>
            <div className="input-group">
              <label className="input-label-sm">Tech Stack</label>
              <DebouncedInput
                type="text"
                value={proj.techStack}
                onChangeValue={(val) => updateProject(proj.id, 'techStack', val)}
                className="input-field"
                placeholder="React, Next.js, Python"
                delay={250}
              />
            </div>
          </div>
          <div className="input-group">
            <div className="label-row">
              <label className="input-label-sm">Description</label>
              <button type="button" onClick={() => handleRewriteProjectDesc(proj.id, proj.description)} disabled={loadingSuggestion === proj.id || !proj.description} className="ai-autofill-btn" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                {loadingSuggestion === proj.id ? <><Loader2 size={12} className="spin-icon" /> Rewriting...</> : <><Sparkles size={12} /> AI Rewrite</>}
              </button>
            </div>
            <DebouncedTextarea
              value={proj.description}
              onChangeValue={(val) => updateProject(proj.id, 'description', val)}
              className="input-field"
              rows={2}
              placeholder="Built a full-stack application that..."
              delay={250}
            />
          </div>
          <div className="input-group">
            <label className="input-label-sm">Link</label>
            <DebouncedInput
              type="url"
              value={proj.link}
              onChangeValue={(val) => updateProject(proj.id, 'link', val)}
              className="input-field"
              placeholder="https://github.com/..."
              delay={250}
            />
          </div>
        </div>
      ))}
      <button type="button" onClick={addProject} className="btn-secondary full-width"><Plus size={16} /> Add Project</button>
    </div>
  );
}
