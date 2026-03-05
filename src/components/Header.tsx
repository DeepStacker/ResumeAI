'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Menu, X, LogIn } from 'lucide-react';
import UserMenu from './UserMenu';
import { useSession } from 'next-auth/react';

const NAV_ITEMS = [
  { href: '/builder', label: 'Builder' },
  { href: '/dashboard', label: 'My Resumes' },
  { href: '/profile', label: 'Profile' },
];

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Don't show header on auth pages
  if (pathname?.startsWith('/auth')) return null;

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Link href="/" className="app-brand">
          <div className="app-brand-icon"><Sparkles size={18} /></div>
          <span className="app-brand-name">ResumeAI</span>
        </Link>

        {session && (
          <nav className={`app-nav ${mobileOpen ? 'open' : ''}`}>
            {NAV_ITEMS.map(item => (
              <Link key={item.href} href={item.href}
                className={`app-nav-link ${pathname === item.href ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}>
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="app-header-right">
          {session ? (
            <>
              <UserMenu />
              <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)} type="button">
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </>
          ) : (
            <Link href="/auth/signin" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
              <LogIn size={16} /> Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
