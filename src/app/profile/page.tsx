'use client';

import React, { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User, Lock, Shield, Loader2, Save, Trash2, AlertTriangle } from 'lucide-react';

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [billingLoading, setBillingLoading] = useState<number | null>(null);
  const [billingMsg, setBillingMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    if (status === 'authenticated' && session.user) {
      setName(session.user.name || '');
      setEmail(session.user.email || '');
      setLoading(false);
    }
  }, [status, session, router]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileLoading(true);
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      setProfileMsg(res.ok ? '✓ Profile updated successfully' : data.error || 'Update failed');
    } catch {
      setProfileMsg('Something went wrong');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg('');
    if (newPassword !== confirmPassword) {
      setPasswordMsg('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg('Password must be at least 6 characters.');
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordMsg('✓ Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMsg(data.error || 'Password change failed');
      }
    } catch {
      setPasswordMsg('Something went wrong');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAddCredits = async (amount: number, cost: number) => {
    setBillingMsg('');
    setBillingLoading(amount);
    try {
      const res = await fetch('/api/credits/add-mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (res.ok) {
        await update(); // This refetches session from server so the updated credits show globally
        setBillingMsg(`✓ Top-up successful! Added ${amount} tokens for $${cost}. New balance: ${data.remaining}`);
      } else {
        setBillingMsg(data.error || 'Top-up failed');
      }
    } catch {
      setBillingMsg('Something went wrong');
    } finally {
      setBillingLoading(null);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure? This will permanently delete your account and all data.')) return;
    const res = await fetch('/api/user', { method: 'DELETE' });
    if (res.ok) {
      signOut({ callbackUrl: '/auth/signin' });
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-screen">
          <Loader2 size={28} className="spin-icon" style={{ color: 'var(--primary)' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="dashboard-header">
        <h1>Profile Settings</h1>
        <p>Manage your account, password, and preferences</p>
      </div>

      {/* Profile Info */}
      <section className="profile-section glass-panel">
        <div className="profile-section-header">
          <User size={18} />
          <h2>Personal Information</h2>
        </div>
        <form onSubmit={handleProfileUpdate} className="profile-form">
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="Your name" />
          </div>
          <div className="input-group">
            <label className="input-label">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" />
          </div>
          {profileMsg && <p className={`profile-msg ${profileMsg.startsWith('✓') ? 'success' : 'error'}`}>{profileMsg}</p>}
          <button type="submit" className="btn-primary" disabled={profileLoading}>
            {profileLoading ? <><Loader2 size={16} className="spin-icon" /> Saving...</> : <><Save size={16} /> Save Changes</>}
          </button>
        </form>
      </section>

      {/* Billing & Pricing */}
      <section className="profile-section glass-panel">
        <div className="profile-section-header">
          <Shield size={18} />
          <h2>Billing & Pricing Models</h2>
        </div>
        <div className="pricing-container">
          <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '1.5rem' }}>
            Choose a plan to top up your AI tokens. (Mock billing for testing purposes).
          </p>
          
          <div className="pricing-grid">
            {/* Starter Plan */}
            <div className="pricing-card">
              <div className="pricing-header">
                <h3>Starter</h3>
                <div className="pricing-price">$5</div>
              </div>
              <div className="pricing-tokens">50 Tokens</div>
              <ul className="pricing-features">
                <li>~25 Resume Generations</li>
                <li>Full ATS Scoring</li>
                <li>AI Cover Letters</li>
              </ul>
              <button 
                type="button" 
                onClick={() => handleAddCredits(50, 5)} 
                className="btn-secondary full-width" 
                disabled={billingLoading !== null}
              >
                {billingLoading === 50 ? <><Loader2 size={16} className="spin-icon" /> Processing...</> : 'Buy Starter'}
              </button>
            </div>

            {/* Pro Plan */}
            <div className="pricing-card popular">
              <div className="pricing-badge">Most Popular</div>
              <div className="pricing-header">
                <h3>Professional</h3>
                <div className="pricing-price">$15</div>
              </div>
              <div className="pricing-tokens">200 Tokens</div>
              <ul className="pricing-features">
                <li>~100 Resume Generations</li>
                <li>Priority Support</li>
                <li>Unlimited Bullet Rewrites</li>
              </ul>
              <button 
                type="button" 
                onClick={() => handleAddCredits(200, 15)} 
                className="btn-primary full-width" 
                disabled={billingLoading !== null}
              >
                {billingLoading === 200 ? <><Loader2 size={16} className="spin-icon" /> Processing...</> : 'Buy Professional'}
              </button>
            </div>

            {/* Elite Plan */}
            <div className="pricing-card">
              <div className="pricing-header">
                <h3>Elite</h3>
                <div className="pricing-price">$30</div>
              </div>
              <div className="pricing-tokens">500 Tokens</div>
              <ul className="pricing-features">
                <li>~250 Resume Generations</li>
                <li>Enterprise Grade</li>
                <li>Early feature access</li>
              </ul>
              <button 
                type="button" 
                onClick={() => handleAddCredits(500, 30)} 
                className="btn-secondary full-width" 
                disabled={billingLoading !== null}
              >
                {billingLoading === 500 ? <><Loader2 size={16} className="spin-icon" /> Processing...</> : 'Buy Elite'}
              </button>
            </div>
          </div>
          
          {billingMsg && <div className={`profile-msg mt-4 ${billingMsg.startsWith('✓') ? 'success' : 'error'}`}>{billingMsg}</div>}
        </div>
      </section>

      {/* Change Password */}
      <section className="profile-section glass-panel">
        <div className="profile-section-header">
          <Lock size={18} />
          <h2>Change Password</h2>
        </div>
        <form onSubmit={handlePasswordChange} className="profile-form">
          <div className="input-group">
            <label className="input-label">Current Password</label>
            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="input-field" required />
          </div>
          <div className="input-group">
            <label className="input-label">New Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input-field" minLength={6} required />
          </div>
          <div className="input-group">
            <label className="input-label">Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="input-field" minLength={6} required />
          </div>
          {passwordMsg && <p className={`profile-msg ${passwordMsg.startsWith('✓') ? 'success' : 'error'}`}>{passwordMsg}</p>}
          <button type="submit" className="btn-primary" disabled={passwordLoading}>
            {passwordLoading ? <><Loader2 size={16} className="spin-icon" /> Changing...</> : <><Shield size={16} /> Change Password</>}
          </button>
        </form>
      </section>

      {/* Danger Zone */}
      <section className="profile-section danger-zone glass-panel">
        <div className="profile-section-header">
          <AlertTriangle size={18} />
          <h2>Danger Zone</h2>
        </div>
        <p style={{ fontSize: '0.9rem', opacity: 0.6, marginBottom: '1rem' }}>
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <button className="btn-danger" onClick={handleDeleteAccount}>
          <Trash2 size={16} /> Delete Account
        </button>
      </section>
    </div>
  );
}
