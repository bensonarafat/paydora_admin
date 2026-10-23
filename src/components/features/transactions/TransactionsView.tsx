'use client';

import React, { useState } from 'react';
import { 
  ReceiptText, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  X,
  ChevronDown
} from 'lucide-react';
import { TransactionItem, TransactionStatus, TransactionType, formatTransactionType, formatTransactionStatus } from '@/types/admin';

interface TransactionsViewProps {
  transactions: TransactionItem[];
  isLoading: boolean;
  onSelectTransaction?: (tx: TransactionItem) => void;
}

export default function TransactionsView({ transactions, isLoading, onSelectTransaction }: TransactionsViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'ALL'>('ALL');
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);

  const filtered = transactions.filter((tx) => {
    const matchStatus = statusFilter === 'ALL' || tx.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch =
      tx.reference.toLowerCase().includes(q) ||
      tx.user_name.toLowerCase().includes(q) ||
      tx.user_email.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Filter Bar */}
      <div
        className="card-standard"
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>Filter by status:</span>
          {(['ALL', 'SUCCESS', 'PENDING', 'FAILED'] as const).map((st) => {
            const isActive = statusFilter === st;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 'var(--r-full)',
                  fontSize: 12.5,
                  fontWeight: isActive ? 600 : 500,
                  background: isActive ? '#eff6ff' : 'transparent',
                  color: isActive ? 'var(--primary)' : '#64748b',
                  border: isActive ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                  cursor: 'pointer',
                  transition: 'all var(--transition)',
                }}
              >
                {st === 'ALL' ? 'All' : formatTransactionStatus(st)}
              </button>
            );
          })}
        </div>

        <div style={{ position: 'relative', width: 260 }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
            }}
          />
          <input
            type="text"
            placeholder="Search reference or user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: 34, fontSize: 13 }}
          />
        </div>
      </div>

      {/* Transactions Table Card */}
      <div className="card-standard" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr
                style={{
                  background: '#f8fafc',
                  borderBottom: '1px solid var(--border)',
                  color: '#64748b',
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                <th style={{ padding: '14px 20px' }}>Reference</th>
                <th style={{ padding: '14px 20px' }}>User Details</th>
                <th style={{ padding: '14px 20px' }}>Payment Rail</th>
                <th style={{ padding: '14px 20px' }}>Amount & Fee</th>
                <th style={{ padding: '14px 20px' }}>Status</th>
                <th style={{ padding: '14px 20px' }}>Created</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => (
                <tr
                  key={tx.id}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    cursor: 'pointer',
                    transition: 'background var(--transition)',
                  }}
                  onClick={() => {
                    if (onSelectTransaction) {
                      onSelectTransaction(tx);
                    } else {
                      setSelectedTx(tx);
                    }
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '14px 20px', fontFamily: 'monospace', color: '#475569' }}>
                    {tx.reference}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{tx.user_name}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{tx.user_email}</div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span className="badge badge-info">{formatTransactionType(tx.type)}</span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>
                      ₦{tx.amount.toLocaleString()}
                    </div>
                    {tx.fee > 0 && (
                      <div style={{ fontSize: 11, color: '#64748b' }}>
                        Fee: ₦{tx.fee.toFixed(2)}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span
                      className={`badge ${
                        tx.status === 'SUCCESS'
                          ? 'badge-verified'
                          : tx.status === 'FAILED'
                          ? 'badge-danger'
                          : 'badge-pending'
                      }`}
                    >
                      {formatTransactionStatus(tx.status)}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', color: '#64748b', fontSize: 12 }}>
                    {new Date(tx.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <button
                      className="btn-outline"
                      style={{ padding: '6px 12px', fontSize: 12 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectTransaction) {
                          onSelectTransaction(tx);
                        } else {
                          setSelectedTx(tx);
                        }
                      }}
                    >
                      View details ➜
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTx && (
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
          onClick={() => setSelectedTx(null)}
        >
          <div
            className="animate-fade-in"
            style={{
              width: '100%',
              maxWidth: 520,
              padding: 28,
              background: '#ffffff',
              borderRadius: 'var(--r-lg)',
              border: 'none',
              boxShadow: 'none',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="badge badge-info">{selectedTx.type}</span>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '8px 0 2px 0' }}>
                  ₦{selectedTx.amount.toLocaleString()}
                </h2>
                <p style={{ fontSize: 12, fontFamily: 'monospace', color: '#64748b', margin: 0 }}>
                  {selectedTx.reference}
                </p>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                style={{ padding: 6, borderRadius: '50%', color: '#64748b', background: '#f8fafc' }}
              >
                <X size={18} />
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 14,
                marginTop: 20,
                padding: '16px',
                borderRadius: 'var(--r-md)',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
              }}
            >
              <div>
                <div style={{ fontSize: 11.5, color: '#64748b' }}>
                  Customer
                </div>
                <div style={{ fontSize: 13.5, color: '#0f172a', marginTop: 2, fontWeight: 600 }}>
                  {selectedTx.user_name}
                </div>
                <div style={{ fontSize: 11.5, color: '#64748b' }}>{selectedTx.user_email}</div>
              </div>

              <div>
                <div style={{ fontSize: 11.5, color: '#64748b' }}>
                  Status
                </div>
                <div style={{ marginTop: 2 }}>
                  <span
                    className={`badge ${
                      selectedTx.status === 'SUCCESS' ? 'badge-verified' : 'badge-danger'
                    }`}
                  >
                    {formatTransactionStatus(selectedTx.status)}
                  </span>
                </div>
              </div>

              {selectedTx.beneficiary && (
                <>
                  <div>
                    <div style={{ fontSize: 11.5, color: '#64748b' }}>
                      Beneficiary account
                    </div>
                    <div style={{ fontSize: 13, color: '#0f172a', fontWeight: 600, marginTop: 2, fontFamily: 'monospace' }}>
                      {selectedTx.beneficiary.account_number}
                    </div>
                    <div style={{ fontSize: 11.5, color: '#64748b' }}>
                      {selectedTx.beneficiary.bank_name}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 11.5, color: '#64748b' }}>
                      Account name
                    </div>
                    <div style={{ fontSize: 13, color: '#0f172a', marginTop: 2 }}>
                      {selectedTx.beneficiary.account_name}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <button
                onClick={() => setSelectedTx(null)}
                className="btn-outline"
                style={{ fontSize: 13 }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
