'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Download, RefreshCw, FileText, Eye, Edit3, Copy, Printer, Check, Loader2, Target, ChevronDown, ChevronUp } from 'lucide-react';

interface AtsResult {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
}

interface ResumePreviewProps {
  resumeMarkdown: string | null;
  onResumeChange: (markdown: string) => void;
  onReset: () => void;
  jobDescription?: string;
}

export default function ResumePreview({ resumeMarkdown, onResumeChange, onReset, jobDescription }: ResumePreviewProps) {
  const [mode, setMode] = useState<'preview' | 'edit'>('preview');
  const [copied, setCopied] = useState(false);
  const [atsResult, setAtsResult] = useState<AtsResult | null>(null);
  const [atsLoading, setAtsLoading] = useState(false);
  const [atsExpanded, setAtsExpanded] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Auto-run ATS score when resume is generated and JD is available
  useEffect(() => {
    if (resumeMarkdown && jobDescription && jobDescription.length > 20 && !atsResult) {
      runAtsScore();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeMarkdown]);

  const runAtsScore = async () => {
    if (!resumeMarkdown || !jobDescription) return;
    setAtsLoading(true);
    try {
      const res = await fetch('/api/ats-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume: resumeMarkdown, jobDescription }),
      });
      const data = await res.json();
      if (data.score !== undefined) setAtsResult(data);
    } catch { /* silent */ }
    setAtsLoading(false);
  };

  const handleDownload = () => {
    if (!resumeMarkdown) return;
    const blob = new Blob([resumeMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    if (!resumeMarkdown) return;
    await navigator.clipboard.writeText(resumeMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--warning)';
    return 'var(--error)';
  };

  if (!resumeMarkdown) {
    return (
      <div className="preview-empty">
        <div className="preview-empty-icon"><FileText size={48} strokeWidth={1.5} /></div>
        <h3>Your Resume Awaits</h3>
        <p>Fill out the form and generate. Our AI crafts an ATS-optimized resume tailored to your target role.</p>
        <div className="preview-empty-features">
          <div className="preview-feature-item"><Edit3 size={14} /><span>Editable</span></div>
          <div className="preview-feature-item"><Printer size={14} /><span>Print-ready</span></div>
          <div className="preview-feature-item"><Target size={14} /><span>ATS Score</span></div>
          <div className="preview-feature-item"><Download size={14} /><span>Export</span></div>
        </div>
      </div>
    );
  }

  return (
    <div className="preview-container animate-fade-in">
      {/* Toolbar */}
      <div className="preview-toolbar">
        <div className="preview-toolbar-left">
          <div className="preview-mode-toggle">
            <button className={`mode-btn ${mode === 'preview' ? 'active' : ''}`} onClick={() => setMode('preview')} type="button"><Eye size={14} /> Preview</button>
            <button className={`mode-btn ${mode === 'edit' ? 'active' : ''}`} onClick={() => setMode('edit')} type="button"><Edit3 size={14} /> Edit</button>
          </div>
          {/* ATS Score Badge */}
          {atsLoading && <div className="ats-badge loading"><Loader2 size={13} className="spin-icon" /> Scoring...</div>}
          {atsResult && !atsLoading && (
            <button className="ats-badge" onClick={() => setAtsExpanded(!atsExpanded)} type="button" style={{ borderColor: getScoreColor(atsResult.score) }}>
              <Target size={13} />
              <span style={{ color: getScoreColor(atsResult.score), fontWeight: 700 }}>{atsResult.score}</span>
              <span>ATS</span>
              {atsExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          )}
        </div>
        <div className="preview-toolbar-right">
          <button onClick={onReset} className="toolbar-btn" title="Reset" type="button"><RefreshCw size={14} /></button>
          <button onClick={handleCopy} className="toolbar-btn" title="Copy" type="button">{copied ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}</button>
          <button onClick={handleDownload} className="toolbar-btn" title="Download .md" type="button"><Download size={14} /></button>
          <button onClick={() => window.print()} className="toolbar-btn accent" title="Print / PDF" type="button"><Printer size={14} /></button>
        </div>
      </div>

      {/* ATS Details Panel */}
      {atsResult && atsExpanded && (
        <div className="ats-details animate-fade-in">
          <div className="ats-score-ring">
            <svg viewBox="0 0 36 36" className="ats-ring-svg">
              <path className="ats-ring-bg" d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" />
              <path className="ats-ring-fill" d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3"
                style={{ stroke: getScoreColor(atsResult.score), strokeDasharray: `${atsResult.score}, 100` }} />
            </svg>
            <span className="ats-ring-text" style={{ color: getScoreColor(atsResult.score) }}>{atsResult.score}</span>
          </div>
          <div className="ats-keywords">
            {atsResult.matchedKeywords.length > 0 && (
              <div className="ats-kw-section">
                <span className="ats-kw-label matched">✓ Matched</span>
                <div className="skill-chips">{atsResult.matchedKeywords.map((k, i) => <span key={i} className="skill-chip ats-matched">{k}</span>)}</div>
              </div>
            )}
            {atsResult.missingKeywords.length > 0 && (
              <div className="ats-kw-section">
                <span className="ats-kw-label missing">✗ Missing</span>
                <div className="skill-chips">{atsResult.missingKeywords.map((k, i) => <span key={i} className="skill-chip ats-missing">{k}</span>)}</div>
              </div>
            )}
            {atsResult.suggestions.length > 0 && (
              <div className="ats-suggestions">
                {atsResult.suggestions.map((s, i) => <p key={i} className="ats-suggestion-item">💡 {s}</p>)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="preview-content-area">
        {mode === 'edit' ? (
          <div className="editor-wrapper animate-fade-in">
            <textarea className="resume-editor" value={resumeMarkdown} onChange={e => onResumeChange(e.target.value)} spellCheck={false} />
          </div>
        ) : (
          <div className="resume-paper" ref={printRef} id="resume-print-area">
            <div className="resume-content">
              <ReactMarkdown
                components={{
                  h1: ({ children, ...props }) => <h1 className="resume-h1" {...props}>{children}</h1>,
                  h2: ({ children, ...props }) => <h2 className="resume-h2" {...props}>{children}</h2>,
                  h3: ({ children, ...props }) => <h3 className="resume-h3" {...props}>{children}</h3>,
                  p: ({ children, ...props }) => <p className="resume-p" {...props}>{children}</p>,
                  ul: ({ children, ...props }) => <ul className="resume-ul" {...props}>{children}</ul>,
                  li: ({ children, ...props }) => <li className="resume-li" {...props}>{children}</li>,
                  strong: ({ children, ...props }) => <strong className="resume-strong" {...props}>{children}</strong>,
                  hr: (props) => <hr className="resume-hr" {...props} />,
                  a: ({ children, ...props }) => <a className="resume-link" {...props} target="_blank" rel="noopener">{children}</a>,
                }}
              >
                {resumeMarkdown}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
