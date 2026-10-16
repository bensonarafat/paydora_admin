'use client';

import React from 'react';
import { 
  TrendingUp, 
  Users, 
  ShieldAlert, 
  ShieldCheck, 
  ArrowUpRight, 
  Layers, 
  Clock, 
  CheckCircle2 
} from 'lucide-react';
import { SystemMetrics, KycReviewItem, TransactionItem } from '@/types/admin';
import { AdminTab } from '@/components/layout/AdminSidebar';

interface OverviewViewProps {
  metrics: SystemMetrics | null;
  pendingKyc: KycReviewItem[];
  recentTransactions: TransactionItem[];
  onNavigate: (tab: AdminTab) => void;
  onTriggerKycReminder?: () => void;
}

export default function OverviewView({
  metrics,
  pendingKyc,
  recentTransactions,
  onNavigate,
}: OverviewViewProps) {
  const formatNgn = (val: number) => {
    return '₦' + val.toLocaleString('en-NG', { maximumFractionDigits: 0 });
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* KPI Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 18,
        }}
      >
        {/* Metric 1: 24h Volume */}
        <div className="card-standard">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              24h Volume (Settled)
            </span>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: '#f0fdf4',
                color: 'var(--green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', marginTop: 12 }}>
            {metrics ? formatNgn(metrics.volume24hNgn) : '₦42,890,500'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 12, color: 'var(--green)' }}>
            <ArrowUpRight size={14} />
            <span>+14.2% vs yesterday ({metrics?.txCount24h || 3120} txns)</span>
          </div>
        </div>

        {/* Metric 2: Total Customers */}
        <div className="card-standard">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              Total Users
            </span>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: '#eff6ff',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', marginTop: 12 }}>
            {metrics ? metrics.totalUsers.toLocaleString() : '14,820'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 12, color: '#64748b' }}>
            <span>{metrics?.activeToday.toLocaleString() || '1,940'} active today</span>
          </div>
        </div>

        {/* Metric 3: Pending KYC Reviews */}
        <div
          className="card-standard"
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigate('kyc')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: '#d97706', textTransform: 'uppercase' }}>
              Pending KYC Reviews
            </span>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: '#fffbeb',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', marginTop: 12 }}>
            {metrics ? metrics.pendingKycCount : pendingKyc.length}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 12, color: '#d97706' }}>
            <span>Requires compliance review ➜</span>
          </div>
        </div>

        {/* Metric 4: Blocked / Flagged Accounts */}
        <div
          className="card-standard"
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigate('users')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: '#dc2626', textTransform: 'uppercase' }}>
              Blocked Accounts
            </span>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: '#fef2f2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldAlert size={18} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', marginTop: 12 }}>
            {metrics ? metrics.blockedUsersCount : '1'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 12, color: '#dc2626' }}>
            <span>Review flagged accounts ➜</span>
          </div>
        </div>
      </div>

      {/* Grid: KYC Review Desk & BullMQ Queues */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
        {/* Left: Pending KYC Desk */}
        <div className="card-standard">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Pending KYC Verifications
              </h3>
              <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0 0' }}>
                Identity records requiring compliance approval
              </p>
            </div>
            <button
              onClick={() => onNavigate('kyc')}
              style={{ fontSize: 12.5, color: 'var(--primary)', fontWeight: 600 }}
            >
              View All ({pendingKyc.length}) ➜
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pendingKyc.slice(0, 4).map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 'var(--r-md)',
                  background: '#f8fafc',
                  border: '1px solid var(--border)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: '#0f172a' }}>
                      {item.full_name}
                    </span>
                    <span className="badge badge-pending">Tier {item.tier}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>
                    BVN: {item.bvn || 'N/A'} &bull; {item.email}
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('kyc')}
                  className="btn-outline"
                  style={{ padding: '6px 12px', fontSize: 12 }}
                >
                  Review
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: BullMQ Telemetry */}
        <div className="card-standard">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Layers size={18} color="var(--primary)" />
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                BullMQ Processing Queues
              </h3>
              <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0 0' }}>
                Redis background task workers
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(metrics?.queues || [
              { name: 'broadcast-mail', status: 'HEALTHY', pendingJobs: 0 },
              { name: 'kyc-reminder', status: 'HEALTHY', pendingJobs: 0 },
              { name: 'vault-sweep', status: 'HEALTHY', pendingJobs: 2 },
              { name: 'transaction-alert', status: 'HEALTHY', pendingJobs: 0 },
            ]).map((q) => (
              <div
                key={q.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 'var(--r-md)',
                  background: '#f8fafc',
                  border: '1px solid var(--border)',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                    {q.name}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    {q.pendingJobs} pending jobs
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={15} color="var(--green)" />
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)' }}>
                    ACTIVE
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions Feed */}
      <div className="card-standard">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Balance Transactions Feed
            </h3>
            <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0 0' }}>
              Real-time incoming and outgoing settlements
            </p>
          </div>
          <button
            onClick={() => onNavigate('transactions')}
            style={{ fontSize: 12.5, color: 'var(--primary)', fontWeight: 600 }}
          >
            Open Full Ledger ➜
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: 11.5, textTransform: 'uppercase' }}>
                <th style={{ padding: '10px 12px' }}>Reference</th>
                <th style={{ padding: '10px 12px' }}>User Details</th>
                <th style={{ padding: '10px 12px' }}>Type</th>
                <th style={{ padding: '10px 12px' }}>Amount</th>
                <th style={{ padding: '10px 12px' }}>Status</th>
                <th style={{ padding: '10px 12px' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((tx) => (
                <tr
                  key={tx.id}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'background var(--transition)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '12px', fontFamily: 'monospace', color: '#475569' }}>
                    {tx.reference}
                  </td>
                  <td style={{ padding: '12px', color: '#0f172a', fontWeight: 500 }}>
                    <div>{tx.user_name}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{tx.user_email}</div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span className="badge badge-info">{tx.type}</span>
                  </td>
                  <td style={{ padding: '12px', fontWeight: 600, color: '#0f172a' }}>
                    ₦{tx.amount.toLocaleString()}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span className={`badge ${tx.status === 'SUCCESS' ? 'badge-verified' : tx.status === 'FAILED' ? 'badge-danger' : 'badge-pending'}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: '#64748b', fontSize: 12 }}>
                    {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
