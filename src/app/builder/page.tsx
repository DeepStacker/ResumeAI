'use client';

import React, { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ResumeForm from '@/components/ResumeForm';
import ResumePreview from '@/components/ResumePreview';
import { ResumeData } from '@/types/resume';
import { useResumeStore } from '@/store/useResumeStore';
import styles from './page.module.css';
import { AlertCircle } from 'lucide-react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [resumeMarkdown, setResumeMarkdown] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastJD = useRef<string>('');

  if (status === 'loading') {
    return (
      <div className={styles.pageContainer}>
        <div className="loading-screen">
          <div className="spin-icon" style={{ width: 36, height: 36, border: '3px solid var(--surface-border)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} />
        </div>
      </div>
    );
  }

  if (!session) {
    router.push('/auth/signin');
    return null;
  }

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

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.error || `HTTP error! status: ${response.status}`);
      }

      // The new API returns perfectly tailored JSON ResumeData
      if (responseData.data) {
        useResumeStore.getState().setResumeData(responseData.data);
      }
      if (responseData.resumeId) {
        useResumeStore.getState().setCurrentResumeId(responseData.resumeId);
      }
      
      setResumeMarkdown('# Generated'); // Set a truthy value to trigger the preview pane

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
    </div>
  );
}
