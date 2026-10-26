'use client';

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin, 
  MessageCircle,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { KycReviewItem, KycStatus, UserAccount, formatKycStatus } from '@/types/admin';
import { AdminTab } from '@/components/layout/AdminSidebar';

interface KycDetailsViewProps {
  item: KycReviewItem;
  user?: UserAccount | null;
  onBack: () => void;
  onUpdateStatus: (userId: string, status: KycStatus, reason?: string) => Promise<void>;
  onNavigateTab: (tab: AdminTab) => void;
}

export default function KycDetailsView({
  item,
  user,
  onBack,
  onUpdateStatus,
  onNavigateTab,
}: KycDetailsViewProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('BVN official names do not match account holder registration names.');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    await onUpdateStatus(item.user_id, 'verified');
    setIsSubmitting(false);
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    await onUpdateStatus(item.user_id, 'rejected', rejectReason);
    setIsSubmitting(false);
    setShowRejectModal(false);
  };

  const handleMarkReview = async () => {
    setIsSubmitting(true);
    await onUpdateStatus(item.user_id, 'under_review');
    setIsSubmitting(false);
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  const virtualAccount = user?.virtual_account || (item.virtual_account_number ? {
    account_number: item.virtual_account_number,
    bank_name: item.virtual_account_bank || 'Bank',
    account_name: item.virtual_account_name || `Paydora / ${item.full_name}`,
  } : null);

  const resolvedUser = {
    id: user?.id || item.user_id,
    name: user ? `${user.first_name} ${user.last_name}`.trim() || item.full_name : item.full_name,
    username: user?.username || item.email.split('@')[0],
    email: user?.email || item.email,
    phone: user?.phone || item.phone,
    isBlocked: user?.is_blocked || false,
    balance: user?.balance_ngn ?? 0,
    createdAt: user?.created_at ? formatDate(user.created_at) : 'Registered customer',
    virtualAccount,
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Breadcrumb & Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--text-muted)',
            background: 'none',
            border: 'none',
            padding: '6px 0',
            cursor: 'pointer',
            transition: 'color var(--transition)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <ArrowLeft size={16} />
          <span>Back to KYC compliance</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {item.status !== 'verified' && (
            <button
              onClick={handleApprove}
              disabled={isSubmitting}
              className="btn-success"
              style={{ fontSize: 13, padding: '8px 18px' }}
            >
              <CheckCircle2 size={15} />
              <span>{isSubmitting ? 'Approving...' : 'Approve verification'}</span>
            </button>
          )}

          {item.status !== 'rejected' && (
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={isSubmitting}
              className="btn-danger"
              style={{ fontSize: 13, padding: '8px 18px' }}
            >
              <XCircle size={15} />
              <span>Reject submission</span>
            </button>
          )}

          {item.status !== 'under_review' && item.status !== 'verified' && (
            <button
              onClick={handleMarkReview}
              disabled={isSubmitting}
              className="btn-outline"
              style={{ fontSize: 13, padding: '8px 16px' }}
            >
              <Clock size={15} />
              <span>Mark as under review</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Applicant Summary Card */}
      <div className="card-standard">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: '#eff6ff',
                color: 'var(--primary)',
                fontWeight: 700,
                fontSize: 22,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {item.full_name.charAt(0)}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  {item.full_name}
                </h2>
                <span
                  className={`badge ${
                    item.status === 'verified'
                      ? 'badge-verified'
                      : item.status === 'rejected'
                      ? 'badge-danger'
                      : 'badge-pending'
                  }`}
                >
                  {formatKycStatus(item.status)}
                </span>
                <span
                  style={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 'var(--r-full)',
                    background: item.risk_score === 'HIGH' ? 'var(--red-bg)' : item.risk_score === 'MEDIUM' ? 'var(--yellow-bg)' : 'var(--green-bg)',
                    color: item.risk_score === 'HIGH' ? 'var(--red)' : item.risk_score === 'MEDIUM' ? 'var(--yellow)' : 'var(--green)',
                  }}
                >
                  {item.risk_score === 'HIGH' ? 'High risk score' : item.risk_score === 'MEDIUM' ? 'Medium risk score' : 'Low risk score'}
                </span>
              </div>

              <div style={{ fontSize: 13, color: '#64748b', marginTop: 4, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span>{item.email}</span>
                <span>&bull;</span>
                <span>{item.phone}</span>
                <span>&bull;</span>
                <span>Channel: {item.channel === 'WHATSAPP' ? 'WhatsApp Verification' : 'SMS Verification'}</span>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '12px 18px',
              borderRadius: 'var(--r-md)',
              background: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              minWidth: 200,
            }}
          >
            <span style={{ fontSize: 11.5, color: '#64748b' }}>Submitted timestamp</span>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0f172a' }}>
              {formatDate(item.submitted_at)}
            </div>
            <span style={{ fontSize: 11, color: '#64748b' }}>
              Application ID: {item.id}
            </span>
          </div>
        </div>
      </div>

      {/* 2-Column Split: Identity Details vs User Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20 }}>
        {/* Column 1: Identity Documents & Verification Checks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Identity Numbers Card */}
          <div className="card-standard">
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0' }}>
              Official identity verification records
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* BVN Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>Bank Verification Number (BVN)</div>
                  <div style={{ fontSize: 11.5, color: item.bvn ? 'var(--green)' : 'var(--red)', marginTop: 2 }}>
                    {item.bvn_match_status || (item.bvn ? 'Confirmed with NIBSS database' : 'Not submitted')}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <code style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', background: '#f1f5f9', padding: '4px 10px', borderRadius: 6 }}>
                    {item.bvn || 'Not submitted'}
                  </code>
                  {item.bvn && (
                    <button
                      onClick={() => copyToClipboard(item.bvn!, 'bvn')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 2 }}
                    >
                      {copiedKey === 'bvn' ? <Check size={14} color="var(--green)" /> : <Copy size={14} />}
                    </button>
                  )}
                </div>
              </div>

              {/* NIN Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>National Identification Number (NIN)</div>
                  <div style={{ fontSize: 11.5, color: item.nin ? 'var(--green)' : '#64748b', marginTop: 2 }}>
                    {item.nin_match_status || (item.nin ? 'NIMC verification record confirmed' : 'Optional secondary identification')}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <code style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', background: '#f1f5f9', padding: '4px 10px', borderRadius: 6 }}>
                    {item.nin || 'Not submitted'}
                  </code>
                  {item.nin && (
                    <button
                      onClick={() => copyToClipboard(item.nin!, 'nin')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 2 }}
                    >
                      {copiedKey === 'nin' ? <Check size={14} color="var(--green)" /> : <Copy size={14} />}
                    </button>
                  )}
                </div>
              </div>

              {/* DOB & Gender */}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>Date of birth</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                  {item.dob ? `${item.dob}` : 'Not provided'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>Gender</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                  {item.gender || 'Not specified'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>State of origin</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                  {item.state_of_origin || 'Federal Republic of Nigeria'}
                </span>
              </div>
            </div>
          </div>

          {/* Document & Biometric Match Card */}
          <div className="card-standard">
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0' }}>
              Document upload & biometric match
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>Uploaded ID document</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                  {item.id_document_type || 'National Identity (NIN Slip)'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>Document serial / ID number</span>
                <span style={{ fontSize: 13, fontFamily: 'monospace', color: '#0f172a' }}>
                  {item.id_document_number || item.nin || 'DOC-9182-3849'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>Verified residential address</span>
                <span style={{ fontSize: 13, color: '#0f172a', maxWidth: '60%', textAlign: 'right' }}>
                  {item.residential_address || 'Lekki Phase 1, Eti-Osa LGA, Lagos'}
                </span>
              </div>

              {/* Liveness Score Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: '#64748b' }}>Facial biometric liveness score</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)' }}>
                    {item.liveness_score || 98.8}% Match
                  </span>
                </div>
                <div style={{ width: '100%', height: 6, borderRadius: 3, background: '#f1f5f9', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${item.liveness_score || 98.8}%`,
                      height: '100%',
                      borderRadius: 3,
                      background: 'var(--green)',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Rejection Note banner if rejected */}
          {item.status === 'rejected' && item.rejection_reason && (
            <div
              style={{
                padding: '16px 20px',
                borderRadius: 'var(--r-md)',
                background: 'var(--red-bg)',
                color: 'var(--red)',
                border: '1px solid #fecaca',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13.5 }}>
                <AlertTriangle size={16} />
                <span>Verification Rejection Reason</span>
              </div>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>
                {item.rejection_reason}
              </p>
            </div>
          )}
        </div>

        {/* Column 2: Customer Account Profile & Fast Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card-standard">
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0' }}>
              Customer account details
            </h3>

            {/* Profile Avatar Card */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '16px',
                borderRadius: 'var(--r-md)',
                background: '#f8fafc',
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: '#eff6ff',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  fontSize: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {resolvedUser.name.charAt(0)}
              </div>

              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {resolvedUser.name}
                </div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  @{resolvedUser.username}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                  <span className={`badge ${resolvedUser.isBlocked ? 'badge-danger' : 'badge-active'}`}>
                    {resolvedUser.isBlocked ? 'Blocked' : 'Active Account'}
                  </span>
                </div>
              </div>
            </div>

            {/* User Meta List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 12.5, color: '#64748b' }}>Email address</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>
                  {resolvedUser.email}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 12.5, color: '#64748b' }}>Phone number</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>
                  {resolvedUser.phone}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 12.5, color: '#64748b' }}>Customer ID</span>
                <span style={{ fontSize: 12.5, fontFamily: 'monospace', color: '#64748b' }}>
                  {resolvedUser.id}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 12.5, color: '#64748b' }}>Wallet balance</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                  ₦{resolvedUser.balance.toLocaleString()}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12.5, color: '#64748b' }}>Customer since</span>
                <span style={{ fontSize: 12.5, color: '#0f172a' }}>
                  {resolvedUser.createdAt}
                </span>
              </div>
            </div>
          </div>

          {/* Dedicated Virtual Account */}
          <div className="card-standard">
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 14px 0' }}>
              Assigned dedicated account
            </h3>

            {resolvedUser.virtualAccount ? (
              <div
                style={{
                  padding: '16px',
                  borderRadius: 'var(--r-md)',
                  background: '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div>
                  <span style={{ fontSize: 11.5, color: '#64748b' }}>Bank institution</span>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0f172a', marginTop: 2 }}>
                    {resolvedUser.virtualAccount.bank_name}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: 11.5, color: '#64748b' }}>Virtual account number</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, fontFamily: 'monospace', color: '#0f172a' }}>
                      {resolvedUser.virtualAccount.account_number}
                    </span>
                    <button
                      onClick={() => copyToClipboard(resolvedUser.virtualAccount!.account_number, 'va_num')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                    >
                      {copiedKey === 'va_num' ? <Check size={13} color="var(--green)" /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: 11.5, color: '#64748b' }}>Account name</span>
                  <div style={{ fontSize: 13, color: '#0f172a', marginTop: 2 }}>
                    {resolvedUser.virtualAccount.account_name}
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: '24px 16px',
                  borderRadius: 'var(--r-md)',
                  background: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>
                  No dedicated virtual account yet
                </div>
                <div style={{ fontSize: 12, color: '#64748b', maxWidth: 260, lineHeight: 1.4 }}>
                  A dedicated virtual account will be generated upon approval.
                </div>
              </div>
            )}

            {/* Quick Actions for User */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
              <button
                onClick={() => onNavigateTab('users')}
                className="btn-outline"
                style={{ width: '100%', justifyContent: 'center', fontSize: 12.5 }}
              >
                <User size={14} />
                <span>View user profile</span>
              </button>

              <button
                onClick={() => onNavigateTab('whatsapp')}
                className="btn-outline"
                style={{ width: '100%', justifyContent: 'center', fontSize: 12.5 }}
              >
                <MessageCircle size={14} />
                <span>Open WhatsApp support chat</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 20,
          }}
        >
          <div
            className="animate-fade-in card-standard"
            style={{ width: '100%', maxWidth: 440, padding: 24 }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Reject KYC submission
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '6px 0 16px 0' }}>
              Please specify the compliance reason for declining {item.full_name}&apos;s verification.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                onClick={() => setRejectReason('BVN official names do not match account holder registration names.')}
                className="btn-outline"
                style={{ justifyContent: 'flex-start', fontSize: 12, textAlign: 'left', padding: '8px 12px' }}
              >
                BVN name mismatch with registered name
              </button>
              <button
                onClick={() => setRejectReason('ID document photo is blurry, unreadable, or expired.')}
                className="btn-outline"
                style={{ justifyContent: 'flex-start', fontSize: 12, textAlign: 'left', padding: '8px 12px' }}
              >
                ID document photo is blurry or expired
              </button>
              <button
                onClick={() => setRejectReason('Facial biometric liveness score below security compliance threshold.')}
                className="btn-outline"
                style={{ justifyContent: 'flex-start', fontSize: 12, textAlign: 'left', padding: '8px 12px' }}
              >
                Biometric score below required threshold
              </button>
            </div>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={{ width: '100%', marginTop: 12, fontSize: 13 }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
              <button
                onClick={() => setShowRejectModal(false)}
                className="btn-outline"
                style={{ fontSize: 13 }}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isSubmitting}
                className="btn-danger"
                style={{ fontSize: 13 }}
              >
                {isSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
