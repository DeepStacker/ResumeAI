'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import {
  MessageCircle, X, Send, Loader2, Sparkles, Bot, User, Minimize2,
  RotateCcw, Lightbulb, Paperclip, FileText, Mic, MicOff, Volume2, VolumeX
} from 'lucide-react';
import { useResumeStore } from '@/store/useResumeStore';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const WELCOME_MSG: Message = {
  id: 'welcome',
  role: 'assistant',
  content: "Hey! 👋 I'm your AI Career Counselor.\n\nI can help you:\n• **Build a resume** through conversation\n• **Answer career questions** and clear doubts\n• **Parse your existing resume** — just attach a file!\n\n**What would you like to do?**"
};

const WELCOME_SUGGESTIONS = [
  "Build a resume from scratch",
  "Upload my existing resume",
  "I need career guidance"
];

// ─── Resume Data Validator ───────────────────────────
interface ValidationResult {
  score: number;       // 0-100 readiness score
  passed: boolean;     // true if score >= 60
  missing: string[];   // missing critical fields
  warnings: string[];  // nice-to-have fields
  filled: string[];    // what's already provided
}

function validateResumeData(data: any): ValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];
  const filled: string[] = [];
  let score = 0;

  // Critical fields (each worth points)
  if (data.personal?.fullName?.trim()) { score += 15; filled.push('Full name'); }
  else missing.push('Full name');

  if (data.targetRole?.trim()) { score += 15; filled.push('Target role'); }
  else missing.push('Target role');

  if (data.personal?.email?.trim()) { score += 8; filled.push('Email'); }
  else missing.push('Email address');

  if (data.personal?.phone?.trim()) { score += 5; filled.push('Phone'); }
  else warnings.push('Phone number');

  if (data.personal?.location?.trim()) { score += 3; filled.push('Location'); }
  else warnings.push('Location');

  // Skills (critical)
  const skills = Array.isArray(data.skills) ? data.skills.filter(Boolean) : [];
  if (skills.length >= 3) { score += 15; filled.push(`${skills.length} skills`); }
  else if (skills.length > 0) { score += 7; warnings.push(`Only ${skills.length} skill(s) — add at least 3`); }
  else missing.push('Skills (at least 3)');

  // Experience OR Education (at least one required)
  const exp = Array.isArray(data.experience) ? data.experience.filter((e: any) => e.jobTitle || e.company) : [];
  const edu = Array.isArray(data.education) ? data.education.filter((e: any) => e.degree || e.institution) : [];

  if (exp.length > 0) {
    score += 15;
    filled.push(`${exp.length} work experience(s)`);
    // Check if experience has bullets
    const bulleted = exp.filter((e: any) => e.bullets?.length > 0).length;
    if (bulleted < exp.length) warnings.push('Some work experiences have no achievements/bullets');
  } else {
    missing.push('Work experience (at least 1)');
  }

  if (edu.length > 0) { score += 10; filled.push(`${edu.length} education entry(ies)`); }
  else missing.push('Education');

  // If they have neither experience nor education, it's a hard block
  if (exp.length === 0 && edu.length === 0) {
    score = Math.min(score, 30);
  }

  // Optional bonus points
  if (data.summary?.trim()) { score += 5; filled.push('Professional summary'); }
  const projects = Array.isArray(data.projects) ? data.projects.filter((p: any) => p.name) : [];
  if (projects.length > 0) { score += 5; filled.push(`${projects.length} project(s)`); }
  if (data.personal?.linkedin?.trim()) { score += 2; filled.push('LinkedIn'); }
  if (data.personal?.github?.trim()) { score += 2; filled.push('GitHub'); }

  score = Math.min(score, 100);

  return {
    score,
    passed: score >= 60 && missing.length <= 1,
    missing,
    warnings,
    filled,
  };
}

