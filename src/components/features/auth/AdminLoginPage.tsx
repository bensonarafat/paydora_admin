'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Lock, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { AdminUser } from '@/types/admin';

interface AdminLoginPageProps {
  onLoginSuccess: (user: AdminUser) => void;
}

export default function AdminLoginPage({ onLoginSuccess }: AdminLoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
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
          maxWidth: 420,
          background: '#ffffff',
          borderRadius: 'var(--r-lg)',
          border: '1px solid #e2e8f0',
          boxShadow: 'none',
          padding: '40px 32px',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
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
            Admin Console
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
            Operations & Compliance Control Portal
          </p>
        </div>

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

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
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
        </form>
      </div>
    </div>
  );
}
