import React, { useState } from 'react';
import { Target, ClipboardList, Code, Loader2, Sparkles, Plus, X } from 'lucide-react';
import { useResumeStore } from '@/store/useResumeStore';
import { DebouncedInput, DebouncedTextarea } from '@/components/DebouncedInput';
import { callAI } from '@/lib/ai';

export function TargetAndSkillsSection({
  loadingSuggestion,
  fetchSuggestion,
  handleAddChip,
  onSkillsChange,
  SuggestionBubble,
  skillInput,
  setSkillInput
}: any) {
  const { data, updateField, removeChip } = useResumeStore();

  const handleSuggestTargetRoles = async () => {
    // Passed down or handled locally? For now expect it in parent or implement here
    // In this refactor, it's easier to pass these complex handlers from ResumeForm
    // or port them here if they only depend on store.
  };

  return (
    <>
      <div className="input-group">
        <div className="label-row">
          <label className="input-label"><Target size={14} /> Target Job Title <span className="required">*</span></label>
        </div>
        <DebouncedInput
          type="text"
          value={data.targetRole}
          onChangeValue={(val) => updateField('targetRole', val)}
          className="input-field"
          placeholder="Senior Software Engineer"
          required
        />
        <SuggestionBubble field="targetRoleIdeation" />
        <p className="field-hint">AI uses this to tailor content and ATS keywords.</p>
      </div>

      <div className="input-group">
        <label className="input-label"><ClipboardList size={14} /> Job Description <span className="badge-optional">optional</span></label>
        <DebouncedTextarea
          value={data.jobDescription || ''}
          onChangeValue={(val) => updateField('jobDescription', val)}
          className="input-field jd-textarea"
          rows={10}
          placeholder="Paste the full job description here for maximum ATS optimization..."
        />
        <p className="field-hint">Pasting a JD lets AI extract keywords and score your resume against the role.</p>
      </div>
    </>
  );
}
