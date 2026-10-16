'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  Eye, 
  CheckCircle2, 
  Zap, 
  FileCode,
  Sparkles
} from 'lucide-react';
import { AudienceStats, BroadcastDraft } from '@/types/admin';
import { adminApi } from '@/lib/api';

interface BroadcastMailViewProps {
  stats: AudienceStats | null;
  onTriggerKycReminder: () => Promise<void>;
  isTriggeringKyc: boolean;
}

export default function BroadcastMailView({
  stats,
  onTriggerKycReminder,
  isTriggeringKyc,
}: BroadcastMailViewProps) {
  const [draft, setDraft] = useState<BroadcastDraft>({
    subject: 'Complete your Paydora KYC to unlock higher daily limits',
    preheader: 'Verify your BVN or NIN in under 2 minutes',
    title: 'Unlock Your Paydora Full Financial Tier',
    body: `Hello {{firstName}},\n\nWe noticed your Paydora account verification is still pending. By completing your KYC tier 2 verification with your BVN or NIN, you will unlock:\n\n• Daily transaction limits up to ₦5,000,000\n• Instant virtual debit card creation\n• Automatic interest on your wallet vault\n\nTap below to verify now securely from your Paydora mobile app or web dashboard.`,
    ctaText: 'Complete Verification Now',
    ctaUrl: 'https://app.paydora.africa/dashboard/kyc',
    targetAudience: 'PENDING_KYC',
  });

  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (activeTab === 'preview') {
      adminApi.previewBroadcast(draft).then(setPreviewHtml);
    }
  }, [activeTab, draft]);

  const handleSendBroadcast = async () => {
    if (!draft.subject || !draft.body) {
      alert('Please provide both a subject line and body content.');
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to broadcast this message to ${draft.targetAudience}? This will queue emails in BullMQ.`
    );
    if (!confirmed) return;

    setIsSending(true);
    const res = await adminApi.sendBroadcast(draft);
    setIsSending(false);

    if (res.success) {
      setNotification({ type: 'success', message: res.message });
      setTimeout(() => setNotification(null), 6000);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Audience Stats Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
        }}
      >
        <div className="card-standard">
          <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
            Reachable Users
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginTop: 8 }}>
            {stats ? stats.totalUsers.toLocaleString() : '14,820'}
          </div>
          <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 4 }}>
            Registered email addresses
          </div>
        </div>

        <div className="card-standard">
          <div style={{ fontSize: 12, color: 'var(--green)', textTransform: 'uppercase', fontWeight: 600 }}>
            Verified Accounts
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginTop: 8 }}>
            {stats ? stats.verifiedUsers.toLocaleString() : '11,450'}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--green)', marginTop: 4 }}>
            Tier 2 & 3 KYC verified
          </div>
        </div>

        <div className="card-standard">
          <div style={{ fontSize: 12, color: 'var(--yellow)', textTransform: 'uppercase', fontWeight: 600 }}>
            Pending KYC
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginTop: 8 }}>
            {stats ? stats.pendingKycUsers.toLocaleString() : '480'}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--yellow)', marginTop: 4 }}>
            KYC in review / unverified
          </div>
        </div>

        <div
          className="card-standard"
          style={{
            background: '#eff6ff',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
              Automated KYC Reminders
            </div>
            <div style={{ fontSize: 11.5, color: '#475569', marginTop: 4 }}>
              Dispatches reminder sequence to unverified users
            </div>
          </div>

          <button
            onClick={onTriggerKycReminder}
            disabled={isTriggeringKyc}
            className="btn-primary"
            style={{ marginTop: 12, fontSize: 12.5, padding: '7px 14px', width: 'fit-content' }}
          >
            <Zap size={14} />
            <span>{isTriggeringKyc ? 'Scheduling...' : 'Run Reminder Batch'}</span>
          </button>
        </div>
      </div>

      {notification && (
        <div
          className="sys-alert-info animate-fade-in"
          style={{ display: 'flex', alignItems: 'center', gap: 10 }}
        >
          <CheckCircle2 size={18} />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Campaign Composer */}
      <div className="card-standard">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border)',
            paddingBottom: 16,
            marginBottom: 20,
          }}
        >
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Broadcast Email Campaign Composer
            </h3>
            <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0 0' }}>
              Dispatches via Paydora BullMQ & Resend Transactional Engine
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              padding: 3,
              borderRadius: 'var(--r-full)',
              background: '#f8fafc',
              border: '1px solid var(--border)',
            }}
          >
            <button
              onClick={() => setActiveTab('editor')}
              style={{
                padding: '5px 14px',
                borderRadius: 'var(--r-full)',
                fontSize: 12.5,
                fontWeight: activeTab === 'editor' ? 600 : 500,
                background: activeTab === 'editor' ? '#ffffff' : 'transparent',
                color: activeTab === 'editor' ? 'var(--primary)' : '#64748b',
                border: activeTab === 'editor' ? '1px solid #e2e8f0' : '1px solid transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
              }}
            >
              <FileCode size={14} />
              <span>Editor</span>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              style={{
                padding: '5px 14px',
                borderRadius: 'var(--r-full)',
                fontSize: 12.5,
                fontWeight: activeTab === 'preview' ? 600 : 500,
                background: activeTab === 'preview' ? '#ffffff' : 'transparent',
                color: activeTab === 'preview' ? 'var(--primary)' : '#64748b',
                border: activeTab === 'preview' ? '1px solid #e2e8f0' : '1px solid transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
              }}
            >
              <Eye size={14} />
              <span>Live Preview</span>
            </button>
          </div>
        </div>

        {activeTab === 'editor' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a', display: 'block', marginBottom: 6 }}>
                  Target Audience
                </label>
                <select
                  value={draft.targetAudience}
                  onChange={(e) => setDraft({ ...draft, targetAudience: e.target.value as any })}
                  style={{ width: '100%' }}
                >
                  <option value="ALL">All Registered Users (14,820)</option>
                  <option value="VERIFIED_ONLY">Verified Tier 2 & 3 Users Only (11,450)</option>
                  <option value="UNVERIFIED_ONLY">Unverified Users Only (2,890)</option>
                  <option value="PENDING_KYC">Pending / Under Review KYC (480)</option>
                  <option value="BLOCKED_USERS">Flagged & Blocked Accounts (12)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a', display: 'block', marginBottom: 6 }}>
                  Subject Line
                </label>
                <input
                  type="text"
                  placeholder="e.g. Important update regarding your Paydora account"
                  value={draft.subject}
                  onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>
                    Preheader (Inbox Snippet)
                  </label>
                  <input
                    type="text"
                    placeholder="Short preview text..."
                    value={draft.preheader || ''}
                    onChange={(e) => setDraft({ ...draft, preheader: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>
                    Hero Heading
                  </label>
                  <input
                    type="text"
                    placeholder="Headline inside email body..."
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a' }}>
                    Email Body Content
                  </label>
                  <span style={{ fontSize: 11.5, color: 'var(--primary)' }}>
                    Supports: &#123;&#123;firstName&#125;&#125;, &#123;&#123;email&#125;&#125;
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={draft.body}
                  onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                  style={{ width: '100%', lineHeight: 1.5, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>
                    CTA Button Text (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Open Paydora App"
                    value={draft.ctaText || ''}
                    onChange={(e) => setDraft({ ...draft, ctaText: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>
                    CTA Link URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://app.paydora.africa/..."
                    value={draft.ctaUrl || ''}
                    onChange={(e) => setDraft({ ...draft, ctaUrl: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                <button
                  onClick={handleSendBroadcast}
                  disabled={isSending}
                  className="btn-primary"
                  style={{ padding: '11px 24px', fontSize: 13.5 }}
                >
                  <Send size={15} />
                  <span>{isSending ? 'Queueing Broadcast...' : 'Dispatch Broadcast'}</span>
                </button>
              </div>
            </div>

            {/* Right: Presets */}
            <div
              style={{
                background: '#f8fafc',
                borderRadius: 'var(--r-md)',
                padding: '20px',
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={16} color="var(--primary)" />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                  Quick Campaign Presets
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  className="btn-outline"
                  style={{ textAlign: 'left', justifyContent: 'flex-start', fontSize: 12, background: '#ffffff' }}
                  onClick={() =>
                    setDraft({
                      subject: '⚡ Scheduled System Maintenance Notice',
                      preheader: 'Paydora scheduled core banking upgrade',
                      title: 'Maintenance Advisory',
                      body: 'Dear {{firstName}},\n\nPlease be advised that our banking partners will be carrying out scheduled interbank infrastructure maintenance this Sunday between 01:00 AM and 04:00 AM WAT.\n\nDuring this period, outgoing NIP bank transfers may experience slight delays. Card funding and wallet-to-wallet transfers will remain fully operational.',
                      ctaText: 'Check Service Status',
                      ctaUrl: 'https://status.paydora.africa',
                      targetAudience: 'ALL',
                    })
                  }
                >
                  🔧 Maintenance Advisory
                </button>

                <button
                  className="btn-outline"
                  style={{ textAlign: 'left', justifyContent: 'flex-start', fontSize: 12, background: '#ffffff' }}
                  onClick={() =>
                    setDraft({
                      subject: '🛡️ Important Security Alert: Enable Two-Factor Authentication',
                      preheader: 'Keep your Paydora wallet secure',
                      title: 'Protect Your Paydora Account',
                      body: 'Dear {{firstName}},\n\nYour security is our priority. Please remember never to share your 6-digit transaction PIN, OTP, or password with anyone, including individuals claiming to represent Paydora staff.\n\nEnable biometric login and 2FA today in your account settings.',
                      ctaText: 'Review Security Settings',
                      ctaUrl: 'https://app.paydora.africa/dashboard/settings',
                      targetAudience: 'VERIFIED_ONLY',
                    })
                  }
                >
                  🛡️ Security Warning Advisory
                </button>

                <button
                  className="btn-outline"
                  style={{ textAlign: 'left', justifyContent: 'flex-start', fontSize: 12, background: '#ffffff' }}
                  onClick={() =>
                    setDraft({
                      subject: '💳 Virtual Dollar Card is Now Available on Paydora!',
                      preheader: 'Pay seamlessly on Apple, Spotify, Amazon & Netflix',
                      title: 'Meet Your New Virtual USD Card',
                      body: 'Hey {{firstName}}!\n\nWe are excited to announce that your Paydora Virtual Dollar Card is ready. Fund your card directly from your NGN wallet and spend globally at real-time exchange rates.\n\nGenerate your card instantly inside the mobile app or web dashboard.',
                      ctaText: 'Create Virtual Card',
                      ctaUrl: 'https://app.paydora.africa/dashboard/cards',
                      targetAudience: 'VERIFIED_ONLY',
                    })
                  }
                >
                  💳 Virtual Card Launch Feature
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0' }}>
            <div
              style={{
                width: '100%',
                maxWidth: 640,
                background: '#ffffff',
                borderRadius: 12,
                overflow: 'hidden',
                border: 'none',
                boxShadow: 'none',
              }}
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
