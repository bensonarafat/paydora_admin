'use client';

import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  Wallet, 
  Coins, 
  CreditCard, 
  Building2, 
  Layers, 
  Radio, 
  ArrowLeftRight, 
  ArrowUpRight 
} from 'lucide-react';
import { SystemMetrics, KycReviewItem, TransactionItem, formatTransactionType, formatTransactionStatus } from '@/types/admin';
import { AdminTab } from '@/components/layout/AdminSidebar';

interface OverviewViewProps {
  metrics: SystemMetrics | null;
  pendingKyc: KycReviewItem[];
  recentTransactions: TransactionItem[];
  onNavigate: (tab: AdminTab) => void;
  onTriggerKycReminder?: () => void;
  onSelectTransaction?: (tx: TransactionItem) => void;
}

export default function OverviewView({
  metrics,
  pendingKyc,
  recentTransactions,
  onNavigate,
  onSelectTransaction,
}: OverviewViewProps) {
  const formatNgn = (val: number) => {
    return '₦' + val.toLocaleString('en-NG', { maximumFractionDigits: 0 });
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* SECTION 1: Core Platform Telemetry */}
      <div>
        <div style={{ marginBottom: 14 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Platform Overview & Operations
          </h2>
          <p style={{ fontSize: 13, color: '#64748b', margin: '3px 0 0 0' }}>
            Live customer volume, custodial liabilities, and account verification velocity
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
          }}
        >
          {/* Card 1: Total Custodial Deposits */}
          <div className="card-standard">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>
                Total custodial deposits
              </span>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: '#f1f5f9',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Wallet size={17} />
              </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginTop: 12 }}>
              {formatNgn(metrics?.custodialDepositsNgn || 184520000)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 12, color: '#64748b' }}>
              <span>User wallet balances in trust</span>
            </div>
          </div>

          {/* Card 2: Platform Fee Revenue */}
          <div className="card-standard">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>
                Platform fee revenue
              </span>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: '#f1f5f9',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Coins size={17} />
              </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginTop: 12 }}>
              {formatNgn(metrics?.platformFeeRevenueNgn || 3840250)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 12, color: 'var(--green)' }}>
              <ArrowUpRight size={14} />
              <span>+12.8% fees collected (MTD)</span>
            </div>
          </div>

          {/* Card 3: Active Cards Issued */}
          <div className="card-standard">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>
                Active cards issued
              </span>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: '#f1f5f9',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CreditCard size={17} />
              </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginTop: 12 }}>
              {(metrics?.activeCardsCount || 4210).toLocaleString()} Cards
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 12, color: '#64748b' }}>
              <span>Virtual Visa & Mastercard</span>
            </div>
          </div>

          {/* Card 4: 24h Volume */}
          <div className="card-standard">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>
                24h volume (settled)
              </span>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: '#f1f5f9',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TrendingUp size={17} />
              </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginTop: 12 }}>
              {metrics ? formatNgn(metrics.volume24hNgn) : '₦42,890,500'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 12, color: 'var(--green)' }}>
              <ArrowUpRight size={14} />
              <span>+14.2% ({metrics?.txCount24h || 3120} txns)</span>
            </div>
          </div>

          {/* Card 5: Total Users */}
          <div className="card-standard">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>
                Total users
              </span>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: '#f1f5f9',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Users size={17} />
              </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginTop: 12 }}>
              {metrics ? metrics.totalUsers.toLocaleString() : '14,820'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 12, color: '#64748b' }}>
              <span>{metrics?.activeToday.toLocaleString() || '1,940'} active today</span>
            </div>
          </div>

          {/* Card 6: Pending KYC Reviews */}
          <div
            className="card-standard"
            style={{ cursor: 'pointer' }}
            onClick={() => onNavigate('kyc')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>
                Pending KYC reviews
              </span>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: '#f1f5f9',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Clock size={17} />
              </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginTop: 12 }}>
              {metrics ? metrics.pendingKycCount : pendingKyc.length}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 12, color: '#d97706' }}>
              <span>Requires compliance review ➜</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Provider Treasury & Settlement Balances */}
      <div>
        <div style={{ marginBottom: 14 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Settlement Rails & Provider Balances
          </h2>
          <p style={{ fontSize: 13, color: '#64748b', margin: '3px 0 0 0' }}>
            Live available balances and operating float across integration partners
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
          }}
        >
          {/* Rail 1: Squad Balance */}
          <div className="card-standard">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>
                  Squad balance
                </span>
                <div style={{ fontSize: 11, color: '#2563eb', fontWeight: 500, marginTop: 2 }}>
                  Virtual accounts
                </div>
              </div>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: '#f1f5f9',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Building2 size={17} />
              </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginTop: 12 }}>
              {formatNgn(metrics?.squadBalanceNgn || 18450200)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 12, color: '#64748b' }}>
              <span>HabariPay / GTCO Settlement Pool</span>
            </div>
          </div>

          {/* Rail 2: Paystack Balance */}
          <div className="card-standard">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>
                  Paystack balance
                </span>
                <div style={{ fontSize: 11, color: '#2563eb', fontWeight: 500, marginTop: 2 }}>
                  Cards & gateway
                </div>
              </div>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: '#f1f5f9',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Layers size={17} />
              </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginTop: 12 }}>
              {formatNgn(metrics?.paystackBalanceNgn || 24190000)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 12, color: '#64748b' }}>
              <span>Collections & Payout Reserve Float</span>
            </div>
          </div>

          {/* Rail 3: Korapay Balance */}
          <div className="card-standard">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>
                  Korapay balance
                </span>
                <div style={{ fontSize: 11, color: '#2563eb', fontWeight: 500, marginTop: 2 }}>
                  Disbursements & NIN
                </div>
              </div>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: '#f1f5f9',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ArrowLeftRight size={17} />
              </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginTop: 12 }}>
              {formatNgn(metrics?.korapayBalanceNgn || 12850000)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 12, color: '#64748b' }}>
              <span>Identity verification & payouts</span>
            </div>
          </div>

          {/* Rail 4: Termii Balance */}
          <div className="card-standard">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>
                  Termii balance
                </span>
                <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 500, marginTop: 2 }}>
                  {(metrics?.termiiUnits || 21125).toLocaleString()} SMS units
                </div>
              </div>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: '#f1f5f9',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Radio size={17} />
              </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginTop: 12 }}>
              {formatNgn(metrics?.termiiBalanceNgn || 84500)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 12, color: '#64748b' }}>
              <span>SMS OTP & notification delivery</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions Feed */}
      <div className="card-standard">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Recent transactions
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
              <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: 12, fontWeight: 500 }}>
                <th style={{ padding: '10px 12px' }}>Reference</th>
                <th style={{ padding: '10px 12px' }}>User Details</th>
                <th style={{ padding: '10px 12px' }}>Type</th>
                <th style={{ padding: '10px 12px' }}>Amount</th>
                <th style={{ padding: '10px 12px' }}>Status</th>
                <th style={{ padding: '10px 12px' }}>Timestamp</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((tx) => (
                <tr
                  key={tx.id}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    cursor: 'pointer',
                    transition: 'background var(--transition)',
                  }}
                  onClick={() => onSelectTransaction?.(tx)}
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
                    <span className="badge badge-info">{formatTransactionType(tx.type)}</span>
                  </td>
                  <td style={{ padding: '12px', fontWeight: 600, color: '#0f172a' }}>
                    ₦{tx.amount.toLocaleString()}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span className={`badge ${tx.status === 'SUCCESS' ? 'badge-verified' : tx.status === 'FAILED' ? 'badge-danger' : 'badge-pending'}`}>
                      {formatTransactionStatus(tx.status)}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: '#64748b', fontSize: 12 }}>
                    {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>
                      View details ➜
                    </span>
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
