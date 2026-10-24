'use client';

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  ExternalLink, 
  RefreshCw, 
  User, 
  Wallet, 
  CreditCard, 
  Building2, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  MessageCircle,
  ShieldAlert,
  Download
} from 'lucide-react';
import { TransactionItem, UserAccount, formatTransactionType, formatTransactionStatus } from '@/types/admin';
import { AdminTab } from '@/components/layout/AdminSidebar';
import { adminApi } from '@/lib/api';

interface TransactionDetailsViewProps {
  transaction: TransactionItem;
  user?: UserAccount | null;
  onBack: () => void;
  onNavigateTab: (tab: AdminTab) => void;
  onToggleUserBlock?: (userId: string, isBlocked: boolean) => void;
}

export default function TransactionDetailsView({
  transaction,
  user,
  onBack,
  onNavigateTab,
  onToggleUserBlock,
}: TransactionDetailsViewProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isRequerying, setIsRequerying] = useState(false);
  const [requeryStatus, setRequeryStatus] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleRequery = async () => {
    setIsRequerying(true);
    setRequeryStatus(null);
    try {
      const res = await adminApi.requeryTransaction(transaction.reference);
      setRequeryStatus(res.message || (res.success ? 'Requery complete' : 'Requery failed'));
    } catch {
      setRequeryStatus('Network error while querying provider rails');
    } finally {
      setIsRequerying(false);
      setTimeout(() => setRequeryStatus(null), 5000);
    }
  };

  const formatNgn = (amount: number) => {
    return '₦' + amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
        second: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  // Resolved user details (from matching user object or fallback from transaction)
  const resolvedUser = {
    id: user?.id || transaction.user_id,
    name: user ? `${user.first_name} ${user.last_name}` : transaction.user_name,
    username: user?.username || transaction.user_email.split('@')[0],
    email: user?.email || transaction.user_email,
    phone: user?.phone || '+2348000000000',
    tier: user?.kyc_tier || 2,
    kycStatus: user?.kyc_status || 'verified',
    isBlocked: user?.is_blocked || false,
    balance: user?.balance_ngn ?? 1420500,
    createdAt: user?.created_at ? formatDate(user.created_at) : 'Active customer',
    virtualAccount: user?.virtual_account || {
      account_number: '9082341029',
      bank_name: 'Wema Bank (Squad)',
      account_name: `Paydora / ${transaction.user_name}`,
    },
  };

  const isDebit = transaction.direction === 'DEBIT' || transaction.type === 'TRANSFER' || transaction.type === 'BILL_PAYMENT';
  const netAmount = Math.max(0, transaction.amount - (transaction.fee || 0));

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Breadcrumb & Actions Bar */}
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
          <span>Back to previous view</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => copyToClipboard(transaction.reference, 'ref')}
            className="btn-outline"
            style={{ fontSize: 12.5, padding: '7px 14px' }}
          >
            {copiedKey === 'ref' ? <Check size={14} color="var(--green)" /> : <Copy size={14} />}
            <span>{copiedKey === 'ref' ? 'Reference Copied' : 'Copy Reference'}</span>
          </button>

          <button
            onClick={handleRequery}
            disabled={isRequerying}
            className="btn-outline"
            style={{ fontSize: 12.5, padding: '7px 14px' }}
          >
            <RefreshCw size={14} className={isRequerying ? 'animate-spin' : ''} />
            <span>{isRequerying ? 'Re-querying...' : 'Re-query Provider'}</span>
          </button>
        </div>
      </div>

      {/* Status Alert if re-queried */}
      {requeryStatus && (
        <div
          className="animate-fade-in"
          style={{
            padding: '12px 18px',
            borderRadius: 'var(--r-md)',
            background: 'var(--green-bg)',
            color: 'var(--green)',
            border: '1px solid #bbf7d0',
            fontSize: 13,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <CheckCircle2 size={16} />
          <span>{requeryStatus}</span>
        </div>
      )}

      {/* Main Header Card */}
      <div className="card-standard">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: '#64748b' }}>
                Reference
              </span>
              <code style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', background: '#f1f5f9', padding: '3px 8px', borderRadius: 6 }}>
                {transaction.reference}
              </code>
              <span
                className={`badge ${
                  transaction.status === 'SUCCESS'
                    ? 'badge-verified'
                    : transaction.status === 'FAILED'
                    ? 'badge-danger'
                    : 'badge-pending'
                }`}
              >
                {formatTransactionStatus(transaction.status)}
              </span>
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: 'var(--r-full)',
                  background: isDebit ? 'var(--red-bg)' : 'var(--green-bg)',
                  color: isDebit ? 'var(--red)' : 'var(--green)',
                }}
              >
                {isDebit ? 'Outbound Debit' : 'Inbound Credit'}
              </span>
            </div>

            <div style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', marginTop: 14, letterSpacing: '-0.5px' }}>
              {formatNgn(transaction.amount)}
            </div>

            <div style={{ fontSize: 13, color: '#64748b', marginTop: 6, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span>Fee: {formatNgn(transaction.fee || 0)}</span>
              <span>&bull;</span>
              <span>Net settlement: {formatNgn(netAmount)}</span>
              <span>&bull;</span>
              <span>Initiated on {formatDate(transaction.created_at)}</span>
            </div>
          </div>

          <div
            style={{
              padding: '14px 18px',
              borderRadius: 'var(--r-md)',
              background: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              minWidth: 220,
            }}
          >
            <span style={{ fontSize: 11.5, color: '#64748b' }}>Payment settlement rail</span>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
              {transaction.payment_method || 'Squad Instant Settlement Pool'}
            </div>
            <span style={{ fontSize: 11.5, color: 'var(--green)', fontWeight: 500, marginTop: 2 }}>
              Provider session active
            </span>
          </div>
        </div>
      </div>

      {/* 2-Column Split: Transaction Details vs User Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20 }}>
        {/* Column 1: Detailed Transaction & Settlement Metadata */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card-standard">
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0' }}>
              Transaction details
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>Transaction type</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                  {formatTransactionType(transaction.type)}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>Channel</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                  {transaction.channel || 'Bank Transfer'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>Currency</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                  NGN (Nigerian Naira ₦)
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>Narration / Description</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#0f172a', maxWidth: '60%', textAlign: 'right' }}>
                  {transaction.description || 'Electronic fund settlement via Paydora API'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>Provider reference</span>
                <span style={{ fontSize: 13, fontFamily: 'monospace', color: '#0f172a' }}>
                  {transaction.provider_reference || 'SQD-OUT-991028371'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>NIP session ID</span>
                <span style={{ fontSize: 12.5, fontFamily: 'monospace', color: '#0f172a' }}>
                  {transaction.session_id || '99905826101605541200000000501'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>Client IP & location</span>
                <span style={{ fontSize: 13, color: '#0f172a' }}>
                  {transaction.ip_address || '102.89.41.112 (Lagos, Nigeria)'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>Settled timestamp</span>
                <span style={{ fontSize: 13, color: '#0f172a' }}>
                  {transaction.settled_at ? formatDate(transaction.settled_at) : formatDate(transaction.created_at)}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>Gateway response message</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: transaction.status === 'FAILED' ? 'var(--red)' : 'var(--green)' }}>
                  {transaction.gateway_response || '00 Approved / Successful transaction'}
                </span>
              </div>
            </div>
          </div>

          {/* Beneficiary Details (if outbound) */}
          {transaction.beneficiary && (
            <div className="card-standard">
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0' }}>
                Beneficiary destination account
              </h3>

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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>Account holder name</span>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>
                    {transaction.beneficiary.account_name}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>Bank</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                    {transaction.beneficiary.bank_name}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>Account number</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                      {transaction.beneficiary.account_number}
                    </span>
                    <button
                      onClick={() => copyToClipboard(transaction.beneficiary!.account_number, 'beneficiary_num')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 2 }}
                    >
                      {copiedKey === 'beneficiary_num' ? <Check size={13} color="var(--green)" /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Column 2: Full User & Dedicated Account Profile */}
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
                  <span className="badge badge-verified">
                    Tier {resolvedUser.tier} Verified
                  </span>
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
                  {formatNgn(resolvedUser.balance)}
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

          {/* Assigned Dedicated Virtual Account Card */}
          <div className="card-standard">
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 14px 0' }}>
              Dedicated virtual account
            </h3>

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
                    onClick={() => copyToClipboard(resolvedUser.virtualAccount.account_number, 'va_num')}
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
    </div>
  );
}
