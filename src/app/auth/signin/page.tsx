'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2, Sparkles, ArrowRight, User, Github, Linkedin } from 'lucide-react';

type Tab = 'signin' | 'register';

export default function AuthPage() {
  const [tab, setTab] = useState<Tab>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (result?.error) {
      setError('Invalid email or password. Please try again.');
    } else {
      router.push('/');
      router.refresh();
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name || email.split('@')[0], email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed.');
        setLoading(false);
        return;
      }

      // Auto sign-in after registration
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      setLoading(false);

      if (result?.error) {
        setError('Account created! Please sign in.');
        setTab('signin');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const handleOAuth = (provider: string) => {
    signIn(provider, { callbackUrl: '/' });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-card text-card-foreground border shadow-sm rounded-xl p-6 sm:p-8 animate-fade-in">
        {/* Logo & Branding */}
        <div className="flex flex-col items-center space-y-2 text-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2"><Sparkles size={26} /></div>
          <h1 className="text-2xl font-semibold tracking-tight">AI Resume Builder</h1>
          <p className="text-sm text-muted-foreground">Build ATS-optimized resumes in minutes</p>
        </div>

        {/* Tab Switch */}
        <div className="grid w-full grid-cols-2 p-1 bg-muted rounded-lg mb-6">
          <button type="button" className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${tab === 'signin' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`} onClick={() => { setTab('signin'); setError(''); }}>
            Sign In
          </button>
          <button type="button" className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${tab === 'register' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`} onClick={() => { setTab('register'); setError(''); }}>
            Create Account
          </button>
        </div>

        {error && <div className="p-3 mb-6 text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-md flex items-center">{error}</div>}

        {/* Sign In Form */}
        {tab === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none flex items-center gap-2"><Mail size={16} /> Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="you@example.com" required autoFocus />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none flex items-center gap-2"><Lock size={16} /> Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="Your password" required minLength={4} />
            </div>
            <button type="submit" disabled={loading} className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full mt-2">
              {loading ? <><Loader2 size={18} className="spin-icon" /> Signing in...</> : <>Sign In <ArrowRight size={18} /></>}
            </button>
          </form>
        )}

        {/* Register Form */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none flex items-center gap-2"><User size={16} /> Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="Jane Doe" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none flex items-center gap-2"><Mail size={16} /> Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="you@example.com" required autoFocus />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none flex items-center gap-2"><Lock size={16} /> Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="Min 6 characters" required minLength={6} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none flex items-center gap-2"><Lock size={16} /> Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="Re-enter password" required minLength={6} />
            </div>
            <button type="submit" disabled={loading} className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full mt-2">
              {loading ? <><Loader2 size={18} className="spin-icon" /> Creating account...</> : <>Create Account <ArrowRight size={18} /></>}
            </button>
          </form>
        )}

        {/* OAuth Divider */}
        <div className="relative my-6"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or continue with</span></div></div>

        {/* OAuth Buttons */}
        <div className="grid gap-2">
          <button type="button" onClick={() => handleOAuth('google')} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
            <svg viewBox="0 0 24 24" width="18" height="18"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>
          <button type="button" onClick={() => handleOAuth('github')} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
            <Github size={18} />
            Continue with GitHub
          </button>
          <button type="button" onClick={() => handleOAuth('linkedin')} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
            <Linkedin size={18} style={{ color: '#0077b5' }} />
            Continue with LinkedIn
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {tab === 'signin' 
            ? <>Don&apos;t have an account? <button type="button" className="font-medium text-primary underline underline-offset-4 hover:text-primary/90" onClick={() => setTab('register')}>Create one free</button></>
            : <>Already have an account? <button type="button" className="font-medium text-primary underline underline-offset-4 hover:text-primary/90" onClick={() => setTab('signin')}>Sign in</button></>
          }
        </p>
        <p className="mt-6 text-center text-sm text-muted-foreground" style={{ marginTop: '0.5rem' }}>
          New accounts receive <strong>10 free credits</strong> to get started.
        </p>
      </div>
    </div>
  );
}
