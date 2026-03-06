import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { useResumeStore } from '@/store/useResumeStore';
import { DebouncedInput } from '@/components/DebouncedInput';

export function EducationSection() {
  const { data, updateEducation, addEducation, removeEducation } = useResumeStore();

  return (
    <div className="step-content animate-fade-in">
      {data.education.map((edu, idx) => (
        <div key={edu.id} className="entry-card">
          <div className="entry-card-header">
            <span className="entry-card-number">#{idx + 1}</span>
            {data.education.length > 1 && (
              <button type="button" onClick={() => removeEducation(edu.id)} className="entry-remove-btn"><Trash2 size={14} /></button>
            )}
          </div>
          <div className="form-grid">
            <div className="input-group">
              <label className="input-label-sm">Degree / Program</label>
              <DebouncedInput
                type="text"
                value={edu.degree}
                onChangeValue={(val) => updateEducation(edu.id, 'degree', val)}
                className="input-field"
                placeholder="B.S. Computer Science"
                delay={250}
              />
            </div>
            <div className="input-group">
              <label className="input-label-sm">Institution</label>
              <DebouncedInput
                type="text"
                value={edu.institution}
                onChangeValue={(val) => updateEducation(edu.id, 'institution', val)}
                className="input-field"
                placeholder="Stanford University"
                delay={250}
              />
            </div>
          </div>
          <div className="form-grid form-grid-3">
            <div className="input-group">
              <label className="input-label-sm">Year</label>
              <DebouncedInput
                type="text"
                value={edu.year}
                onChangeValue={(val) => updateEducation(edu.id, 'year', val)}
                className="input-field"
                placeholder="2020"
                delay={250}
              />
            </div>
            <div className="input-group">
              <label className="input-label-sm">GPA (optional)</label>
              <DebouncedInput
                type="text"
                value={edu.gpa}
                onChangeValue={(val) => updateEducation(edu.id, 'gpa', val)}
                className="input-field"
                placeholder="3.9/4.0"
                delay={250}
              />
            </div>
            <div className="input-group">
              <label className="input-label-sm">Coursework (optional)</label>
              <DebouncedInput
                type="text"
                value={(edu as any).coursework || ''}
                onChangeValue={(val) => updateEducation(edu.id, 'coursework' as any, val)}
                className="input-field"
                placeholder="Data Structures, ML, Databases"
                delay={250}
              />
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={addEducation} className="btn-secondary full-width"><Plus size={16} /> Add Education</button>
    </div>
  );
}
