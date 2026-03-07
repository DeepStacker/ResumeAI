'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Twitter, Github, Linkedin, Mail, ShieldCheck, Zap, BarChart3, MessageCircle } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith('/auth')) return null;

  return (
    <footer className="w-full border-t bg-background/80 py-12 backdrop-blur-md">
      <div className="container mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4 lg:gap-16">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 text-primary transition-opacity hover:opacity-80">
              <Sparkles size={20} />
              <span className="text-xl font-bold tracking-tight">ResumeAI</span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Empowering job seekers with state-of-the-art AI to build ATS-optimized resumes and land more interviews.
            </p>
            <div className="flex items-center gap-4 text-muted-foreground">
              <Link href="#" className="hover:text-primary transition-colors"><Twitter size={18} /></Link>
              <Link href="#" className="hover:text-primary transition-colors"><Github size={18} /></Link>
              <Link href="#" className="hover:text-primary transition-colors"><Linkedin size={18} /></Link>
              <Link href="#" className="hover:text-primary transition-colors"><Mail size={18} /></Link>
            </div>
          </div>

          {/* Product Column */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/builder" className="hover:text-primary transition-colors flex items-center gap-2"><Zap size={14} /> AI Builder</Link></li>
              <li><Link href="/ats-tracker" className="hover:text-primary transition-colors flex items-center gap-2"><BarChart3 size={14} /> ATS Tracker</Link></li>
              <li><Link href="/dashboard" className="hover:text-primary transition-colors flex items-center gap-2"><ShieldCheck size={14} /> Dashboard</Link></li>
              <li><button onClick={() => (window as any).openChat?.()} className="hover:text-primary transition-colors flex items-center gap-2"><MessageCircle size={14} /> AI Counselor</button></li>
            </ul>
          </div>

          {/* Resources Column */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary transition-colors">Resume Guide</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">ATS Optimization</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">XYZ Formula</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Pricing</Link></li>
            </ul>
          </div>

          {/* Credits/System Info Column */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">System Status</h4>
            <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>Core Analytics</span>
                <span className="text-emerald-500 font-bold">Online</span>
              </div>
              <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full w-[95%] bg-emerald-500 rounded-full" />
              </div>
              <p className="text-[0.65rem] text-muted-foreground italic leading-tight">
                AI Credits: 2 = 1 Resume, 1 = 1 Parse/Audit.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between border-t pt-8 gap-4 md:flex-row">
          <p className="text-xs text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} ResumeAI. Designed for visual excellence and academic precision.
          </p>
          <div className="flex items-center gap-6 text-xs font-medium text-muted-foreground">
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-primary transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
