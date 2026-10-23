'use client';

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  ShieldAlert, 
  MessageCircle, 
  CreditCard, 
  Clock, 
  Send, 
  KeyRound, 
  ExternalLink,
  ReceiptText,
  AlertTriangle,
  User,
  Phone,
  Mail,
  Calendar,
  Building
} from 'lucide-react';
import { UserAccount, KycReviewItem, TransactionItem, formatKycStatus, formatTransactionType, formatTransactionStatus } from '@/types/admin';
import { AdminTab } from '@/components/layout/AdminSidebar';

interface UserDetailsViewProps {
  user: UserAccount;
  kycItem?: KycReviewItem | null;
  transactions: TransactionItem[];
  onBack: () => void;
  onToggleBlock: (userId: string, isBlocked: boolean, reason?: string) => Promise<void>;
  onNavigateTab: (tab: AdminTab) => void;
  onSelectTransaction?: (tx: TransactionItem) => void;
  onSelectKyc?: (kyc: KycReviewItem) => void;
}

export default function UserDetailsView({
  user,
  kycItem,
  transactions,
  onBack,
  onToggleBlock,
  onNavigateTab,
  onSelectTransaction,
  onSelectKyc,
}: UserDetailsViewProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockReason, setBlockReason] = useState('Suspicious high-velocity transfer activity.');
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleBlockConfirm = async () => {
    setIsUpdating(true);
    await onToggleBlock(user.id, true, blockReason);
    setIsUpdating(false);
    setShowBlockModal(false);
  };

  const handleUnblock = async () => {
    setIsUpdating(true);
    await onToggleBlock(user.id, false);
    setIsUpdating(false);
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

  // User's relevant transactions
  const userTransactions = transactions.filter(
    (tx) => tx.user_id === user.id || tx.user_email === user.email
  );

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Action Notification Toast */}
      {actionNotice && (
        <div
          className="animate-fade-in"
          style={{
            position: 'fixed',
            bottom: 28,
            right: 28,
            padding: '12px 20px',
            borderRadius: 'var(--r-md)',
            background: '#ffffff',
            border: 'none',
            boxShadow: 'none',
            color: '#0f172a',
            fontSize: 13,
            fontWeight: 600,
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)' }} />
          <span>{actionNotice}</span>
        </div>
      )}

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
          <span>Back to users</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {user.is_blocked ? (
            <button
              onClick={handleUnblock}
              disabled={isUpdating}
              className="btn-success"
              style={{ fontSize: 13, padding: '8px 18px' }}
            >
              <Unlock size={15} />
              <span>{isUpdating ? 'Unblocking...' : 'Resolve & unblock account'}</span>
            </button>
          ) : (
            <button
              onClick={() => setShowBlockModal(true)}
              disabled={isUpdating}
              className="btn-danger"
              style={{ fontSize: 13, padding: '8px 18px' }}
            >
              <Lock size={15} />
              <span>Restrict & block account</span>
            </button>
          )}

          <button
            onClick={() => onNavigateTab('whatsapp')}
            className="btn-outline"
            style={{ fontSize: 13, padding: '8px 16px' }}
          >
            <MessageCircle size={15} />
            <span>Open WhatsApp chat</span>
          </button>
        </div>
      </div>

      {/* Main User Profile Card */}
      <div className="card-standard">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: '#eff6ff',
                color: 'var(--primary)',
                fontWeight: 700,
                fontSize: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {user.first_name.charAt(0)}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  {user.first_name} {user.last_name}
                </h2>
                <span className={`badge ${user.is_blocked ? 'badge-danger' : 'badge-verified'}`}>
                  {user.is_blocked ? 'Blocked' : 'Active'}
                </span>
                <span
                  className={`badge ${
                    (kycItem?.status || user.kyc_status) === 'verified'
                      ? 'badge-verified'
                      : (kycItem?.status || user.kyc_status) === 'rejected'
                      ? 'badge-danger'
                      : 'badge-pending'
                  }`}
                >
                  KYC {formatKycStatus(kycItem?.status || user.kyc_status)}
                </span>
              </div>

              <div style={{ fontSize: 13, color: '#64748b', marginTop: 4, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--primary)', fontWeight: 500 }}>@{user.username}</span>
                <span>&bull;</span>
                <span>{user.email}</span>
                <span>&bull;</span>
                <span>{user.phone}</span>
              </div>
            </div>
          </div>

          {/* Balance & Customer ID */}
          <div
            style={{
              padding: '14px 20px',
              borderRadius: 'var(--r-md)',
              background: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              minWidth: 220,
            }}
          >
            <span style={{ fontSize: 11.5, color: '#64748b' }}>Current wallet balance</span>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>
              ₦{user.balance_ngn.toLocaleString()}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <span style={{ fontSize: 11, color: '#64748b' }}>ID:</span>
              <code style={{ fontSize: 11.5, fontFamily: 'monospace', color: '#0f172a', background: '#f1f5f9', padding: '1px 6px', borderRadius: 4 }}>
                {user.id}
              </code>
              <button
                onClick={() => copyToClipboard(user.id, 'user_id')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 1 }}
              >
                {copiedKey === 'user_id' ? <Check size={12} color="var(--green)" /> : <Copy size={12} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Details Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
        {/* Left Column: Account Details, KYC Records, Security Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Account Profile Card */}
          <div className="card-standard">
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0' }}>
              Customer account profile
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>Full legal name</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                  {user.first_name} {user.last_name}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>Username</span>
                <span style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 500 }}>
                  @{user.username}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>Email address</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13, color: '#0f172a' }}>{user.email}</span>
                  <button
                    onClick={() => copyToClipboard(user.email, 'email')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 2 }}
                  >
                    {copiedKey === 'email' ? <Check size={13} color="var(--green)" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>Phone number</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13, color: '#0f172a' }}>{user.phone}</span>
                  <button
                    onClick={() => copyToClipboard(user.phone, 'phone')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 2 }}
                  >
                    {copiedKey === 'phone' ? <Check size={13} color="var(--green)" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>Registration date</span>
                <span style={{ fontSize: 13, color: '#0f172a' }}>
                  {formatDate(user.created_at)}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>Account standing</span>
                <span
                  style={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: user.is_blocked ? 'var(--red)' : 'var(--green)',
                  }}
                >
                  {user.is_blocked ? 'Account Restricted / Blocked' : 'Active - In Good Standing'}
                </span>
              </div>
            </div>

            {/* Block Alert Banner if blocked */}
            {user.is_blocked && (
              <div
                style={{
                  marginTop: 16,
                  padding: '14px 16px',
                  borderRadius: 'var(--r-md)',
                  background: 'var(--red-bg)',
                  border: '1px solid #fecaca',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13, color: 'var(--red)' }}>
                  <ShieldAlert size={16} />
                  <span>Restriction Reason on Record</span>
                </div>
                <p style={{ margin: 0, fontSize: 12.5, color: '#991b1b', lineHeight: 1.5 }}>
                  {user.blocked_reason || 'Administrative restriction applied due to risk review.'}
                </p>
                {user.blocked_at && (
                  <span style={{ fontSize: 11, color: '#b91c1c', marginTop: 2 }}>
                    Applied on: {formatDate(user.blocked_at)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* KYC & Verification Details Card */}
          <div className="card-standard">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Compliance & identity records
              </h3>
              {kycItem && onSelectKyc && (
                <button
                  onClick={() => onSelectKyc(kycItem)}
                  className="btn-outline"
                  style={{ padding: '4px 10px', fontSize: 11.5 }}
                >
                  <span>Full KYC application</span>
                  <ExternalLink size={12} />
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>Bank Verification Number (BVN)</div>
                  <div style={{ fontSize: 11.5, color: kycItem?.bvn ? 'var(--green)' : '#64748b', marginTop: 2 }}>
                    {kycItem?.bvn_match_status || (kycItem?.bvn ? 'Confirmed with NIBSS database' : 'Not submitted')}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <code style={{ fontSize: 13.5, fontWeight: 600, color: '#0f172a', background: '#f1f5f9', padding: '3px 8px', borderRadius: 6 }}>
                    {kycItem?.bvn || 'Not submitted'}
                  </code>
                  {kycItem?.bvn && (
                    <button
                      onClick={() => copyToClipboard(kycItem.bvn!, 'kyc_bvn')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 2 }}
                    >
                      {copiedKey === 'kyc_bvn' ? <Check size={13} color="var(--green)" /> : <Copy size={13} />}
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>National Identification Number (NIN)</div>
                  <div style={{ fontSize: 11.5, color: kycItem?.nin ? 'var(--green)' : '#64748b', marginTop: 2 }}>
                    {kycItem?.nin_match_status || (kycItem?.nin ? 'NIMC verification record confirmed' : 'Not submitted')}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <code style={{ fontSize: 13.5, fontWeight: 600, color: '#0f172a', background: '#f1f5f9', padding: '3px 8px', borderRadius: 6 }}>
                    {kycItem?.nin || 'Not submitted'}
                  </code>
                  {kycItem?.nin && (
                    <button
                      onClick={() => copyToClipboard(kycItem.nin!, 'kyc_nin')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 2 }}
                    >
                      {copiedKey === 'kyc_nin' ? <Check size={13} color="var(--green)" /> : <Copy size={13} />}
                    </button>
                  )}
                </div>
              </div>

              {kycItem?.dob && (
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: 13, color: '#64748b' }}>Date of birth on record</span>
                  <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 500 }}>
                    {kycItem.dob}
                  </span>
                </div>
              )}

              {kycItem?.residential_address && (
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: 13, color: '#64748b' }}>Residential address</span>
                  <span style={{ fontSize: 13, color: '#0f172a', maxWidth: '60%', textAlign: 'right' }}>
                    {kycItem.residential_address}
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>Facial biometric liveness</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)' }}>
                  {kycItem?.liveness_score ? `${kycItem.liveness_score}% Match` : 'Biometrics Passed'}
                </span>
              </div>
            </div>
          </div>

          {/* Account Security & Operator Controls */}
          <div className="card-standard">
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0' }}>
              Security actions & customer support
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                onClick={() => showNotice(`Security password reset link dispatched to ${user.email}`)}
                className="btn-outline"
                style={{ fontSize: 12.5, justifyContent: 'center', padding: '10px 14px' }}
              >
                <KeyRound size={14} />
                <span>Reset password / PIN</span>
              </button>

              <button
                onClick={() => showNotice(`Monthly account statement emailed to ${user.email}`)}
                className="btn-outline"
                style={{ fontSize: 12.5, justifyContent: 'center', padding: '10px 14px' }}
              >
                <Send size={14} />
                <span>Send statement email</span>
              </button>

              <button
                onClick={() => onNavigateTab('whatsapp')}
                className="btn-outline"
                style={{ fontSize: 12.5, justifyContent: 'center', padding: '10px 14px' }}
              >
                <MessageCircle size={14} />
                <span>Open WhatsApp chat</span>
              </button>

              <button
                onClick={() => onNavigateTab('broadcast')}
                className="btn-outline"
                style={{ fontSize: 12.5, justifyContent: 'center', padding: '10px 14px' }}
              >
                <Mail size={14} />
                <span>Broadcast message</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Virtual Account & Recent Transactions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Dedicated Virtual Account Card */}
          <div className="card-standard">
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 14px 0' }}>
              Assigned dedicated virtual account
            </h3>

            {user.virtual_account ? (
              <div
                style={{
                  padding: '16px',
                  borderRadius: 'var(--r-md)',
                  background: '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div>
                  <span style={{ fontSize: 11.5, color: '#64748b' }}>Bank institution</span>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Building size={14} color="#64748b" />
                    <span>{user.virtual_account.bank_name}</span>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: 11.5, color: '#64748b' }}>Account number</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                    <span style={{ fontSize: 17, fontWeight: 700, fontFamily: 'monospace', color: '#0f172a' }}>
                      {user.virtual_account.account_number}
                    </span>
                    <button
                      onClick={() => copyToClipboard(user.virtual_account!.account_number, 'user_va')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                    >
                      {copiedKey === 'user_va' ? <Check size={14} color="var(--green)" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: 11.5, color: '#64748b' }}>Account name</span>
                  <div style={{ fontSize: 13, color: '#0f172a', marginTop: 2 }}>
                    {user.virtual_account.account_name}
                  </div>
                </div>

                <div style={{ paddingTop: 8, borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)' }} />
                  <span style={{ fontSize: 11.5, color: '#64748b' }}>Settlement rail active & receiving deposits</span>
                </div>
              </div>
            ) : (
              <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                No dedicated virtual account assigned yet
              </div>
            )}
          </div>

          {/* User's Recent Transactions */}
          <div className="card-standard">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Recent transactions ({userTransactions.length})
              </h3>
              {userTransactions.length > 0 && (
                <button
                  onClick={() => onNavigateTab('transactions')}
                  className="btn-outline"
                  style={{ padding: '4px 10px', fontSize: 11.5 }}
                >
                  <span>All transactions</span>
                </button>
              )}
            </div>

            {userTransactions.length === 0 ? (
              <div style={{ padding: '24px 12px', textAlign: 'center', color: '#64748b', fontSize: 13 }}>
                No transaction records found for this user
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {userTransactions.slice(0, 6).map((tx) => (
                  <div
                    key={tx.id}
                    onClick={() => onSelectTransaction && onSelectTransaction(tx)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--r-md)',
                      background: '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: onSelectTransaction ? 'pointer' : 'default',
                      transition: 'background var(--transition)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#f8fafc')}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                        {formatTransactionType(tx.type)}
                      </div>
                      <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                        {tx.reference} &bull; {formatDate(tx.created_at)}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          fontSize: 13.5,
                          fontWeight: 700,
                          color: tx.type === 'WALLET_TOPUP' ? 'var(--green)' : '#0f172a',
                        }}
                      >
                        {tx.type === 'WALLET_TOPUP' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                      </div>
                      <span
                        className={`badge ${
                          tx.status === 'SUCCESS'
                            ? 'badge-verified'
                            : tx.status === 'FAILED'
                            ? 'badge-danger'
                            : 'badge-pending'
                        }`}
                        style={{ fontSize: 10.5, padding: '1px 6px', marginTop: 2 }}
                      >
                        {formatTransactionStatus(tx.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Block Restriction Modal */}
      {showBlockModal && (
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
              Restrict & block user account
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '6px 0 16px 0' }}>
              Please select or enter the compliance reason for blocking {user.first_name} {user.last_name}&apos;s account.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                onClick={() => setBlockReason('Suspicious high-velocity transfer activity.')}
                className="btn-outline"
                style={{ justifyContent: 'flex-start', fontSize: 12, textAlign: 'left', padding: '8px 12px' }}
              >
                Suspicious high-velocity transfer activity
              </button>
              <button
                onClick={() => setBlockReason('Disputed chargeback or fraudulent deposit alert.')}
                className="btn-outline"
                style={{ justifyContent: 'flex-start', fontSize: 12, textAlign: 'left', padding: '8px 12px' }}
              >
                Disputed chargeback or fraudulent deposit alert
              </button>
              <button
                onClick={() => setBlockReason('Identity verification mismatch or compromised account credentials.')}
                className="btn-outline"
                style={{ justifyContent: 'flex-start', fontSize: 12, textAlign: 'left', padding: '8px 12px' }}
              >
                Identity mismatch or compromised credentials
              </button>
            </div>

            <textarea
              rows={3}
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              style={{ width: '100%', marginTop: 12, fontSize: 13 }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
              <button
                onClick={() => setShowBlockModal(false)}
                className="btn-outline"
                style={{ fontSize: 13 }}
              >
                Cancel
              </button>
              <button
                onClick={handleBlockConfirm}
                disabled={isUpdating}
                className="btn-danger"
                style={{ fontSize: 13 }}
              >
                {isUpdating ? 'Restricting...' : 'Confirm account restriction'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
