import React, { useRef } from 'react';
import { User, Mail, Phone, MapPin, Linkedin, Github, Globe, Trash2 } from 'lucide-react';
import { useResumeStore } from '@/store/useResumeStore';
import { DebouncedInput } from '@/components/DebouncedInput';

export function PersonalSection() {
  const { data, updatePersonal } = useResumeStore();
  const profileImageRef = useRef<HTMLInputElement>(null);

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be smaller than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => updatePersonal('profileImage', reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = ''; // Allow re-uploading the same file
  };

  return (
    <div className="step-content animate-fade-in">
      <div className="form-grid">
        <div className="input-group">
          <label className="input-label"><User size={14} /> Full Name <span className="required">*</span></label>
          <DebouncedInput
            type="text"
            value={data.personal.fullName}
            onChangeValue={(value) => updatePersonal('fullName', value)}
            className="input-field"
            placeholder="Jane Doe"
            required
            delay={250}
          />
        </div>
        <div className="input-group">
          <label className="input-label"><Mail size={14} /> Email <span className="required">*</span></label>
          <DebouncedInput
            type="email"
            value={data.personal.email}
            onChangeValue={(value) => updatePersonal('email', value)}
            className="input-field"
            placeholder="jane@example.com"
            delay={250}
          />
        </div>
      </div>

      <div className="form-grid">
        <div className="input-group">
          <label className="input-label"><Phone size={14} /> Phone</label>
          <DebouncedInput
            type="tel"
            value={data.personal.phone}
            onChangeValue={(value) => updatePersonal('phone', value)}
            className="input-field"
            placeholder="+1 234 567 8900"
            delay={250}
          />
        </div>
        <div className="input-group">
          <label className="input-label"><MapPin size={14} /> Location</label>
          <DebouncedInput
            type="text"
            value={data.personal.location}
            onChangeValue={(value) => updatePersonal('location', value)}
            className="input-field"
            placeholder="San Francisco, CA"
            delay={250}
          />
        </div>
      </div>

      <div className="form-grid">
        <div className="input-group">
          <label className="input-label"><Linkedin size={14} /> LinkedIn</label>
          <DebouncedInput
            type="url"
            value={data.personal.linkedin}
            onChangeValue={(value) => updatePersonal('linkedin', value)}
            className="input-field"
            placeholder="linkedin.com/in/janedoe"
            delay={250}
          />
        </div>
        <div className="input-group">
          <label className="input-label"><Github size={14} /> GitHub</label>
          <DebouncedInput
            type="url"
            value={data.personal.github}
            onChangeValue={(value) => updatePersonal('github', value)}
            className="input-field"
            placeholder="github.com/janedoe"
            delay={250}
          />
        </div>
      </div>

      <div className="input-group">
        <label className="input-label"><Globe size={14} /> Portfolio / Website</label>
        <DebouncedInput
          type="url"
          value={data.personal.portfolio}
          onChangeValue={(value) => updatePersonal('portfolio', value)}
          className="input-field"
          placeholder="https://janedoe.dev"
          delay={250}
        />
      </div>

      {data.template === 'modern' && (
        <div className="input-group" style={{ marginTop: '0.5rem', padding: '1.25rem', border: '1px dashed var(--surface-border)', borderRadius: 'var(--radius-lg)', background: 'rgba(0,0,0,0.01)' }}>
          <label className="input-label" style={{ marginBottom: '0.5rem' }}>Profile Image <span className="badge-optional" style={{ marginLeft: 'auto' }}>Modern Template</span></label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {data.personal.profileImage ? (
              <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--surface-border)' }}>
                <img src={data.personal.profileImage} alt="Profile preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button type="button" className="btn-icon" onClick={() => updatePersonal('profileImage', '')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: 0, opacity: 0, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
                  <Trash2 size={24} />
                </button>
              </div>
            ) : (
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <User size={32} opacity={0.3} />
              </div>
            )}
            <div style={{ flex: 1 }}>
              <button type="button" className="btn-secondary" onClick={() => profileImageRef.current?.click()}>
                {data.personal.profileImage ? 'Change Image' : 'Upload Image'}
              </button>
              <p className="field-hint" style={{ marginTop: '0.35rem' }}>For best results, use a square aspect ratio. Max 2MB.</p>
              <input type="file" ref={profileImageRef} onChange={handleProfileImageUpload} accept="image/png, image/jpeg, image/webp" style={{ display: 'none' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
