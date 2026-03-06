import React from 'react';
import { Trash2, Plus, X, Loader2, Sparkles } from 'lucide-react';
import { useResumeStore } from '@/store/useResumeStore';
import { DebouncedInput } from '@/components/DebouncedInput';
import { WorkEntry } from '@/types/resume';

export function ExperienceSection({
  handleRewriteBullets,
  handleGenerateRoleBullets,
  bulletLoading
}: {
  handleRewriteBullets: (id: string, entry: WorkEntry) => void;
  handleGenerateRoleBullets: (id: string, title: string) => void;
  bulletLoading: string | null;
}) {
  const { data, updateWork, addWorkEntry, removeWorkEntry, updateBullet, removeBullet, addBullet } = useResumeStore();

  return (
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
              <DebouncedInput
                type="text"
                value={entry.jobTitle}
                onChangeValue={(val) => updateWork(entry.id, 'jobTitle', val)}
                className="input-field"
                placeholder="Software Engineer"
                delay={250}
              />
            </div>
            <div className="input-group">
              <label className="input-label-sm">Company</label>
              <DebouncedInput
                type="text"
                value={entry.company}
                onChangeValue={(val) => updateWork(entry.id, 'company', val)}
                className="input-field"
                placeholder="Google"
                delay={250}
              />
            </div>
          </div>
          <div className="form-grid form-grid-3">
            <div className="input-group">
              <label className="input-label-sm">Location</label>
              <DebouncedInput
                type="text"
                value={entry.location}
                onChangeValue={(val) => updateWork(entry.id, 'location', val)}
                className="input-field"
                placeholder="Mountain View, CA"
                delay={250}
              />
            </div>
            <div className="input-group">
              <label className="input-label-sm">Start</label>
              <DebouncedInput
                type="text"
                value={entry.startDate}
                onChangeValue={(val) => updateWork(entry.id, 'startDate', val)}
                className="input-field"
                placeholder="Jan 2022"
                delay={250}
              />
            </div>
            <div className="input-group">
              <label className="input-label-sm">End</label>
              <DebouncedInput
                type="text"
                value={entry.endDate}
                onChangeValue={(val) => updateWork(entry.id, 'endDate', val)}
                className="input-field"
                placeholder="Present"
                delay={250}
              />
            </div>
          </div>
          <div className="input-group">
            <label className="input-label-sm">Achievement Bullets</label>
            {entry.bullets.map((b, bi) => (
              <div key={bi} className="bullet-row">
                <span className="bullet-marker">▸</span>
                <DebouncedInput
                  type="text"
                  value={b}
                  onChangeValue={(val) => updateBullet(entry.id, bi, val)}
                  className="input-field bullet-input"
                  placeholder="Accomplished X by doing Y, resulting in Z..."
                  delay={150}
                />
                {entry.bullets.length > 1 && (
                  <button type="button" onClick={() => removeBullet(entry.id, bi)} className="bullet-remove"><X size={12} /></button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => addBullet(entry.id)} className="add-inline-btn"><Plus size={14} /> Add bullet</button>
            <button type="button" onClick={() => handleRewriteBullets(entry.id, entry)} disabled={bulletLoading === entry.id} className="ai-autofill-btn" style={{ marginLeft: '1rem', marginTop: '0.2rem' }}>
              {bulletLoading === entry.id ? <><Loader2 size={13} className="spin-icon" /> Rewriting...</> : <><Sparkles size={13} /> AI Rewrite (XYZ)</>}
            </button>
            {entry.jobTitle && (
              <button type="button" onClick={() => handleGenerateRoleBullets(entry.id, entry.jobTitle)} disabled={bulletLoading === entry.id + '_generate'} className="ai-autofill-btn" style={{ marginLeft: '0.5rem', marginTop: '0.2rem', borderColor: 'var(--secondary)', color: 'var(--secondary)' }}>
                {bulletLoading === entry.id + '_generate' ? <><Loader2 size={13} className="spin-icon" /> Thinking...</> : <><Sparkles size={13} /> Generate Ideas</>}
              </button>
            )}
          </div>
        </div>
      ))}
      <button type="button" onClick={addWorkEntry} className="btn-secondary full-width"><Plus size={16} /> Add Work Experience</button>
    </div>
  );
}
