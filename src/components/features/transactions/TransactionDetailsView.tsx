'use client';

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  RefreshCw, 
  User, 
  CheckCircle2, 
  MessageCircle,
  Code2,
  ChevronDown,
  ChevronUp,
  Zap,
  ArrowDownLeft,
  ArrowUpRight,
  FileText
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
}: TransactionDetailsViewProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isRequerying, setIsRequerying] = useState(false);
  const [requeryStatus, setRequeryStatus] = useState<string | null>(null);
  const [showRawMetadata, setShowRawMetadata] = useState(false);

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
      setRequeryStatus(res.message || (res.success ? 'Provider rail query succeeded' : 'Requery failed'));
    } catch {
      setRequeryStatus('Network error while querying provider rails');
    } finally {
      setIsRequerying(false);
      setTimeout(() => setRequeryStatus(null), 6000);
    }
  };

  const formatNgn = (amount: number) => {
    return '₦' + Number(amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return 'N/A';
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr;
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

  // Resolved user details (from matching user object or transaction metadata)
  const resolvedUser = {
    id: user?.id || transaction.user_id,
    name: user ? `${user.first_name} ${user.last_name}`.trim() || transaction.user_name : transaction.user_name,
    username: user?.username || (transaction.user_email.includes('@') ? transaction.user_email.split('@')[0] : 'customer'),
    email: user?.email || transaction.user_email,
    phone: user?.phone || 'Not provided',
    tier: user?.kyc_tier || (user?.kyc_status === 'verified' || user?.status === 'active' ? 2 : 1),
    kycStatus: user?.kyc_status || 'verified',
    isBlocked: user?.is_blocked || user?.status === 'blocked' || false,
    balance: user?.balance_ngn ?? 0,
    createdAt: user?.created_at ? formatDate(user.created_at) : 'Active customer',
    virtualAccount: user?.virtual_account || null,
  };

  const isDebit = transaction.direction === 'DEBIT' || transaction.type === 'TRANSFER' || transaction.type === 'BILL_PAYMENT';
  const netAmount = Math.max(0, transaction.amount - (transaction.fee || 0));

  // Dynamic extractors
  const meta = transaction.metadata || {};
  const beneficiary = transaction.beneficiary || (meta.beneficiary || (meta.account_number ? {
    account_number: meta.account_number || meta.destination_account_number || '',
    bank_name: meta.bank_name || meta.destination_bank_name || 'Bank',
    account_name: meta.account_name || meta.recipient_name || 'Beneficiary',
  } : null));

  const sender = transaction.sender || (meta.sender || (meta.sender_name || meta.sender_bank ? {
    name: meta.sender_name || meta.senderName || 'External Sender',
    bank_name: meta.sender_bank || meta.senderBank || 'External Bank',
    account_number: meta.sender_account_number || meta.senderAccount || 'N/A',
  } : null));

  const token = transaction.token || meta.token || meta.pin || meta.token_code;
  const meterOrPhone = meta.meter_no || meta.meterNumber || meta.phone_number || meta.phone;
  const billerName = meta.provider || meta.biller_name || meta.service_provider;

  const providerReference = transaction.provider_reference || meta.transaction_ref || meta.transaction_reference || 'N/A';
  const sessionId = transaction.session_id || meta.session_id || meta.nip_session_id || 'N/A';
  const ipAddress = transaction.ip_address || meta.ip_address || meta.ip || 'N/A';
  const gatewayResponse = transaction.gateway_response || meta.response_message || meta.message || (
    transaction.status === 'SUCCESS' ? '00 Transaction Approved & Settled' : transaction.status === 'FAILED' ? 'Transaction Failed' : 'Pending Provider Settlement'
  );

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
          <span>Back to transactions</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
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
            <span>{isRequerying ? 'Re-querying Rails...' : 'Re-query Provider Rails'}</span>
          </button>

          {meta && Object.keys(meta).length > 0 && (
            <button
              onClick={() => setShowRawMetadata(!showRawMetadata)}
              className="btn-outline"
              style={{ fontSize: 12.5, padding: '7px 14px' }}
            >
              <Code2 size={14} />
              <span>{showRawMetadata ? 'Hide Raw Metadata' : 'View Raw Metadata'}</span>
              {showRawMetadata ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          )}
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
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                {isDebit ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
                <span>{isDebit ? 'Outbound Debit' : 'Inbound Credit'}</span>
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
            <span style={{ fontSize: 11.5, color: '#64748b' }}>Settlement rail</span>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
              {transaction.payment_method || (isDebit ? 'Outbound NIP Rail' : 'Inbound Settlement Rail')}
            </div>
            <span style={{ fontSize: 11.5, color: 'var(--green)', fontWeight: 500, marginTop: 2 }}>
              Provider verification available
            </span>
          </div>
        </div>
      </div>

      {/* Raw Metadata Accordion Box */}
      {showRawMetadata && meta && (
        <div className="card-standard animate-fade-in" style={{ background: '#0f172a', color: '#f8fafc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>
              <Code2 size={16} color="var(--primary)" />
              <span>Raw Provider Payload & Metadata</span>
            </div>
            <button
              onClick={() => copyToClipboard(JSON.stringify(meta, null, 2), 'raw_json')}
              className="btn-outline"
              style={{ fontSize: 11, padding: '4px 10px', background: 'transparent', color: '#cbd5e1', borderColor: '#334155' }}
            >
              {copiedKey === 'raw_json' ? 'Copied JSON' : 'Copy JSON'}
            </button>
          </div>
          <pre style={{ margin: 0, fontSize: 12, lineHeight: 1.5, overflowX: 'auto', color: '#38bdf8', fontFamily: 'monospace' }}>
            {JSON.stringify(meta, null, 2)}
          </pre>
        </div>
      )}

      {/* 2-Column Split: Transaction Details vs Customer Profile */}
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
                  {transaction.channel || (isDebit ? 'Outbound Transfer' : 'Inbound Deposit')}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>Currency</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                  {transaction.currency || 'NGN'} (Nigerian Naira ₦)
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>Narration / Description</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#0f172a', maxWidth: '60%', textAlign: 'right' }}>
                  {transaction.description || 'No description provided'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>Provider reference</span>
                <span style={{ fontSize: 13, fontFamily: 'monospace', color: '#0f172a' }}>
                  {providerReference}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>NIP session ID</span>
                <span style={{ fontSize: 12.5, fontFamily: 'monospace', color: '#0f172a' }}>
                  {sessionId}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>Client IP address</span>
                <span style={{ fontSize: 13, color: '#0f172a' }}>
                  {ipAddress}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>Settled timestamp</span>
                <span style={{ fontSize: 13, color: '#0f172a' }}>
                  {formatDate(transaction.settled_at || transaction.created_at)}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>Gateway response</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: transaction.status === 'FAILED' ? 'var(--red)' : 'var(--green)' }}>
                  {gatewayResponse}
                </span>
              </div>
            </div>
          </div>

          {/* Utility / Bill Payment Token Card (if electricity, airtime, or utility vend) */}
          {(token || meterOrPhone || billerName) && (
            <div className="card-standard" style={{ borderLeft: '4px solid var(--primary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Zap size={16} color="var(--primary)" />
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Utility / Bill purchase details
                </h3>
              </div>

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
                {token && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#64748b' }}>Recharge token / PIN</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 15, fontFamily: 'monospace', fontWeight: 800, color: 'var(--primary)' }}>
                        {token}
                      </span>
                      <button
                        onClick={() => copyToClipboard(token, 'token_val')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 2 }}
                      >
                        {copiedKey === 'token_val' ? <Check size={13} color="var(--green)" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>
                )}

                {billerName && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#64748b' }}>Provider / Biller</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                      {billerName}
                    </span>
                  </div>
                )}

                {meterOrPhone && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#64748b' }}>Meter / Phone number</span>
                    <span style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 600, color: '#0f172a' }}>
                      {meterOrPhone}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Beneficiary Details (if outbound transfer) */}
          {beneficiary && (
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
                    {beneficiary.account_name}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>Bank</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                    {beneficiary.bank_name}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>Account number</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                      {beneficiary.account_number}
                    </span>
                    <button
                      onClick={() => copyToClipboard(beneficiary.account_number, 'beneficiary_num')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 2 }}
                    >
                      {copiedKey === 'beneficiary_num' ? <Check size={13} color="var(--green)" /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sender Details (if inbound deposit / credit) */}
          {!isDebit && sender && (
            <div className="card-standard">
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0' }}>
                Sender funding details
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
                  <span style={{ fontSize: 12, color: '#64748b' }}>Sender name</span>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>
                    {sender.name}
                  </span>
                </div>

                {sender.bank_name && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#64748b' }}>Originating bank</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                      {sender.bank_name}
                    </span>
                  </div>
                )}

                {sender.account_number && sender.account_number !== 'N/A' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#64748b' }}>Sender account number</span>
                    <span style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                      {sender.account_number}
                    </span>
                  </div>
                )}
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
                  No active dedicated virtual account assigned to this user profile.
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
    </div>
  );
}
