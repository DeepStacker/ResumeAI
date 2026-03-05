'use client';

import { usePathname } from 'next/navigation';
import { Sparkles } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith('/auth')) return null;

  return (
    <footer className="app-footer">
      <div className="app-footer-inner">
        <div className="app-footer-brand">
          <Sparkles size={14} />
          <span>ResumeAI</span>
        </div>
        <p>© {new Date().getFullYear()} ResumeAI — Build ATS-optimized resumes with AI</p>
        <div className="app-footer-links">
          <span>2 credits = 1 resume</span>
          <span>·</span>
          <span>1 credit = 1 parse or ATS score</span>
        </div>
      </div>
    </footer>
  );
}