export default function ChatBot() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(WELCOME_SUGGESTIONS);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [parsedContext, setParsedContext] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice state
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);
  const lastMsgRef = useRef<string>('');

  // ─── Voice Typing (Speech-to-Text) ────────────────
  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Your browser does not support voice input. Please use Chrome or Edge.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput(prev => {
        // Replace interim results with final
        const base = prev.replace(/\[🎤\s.*?\]$/, '').trim();
        const isFinal = event.results[event.results.length - 1].isFinal;
        if (isFinal) {
          return (base ? base + ' ' : '') + transcript;
        }
        return (base ? base + ' ' : '') + `[🎤 ${transcript}]`;
      });
    };

    recognition.onerror = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setIsListening(false);
      // Clean up interim markers
      setInput(prev => prev.replace(/\[🎤\s.*?\]$/, '').trim());
      recognitionRef.current = null;
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  // ─── Voice Reply (Text-to-Speech) ─────────────────
  const speakText = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Your browser does not support text-to-speech.');
      return;
    }
    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    // Strip markdown for cleaner speech
    const clean = text
      .replace(/```[\s\S]*?```/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,4}\s*/g, '')
      .replace(/[\-•]\s/g, '')
      .replace(/\[SUGGESTIONS\]:.*$/gm, '')
      .replace(/\n{2,}/g, '. ')
      .replace(/\n/g, '. ')
      .trim();

    if (!clean) return;

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Auto-speak new assistant messages
  React.useEffect(() => {
    if (!autoSpeak || messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role === 'assistant' && lastMsg.id !== lastMsgRef.current) {
      lastMsgRef.current = lastMsg.id;
      const clean = lastMsg.content.replace(/```json[\s\S]*?```/g, '').trim();
      if (clean) speakText(clean);
    }
  }, [messages, autoSpeak, speakText]);

  const focusInput = useCallback(() => {
    setTimeout(() => inputRef.current?.focus(), 150);
  }, []);

  // Load from localStorage on mount
  React.useEffect(() => {
    if (!session?.user) return;
    try {
      const stored = localStorage.getItem('chatbot_context');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.messages?.length > 0) {
          setMessages(parsed.messages);
          setSuggestions(parsed.suggestions || []);
          setExtractedData(parsed.extractedData || null);
          setParsedContext(parsed.parsedContext || '');
          return;
        }
      }
    } catch { /* ignore */ }
    setMessages([WELCOME_MSG]);
    setSuggestions(WELCOME_SUGGESTIONS);
  }, [session?.user]);

  // Save to localStorage when state changes
  React.useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatbot_context', JSON.stringify({
        messages, suggestions, extractedData, parsedContext
      }));
    }
  }, [messages, suggestions, extractedData, parsedContext]);

  if (!session?.user) return null;

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const openChat = () => {
    setIsOpen(true);
    setIsMinimized(false);
    focusInput();
    scrollToBottom();
  };

  const handleReset = () => {
    setMessages([WELCOME_MSG]);
    setSuggestions(WELCOME_SUGGESTIONS);
    setExtractedData(null);
    setParsedContext('');
    setInput('');
    localStorage.removeItem('chatbot_context');
    focusInput();
  };


  // ─── File Upload ───────────────────────────────────
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    if (!allowedTypes.includes(file.type)) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: '⚠️ Please upload a PDF, DOCX, or TXT file.'
      }]);
      return;
    }

    setUploading(true);
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: `📎 Uploaded: ${file.name}`
    }]);
    scrollToBottom();

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.parsed) {
        const parsed = data.parsed;

        // Build a context summary for the AI
        const contextParts: string[] = [];
        if (parsed.fullName) contextParts.push(`Name: ${parsed.fullName}`);
        if (parsed.email) contextParts.push(`Email: ${parsed.email}`);
        if (parsed.phone) contextParts.push(`Phone: ${parsed.phone}`);
        if (parsed.location) contextParts.push(`Location: ${parsed.location}`);
        if (parsed.linkedin) contextParts.push(`LinkedIn: ${parsed.linkedin}`);
        if (parsed.github) contextParts.push(`GitHub: ${parsed.github}`);
        if (parsed.summary) contextParts.push(`Summary: ${parsed.summary}`);
        if (parsed.skills?.length) contextParts.push(`Skills: ${parsed.skills.join(', ')}`);
        if (parsed.experience?.length) {
          contextParts.push('Experience:');
          parsed.experience.forEach((e: any) => {
            contextParts.push(`  - ${e.jobTitle || 'Role'} at ${e.company || 'Company'} (${e.startDate || ''}–${e.endDate || 'Present'})`);
            if (e.bullets?.length) e.bullets.forEach((b: string) => contextParts.push(`    • ${b}`));
          });
        }
        if (parsed.education?.length) {
          contextParts.push('Education:');
          parsed.education.forEach((e: any) => {
            contextParts.push(`  - ${e.degree || 'Degree'}, ${e.institution || 'Institution'} (${e.year || ''})`);
          });
        }
        if (parsed.projects?.length) {
          contextParts.push('Projects:');
          parsed.projects.forEach((p: any) => {
            contextParts.push(`  - ${p.name || 'Project'}: ${p.description || ''} (${p.techStack || ''})`);
          });
        }
        if (parsed.certifications?.length) contextParts.push(`Certifications: ${parsed.certifications.join(', ')}`);
        if (parsed.languages?.length) contextParts.push(`Languages: ${parsed.languages.join(', ')}`);

        const contextStr = contextParts.join('\n');
        setParsedContext(contextStr);

        // Show what was extracted
        const summaryParts: string[] = ['✅ **Resume parsed!** Here\'s what I found:\n'];
        if (parsed.fullName) summaryParts.push(`👤 **${parsed.fullName}**`);
        if (parsed.skills?.length) summaryParts.push(`🛠️ ${parsed.skills.length} skills`);
        if (parsed.experience?.length) summaryParts.push(`💼 ${parsed.experience.length} work experiences`);
        if (parsed.education?.length) summaryParts.push(`🎓 ${parsed.education.length} education entries`);
        if (parsed.projects?.length) summaryParts.push(`📁 ${parsed.projects.length} projects`);
        summaryParts.push('\nI already have your details. Now tell me — **what role are you targeting?** I\'ll optimize your resume for it.');

        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: summaryParts.join('\n')
        }]);
        setSuggestions(['Software Engineer', 'Data Scientist', 'Product Manager']);
      } else {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `⚠️ ${data.error || 'Could not parse the file. Try a different format or tell me about yourself instead.'}`
        }]);
        setSuggestions(["I'll type my details instead", "Try a different file", "Help me get started"]);
      }
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Upload failed. Please try again or just type your details.'
      }]);
    } finally {
      setUploading(false);
      scrollToBottom();
      focusInput();
    }
  };

  // ─── Send Message ──────────────────────────────────
  const sendMessage = async (text?: string) => {
    const msgText = (text || input).trim();
    if (!msgText || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: msgText };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setSuggestions([]);
    setLoading(true);
    scrollToBottom();

    try {
      // Inject parsed resume context as system message for maximum priority
      const apiMessages: { role: 'user' | 'assistant' | 'system'; content: string }[] = updatedMessages.map(m => ({ role: m.role, content: m.content }));
      if (parsedContext) {
        apiMessages.unshift({
          role: 'system' as const,
          content: `IMPORTANT: The user already uploaded their resume. Below is ALL the parsed data from their resume. You MUST treat this data as already collected. DO NOT ask about any information present below. Only ask about fields that are missing or need clarification (like target role). When generating the final JSON, include ALL of this data.\n\n${parsedContext}`
        });
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await res.json();

      if (res.ok && data.reply) {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.reply
        }]);

        if (data.suggestions?.length > 0) {
          setSuggestions(data.suggestions);
        }

        // Check for extracted JSON data
        const jsonMatch = data.reply.match(/```json\s*([\s\S]*?)```/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[1]);
            if (parsed.ready && parsed.data) {
              setExtractedData(parsed.data);
            }
          } catch { /* not valid JSON yet */ }
        }
      } else {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.error || 'Something went wrong. Please try again.'
        }]);
        setSuggestions(["Let's try again", "Start over"]);
      }
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Network error. Please check your connection.'
      }]);
    } finally {
      setLoading(false);
      scrollToBottom();
      focusInput();
    }
  };

  // ─── Validation ────────────────────────────────────
  const validation = extractedData ? validateResumeData(extractedData) : null;

  // ─── Fill Builder & Review ──────────────────────────────
  const handleGenerate = async () => {
    if (!extractedData) return;

    const v = validateResumeData(extractedData);
    if (!v.passed) {
      const missingList = v.missing.map(m => `• ${m}`).join('\n');
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `⚠️ **Your resume isn't ready yet** (${v.score}% complete)\n\n**Missing:**\n${missingList}\n\nPlease provide the missing information so I can fill the builder for you.`
      }]);
      setSuggestions(v.missing.slice(0, 3).map(m => `My ${m.toLowerCase()} is...`));
      scrollToBottom();
      focusInput();
      return;
    }

    // Map chatbot data into the builder store format
    const d = extractedData;
    const store = useResumeStore.getState();

    const experience = (Array.isArray(d.experience) ? d.experience : []).map((exp: any) => ({
      id: crypto.randomUUID(),
      jobTitle: exp.jobTitle || '',
      company: exp.company || '',
      location: exp.location || '',
      startDate: exp.startDate || '',
      endDate: exp.endDate || '',
      bullets: Array.isArray(exp.bullets) ? exp.bullets.filter((b: string) => b?.trim()) : [''],
    }));

    const projects = (Array.isArray(d.projects) ? d.projects : []).map((proj: any) => ({
      id: crypto.randomUUID(),
      name: proj.name || '',
      techStack: proj.techStack || '',
      description: proj.description || '',
      link: proj.link || '',
    }));

    const education = (Array.isArray(d.education) ? d.education : []).map((edu: any) => ({
      id: crypto.randomUUID(),
      degree: edu.degree || '',
      institution: edu.institution || '',
      year: edu.year || '',
      gpa: edu.gpa || '',
    }));

    store.setResumeData({
      personal: {
        fullName: d.personal?.fullName || '',
        email: d.personal?.email || '',
        phone: d.personal?.phone || '',
        location: d.personal?.location || '',
        linkedin: d.personal?.linkedin || '',
        github: d.personal?.github || '',
        portfolio: d.personal?.portfolio || '',
      },
      summary: d.summary || '',
      targetRole: d.targetRole || '',
      jobDescription: '',
      skills: Array.isArray(d.skills) ? d.skills : [],
      experience: experience.length > 0 ? experience : [{ id: crypto.randomUUID(), jobTitle: '', company: '', location: '', startDate: '', endDate: '', bullets: [''] }],
      projects: projects.length > 0 ? projects : [{ id: crypto.randomUUID(), name: '', techStack: '', description: '', link: '' }],
      education: education.length > 0 ? education : [{ id: crypto.randomUUID(), degree: '', institution: '', year: '', gpa: '' }],
      certifications: Array.isArray(d.certifications) ? d.certifications : [],
      languages: Array.isArray(d.languages) ? d.languages : [],
      template: d.template || 'professional',
    });

    store.setStep(7);

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      content: '✅ **All your details have been filled in the Resume Builder!**\n\nRedirecting you to the builder where you can:\n- 📝 **Review** all your information\n- ✏️ **Edit** any section\n- 🔍 **Check Readiness** for ATS score\n- 🚀 **Generate** your optimized resume\n\nRedirecting now...'
    }]);
    scrollToBottom();
    setTimeout(() => {
      router.push('/builder');
      setIsOpen(false);
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };



  const renderMessage = (msg: Message) => {
    const displayContent = msg.content.replace(/```json[\s\S]*?```/g, '').trim();
    if (!displayContent) return null;

    return (
      <div key={msg.id} className={`chat-message ${msg.role}`}>
        <div className="chat-avatar">
          {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
        </div>
        <div className="chat-bubble chat-markdown">
          <ReactMarkdown>{displayContent}</ReactMarkdown>
          {msg.role === 'assistant' && msg.id !== 'welcome' && (
            <button
              className="chat-speak-btn"
              onClick={() => speakText(displayContent)}
              title="Read aloud"
              type="button"
            >
              <Volume2 size={13} />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

      {/* Floating Action Button */}
      {!isOpen && (
        <button className="chatbot-fab" onClick={openChat} title="AI Career Counselor">
          <MessageCircle size={24} />
          <span className="chatbot-fab-pulse" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && !isMinimized && (
        <div className="chatbot-panel glass-panel animate-slide-up">
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <Bot size={20} />
              <div>
                <h4>AI Career Counselor</h4>
                <span>
                  {uploading ? '📎 Parsing file...' : loading ? 'Thinking...' : parsedContext ? '📄 Resume loaded' : 'Online'}
                </span>
              </div>
            </div>
            <div className="chatbot-header-actions">
              <button onClick={handleReset} className="chatbot-header-btn" title="New Chat">
                <RotateCcw size={15} />
              </button>
              <button onClick={() => setIsMinimized(true)} className="chatbot-header-btn" title="Minimize">
                <Minimize2 size={16} />
              </button>
              <button onClick={() => setIsOpen(false)} className="chatbot-header-btn" title="Close">
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="chatbot-messages" ref={scrollRef}>
            {messages.map(renderMessage)}
            {(loading || uploading) && (
              <div className="chat-message assistant">
                <div className="chat-avatar"><Bot size={16} /></div>
                <div className="chat-bubble chat-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
          </div>

          {/* Quick reply suggestions */}
          {suggestions.length > 0 && !loading && !uploading && (
            <div className="chatbot-suggestions">
              <Lightbulb size={12} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }} />
              <div className="chatbot-suggestion-chips">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    className="chatbot-suggestion-chip"
                    onClick={() => sendMessage(s)}
                    disabled={loading}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Fill Builder action with readiness score */}
          {extractedData && validation && (
            <div className="chatbot-actions">
              <div className="chatbot-readiness">
                <div className="chatbot-readiness-header">
                  <span>Resume Readiness</span>
                  <span className={`chatbot-readiness-score ${validation.passed ? 'ready' : 'not-ready'}`}>
                    {validation.score}%
                  </span>
                </div>
                <div className="chatbot-readiness-bar">
                  <div
                    className={`chatbot-readiness-fill ${validation.passed ? 'ready' : 'not-ready'}`}
                    style={{ width: `${validation.score}%` }}
                  />
                </div>
                {validation.missing.length > 0 && (
                  <div className="chatbot-readiness-missing">
                    Missing: {validation.missing.join(', ')}
                  </div>
                )}
              </div>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className={`btn-primary chatbot-generate-btn ${!validation.passed ? 'btn-warning' : ''}`}
              >
                {generating
                  ? <><Loader2 size={16} className="spin-icon" /> Filling Builder...</>
                  : validation.passed
                    ? <><Sparkles size={16} /> Fill Builder & Review</>
                    : <><Sparkles size={16} /> Fill Builder ({validation.score}% ready)</>
                }
              </button>
            </div>
          )}

          <div className="chatbot-input-area">
            <button
              className="chatbot-attach-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || uploading}
              title="Attach resume (PDF, DOCX, TXT)"
            >
              {uploading ? <Loader2 size={18} className="spin-icon" /> : <Paperclip size={18} />}
            </button>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? '🎤 Listening...' : parsedContext ? "Tell me your target role..." : "Type your answer or ask a question..."}
              className={`chatbot-input ${isListening ? 'voice-active' : ''}`}
              disabled={loading || uploading}
              rows={1}
            />
            <button
              className={`chatbot-voice-btn ${isListening ? 'recording' : ''}`}
              onClick={isListening ? stopListening : startListening}
              disabled={loading || uploading}
              title={isListening ? 'Stop recording' : 'Voice input'}
              type="button"
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            <button
              className={`chatbot-voice-btn ${autoSpeak ? 'active' : ''}`}
              onClick={() => { if (isSpeaking) stopSpeaking(); setAutoSpeak(!autoSpeak); }}
              title={autoSpeak ? 'Auto-read: ON' : 'Auto-read: OFF'}
              type="button"
            >
              {autoSpeak ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <button onClick={() => sendMessage()} disabled={loading || uploading || !input.trim()} className="chatbot-send-btn">
              {loading ? <Loader2 size={18} className="spin-icon" /> : <Send size={18} />}
            </button>
          </div>
        </div>
      )}

      {/* Minimized state */}
      {isOpen && isMinimized && (
        <button className="chatbot-fab chatbot-minimized" onClick={() => { setIsMinimized(false); focusInput(); }}>
          <Bot size={20} />
          {messages.length > 1 && <span className="chatbot-badge">{messages.length}</span>}
        </button>
      )}
    </>
  );
}
