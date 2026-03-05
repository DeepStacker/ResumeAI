'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  MessageCircle, X, Send, Loader2, Sparkles, Bot, User, Minimize2,
  RotateCcw, Lightbulb
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const WELCOME_MSG: Message = {
  id: 'welcome',
  role: 'assistant',
  content: "Hey! 👋 I'm your AI Career Counselor. I'll help you build a professional resume through a quick conversation.\n\nI can also answer career questions, help you explore career paths, or clear any doubts.\n\n**What's your name and what kind of role are you looking for?**"
};

const WELCOME_SUGGESTIONS = [
  "I'm looking for a Software Engineer role",
  "I need help choosing a career path",
  "I want to switch careers"
];

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
  const [generating, setGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const focusInput = useCallback(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 150);
  }, []);

  // Don't render if not logged in
  if (!session?.user) return null;

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const openChat = () => {
    setIsOpen(true);
    setIsMinimized(false);
    if (messages.length === 0) {
      setMessages([WELCOME_MSG]);
      setSuggestions(WELCOME_SUGGESTIONS);
    }
    focusInput();
  };

  const handleReset = () => {
    setMessages([WELCOME_MSG]);
    setSuggestions(WELCOME_SUGGESTIONS);
    setExtractedData(null);
    setInput('');
    focusInput();
  };

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
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();

      if (res.ok && data.reply) {
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.reply
        };
        setMessages(prev => [...prev, aiMsg]);

        // Set AI-generated suggestions
        if (data.suggestions && data.suggestions.length > 0) {
          setSuggestions(data.suggestions);
        }

        // Check if AI included a JSON block with extracted data
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
        setSuggestions(["Let's try again", "Start over", "Tell me about career options"]);
      }
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Network error. Please check your connection.'
      }]);
      setSuggestions(["Try again"]);
    } finally {
      setLoading(false);
      scrollToBottom();
      focusInput();
    }
  };

  const handleGenerate = async () => {
    if (!extractedData) return;
    setGenerating(true);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(extractedData),
      });

      if (res.ok) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: '✅ Resume generated! Redirecting you to the builder...'
        }]);
        setTimeout(() => {
          router.push('/builder');
          setIsOpen(false);
        }, 1500);
      } else {
        const err = await res.json();
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `❌ ${err.error || 'Failed to generate. Please try again.'}`
        }]);
        setSuggestions(["Try generating again", "Add more details", "Change target role"]);
      }
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: '❌ Network error. Please try again.'
      }]);
    } finally {
      setGenerating(false);
      scrollToBottom();
      focusInput();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderMessage = (msg: Message) => {
    // Strip JSON blocks from display
    const displayContent = msg.content.replace(/```json[\s\S]*?```/g, '').trim();
    if (!displayContent) return null;

    return (
      <div key={msg.id} className={`chat-message ${msg.role}`}>
        <div className="chat-avatar">
          {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
        </div>
        <div className="chat-bubble">
          {displayContent.split('\n').map((line, i) => (
            <React.Fragment key={i}>
              {line.split(/(\*\*.*?\*\*)/).map((part, j) =>
                part.startsWith('**') && part.endsWith('**')
                  ? <strong key={j}>{part.slice(2, -2)}</strong>
                  : part
              )}
              {i < displayContent.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
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
                <span>{loading ? 'Thinking...' : 'Online'}</span>
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
            {loading && (
              <div className="chat-message assistant">
                <div className="chat-avatar"><Bot size={16} /></div>
                <div className="chat-bubble chat-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
          </div>

          {/* Quick reply suggestions */}
          {suggestions.length > 0 && !loading && (
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

          {/* Generate Resume action */}
          {extractedData && (
            <div className="chatbot-actions">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="btn-primary chatbot-generate-btn"
              >
                {generating
                  ? <><Loader2 size={16} className="spin-icon" /> Generating...</>
                  : <><Sparkles size={16} /> Generate Resume (2 credits)</>
                }
              </button>
            </div>
          )}

          <div className="chatbot-input-area">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer or ask a career question..."
              className="chatbot-input"
              disabled={loading}
              rows={1}
            />
            <button onClick={() => sendMessage()} disabled={loading || !input.trim()} className="chatbot-send-btn">
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
