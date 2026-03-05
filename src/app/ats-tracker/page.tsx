'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  BarChart3, Target, Loader2, Plus, X, TrendingUp, TrendingDown,
  CheckCircle2, AlertCircle, Lightbulb, FileText, Clock
} from 'lucide-react';

interface AtsScoreItem {
  id: string;
  score: number;
  jdSnippet: string | null;
  matched: string[];
  missing: string[];
  suggestions: string[];
  createdAt: string;
  resume: { id: string; title: string };
}

interface ResumeOption {
  id: string;
  title: string;
}

export default function AtsTrackerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [scores, setScores] = useState<AtsScoreItem[]>([]);
  const [resumes, setResumes] = useState<ResumeOption[]>([]);
  const [loading, setLoading] = useState(true);

  // New analysis modal
  const [showModal, setShowModal] = useState(false);
  const [selectedResume, setSelectedResume] = useState('');
  const [jd, setJd] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  // Detail view
  const [viewingScore, setViewingScore] = useState<AtsScoreItem | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
    if (status === 'authenticated') fetchData();
  }, [status, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ats-tracker');
      if (res.ok) {
        const data = await res.json();
        setScores(data.scores || []);
        setResumes(data.resumes || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedResume || !jd.trim()) return;
    setAnalyzing(true);
    try {
      const res = await fetch('/api/ats-tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId: selectedResume, jobDescription: jd }),
      });
      const data = await res.json();
      if (res.ok && data.score) {
        setShowModal(false);
        setJd('');
        setSelectedResume('');
        fetchData();
        // Auto-open the result
        setViewingScore(data.score);
      } else {
        alert(data.error || 'Analysis failed.');
      }
    } catch {
      alert('Network error. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
  };

  const averageScore = scores.length > 0
    ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length)
    : 0;

  const bestScore = scores.length > 0 ? Math.max(...scores.map(s => s.score)) : 0;

  if (status === 'loading' || loading) {
    return (
      <div className="dashboard-page" style={{ display: 'flex', justifyContent: 'center', paddingTop: '6rem' }}>
        <Loader2 size={36} className="spin-icon" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <BarChart3 size={28} style={{ color: 'var(--primary)' }} />
            ATS Score Tracker
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Track how well your resumes match job descriptions
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary" disabled={resumes.length === 0}>
          <Plus size={16} /> Run New Analysis
        </button>
      </div>

      {/* Stats cards */}
      {scores.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Total Analyses</p>
            <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>{scores.length}</p>
          </div>
          <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Average Score</p>
            <p style={{ fontSize: '2rem', fontWeight: 700, color: getScoreColor(averageScore) }}>{averageScore}%</p>
          </div>
          <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Best Score</p>
            <p style={{ fontSize: '2rem', fontWeight: 700, color: getScoreColor(bestScore) }}>{bestScore}%</p>
          </div>
        </div>
      )}

      {/* Score history */}
      {scores.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <Target size={48} style={{ color: 'var(--primary)', opacity: 0.3, marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>No analyses yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Run your first ATS analysis to see how your resume matches a job description.
          </p>
          {resumes.length > 0 ? (
            <button onClick={() => setShowModal(true)} className="btn-primary"><Plus size={16} /> Run First Analysis</button>
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--error)' }}>Generate a resume first to run an analysis.</p>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {scores.map(score => (
            <div
              key={score.id}
              className="glass-panel"
              onClick={() => setViewingScore(score)}
              style={{ padding: '1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'border-color 0.2s', border: '1px solid transparent' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: `conic-gradient(${getScoreColor(score.score)} ${score.score * 3.6}deg, var(--surface-border) 0deg)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative'
                }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%', background: 'var(--background)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.85rem', fontWeight: 700, color: getScoreColor(score.score)
                  }}>
                    {score.score}%
                  </div>
                </div>
                <div>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.15rem' }}>
                    <FileText size={14} style={{ color: 'var(--primary)' }} />
                    {score.resume.title}
                    <span style={{ color: getScoreColor(score.score), fontSize: '0.75rem', fontWeight: 600 }}>
                      {getScoreLabel(score.score)}
                    </span>
                  </h4>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={11} /> {new Date(score.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {score.jdSnippet && <> · {score.jdSnippet.substring(0, 50)}...</>}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
                <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                  <CheckCircle2 size={12} /> {(score.matched as string[])?.length || 0}
                </span>
                <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                  <AlertCircle size={12} /> {(score.missing as string[])?.length || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Run Analysis Modal */}
      {showModal && (
        <div className="resume-modal-overlay">
          <div className="resume-modal-content" style={{ maxWidth: '550px', padding: '2rem' }}>
            <button className="resume-modal-close" onClick={() => setShowModal(false)} type="button"><X size={20} /></button>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>
              <Target size={20} /> Run ATS Analysis
            </h3>

            <div className="input-group" style={{ marginBottom: '1rem' }}>
              <label className="input-label">Select Resume</label>
              <select
                value={selectedResume}
                onChange={e => setSelectedResume(e.target.value)}
                className="input-field"
                style={{ cursor: 'pointer' }}
              >
                <option value="">Choose a resume...</option>
                {resumes.map(r => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>
            </div>

            <div className="input-group" style={{ marginBottom: '1.5rem' }}>
              <label className="input-label">Job Description</label>
              <textarea
                value={jd}
                onChange={e => setJd(e.target.value)}
                className="input-field jd-textarea"
                rows={8}
                placeholder="Paste the full job description here..."
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={analyzing || !selectedResume || !jd.trim()}
              className="btn-primary full-width"
              style={{ justifyContent: 'center' }}
            >
              {analyzing ? <><Loader2 size={16} className="spin-icon" /> Analyzing...</> : <><Target size={16} /> Analyze (1 credit)</>}
            </button>
          </div>
        </div>
      )}

      {/* Score Detail Modal */}
      {viewingScore && (
        <div className="resume-modal-overlay">
          <div className="resume-modal-content" style={{ maxWidth: '650px', padding: '2rem' }}>
            <button className="resume-modal-close" onClick={() => setViewingScore(null)} type="button"><X size={20} /></button>

            {/* Score header */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: '100px', height: '100px', borderRadius: '50%', margin: '0 auto 1rem',
                background: `conic-gradient(${getScoreColor(viewingScore.score)} ${viewingScore.score * 3.6}deg, var(--surface-border) 0deg)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  width: '80px', height: '80px', borderRadius: '50%', background: 'var(--background)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column'
                }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700, color: getScoreColor(viewingScore.score) }}>{viewingScore.score}%</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{getScoreLabel(viewingScore.score)}</span>
                </div>
              </div>
              <h3>{viewingScore.resume.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                {new Date(viewingScore.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Matched keywords */}
              {(viewingScore.matched as string[])?.length > 0 && (
                <div>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem', color: '#10b981', fontSize: '0.9rem' }}>
                    <CheckCircle2 size={16} /> Matched Keywords ({(viewingScore.matched as string[]).length})
                  </h4>
                  <div className="skill-chips">
                    {(viewingScore.matched as string[]).map((kw, i) => (
                      <span key={i} className="skill-chip" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', borderColor: 'rgba(16,185,129,0.2)' }}>{kw}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing keywords */}
              {(viewingScore.missing as string[])?.length > 0 && (
                <div>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem', color: '#ef4444', fontSize: '0.9rem' }}>
                    <AlertCircle size={16} /> Missing Keywords ({(viewingScore.missing as string[]).length})
                  </h4>
                  <div className="skill-chips">
                    {(viewingScore.missing as string[]).map((kw, i) => (
                      <span key={i} className="skill-chip" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}>{kw}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {(viewingScore.suggestions as string[])?.length > 0 && (
                <div>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem', color: '#f59e0b', fontSize: '0.9rem' }}>
                    <Lightbulb size={16} /> Suggestions
                  </h4>
                  <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {(viewingScore.suggestions as string[]).map((s, i) => (
                      <li key={i} style={{ color: 'var(--foreground)', fontSize: '0.88rem', lineHeight: 1.5 }}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
