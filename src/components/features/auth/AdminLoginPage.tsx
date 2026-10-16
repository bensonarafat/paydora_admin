'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Lock, Mail, Key, Shield, ArrowRight, AlertCircle } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { AdminUser } from '@/types/admin';

interface AdminLoginPageProps {
  onLoginSuccess: (user: AdminUser) => void;
}

export default function AdminLoginPage({ onLoginSuccess }: AdminLoginPageProps) {
  const [mode, setMode] = useState<'credentials' | 'key'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'credentials') {
        const res = await adminApi.login(email, password);
        if (res.success && res.user) {
          onLoginSuccess(res.user);
        } else {
          setError(res.error || 'Invalid administrator credentials');
        }
      } else {
        const res = await adminApi.login(adminKey);
        if (res.success && res.user) {
          onLoginSuccess(res.user);
        } else {
          setError(res.error || 'Invalid Admin Key');
        }
      }
    } catch {
      setError('Connection to Paydora API server failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = () => {
    setEmail('admin@paydora.africa');
    setPassword('admin123');
    setMode('credentials');
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
          border: 'none',
          boxShadow: 'none',
          padding: '36px 32px',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <Image
              src="/icon.png"
              alt="Paydora Logo"
              width={34}
              height={34}
              style={{ borderRadius: 8, objectFit: 'contain' }}
              priority
            />
            <span style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.6px' }}>
              Paydora
            </span>
          </div>

          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Admin Console
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4, margin: 0 }}>
            Operations & Compliance Control Portal
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            padding: 3,
            borderRadius: 'var(--r-full)',
            background: '#f1f5f9',
            border: '1px solid #e2e8f0',
            marginBottom: 20,
          }}
        >
          <button
            type="button"
            onClick={() => {
              setMode('credentials');
              setError(null);
            }}
            style={{
              flex: 1,
              padding: '7px 0',
              borderRadius: 'var(--r-full)',
              fontSize: 12.5,
              fontWeight: mode === 'credentials' ? 600 : 500,
              background: mode === 'credentials' ? '#ffffff' : 'transparent',
              color: mode === 'credentials' ? 'var(--primary)' : '#64748b',
              boxShadow: 'none',
              cursor: 'pointer',
            }}
          >
            Staff Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('key');
              setError(null);
            }}
            style={{
              flex: 1,
              padding: '7px 0',
              borderRadius: 'var(--r-full)',
              fontSize: 12.5,
              fontWeight: mode === 'key' ? 600 : 500,
              background: mode === 'key' ? '#ffffff' : 'transparent',
              color: mode === 'key' ? 'var(--primary)' : '#64748b',
              boxShadow: 'none',
              cursor: 'pointer',
            }}
          >
            Root Admin Key
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            className="sys-alert-danger animate-fade-in"
            style={{ marginBottom: 16, fontSize: 12.5 }}
          >
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {mode === 'credentials' ? (
            <>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a', display: 'block', marginBottom: 6 }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={15}
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8',
                    }}
                  />
                  <input
                    type="email"
                    required
                    placeholder="admin@paydora.africa"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', paddingLeft: 34 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a', display: 'block', marginBottom: 6 }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={15}
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8',
                    }}
                  />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ width: '100%', paddingLeft: 34 }}
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a', display: 'block', marginBottom: 6 }}>
                Secret Admin Key (<code>x-admin-key</code>)
              </label>
              <div style={{ position: 'relative' }}>
                <Key
                  size={15}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                  }}
                />
                <input
                  type="password"
                  required
                  placeholder="paydora-admin-secret"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  style={{ width: '100%', paddingLeft: 34, fontFamily: 'monospace' }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-pill-primary"
            style={{ marginTop: 6 }}
          >
            <span>{isLoading ? 'Signing In...' : 'Sign In to Console'}</span>
            <ArrowRight size={15} />
          </button>
        </form>

        {/* Demo Fast Login */}
        <div
          style={{
            marginTop: 22,
            paddingTop: 16,
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: 12, color: '#64748b' }}>
            Local development mode
          </span>
          <button
            type="button"
            onClick={handleQuickDemo}
            style={{
              fontSize: 12,
              color: 'var(--primary)',
              fontWeight: 600,
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            Quick Fill Demo Login
          </button>
        </div>
      </div>
    </div>
  );
}
