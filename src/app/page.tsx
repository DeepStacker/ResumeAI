'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Sparkles, FileText, Target, Zap, ChevronRight, CheckCircle2,
  Upload, Briefcase, GraduationCap, Code, MessageCircle,
  BarChart3, Share2, Bot, Award, Languages, Globe, Shield,
  ArrowRight, Star, TrendingUp, ClipboardList
} from 'lucide-react';

export default function LandingPage() {
  const { status } = useSession();

  const ctaHref = status === 'authenticated' ? '/builder' : '/auth/signin';
  const ctaLabel = status === 'authenticated' ? 'Go to Builder' : 'Start Building for Free';

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={16} /> <span>AI-Powered Career Platform</span>
          </div>
          <h1 className="hero-title">
            Your Entire Career Toolkit, <br />
            <span className="text-gradient">Powered by AI</span>
          </h1>
          <p className="hero-subtitle">
            Build ATS-optimized resumes, generate tailored cover letters, track your ATS scores, and chat with an AI career counselor — all in one platform.
          </p>
          <div className="hero-actions">
            <Link href={ctaHref} className="btn-primary hero-btn">
              {ctaLabel} <ChevronRight size={18} />
            </Link>
            {status !== 'authenticated' && (
              <p className="hero-subtext">Includes 10 free AI credits. No credit card required.</p>
            )}
          </div>
        </div>

        <div className="hero-visual glass-panel">
          <div className="visual-code-mock">
            <div className="mock-dot red"></div>
            <div className="mock-dot yellow"></div>
            <div className="mock-dot green"></div>
          </div>
          <div className="visual-content">
            <div className="mock-line title"></div>
            <div className="mock-line"></div>
            <div className="mock-line short"></div>
            <br />
            <div className="mock-line"></div>
            <div className="mock-line highlight"></div>
            <div className="mock-line"></div>
          </div>
          <div className="visual-badge"><Target size={14} /> ATS Score: 98/100</div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="process-section">
        <div className="features-header">
          <h2>Everything You Need to Land the Job</h2>
          <p>Four powerful tools working together to maximize your chances.</p>
        </div>
        <div className="process-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          <div className="process-step glass-panel" style={{ borderTop: '3px solid var(--primary)' }}>
            <FileText size={24} className="step-icon" />
            <h4>AI Resume Builder</h4>
            <p>8-step intelligent builder with smart parsing. Upload an existing resume or start from scratch — AI handles the rest.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.75rem' }}>
              <span className="skill-chip" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>PDF/DOCX Upload</span>
              <span className="skill-chip" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>XYZ Bullets</span>
              <span className="skill-chip" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>3 Templates</span>
            </div>
          </div>

          <div className="process-step glass-panel" style={{ borderTop: '3px solid var(--accent)' }}>
            <MessageCircle size={24} className="step-icon" style={{ color: 'var(--accent)' }} />
            <h4>AI Career Chatbot</h4>
            <p>Not sure where to start? Chat with our AI counselor — it learns about you through conversation and builds your resume for you.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.75rem' }}>
              <span className="skill-chip" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>Free Conversation</span>
              <span className="skill-chip" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>1-Click Generate</span>
            </div>
          </div>

          <div className="process-step glass-panel" style={{ borderTop: '3px solid var(--success)' }}>
            <BarChart3 size={24} className="step-icon" style={{ color: 'var(--success)' }} />
            <h4>ATS Score Tracker</h4>
            <p>Run unlimited analyses to see how your resume matches any job description. Track scores, find missing keywords, and improve.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.75rem' }}>
              <span className="skill-chip" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>Score History</span>
              <span className="skill-chip" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>Keyword Matching</span>
            </div>
          </div>

          <div className="process-step glass-panel" style={{ borderTop: '3px solid #f59e0b' }}>
            <ClipboardList size={24} className="step-icon" style={{ color: '#f59e0b' }} />
            <h4>Smart Cover Letters</h4>
            <p>Generate tailored cover letters from any saved resume. Paste a new JD and get a perfectly customized letter in seconds.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.75rem' }}>
              <span className="skill-chip" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>JD-Tailored</span>
              <span className="skill-chip" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>Editable</span>
            </div>
          </div>
        </div>
      </section>

      {/* The Step-by-Step Process */}
      <section className="process-section" style={{ paddingTop: '2rem' }}>
        <div className="features-header">
          <h2>The 8-Step Intelligent Builder</h2>
          <p>Build a professional resume in minutes, not hours.</p>
        </div>
        <div className="process-grid">
          <div className="process-step glass-panel">
            <Upload size={20} className="step-icon" />
            <h4>1. Smart Parsing</h4>
            <p>Upload your old PDF/Word doc — AI instantly extracts all your data.</p>
          </div>
          <div className="process-step glass-panel">
            <Briefcase size={20} className="step-icon" />
            <h4>2. Personal Info</h4>
            <p>Your contact details, LinkedIn, GitHub, and portfolio links.</p>
          </div>
          <div className="process-step glass-panel">
            <Target size={20} className="step-icon" />
            <h4>3. Target Role & JD</h4>
            <p>Paste the job description — AI tailors everything to match it.</p>
          </div>
          <div className="process-step glass-panel">
            <Code size={20} className="step-icon" />
            <h4>4. AI-Powered Skills</h4>
            <p>AI suggests skills from your target role and extracts keywords from the JD.</p>
          </div>
          <div className="process-step glass-panel">
            <Zap size={20} className="step-icon" />
            <h4>5. XYZ Experience</h4>
            <p>AI rewrites weak bullets into high-impact Google XYZ formula achievements.</p>
          </div>
          <div className="process-step glass-panel">
            <Globe size={20} className="step-icon" />
            <h4>6. Projects</h4>
            <p>Showcase your best work with AI-enhanced descriptions and tech stacks.</p>
          </div>
          <div className="process-step glass-panel">
            <GraduationCap size={20} className="step-icon" />
            <h4>7. Education</h4>
            <p>Degrees, coursework, GPA — organized for maximum recruiter impact.</p>
          </div>
          <div className="process-step glass-panel">
            <Sparkles size={20} className="step-icon" />
            <h4>8. Review & Generate</h4>
            <p>AI summary, certifications, languages, template selection — then generate.</p>
          </div>
        </div>
      </section>

      {/* AI Features Deep Dive */}
      <section className="process-section" style={{ paddingTop: '2rem' }}>
        <div className="features-header">
          <h2>AI That Actually Helps</h2>
          <p>Every AI feature is designed to save you time and improve your chances.</p>
        </div>
        <div className="process-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div className="process-step glass-panel">
            <Bot size={20} className="step-icon" style={{ color: 'var(--accent)' }} />
            <h4>Career Counselor Chat</h4>
            <p>Have a conversation with AI to discover your strengths and build your resume naturally.</p>
          </div>
          <div className="process-step glass-panel">
            <Sparkles size={20} className="step-icon" />
            <h4>Smart Skill Suggestions</h4>
            <p>AI suggests skills based on your target role and extracts missing keywords from job descriptions.</p>
          </div>
          <div className="process-step glass-panel">
            <Zap size={20} className="step-icon" style={{ color: '#f59e0b' }} />
            <h4>XYZ Bullet Rewrite</h4>
            <p>Transform "Did X" into "Accomplished X, measured by Y, by doing Z" automatically.</p>
          </div>
          <div className="process-step glass-panel">
            <TrendingUp size={20} className="step-icon" style={{ color: 'var(--success)' }} />
            <h4>Role-Based Ideas</h4>
            <p>AI generates relevant achievement bullets based on just your job title.</p>
          </div>
          <div className="process-step glass-panel">
            <Target size={20} className="step-icon" style={{ color: '#ef4444' }} />
            <h4>ATS Score Analysis</h4>
            <p>See exactly which keywords match and which are missing for any job description.</p>
          </div>
          <div className="process-step glass-panel">
            <Share2 size={20} className="step-icon" style={{ color: '#0ea5e9' }} />
            <h4>Public Sharing</h4>
            <p>Share your resume via a public link — perfect for recruiters and LinkedIn profiles.</p>
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section className="templates-showcase">
        <div className="features-header">
          <h2>ATS-Optimized Templates</h2>
          <p>Designed to pass ATS systems, not just look pretty. Choose from 3 proven formats.</p>
        </div>
        <div className="templates-grid">
          <div className="template-mockup glass-panel">
            <div className="template-preview professional-preview"></div>
            <h4>Professional</h4>
            <p>Clean, traditional corporate layout for finance, law, and enterprise roles.</p>
          </div>
          <div className="template-mockup glass-panel">
            <div className="template-preview modern-preview"></div>
            <h4>Modern</h4>
            <p>Contemporary design with accent sections. Perfect for tech and marketing.</p>
          </div>
          <div className="template-mockup glass-panel">
            <div className="template-preview minimal-preview"></div>
            <h4>Minimal</h4>
            <p>Ultra-clean, maximally ATS-parseable layout focused on content.</p>
          </div>
        </div>
      </section>

      {/* Credit Costs */}
      <section className="process-section" style={{ paddingTop: '2rem' }}>
        <div className="features-header">
          <h2>Transparent Credit Costs</h2>
          <p>Know exactly what each action costs. No hidden fees.</p>
        </div>
        <div className="process-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <div className="process-step glass-panel" style={{ textAlign: 'center' }}>
            <FileText size={20} className="step-icon" />
            <h4>Generate Resume</h4>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>2 credits</p>
          </div>
          <div className="process-step glass-panel" style={{ textAlign: 'center' }}>
            <ClipboardList size={20} className="step-icon" />
            <h4>Cover Letter</h4>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>2 credits</p>
          </div>
          <div className="process-step glass-panel" style={{ textAlign: 'center' }}>
            <Upload size={20} className="step-icon" />
            <h4>Parse Resume</h4>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>1 credit</p>
          </div>
          <div className="process-step glass-panel" style={{ textAlign: 'center' }}>
            <BarChart3 size={20} className="step-icon" />
            <h4>ATS Analysis</h4>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }}>1 credit</p>
          </div>
          <div className="process-step glass-panel" style={{ textAlign: 'center' }}>
            <Zap size={20} className="step-icon" />
            <h4>Bullet Rewrite</h4>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f97316' }}>1 credit</p>
          </div>
          <div className="process-step glass-panel" style={{ textAlign: 'center' }}>
            <MessageCircle size={20} className="step-icon" />
            <h4>AI Chat</h4>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>Free</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section" style={{ display: 'flex', flexDirection: 'column', gap: '3rem', marginTop: '2rem' }}>
        <div className="features-header">
          <h2>Simple, Pay-As-You-Go Pricing</h2>
          <p>No monthly subscriptions. Just buy AI tokens when you need them.</p>
        </div>
        <div className="templates-grid" style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
          {/* Free Tier */}
          <div className="template-mockup glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', padding: '2.5rem' }}>
            <h4 style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Trial</h4>
            <div style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--foreground)' }}>$0</div>
            <p style={{ opacity: 0.7, marginBottom: '2rem' }}>Everything to get started.</p>

            <ul className="trust-list" style={{ marginBottom: '2.5rem', flex: 1 }}>
              <li style={{ fontSize: '0.95rem' }}><CheckCircle2 size={16} color="var(--success)" /> 10 Free AI Credits</li>
              <li style={{ fontSize: '0.95rem' }}><CheckCircle2 size={16} color="var(--success)" /> Up to 5 Resume Generations</li>
              <li style={{ fontSize: '0.95rem' }}><CheckCircle2 size={16} color="var(--success)" /> AI Career Chatbot (Unlimited)</li>
              <li style={{ fontSize: '0.95rem' }}><CheckCircle2 size={16} color="var(--success)" /> ATS Score Analysis</li>
              <li style={{ fontSize: '0.95rem' }}><CheckCircle2 size={16} color="var(--success)" /> Public Resume Sharing</li>
              <li style={{ fontSize: '0.95rem' }}><CheckCircle2 size={16} color="var(--success)" /> 3 ATS-Optimized Templates</li>
            </ul>
            <Link href="/auth/signin" className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>Create Free Account</Link>
          </div>

          {/* Pro Tier */}
          <div className="template-mockup" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', padding: '2.5rem', background: 'var(--surface)', border: '2px solid var(--primary)', borderRadius: 'var(--radius-xl)', position: 'relative', boxShadow: '0 20px 40px -10px rgba(79, 70, 229, 0.2)' }}>
            <div style={{ position: 'absolute', top: '-14px', right: '2rem', background: 'var(--primary)', color: 'white', padding: '0.25rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Most Popular</div>
            <h4 style={{ color: 'var(--primary)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Pro Tokens</h4>
            <div style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--foreground)' }}>$5 <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ one-time</span></div>
            <p style={{ opacity: 0.7, marginBottom: '2rem' }}>For serious job seekers.</p>

            <ul className="trust-list" style={{ marginBottom: '2.5rem', flex: 1 }}>
              <li style={{ fontSize: '0.95rem' }}><CheckCircle2 size={16} color="var(--success)" /> 50 AI Credits</li>
              <li style={{ fontSize: '0.95rem' }}><CheckCircle2 size={16} color="var(--success)" /> 25+ Resume Generations</li>
              <li style={{ fontSize: '0.95rem' }}><CheckCircle2 size={16} color="var(--success)" /> Unlimited Cover Letters</li>
              <li style={{ fontSize: '0.95rem' }}><CheckCircle2 size={16} color="var(--success)" /> Unlimited ATS Score Tracking</li>
              <li style={{ fontSize: '0.95rem' }}><CheckCircle2 size={16} color="var(--success)" /> XYZ Bullet Rewrites</li>
              <li style={{ fontSize: '0.95rem' }}><CheckCircle2 size={16} color="var(--success)" /> JD Keyword Extraction</li>
              <li style={{ fontSize: '0.95rem' }}><CheckCircle2 size={16} color="var(--success)" /> Lifetime Access to All Resumes</li>
            </ul>
            <Link href={ctaHref} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Get Started <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* Trust / CTA Section */}
      <section className="trust-section">
        <div className="trust-content" style={{ maxWidth: '800px', textAlign: 'center' }}>
          <h2>Ready to Beat the ATS?</h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.8, marginBottom: '1.5rem' }}>
            Join professionals using AI to build resumes that actually get past the algorithms. Chat with our AI counselor, build your resume, track your ATS score, and land more interviews.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href={ctaHref} className="btn-primary hero-btn">
              {ctaLabel} <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
