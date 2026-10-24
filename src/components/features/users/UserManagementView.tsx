'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  X 
} from 'lucide-react';
import { UserAccount } from '@/types/admin';

interface UserManagementViewProps {
  users: UserAccount[];
  onToggleBlock: (userId: string, isBlocked: boolean, reason?: string) => Promise<void>;
  isLoading: boolean;
  onSelectUser?: (user: UserAccount) => void;
}

export default function UserManagementView({ users, onToggleBlock, isLoading, onSelectUser }: UserManagementViewProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'BLOCKED'>('ALL');
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [blockReason, setBlockReason] = useState('Suspicious velocity or disputed transaction activity.');
  const [isUpdating, setIsUpdating] = useState(false);

  const filteredUsers = users.filter((u) => {
    // Only regular customers, never administrative team accounts
    if ((u as any).is_admin || (u.role && u.role !== 'user')) return false;

    const matchesFilter =
      filter === 'ALL' ||
      (filter === 'ACTIVE' && !u.is_blocked) ||
      (filter === 'BLOCKED' && u.is_blocked);
    const q = search.toLowerCase();
    const matchesSearch =
      u.email.toLowerCase().includes(q) ||
      u.first_name.toLowerCase().includes(q) ||
      u.last_name.toLowerCase().includes(q) ||
      u.phone.includes(q) ||
      u.username.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const handleBlockAction = async (isBlocked: boolean) => {
    if (!selectedUser) return;
    setIsUpdating(true);
    await onToggleBlock(selectedUser.id, isBlocked, isBlocked ? blockReason : undefined);
    setIsUpdating(false);
    setSelectedUser(null);
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
        <div style={{ display: 'flex', gap: 8 }}>
          {(['ALL', 'ACTIVE', 'BLOCKED'] as const).map((tab) => {
            const isActive = filter === tab;
            const count =
              tab === 'ALL'
                ? users.length
                : tab === 'ACTIVE'
                ? users.filter((u) => !u.is_blocked).length
                : users.filter((u) => u.is_blocked).length;
            const label = tab === 'ALL' ? 'All users' : tab === 'ACTIVE' ? 'Active users' : 'Blocked users';

            return (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
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
                <span>{label}</span>
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
            placeholder="Search username, phone, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: 34, fontSize: 13 }}
          />
        </div>
      </div>

      {/* Users Table */}
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
                <th style={{ padding: '14px 20px' }}>User / Handle</th>
                <th style={{ padding: '14px 20px' }}>Contact</th>
                <th style={{ padding: '14px 20px' }}>Wallet Balance</th>
                <th style={{ padding: '14px 20px' }}>Dedicated Account</th>
                <th style={{ padding: '14px 20px' }}>Status</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr
                  key={u.id}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    cursor: 'pointer',
                    transition: 'background var(--transition)',
                  }}
                  onClick={() => {
                    if (onSelectUser) {
                      onSelectUser(u);
                    } else {
                      setSelectedUser(u);
                    }
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>
                      {u.first_name} {u.last_name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--primary)' }}>@{u.username}</div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ color: '#0f172a' }}>{u.email}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{u.phone}</div>
                  </td>
                  <td style={{ padding: '14px 20px', fontWeight: 600, color: '#0f172a' }}>
                    ₦{u.balance_ngn.toLocaleString()}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    {u.virtual_account ? (
                      <div>
                        <div style={{ fontFamily: 'monospace', color: '#0f172a', fontWeight: 500 }}>
                          {u.virtual_account.account_number}
                        </div>
                        <div style={{ fontSize: 11.5, color: '#64748b' }}>
                          {u.virtual_account.bank_name}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: 12 }}>None assigned</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    {u.is_blocked ? (
                      <span className="badge badge-danger">Blocked</span>
                    ) : (
                      <span className="badge badge-verified">Active</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <button
                      className="btn-outline"
                      style={{ padding: '6px 14px', fontSize: 12 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectUser) {
                          onSelectUser(u);
                        } else {
                          setSelectedUser(u);
                        }
                      }}
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Manage Modal */}
      {selectedUser && (
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
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="animate-fade-in"
            style={{
              width: '100%',
              maxWidth: 540,
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
                <span className="badge badge-info">Account ID: {selectedUser.id}</span>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: '6px 0 2px 0' }}>
                  {selectedUser.first_name} {selectedUser.last_name}
                </h2>
                <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
                  @{selectedUser.username} &bull; {selectedUser.email}
                </p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                style={{ padding: 6, borderRadius: '50%', color: '#64748b', background: '#f8fafc' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Financial Overview */}
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
                  Wallet balance
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                  ₦{selectedUser.balance_ngn.toLocaleString()}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11.5, color: '#64748b' }}>
                  Assigned dedicated account
                </div>
                <div style={{ fontSize: 13, color: '#0f172a', fontWeight: 600, marginTop: 2, fontFamily: 'monospace' }}>
                  {selectedUser.virtual_account?.account_number || 'None'}
                </div>
                <div style={{ fontSize: 11, color: '#64748b' }}>
                  {selectedUser.virtual_account?.bank_name}
                </div>
              </div>
            </div>

            {/* Block Scenario Review Section */}
            <div
              style={{
                marginTop: 18,
                padding: '16px',
                borderRadius: 'var(--r-md)',
                background: selectedUser.is_blocked ? 'var(--red-bg)' : '#f8fafc',
                border: selectedUser.is_blocked
                  ? '1px solid #fecaca'
                  : '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                {selectedUser.is_blocked ? (
                  <>
                    <ShieldAlert size={18} color="var(--red)" />
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--red)' }}>
                      Account Blocked & Restricted
                    </span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} color="var(--green)" />
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--green)' }}>
                      Account In Good Standing
                    </span>
                  </>
                )}
              </div>

              {selectedUser.is_blocked && (
                <div style={{ fontSize: 12.5, color: '#991b1b', marginBottom: 12 }}>
                  <strong>Reason on Record:</strong> {selectedUser.blocked_reason || 'Administrative restriction.'}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                {selectedUser.is_blocked ? (
                  <button
                    onClick={() => handleBlockAction(false)}
                    disabled={isUpdating}
                    className="btn-success"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <Unlock size={15} />
                    <span>Resolve & Unblock Account</span>
                  </button>
                ) : (
                  <div style={{ width: '100%' }}>
                    <input
                      type="text"
                      placeholder="Specify reason for restriction..."
                      value={blockReason}
                      onChange={(e) => setBlockReason(e.target.value)}
                      style={{ width: '100%', marginBottom: 10, fontSize: 12.5 }}
                    />
                    <button
                      onClick={() => handleBlockAction(true)}
                      disabled={isUpdating}
                      className="btn-danger"
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      <Lock size={15} />
                      <span>Restrict & Block Account</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
