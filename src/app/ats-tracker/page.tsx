'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  BarChart3, Target, Loader2, Plus, X, TrendingUp,
  CheckCircle2, AlertCircle, Lightbulb, FileText, Clock,
  Upload, File, Zap, Shield, Award, AlertTriangle, ThumbsUp
} from 'lucide-react';

interface AtsScoreItem {
  id: string;
  score: number;
  jdSnippet: string | null;
  matched: string[];
  missing: string[];
  suggestions: string[];
  fullResult?: any;
  createdAt: string;
  resume: { id: string; title: string };
}

interface KeywordDetail {
  keyword: string;
  found: boolean;
  frequency: number;
  category: string;
}

interface DetailedResult {
  // Deterministic component scores
  score: number;
  keywordScore: number;
  sectionScore: number;
  bulletScore: number;
  readabilityScore: number;
  formatScore: number;

  // Keyword analysis
  matched: string[];
  missing: string[];
  keywords?: KeywordDetail[];

  // Section analysis
  sections?: { name: string; detected: boolean; quality: string; feedback: string }[];

  // Bullet analysis
  bulletAnalysis?: {
    totalBullets: number;
    actionVerbBullets: number;
    quantifiedBullets: number;
    avgBulletLength: number;
    actionVerbs: string[];
    metrics: string[];
  };

  // Format & readability
  readabilityMetrics?: { avgSentenceLength: number; totalWords: number; hasSpecialChars: boolean; hasTablesOrImages: boolean };
  formatMetrics?: { hasDates: boolean; dateConsistency: boolean; hasProperLength: boolean; wordCount: number; estimatedPages: number };

