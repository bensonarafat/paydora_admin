'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Lock, Mail, ArrowRight, AlertCircle, Loader2, UserCheck, ShieldCheck, KeyRound } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { AdminUser } from '@/types/admin';

interface AdminLoginPageProps {
  onLoginSuccess: (user: AdminUser) => void;
}

export default function AdminLoginPage({ onLoginSuccess }: AdminLoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [isInviteMode, setIsInviteMode] = useState(false);
  const [isEmailLocked, setIsEmailLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('invite_token');
      const emailParam = params.get('email');

      if (token) {
        setInviteToken(token);
        setIsInviteMode(true);
        if (emailParam) {
          setEmail(decodeURIComponent(emailParam));
          setIsEmailLocked(true);
        }
      }
    }
  }, []);

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await adminApi.login(email.trim(), password);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setError(res.error || 'Invalid administrator credentials');
      }
    } catch {
      setError('Connection to Paydora API server failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }
    if (!password) {
      setError('Please create a secure password.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!inviteToken) {
      setError('Missing invitation token.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await adminApi.acceptInvite({
        email: email.trim(),
        token: inviteToken,
        password,
        confirm_password: confirmPassword,
        first_name: firstName.trim() || undefined,
        last_name: lastName.trim() || undefined,
      });

      if (res.success && res.user) {
        if (typeof window !== 'undefined') {
          // Clean up the invite query params from the URL bar cleanly
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }
        onLoginSuccess(res.user);
      } else {
        setError(res.error || 'Failed to accept invitation. The invitation link may have expired.');
      }
    } catch {
      setError('Connection to Paydora API server failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        className="animate-fade-in"
        style={{
          width: '100%',
          maxWidth: isInviteMode ? 460 : 420,
          background: '#ffffff',
          borderRadius: 'var(--r-lg)',
          border: '1px solid #e2e8f0',
          boxShadow: 'none',
          padding: '36px 32px',
          transition: 'max-width 0.2s ease',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Image
              src="/icon.png"
              alt="Paydora Logo"
              width={38}
              height={38}
              style={{ borderRadius: 10, objectFit: 'contain' }}
              priority
            />
            <span style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.6px' }}>
              Paydora
            </span>
          </div>

          <h1 style={{ fontSize: 19, fontWeight: 700, color: '#0f172a', margin: 0 }}>
            {isInviteMode ? 'Team Member Activation' : 'Admin Console'}
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
            {isInviteMode
              ? 'Complete your profile setup to access the Admin Console'
              : 'Operations & Compliance Control Portal'}
          </p>
        </div>

        {/* Invitation Welcome Banner */}
        {isInviteMode && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--r-md)',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1d4ed8',
              fontSize: 12.5,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 20,
            }}
          >
            <ShieldCheck size={18} style={{ flexShrink: 0, color: '#2563eb' }} />
            <div>
              You’ve been invited to join the Paydora Administrator team. Choose your password below to create and activate your account.
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div
            className="sys-alert-danger animate-fade-in"
            style={{ marginBottom: 18, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Invite Acceptance Form */}
        {isInviteMode ? (
          <form onSubmit={handleAcceptInvite} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a', display: 'block', marginBottom: 5 }}>
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  style={{
                    width: '100%',
                    height: 42,
                    padding: '0 12px',
                    fontSize: 13,
                    borderRadius: 'var(--r-md)',
                    border: '1px solid #cbd5e1',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a', display: 'block', marginBottom: 5 }}>
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  style={{
                    width: '100%',
                    height: 42,
                    padding: '0 12px',
                    fontSize: 13,
                    borderRadius: 'var(--r-md)',
                    border: '1px solid #cbd5e1',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a', display: 'block', marginBottom: 5 }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                  }}
                />
                <input
                  type="email"
                  required
                  readOnly={isEmailLocked}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    height: 42,
                    paddingLeft: 38,
                    fontSize: 13,
                    borderRadius: 'var(--r-md)',
                    border: '1px solid #cbd5e1',
                    background: isEmailLocked ? '#f8fafc' : '#ffffff',
                    color: isEmailLocked ? '#475569' : '#0f172a',
                    cursor: isEmailLocked ? 'not-allowed' : 'text',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a', display: 'block', marginBottom: 5 }}>
                Create Administrator Password
              </label>
              <div style={{ position: 'relative' }}>
                <KeyRound
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                  }}
                />
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    height: 42,
                    paddingLeft: 38,
                    fontSize: 13,
                    borderRadius: 'var(--r-md)',
                    border: '1px solid #cbd5e1',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a', display: 'block', marginBottom: 5 }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                  }}
                />
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    height: 42,
                    paddingLeft: 38,
                    fontSize: 13,
                    borderRadius: 'var(--r-md)',
                    border: '1px solid #cbd5e1',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-pill-primary"
              style={{
                width: '100%',
                height: 46,
                marginTop: 6,
                background: isLoading ? '#93c5fd' : '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--r-md)',
                fontSize: 14,
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: 'none',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = '#1d4ed8';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = '#2563eb';
                }
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Activating Account...</span>
                </>
              ) : (
                <>
                  <UserCheck size={16} />
                  <span>Create Account &amp; Sign In</span>
                </>
              )}
            </button>

            <div style={{ textAlign: 'center', marginTop: 10 }}>
              <button
                type="button"
                onClick={() => setIsInviteMode(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: 12.5,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Already have an account? Sign In with existing password
              </button>
            </div>
          </form>
        ) : (
          /* Standard Login Form */
          <form onSubmit={handleStandardLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', display: 'block', marginBottom: 6 }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                  }}
                />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    height: 44,
                    paddingLeft: 38,
                    fontSize: 13.5,
                    borderRadius: 'var(--r-md)',
                    border: '1px solid #cbd5e1',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', display: 'block', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                  }}
                />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    height: 44,
                    paddingLeft: 38,
                    fontSize: 13.5,
                    borderRadius: 'var(--r-md)',
                    border: '1px solid #cbd5e1',
                  }}
                />
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-pill-primary"
              style={{
                width: '100%',
                height: 46,
                marginTop: 6,
                background: isLoading ? '#93c5fd' : '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--r-md)',
                fontSize: 14,
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: 'none',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = '#1d4ed8';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = '#2563eb';
                }
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Console</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {inviteToken && (
              <div style={{ textAlign: 'center', marginTop: 6 }}>
                <button
                  type="button"
                  onClick={() => setIsInviteMode(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563eb',
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Activate invited team account &rarr;
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
