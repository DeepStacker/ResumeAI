'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, Clock, Trash2, Coins, ArrowRight, Loader2, Plus, X, Eye, Share2, Sparkles, Copy, Check } from 'lucide-react';
import ResumePreview from '@/components/ResumePreview';

interface ResumeItem {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface TransactionItem {
  id: string;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  // Resume viewing modal state
  const [viewingResume, setViewingResume] = useState<any | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Delete modal state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Cover letter modal state
  const [clResumeId, setClResumeId] = useState<string | null>(null);
  const [clJd, setClJd] = useState('');
  const [clLoading, setClLoading] = useState(false);
  const [clResult, setClResult] = useState<string | null>(null);
  const [clCopied, setClCopied] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resumeRes, creditRes] = await Promise.all([
        fetch('/api/resumes'),
        fetch('/api/credits'),
      ]);
      if (resumeRes.ok) {
        const data = await resumeRes.json();
        setResumes(data.resumes || []);
      }
      if (creditRes.ok) {
        const data = await creditRes.json();
        setCredits(data.balance || 0);
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/resumes?id=${deleteConfirmId}`, { method: 'DELETE' });
      if (res.ok) {
        setResumes(prev => prev.filter(r => r.id !== deleteConfirmId));
        setDeleteConfirmId(null);
      } else {
        alert('Failed to delete resume.');
      }
    } catch (err) {
      console.error('Error deleting resume:', err);
      alert('Error deleting resume.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleViewResume = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setModalLoading(true);
    try {
      const res = await fetch(`/api/resumes?id=${id}`);
      if (res.ok) {
        const responseData = await res.json();
        const resume = responseData.resume;
        
        if (resume?.data && typeof resume.data === 'object' && resume.data.personal) {
          // New JSON format — pass structured data for template rendering
          setViewingResume({ type: 'json', data: resume.data, markdown: resume.markdown });
        } else if (resume?.markdown && resume.markdown !== '# Generated') {
          // Old markdown format
          setViewingResume({ type: 'markdown', markdown: resume.markdown });
        } else if (resume?.data) {
          // JSON data but might be a different shape
          setViewingResume({ type: 'json', data: resume.data, markdown: resume.markdown });
        } else {
          alert('This resume is empty or was saved incorrectly.');
        }
      } else {
        alert('Failed to load resume.');
      }
    } catch {
      alert('Error loading resume.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!clResumeId) return;
    setClLoading(true);
    try {
      const res = await fetch(`/api/resumes/${clResumeId}/cover-letter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription: clJd }),
      });
      const data = await res.json();
      if (res.ok && data.coverLetter) {
        setClResult(data.coverLetter);
        setClResumeId(null); // close JD modal
        fetchData(); // refresh credits
      } else {
        alert(data.error || 'Failed to generate cover letter.');
      }
    } catch {
      alert('Network error. Please try again.');
    } finally {
      setClLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-screen">
          <Loader2 size={28} className="spin-icon" style={{ color: 'var(--primary)' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>My Resumes</h1>
        <p>Manage your generated resumes and billing balance</p>
      </div>

      {/* Credit Summary */}
      <div className="dashboard-grid">
        <div className="dashboard-card glass-panel">
          <div className="dashboard-card-header">
            <Coins size={18} />
            <h3>Billing Balance</h3>
          </div>
          <div className="dashboard-credit-value">{credits}</div>
          <p className="dashboard-card-sub">AI tokens remaining</p>
        </div>

        <div className="dashboard-card glass-panel">
          <div className="dashboard-card-header">
            <FileText size={18} />
            <h3>Resumes Created</h3>
          </div>
          <div className="dashboard-credit-value">{resumes.length}</div>
          <p className="dashboard-card-sub">total resumes</p>
        </div>

        <div className="dashboard-card glass-panel action-card" onClick={() => router.push('/builder')} style={{ cursor: 'pointer' }}>
          <div className="dashboard-card-header">
            <Plus size={18} />
            <h3>New Resume</h3>
          </div>
          <p className="dashboard-card-sub" style={{ marginTop: '0.5rem' }}>
            Build a new ATS-optimized resume
          </p>
          <ArrowRight size={18} style={{ marginTop: 'auto', color: 'var(--primary)' }} />
        </div>
      </div>

      {/* Resume History */}
      <section className="dashboard-section">
        <h2>Resume History</h2>
        {resumes.length === 0 ? (
          <div className="dashboard-empty glass-panel">
            <FileText size={32} style={{ opacity: 0.3 }} />
            <p>No resumes yet. Create your first one!</p>
            <Link href="/builder" className="btn-primary">Create Resume <ArrowRight size={16} /></Link>
          </div>
        ) : (
          <div className="resume-list">
            {resumes.map(resume => (
              <div key={resume.id} className="resume-list-item glass-panel" onClick={(e) => handleViewResume(resume.id, e)} style={{ cursor: 'pointer', transition: 'transform 0.2s', border: '1px solid transparent' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
                <div className="resume-list-info">
                  <div className="resume-icon-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(139,92,246,0.1)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                    {modalLoading ? <Loader2 size={24} className="spin-icon" style={{ color: 'var(--primary)' }} /> : <FileText size={24} style={{ color: 'var(--primary)' }} />}
                  </div>
                  <div>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {resume.title}
                      <span className="view-badge"><Eye size={12} /> View</span>
                    </h4>
                    <span className="resume-list-date" style={{ color: 'var(--text-light)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
                      <Clock size={12} /> {new Date(resume.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button className="share-badge" onClick={(e) => { e.stopPropagation(); const url = `${window.location.origin}/r/${resume.id}`; navigator.clipboard.writeText(url); setCopiedId(resume.id); setTimeout(() => setCopiedId(null), 2000); }} title="Copy share link">
                    <Share2 size={12} /> {copiedId === resume.id ? 'Copied!' : 'Share'}
                  </button>
                  <button className="share-badge" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent)' }} onClick={(e) => { e.stopPropagation(); setClResumeId(resume.id); setClJd(''); }} title="Generate cover letter">
                    <Sparkles size={12} /> Cover Letter
                  </button>
                  <button className="btn-icon" onClick={(e) => handleDelete(resume.id, e)} title="Delete" style={{ color: 'var(--error)', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Transaction History */}
      <section className="dashboard-section">
        <h2>Billing Data</h2>
        {transactions.length === 0 ? (
          <p style={{ opacity: 0.5, fontSize: '0.9rem' }}>No transactions yet.</p>
        ) : (
          <div className="transaction-list">
            {transactions.map(tx => (
              <div key={tx.id} className="transaction-item">
                <div>
                  <span className="transaction-desc">{tx.description}</span>
                  <span className="transaction-date">{new Date(tx.createdAt).toLocaleDateString()}</span>
                </div>
                <span className={`transaction-amount ${tx.amount > 0 ? 'positive' : 'negative'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Fullscreen Resume Modal */}
      {viewingResume && (
        <div className="resume-modal-overlay">
          <div className="resume-modal-content">
            <button className="resume-modal-close" onClick={() => setViewingResume(null)} type="button">
              <X size={24} />
            </button>
            <div className="resume-modal-scroll-area">
              <ResumePreview 
                resumeMarkdown={viewingResume.type === 'markdown' ? viewingResume.markdown : "Loaded"} 
                resumeData={viewingResume.type === 'json' ? viewingResume.data : undefined}
                onResumeChange={() => {}}
                onReset={() => setViewingResume(null)}
                jobDescription={""}
              />
            </div>
          </div>
        </div>
      )}

      {/* Cover Letter JD Input Modal */}
      {clResumeId && (
        <div className="resume-modal-overlay">
          <div className="resume-modal-content" style={{ maxWidth: '550px', padding: '2rem' }}>
            <button className="resume-modal-close" onClick={() => setClResumeId(null)} type="button"><X size={20} /></button>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--accent)' }}>
              <Sparkles size={20} /> Generate Cover Letter
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Paste a job description below to generate a tailored cover letter based on your saved resume.
            </p>
            <textarea
              value={clJd}
              onChange={e => setClJd(e.target.value)}
              className="input-field jd-textarea"
              rows={8}
              placeholder="Paste the job description here (optional)..."
              style={{ width: '100%', marginBottom: '1rem' }}
            />
            <button
              onClick={handleGenerateCoverLetter}
              disabled={clLoading}
              className="btn-primary full-width"
              style={{ justifyContent: 'center' }}
            >
              {clLoading ? <><Loader2 size={16} className="spin-icon" /> Generating...</> : <><Sparkles size={16} /> Generate (2 credits)</>}
            </button>
          </div>
        </div>
      )}

      {/* Cover Letter Result Modal */}
      {clResult && (
        <div className="resume-modal-overlay">
          <div className="resume-modal-content" style={{ maxWidth: '650px', padding: '2rem' }}>
            <button className="resume-modal-close" onClick={() => { setClResult(null); setClCopied(false); }} type="button"><X size={20} /></button>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--accent)' }}>
              <Sparkles size={20} /> Your Cover Letter
            </h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '1rem' }}>
              <textarea
                value={clResult}
                onChange={e => setClResult(e.target.value)}
                className="input-field"
                rows={16}
                style={{ width: '100%', lineHeight: '1.7', fontSize: '0.95rem' }}
              />
            </div>
            <button
              onClick={() => { navigator.clipboard.writeText(clResult); setClCopied(true); setTimeout(() => setClCopied(false), 2000); }}
              className="btn-primary full-width"
              style={{ justifyContent: 'center' }}
            >
              {clCopied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy to Clipboard</>}
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="resume-modal-overlay">
          <div className="resume-modal-content" style={{ maxWidth: '400px', padding: '2rem', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Trash2 size={24} />
            </div>
            <h3 style={{ marginBottom: '0.5rem' }}>Delete Resume</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              Are you sure you want to delete this resume? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                className="btn-secondary" 
                onClick={() => setDeleteConfirmId(null)}
                disabled={deleteLoading}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={confirmDelete}
                disabled={deleteLoading}
                style={{ flex: 1, justifyContent: 'center', background: 'var(--error)', borderColor: 'var(--error)', color: 'white' }}
              >
                {deleteLoading ? <Loader2 size={16} className="spin-icon" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
