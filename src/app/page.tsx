'use client';

import React, { useState, useRef } from 'react';
import ResumeForm from '@/components/ResumeForm';
import ResumePreview from '@/components/ResumePreview';
import { ResumeData } from '@/types/resume';
import styles from './page.module.css';
import { AlertCircle, Sparkles } from 'lucide-react';

export default function Home() {
  const [resumeMarkdown, setResumeMarkdown] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastJD = useRef<string>('');

  const handleGenerateResume = async (data: ResumeData) => {
    setIsLoading(true);
    setError(null);
    setResumeMarkdown(null);
    lastJD.current = data.jobDescription || '';

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setResumeMarkdown(result.resume);

      if (window.innerWidth < 1024) {
        setTimeout(() => {
          document.getElementById('preview-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (err: any) {
      console.error('Failed to generate resume:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const hasResume = resumeMarkdown !== null;

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <div className={styles.headerBadge}><Sparkles size={14} /> AI-Powered Resume Builder</div>
        <h1 className={styles.headerTitle}>Build Your Executive Resume</h1>
        <p className={styles.headerSubtitle}>
          Craft an ATS-optimized, high-impact resume in seconds. Upload your existing resume or start fresh — our AI does the heavy lifting.
        </p>
      </header>

      {error && (
        <div className={styles.errorMessage}>
          <AlertCircle size={18} />
          <p>{error}</p>
          <button onClick={() => setError(null)} className={styles.errorDismiss}>&times;</button>
        </div>
      )}

      <main className={`${styles.mainLayout} ${hasResume ? styles.withPreview : styles.formOnly}`}>
        <div className={styles.formSection}>
          <ResumeForm onSubmit={handleGenerateResume} isLoading={isLoading} />
        </div>
        <div id="preview-section" className={styles.previewSection}>
          <ResumePreview
            resumeMarkdown={resumeMarkdown}
            onResumeChange={setResumeMarkdown}
            onReset={() => setResumeMarkdown(null)}
            jobDescription={lastJD.current}
          />
        </div>
      </main>

      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} AI Resume Generator — Built with Next.js & OpenRouter</p>
      </footer>
    </div>
  );
}