  // AI qualitative
  overallVerdict?: string;
  suggestions?: string[];
  strengthAreas?: string[];
  formatIssues?: string[];
  sectionFeedback?: Record<string, string>;
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
  const [inputMode, setInputMode] = useState<'select' | 'upload'>('select');
  const [selectedResume, setSelectedResume] = useState('');
  const [uploadedText, setUploadedText] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [jd, setJd] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detail view
  const [viewingScore, setViewingScore] = useState<AtsScoreItem | null>(null);
  const [detailedResult, setDetailedResult] = useState<DetailedResult | null>(null);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadedFileName(file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.parsed) {
        // Convert parsed JSON to readable text
        setUploadedText(JSON.stringify(data.parsed));
      } else {
        // Try plain text read
        const text = await file.text();
        if (text.trim().length > 20) {
          setUploadedText(text);
        } else {
          alert(data.error || 'Could not parse file.');
          setUploadedFileName('');
        }
      }
    } catch {
      alert('Error uploading file.');
      setUploadedFileName('');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async () => {
    const hasResume = inputMode === 'select' ? selectedResume : uploadedText.trim();
    if (!hasResume || !jd.trim()) return;
    setAnalyzing(true);
    try {
      const body: any = { jobDescription: jd };
      if (inputMode === 'select') {
        body.resumeId = selectedResume;
      } else {
        body.resumeText = uploadedText;
      }

      const res = await fetch('/api/ats-tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok && data.score) {
        setShowModal(false);
        setJd('');
        setSelectedResume('');
        setUploadedText('');
        setUploadedFileName('');
        fetchData();
        // Auto-open the result
        setViewingScore(data.score);
        setDetailedResult(data.result || null);
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

  const getSectionIcon = (key: string) => {
    const icons: Record<string, React.ReactNode> = {
      contactInfo: <FileText size={14} />,
      summary: <Zap size={14} />,
      experience: <Award size={14} />,
      skills: <Shield size={14} />,
      education: <FileText size={14} />,
      projects: <Target size={14} />,
      formatting: <BarChart3 size={14} />,
    };
    return icons[key] || <FileText size={14} />;
  };

  const getSectionLabel = (key: string) => {
    const labels: Record<string, string> = {
      contactInfo: 'Contact Info',
      summary: 'Summary',
      experience: 'Experience',
      skills: 'Skills',
      education: 'Education',
      projects: 'Projects',
      formatting: 'Formatting',
    };
    return labels[key] || key;
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
            Analyze resumes against job descriptions with detailed section-by-section feedback
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
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
            Upload a resume or select a saved one to check its ATS compatibility.
          </p>
          <button onClick={() => setShowModal(true)} className="btn-primary"><Plus size={16} /> Run First Analysis</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {scores.map(score => (
            <div
              key={score.id}
              className="glass-panel"
              onClick={() => { setViewingScore(score); setDetailedResult(score.fullResult || null); }}
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

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt,.md"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

      {/* Run Analysis Modal */}
      {showModal && (
        <div className="resume-modal-overlay">
          <div className="resume-modal-content" style={{ maxWidth: '600px', padding: '2rem' }}>
            <button className="resume-modal-close" onClick={() => setShowModal(false)} type="button"><X size={20} /></button>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', color: 'var(--primary)' }}>
              <Target size={20} /> ATS Resume Analysis
            </h3>

            {/* Input mode tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <button
                onClick={() => setInputMode('select')}
                className={inputMode === 'select' ? 'btn-primary' : 'btn-secondary'}
                style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem' }}
              >
                <FileText size={14} /> Select Saved Resume
              </button>
              <button
                onClick={() => setInputMode('upload')}
                className={inputMode === 'upload' ? 'btn-primary' : 'btn-secondary'}
                style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem' }}
              >
                <Upload size={14} /> Upload Document
              </button>
            </div>

            {/* Resume input */}
            {inputMode === 'select' ? (
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
                {resumes.length === 0 && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    No saved resumes. Use the Upload tab instead.
                  </p>
                )}
              </div>
            ) : (
              <div className="input-group" style={{ marginBottom: '1rem' }}>
                <label className="input-label">Upload Resume (PDF, DOCX, TXT)</label>
                {uploadedFileName ? (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem',
                    background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: 'var(--radius-md)', fontSize: '0.88rem', color: '#10b981'
                  }}>
                    <File size={16} />
                    <span style={{ flex: 1 }}>{uploadedFileName}</span>
                    <button onClick={() => { setUploadedText(''); setUploadedFileName(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="btn-secondary full-width"
                    style={{ justifyContent: 'center', padding: '1.25rem', flexDirection: 'column', gap: '0.5rem' }}
                  >
                    {uploading ? (
                      <><Loader2 size={20} className="spin-icon" /> Parsing file...</>
                    ) : (
                      <><Upload size={20} /> Click to upload your resume</>
                    )}
                  </button>
                )}
              </div>
            )}

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
              disabled={analyzing || !(inputMode === 'select' ? selectedResume : uploadedText.trim()) || !jd.trim()}
              className="btn-primary full-width"
              style={{ justifyContent: 'center' }}
            >
              {analyzing ? <><Loader2 size={16} className="spin-icon" /> Analyzing...</> : <><Target size={16} /> Run Deep Analysis (1 credit)</>}
            </button>
          </div>
        </div>
      )}

      {/* Score Detail Modal */}
      {viewingScore && (
        <div className="resume-modal-overlay">
          <div className="resume-modal-content" style={{ maxWidth: '720px', padding: '2rem', maxHeight: '90vh' }}>
            <button className="resume-modal-close" onClick={() => { setViewingScore(null); setDetailedResult(null); }} type="button"><X size={20} /></button>

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

            <div style={{ maxHeight: '55vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Fallback for old history items without fullResult */}
              {!detailedResult && (
                <>
                  {viewingScore.matched && viewingScore.matched.length > 0 && (
                    <div>
                      <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem', color: '#10b981', fontSize: '0.9rem' }}>
                        <CheckCircle2 size={16} /> Matched Keywords ({viewingScore.matched.length})
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {viewingScore.matched.map((k: string, i: number) => (
                          <span key={i} style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>{k}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {viewingScore.missing && viewingScore.missing.length > 0 && (
                    <div>
                      <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem', color: '#ef4444', fontSize: '0.9rem' }}>
                        <AlertCircle size={16} /> Missing Keywords ({viewingScore.missing.length})
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {viewingScore.missing.map((k: string, i: number) => (
                          <span key={i} style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.15)' }}>{k}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {viewingScore.suggestions && viewingScore.suggestions.length > 0 && (
                    <div>
                      <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem', color: '#f59e0b', fontSize: '0.9rem' }}>
                        <Lightbulb size={16} /> Suggestions
                      </h4>
                      <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {viewingScore.suggestions.map((s: string, i: number) => (
                          <li key={i} style={{ color: 'var(--foreground)', fontSize: '0.88rem', lineHeight: 1.5 }}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {viewingScore.jdSnippet && (
                    <div>
                      <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        <FileText size={14} /> Job Description Used
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, fontStyle: 'italic' }}>{viewingScore.jdSnippet}</p>
                    </div>
                  )}
                </>
              )}

              {/* Overall Verdict */}
              {detailedResult?.overallVerdict && (
                <div style={{ padding: '1rem', background: 'rgba(139, 92, 246, 0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(139, 92, 246, 0.15)' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem', color: 'var(--primary)', fontSize: '0.9rem' }}>
                    <Zap size={16} /> Professional Assessment
                  </h4>
                  <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--foreground)' }}>{detailedResult.overallVerdict}</p>
                </div>
              )}

              {/* Component Score Breakdown */}
              {detailedResult && (
                <div>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.75rem', color: 'var(--foreground)', fontSize: '0.9rem' }}>
                    <BarChart3 size={16} style={{ color: 'var(--primary)' }} /> Score Breakdown
                  </h4>
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {[
                      { label: 'Keyword Match', score: detailedResult.keywordScore, weight: '35%', icon: <Target size={14} /> },
                      { label: 'Resume Sections', score: detailedResult.sectionScore, weight: '20%', icon: <FileText size={14} /> },
                      { label: 'Bullet Quality', score: detailedResult.bulletScore, weight: '15%', icon: <Award size={14} /> },
                      { label: 'Readability', score: detailedResult.readabilityScore, weight: '15%', icon: <Zap size={14} /> },
                      { label: 'Formatting', score: detailedResult.formatScore, weight: '15%', icon: <Shield size={14} /> },
                    ].map(item => (
                      <div key={item.label} style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 1rem',
                        background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)'
                      }}>
                        <div style={{ color: 'var(--primary)', flexShrink: 0 }}>{item.icon}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.83rem' }}>{item.label} <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.72rem' }}>({item.weight})</span></span>
                            <span style={{ fontWeight: 700, fontSize: '0.8rem', color: getScoreColor(item.score) }}>{item.score}%</span>
                          </div>
                          <div style={{ height: '4px', borderRadius: '2px', background: 'var(--surface-border)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${item.score}%`, background: getScoreColor(item.score), borderRadius: '2px', transition: 'width 0.5s ease' }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bullet Quality Metrics */}
              {detailedResult?.bulletAnalysis && (
                <div>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem', color: 'var(--foreground)', fontSize: '0.9rem' }}>
                    <Award size={16} style={{ color: 'var(--primary)' }} /> Bullet Quality
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{ padding: '0.6rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--surface-border)' }}>
                      <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>{detailedResult.bulletAnalysis.totalBullets}</p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Bullets</p>
                    </div>
                    <div style={{ padding: '0.6rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--surface-border)' }}>
                      <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981' }}>{detailedResult.bulletAnalysis.actionVerbBullets}</p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Action Verbs</p>
                    </div>
                    <div style={{ padding: '0.6rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--surface-border)' }}>
                      <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f59e0b' }}>{detailedResult.bulletAnalysis.quantifiedBullets}</p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Quantified</p>
                    </div>
                  </div>
                  {detailedResult.bulletAnalysis.actionVerbs.length > 0 && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <strong style={{ color: '#10b981' }}>Action verbs found:</strong> {detailedResult.bulletAnalysis.actionVerbs.join(', ')}
                    </p>
                  )}
                  {detailedResult.bulletAnalysis.metrics.length > 0 && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      <strong style={{ color: '#f59e0b' }}>Metrics detected:</strong> {detailedResult.bulletAnalysis.metrics.join(', ')}
                    </p>
                  )}
                </div>
              )}

              {/* Strength Areas */}
              {detailedResult?.strengthAreas && detailedResult.strengthAreas.length > 0 && (
                <div>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem', color: '#10b981', fontSize: '0.9rem' }}>
                    <ThumbsUp size={16} /> Strengths
                  </h4>
                  <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {detailedResult.strengthAreas.map((s, i) => (
                      <li key={i} style={{ color: 'var(--foreground)', fontSize: '0.85rem', lineHeight: 1.5 }}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Format Issues */}
              {detailedResult?.formatIssues && detailedResult.formatIssues.length > 0 && (
                <div>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem', color: '#f97316', fontSize: '0.9rem' }}>
                    <AlertTriangle size={16} /> Formatting Issues
                  </h4>
                  <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {detailedResult.formatIssues.map((f, i) => (
                      <li key={i} style={{ color: 'var(--foreground)', fontSize: '0.85rem', lineHeight: 1.5 }}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Keyword Details Table */}
              {detailedResult?.keywords && detailedResult.keywords.length > 0 && (
                <div>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem', color: 'var(--foreground)', fontSize: '0.9rem' }}>
                    <Target size={16} style={{ color: 'var(--primary)' }} /> Keyword Analysis ({detailedResult.keywords.filter(k => k.found).length}/{detailedResult.keywords.length} matched)
                  </h4>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                      <thead>
                        <tr style={{ background: 'var(--surface)', position: 'sticky', top: 0 }}>
                          <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid var(--surface-border)' }}>Keyword</th>
                          <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontWeight: 600, borderBottom: '1px solid var(--surface-border)' }}>Category</th>
                          <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontWeight: 600, borderBottom: '1px solid var(--surface-border)' }}>Status</th>
                          <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontWeight: 600, borderBottom: '1px solid var(--surface-border)' }}>Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailedResult.keywords.map((kw, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                            <td style={{ padding: '0.4rem 0.75rem', fontWeight: 500 }}>{kw.keyword}</td>
                            <td style={{ padding: '0.4rem 0.75rem', textAlign: 'center' }}>
                              <span style={{
                                fontSize: '0.68rem', padding: '0.1rem 0.4rem', borderRadius: '4px',
                                background: kw.category === 'technical' ? 'rgba(139,92,246,0.1)' : kw.category === 'domain' ? 'rgba(139,92,246,0.07)' : kw.category === 'soft' ? 'rgba(59,130,246,0.1)' : kw.category === 'certification' ? 'rgba(245,158,11,0.1)' : kw.category === 'tool' ? 'rgba(16,185,129,0.1)' : kw.category === 'methodology' ? 'rgba(236,72,153,0.1)' : 'rgba(107,114,128,0.1)',
                                color: kw.category === 'technical' ? '#8b5cf6' : kw.category === 'domain' ? '#7c3aed' : kw.category === 'soft' ? '#3b82f6' : kw.category === 'certification' ? '#f59e0b' : kw.category === 'tool' ? '#10b981' : kw.category === 'methodology' ? '#ec4899' : 'var(--text-muted)'
                              }}>
                                {kw.category}
                              </span>
                            </td>
                            <td style={{ padding: '0.4rem 0.75rem', textAlign: 'center' }}>
                              {kw.found
                                ? <CheckCircle2 size={14} style={{ color: '#10b981' }} />
                                : <AlertCircle size={14} style={{ color: '#ef4444' }} />
                              }
                            </td>
                            <td style={{ padding: '0.4rem 0.75rem', textAlign: 'center', fontWeight: 600, color: kw.found ? '#10b981' : '#ef4444' }}>
                              {kw.frequency}×
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {detailedResult?.suggestions && detailedResult.suggestions.length > 0 && (
                <div>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem', color: '#f59e0b', fontSize: '0.9rem' }}>
                    <Lightbulb size={16} /> Actionable Suggestions
                  </h4>
                  <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {detailedResult.suggestions.map((s, i) => (
                      <li key={i} style={{ color: 'var(--foreground)', fontSize: '0.88rem', lineHeight: 1.5 }}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Resume Stats */}
              {detailedResult?.formatMetrics && (
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    📄 {detailedResult.formatMetrics.wordCount} words (~{detailedResult.formatMetrics.estimatedPages} page{detailedResult.formatMetrics.estimatedPages > 1 ? 's' : ''})
                  </span>
                  <span style={{ fontSize: '0.75rem', color: detailedResult.formatMetrics.dateConsistency ? '#10b981' : '#f97316', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    📅 Dates: {detailedResult.formatMetrics.dateConsistency ? 'Consistent ✓' : 'Inconsistent ✗'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: detailedResult.formatMetrics.hasProperLength ? '#10b981' : '#f97316', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    📏 Length: {detailedResult.formatMetrics.hasProperLength ? 'Good ✓' : 'Review needed ✗'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
