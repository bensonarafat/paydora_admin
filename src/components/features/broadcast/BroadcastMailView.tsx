'use client';

import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  Smartphone,
  Layers
} from 'lucide-react';
import { AudienceStats, BroadcastDraft, MobilePlatform } from '@/types/admin';
import { adminApi } from '@/lib/api';

interface BroadcastMailViewProps {
  stats: AudienceStats | null;
  onTriggerKycReminder?: () => Promise<void>;
  isTriggeringKyc?: boolean;
}

export default function BroadcastMailView({
  stats,
}: BroadcastMailViewProps) {
  const [draft, setDraft] = useState<BroadcastDraft>({
    channel: 'PUSH',
    mobilePlatform: 'ALL',
    pushTitle: '⚡ Instant 2% Cashback on All Bill Payments!',
    pushBody: 'Pay electricity, buy airtime or internet data today and receive instant 2% automated cashback into your wallet.',
    pushDeepLink: '/bills',
    subject: 'Complete your Paydora KYC to unlock higher daily limits',
    preheader: 'Verify your BVN or NIN in under 2 minutes',
    title: 'Unlock Your Paydora Full Financial Tier',
    body: `Hello {{firstName}},\n\nWe noticed your Paydora account verification is still pending. By completing your KYC verification with your BVN or NIN, you will unlock:\n\n• Daily transaction limits up to ₦5,000,000\n• Instant virtual debit card creation\n• Automatic interest on your wallet vault\n\nTap below to verify now securely from your Paydora mobile app or web dashboard.`,
    ctaText: 'Complete Verification Now',
    ctaUrl: 'https://app.paydora.africa/dashboard/kyc',
    targetAudience: 'ALL',
  });

  const [isSending, setIsSending] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSendBroadcast = async () => {
    if (draft.channel === 'PUSH' && (!draft.pushTitle?.trim() || !draft.pushBody?.trim())) {
      alert('Please provide both a notification title and message.');
      return;
    }

    if (draft.channel === 'EMAIL' && (!draft.subject?.trim() || !draft.body?.trim())) {
      alert('Please provide both an email subject and body.');
      return;
    }

    if (draft.channel === 'BOTH' && (!draft.pushTitle?.trim() || !draft.subject?.trim())) {
      alert('Please complete both push notification and email details.');
      return;
    }

    const channelDesc = 
      draft.channel === 'PUSH' ? 'mobile push notification' : 
      draft.channel === 'BOTH' ? 'multi-channel push and email broadcast' : 'email broadcast';

    const confirmed = window.confirm(
      `Are you sure you want to dispatch this ${channelDesc} to ${draft.targetAudience} audience? This will queue the job in BullMQ.`
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
          <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
            Reachable users
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginTop: 8 }}>
            {stats ? stats.totalUsers.toLocaleString() : '14,820'}
          </div>
          <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 4 }}>
            Registered email addresses
          </div>
        </div>

        <div className="card-standard">
          <div style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 500 }}>
            Active mobile devices
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginTop: 8 }}>
            {stats?.mobilePushDevices ? stats.mobilePushDevices.toLocaleString() : '12,940'}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--primary)', marginTop: 4 }}>
            Registered push tokens (FCM / APNs)
          </div>
        </div>

        <div className="card-standard">
          <div style={{ fontSize: 13, color: 'var(--green)', fontWeight: 500 }}>
            Verified accounts
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginTop: 8 }}>
            {stats ? stats.verifiedUsers.toLocaleString() : '11,450'}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--green)', marginTop: 4 }}>
            Fully verified customers
          </div>
        </div>

        <div className="card-standard">
          <div style={{ fontSize: 13, color: 'var(--yellow)', fontWeight: 500 }}>
            Pending KYC
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginTop: 8 }}>
            {stats ? stats.pendingKycUsers.toLocaleString() : '480'}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--yellow)', marginTop: 4 }}>
            KYC in review / unverified
          </div>
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
        {/* Top Header & Mode Toggle */}
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
              Broadcast & Push Notifications Composer
            </h3>
            <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0 0' }}>
              Dispatch instant mobile app push notifications (FCM/APNs) or transactional emails via BullMQ
            </p>
          </div>
        </div>

        {/* Delivery Channel Selector */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a', display: 'block', marginBottom: 8 }}>
            Broadcast delivery channel
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            {/* Push Option */}
            <div
              onClick={() => setDraft({ ...draft, channel: 'PUSH' })}
              style={{
                padding: '14px 16px',
                borderRadius: 'var(--r-md)',
                border: draft.channel === 'PUSH' ? '2px solid var(--primary)' : '1px solid var(--border)',
                background: draft.channel === 'PUSH' ? '#eff6ff' : '#f8fafc',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                transition: 'all var(--transition)',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: draft.channel === 'PUSH' ? 'var(--primary)' : '#e2e8f0',
                  color: draft.channel === 'PUSH' ? '#ffffff' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Smartphone size={18} />
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>
                  Mobile app push notification
                </div>
                <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                  FCM / APNs to Flutter mobile devices
                </div>
              </div>
            </div>

            {/* Email Option */}
            <div
              onClick={() => setDraft({ ...draft, channel: 'EMAIL' })}
              style={{
                padding: '14px 16px',
                borderRadius: 'var(--r-md)',
                border: draft.channel === 'EMAIL' ? '2px solid var(--primary)' : '1px solid var(--border)',
                background: draft.channel === 'EMAIL' ? '#eff6ff' : '#f8fafc',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                transition: 'all var(--transition)',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: draft.channel === 'EMAIL' ? 'var(--primary)' : '#e2e8f0',
                  color: draft.channel === 'EMAIL' ? '#ffffff' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Mail size={18} />
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>
                  Email broadcast
                </div>
                <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                  HTML emails via Resend transactional engine
                </div>
              </div>
            </div>

            {/* Multi-Channel Option */}
            <div
              onClick={() => setDraft({ ...draft, channel: 'BOTH' })}
              style={{
                padding: '14px 16px',
                borderRadius: 'var(--r-md)',
                border: draft.channel === 'BOTH' ? '2px solid var(--primary)' : '1px solid var(--border)',
                background: draft.channel === 'BOTH' ? '#eff6ff' : '#f8fafc',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                transition: 'all var(--transition)',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: draft.channel === 'BOTH' ? 'var(--primary)' : '#e2e8f0',
                  color: draft.channel === 'BOTH' ? '#ffffff' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Layers size={18} />
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>
                  Multi-channel (Push + Email)
                </div>
                <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                  Simultaneous mobile push & user inbox delivery
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Target Audience & Device OS */}
              <div style={{ display: 'grid', gridTemplateColumns: (draft.channel === 'PUSH' || draft.channel === 'BOTH') ? '1fr 1fr' : '1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a', display: 'block', marginBottom: 6 }}>
                    Target audience segment
                  </label>
                  <select
                    value={draft.targetAudience}
                    onChange={(e) => setDraft({ ...draft, targetAudience: e.target.value as any })}
                    style={{ width: '100%' }}
                  >
                    <option value="ALL">All registered users (14,820)</option>
                    <option value="VERIFIED_ONLY">Verified users only (11,450)</option>
                    <option value="UNVERIFIED_ONLY">Unverified users only (2,890)</option>
                    <option value="PENDING_KYC">Pending / Under review KYC (480)</option>
                    <option value="BLOCKED_USERS">Flagged & blocked accounts (12)</option>
                  </select>
                </div>

                {(draft.channel === 'PUSH' || draft.channel === 'BOTH') && (
                  <div>
                    <label style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a', display: 'block', marginBottom: 6 }}>
                      Target mobile platform
                    </label>
                    <select
                      value={draft.mobilePlatform || 'ALL'}
                      onChange={(e) => setDraft({ ...draft, mobilePlatform: e.target.value as MobilePlatform })}
                      style={{ width: '100%' }}
                    >
                      <option value="ALL">All mobile devices (iOS & Android)</option>
                      <option value="IOS">Apple iOS devices (APNs)</option>
                      <option value="ANDROID">Google Android devices (FCM)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Push Notification Fields */}
              {(draft.channel === 'PUSH' || draft.channel === 'BOTH') && (
                <div
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--r-md)',
                    background: '#f8fafc',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Smartphone size={16} color="var(--primary)" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                      Mobile push notification parameters
                    </span>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>
                        Push notification title
                      </label>
                      <span style={{ fontSize: 11, color: '#64748b' }}>
                        {(draft.pushTitle || '').length} / 65 characters
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={65}
                      placeholder="e.g. ⚡ Instant 2% Cashback on All Bill Payments!"
                      value={draft.pushTitle || ''}
                      onChange={(e) => setDraft({ ...draft, pushTitle: e.target.value })}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>
                        Push notification message
                      </label>
                      <span style={{ fontSize: 11, color: '#64748b' }}>
                        {(draft.pushBody || '').length} / 240 characters
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      maxLength={240}
                      placeholder="Enter the push message that appears on user phone lock screens..."
                      value={draft.pushBody || ''}
                      onChange={(e) => setDraft({ ...draft, pushBody: e.target.value })}
                      style={{ width: '100%', lineHeight: 1.5, resize: 'vertical' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', display: 'block', marginBottom: 6 }}>
                      In-app deep link on tap
                    </label>
                    <select
                      value={draft.pushDeepLink || '/home'}
                      onChange={(e) => setDraft({ ...draft, pushDeepLink: e.target.value })}
                      style={{ width: '100%' }}
                    >
                      <option value="/home">Home dashboard (/home)</option>
                      <option value="/payments">Send money & transfers (/payments)</option>
                      <option value="/bills">Bill payments & utilities (/bills)</option>
                      <option value="/cards">Virtual dollar cards (/cards)</option>
                      <option value="/kyc">KYC verification (/kyc)</option>
                      <option value="/settings">Security & settings (/settings)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Email Fields */}
              {(draft.channel === 'EMAIL' || draft.channel === 'BOTH') && (
                <div
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--r-md)',
                    background: '#f8fafc',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Mail size={16} color="var(--primary)" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                      Email broadcast parameters
                    </span>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', display: 'block', marginBottom: 6 }}>
                      Subject line
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
                        Preheader (Inbox snippet)
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
                        Hero heading
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
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>
                        Email body content
                      </label>
                      <span style={{ fontSize: 11.5, color: 'var(--primary)' }}>
                        Supports: &#123;&#123;firstName&#125;&#125;, &#123;&#123;email&#125;&#125;
                      </span>
                    </div>
                    <textarea
                      rows={6}
                      value={draft.body}
                      onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                      style={{ width: '100%', lineHeight: 1.5, resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>
                        CTA button text (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Complete Verification Now"
                        value={draft.ctaText || ''}
                        onChange={(e) => setDraft({ ...draft, ctaText: e.target.value })}
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>
                        CTA link URL
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
                </div>
              )}

              {/* Submit Dispatch Action */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <button
                  onClick={handleSendBroadcast}
                  disabled={isSending}
                  className="btn-primary"
                  style={{ padding: '11px 24px', fontSize: 13.5 }}
                >
                  <Send size={15} />
                  <span>
                    {isSending
                      ? 'Queueing broadcast...'
                      : draft.channel === 'PUSH'
                      ? 'Dispatch push notification'
                      : draft.channel === 'BOTH'
                      ? 'Dispatch multi-channel broadcast'
                      : 'Dispatch email broadcast'}
                  </span>
                </button>
              </div>
        </div>
      </div>
    </div>
  );
}
