'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock, 
  X,
  Phone,
  Mail,
  Calendar
} from 'lucide-react';
import { KycReviewItem, KycStatus, formatKycStatus } from '@/types/admin';

interface KycReviewViewProps {
  items: KycReviewItem[];
  onUpdateStatus: (userId: string, status: KycStatus, reason?: string) => Promise<void>;
  isLoading: boolean;
  onSelectItem?: (item: KycReviewItem) => void;
}

export default function KycReviewView({ items, onUpdateStatus, isLoading, onSelectItem }: KycReviewViewProps) {
  const [filter, setFilter] = useState<KycStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<KycReviewItem | null>(null);
  const [rejectReason, setRejectReason] = useState('BVN name mismatch with registered account names.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredItems = items.filter((item) => {
    const matchesFilter = filter === 'ALL' || item.status === filter;
    const matchesSearch =
      item.full_name.toLowerCase().includes(search.toLowerCase()) ||
      item.email.toLowerCase().includes(search.toLowerCase()) ||
      (item.bvn && item.bvn.includes(search)) ||
      item.phone.includes(search);
    return matchesFilter && matchesSearch;
  });

  const handleApprove = async () => {
    if (!selectedItem) return;
    setIsSubmitting(true);
    await onUpdateStatus(selectedItem.user_id, 'verified');
    setIsSubmitting(false);
    setSelectedItem(null);
  };

  const handleReject = async () => {
    if (!selectedItem) return;
    setIsSubmitting(true);
    await onUpdateStatus(selectedItem.user_id, 'rejected', rejectReason);
    setIsSubmitting(false);
    setSelectedItem(null);
  };

  const handleMarkReview = async () => {
    if (!selectedItem) return;
    setIsSubmitting(true);
    await onUpdateStatus(selectedItem.user_id, 'under_review');
    setIsSubmitting(false);
    setSelectedItem(null);
  };

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
        {/* Status Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {(['ALL', 'under_review', 'pending', 'verified', 'rejected'] as (KycStatus | 'ALL')[]).map((st) => {
            const isActive = filter === st;
            const count = st === 'ALL' ? items.length : items.filter((i) => i.status === st).length;
            return (
              <button
                key={st}
                onClick={() => setFilter(st)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 'var(--r-full)',
                  fontSize: 12.5,
                  fontWeight: isActive ? 600 : 500,
                  background: isActive ? '#eff6ff' : 'transparent',
                  color: isActive ? 'var(--primary)' : '#64748b',
                  border: isActive ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  transition: 'all var(--transition)',
                }}
              >
                <span>{st === 'ALL' ? 'All' : formatKycStatus(st)}</span>
                <span
                  style={{
                    fontSize: 11,
                    background: isActive ? '#dbeafe' : '#f1f5f9',
                    padding: '1px 6px',
                    borderRadius: 10,
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
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
            placeholder="Search name, BVN, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: 34, fontSize: 13 }}
          />
        </div>
      </div>

      {/* Main Review Table Card */}
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
                <th style={{ padding: '14px 20px' }}>Applicant</th>
                <th style={{ padding: '14px 20px' }}>BVN / NIN</th>
                <th style={{ padding: '14px 20px' }}>Date of Birth</th>
                <th style={{ padding: '14px 20px' }}>Status</th>
                <th style={{ padding: '14px 20px' }}>Submitted</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    cursor: 'pointer',
                    transition: 'background var(--transition)',
                  }}
                  onClick={() => {
                    if (onSelectItem) {
                      onSelectItem(item);
                    } else {
                      setSelectedItem(item);
                    }
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.full_name}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      {item.email} &bull; {item.phone}
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', fontFamily: 'monospace' }}>
                    <div style={{ color: '#0f172a', fontWeight: 500 }}>BVN: {item.bvn || 'Not provided'}</div>
                    {item.nin && <div style={{ fontSize: 11, color: '#64748b' }}>NIN: {item.nin}</div>}
                  </td>
                  <td style={{ padding: '14px 20px', color: '#475569' }}>
                    {item.dob || '—'}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
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
                  </td>
                  <td style={{ padding: '14px 20px', color: '#64748b', fontSize: 12 }}>
                    {new Date(item.submitted_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <button
                      className="btn-outline"
                      style={{ padding: '6px 14px', fontSize: 12 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectItem) {
                          onSelectItem(item);
                        } else {
                          setSelectedItem(item);
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

      {/* Review Modal */}
      {selectedItem && (
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
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="animate-fade-in"
            style={{
              width: '100%',
              maxWidth: 580,
              background: '#ffffff',
              borderRadius: 'var(--r-lg)',
              border: 'none',
              boxShadow: 'none',
              padding: '28px',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="badge badge-info" style={{ marginBottom: 6 }}>
                  KYC Compliance Review
                </span>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  {selectedItem.full_name}
                </h2>
                <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0 0' }}>
                  User ID: {selectedItem.user_id}
                </p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                style={{ padding: 6, borderRadius: '50%', color: '#64748b', background: '#f8fafc' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Applicant Metadata Grid */}
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
                  Bank Verification Number (BVN)
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginTop: 2, fontFamily: 'monospace' }}>
                  {selectedItem.bvn || 'Not Submitted'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11.5, color: '#64748b' }}>
                  National Identity (NIN)
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginTop: 2, fontFamily: 'monospace' }}>
                  {selectedItem.nin || 'Not Submitted'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11.5, color: '#64748b' }}>
                  Phone & delivery channel
                </div>
                <div style={{ fontSize: 13, color: '#0f172a', marginTop: 2 }}>
                  {selectedItem.phone} ({selectedItem.channel || 'SMS'})
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11.5, color: '#64748b' }}>
                  Date of birth
                </div>
                <div style={{ fontSize: 13, color: '#0f172a', marginTop: 2 }}>
                  {selectedItem.dob || '—'}
                </div>
              </div>
            </div>

            {/* Current Status Banner */}
            <div
              style={{
                marginTop: 16,
                padding: '12px 14px',
                borderRadius: 'var(--r-md)',
                background:
                  selectedItem.status === 'verified'
                    ? 'var(--green-bg)'
                    : selectedItem.status === 'rejected'
                    ? 'var(--red-bg)'
                    : 'var(--yellow-bg)',
                border: `1px solid ${
                  selectedItem.status === 'verified'
                    ? '#bbf7d0'
                    : selectedItem.status === 'rejected'
                    ? '#fecaca'
                    : '#fde68a'
                }`,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                Current Status: {selectedItem.status.toUpperCase()}
              </div>
              {selectedItem.rejection_reason && (
                <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 4 }}>
                  <strong>Prior Rejection Reason:</strong> {selectedItem.rejection_reason}
                </div>
              )}
            </div>

            {/* Decision Section */}
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>
                Compliance Decision
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>
                  Rejection Reason (if rejecting):
                </label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  style={{ width: '100%', marginBottom: 8 }}
                >
                  <option value="BVN name mismatch with registered account names.">
                    BVN name mismatch with registered account names
                  </option>
                  <option value="Official Date of Birth does not match BVN registry.">
                    Official Date of Birth does not match BVN registry
                  </option>
                  <option value="Unregistered or blocked BVN record.">
                    Unregistered or blocked BVN record
                  </option>
                  <option value="Suspected fraud or multiple identity collision.">
                    Suspected fraud or multiple identity collision
                  </option>
                </select>
                <input
                  type="text"
                  placeholder="Or enter custom rejection reason..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                <button
                  type="button"
                  onClick={handleMarkReview}
                  disabled={isSubmitting}
                  className="btn-outline"
                  style={{ fontSize: 13 }}
                >
                  Keep Under Review
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={isSubmitting}
                  className="btn-danger"
                  style={{ fontSize: 13 }}
                >
                  <XCircle size={15} />
                  <span>Reject Application</span>
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="btn-success"
                  style={{ fontSize: 13 }}
                >
                  <CheckCircle size={15} />
                  <span>Approve & Verify</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
