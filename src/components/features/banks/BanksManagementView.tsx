'use client';

import React, { useState } from 'react';
import { Building2, Search, Star, Image as ImageIcon, Check } from 'lucide-react';
import { BankConfigItem } from '@/types/admin';

interface BanksManagementViewProps {
  banks: BankConfigItem[];
  onToggleCommon: (bankId: string, isCommon: boolean) => Promise<void>;
  onUpdateLogo: (bankId: string, logoUrl: string) => Promise<void>;
  isLoading: boolean;
}

export default function BanksManagementView({
  banks,
  onToggleCommon,
  onUpdateLogo,
  isLoading,
}: BanksManagementViewProps) {
  const [search, setSearch] = useState('');
  const [editingLogoId, setEditingLogoId] = useState<string | null>(null);
  const [logoInput, setLogoInput] = useState('');

  const filtered = banks.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.code.includes(search)
  );

  const handleSaveLogo = async (bankId: string) => {
    if (!logoInput) return;
    await onUpdateLogo(bankId, logoInput);
    setEditingLogoId(null);
    setLogoInput('');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Banner */}
      <div
        className="card-standard"
        style={{
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Settlement Bank Rails & Priority
          </h2>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0 0' }}>
            Banks pinned as &ldquo;Common&rdquo; are prioritized at the top of transfer dropdowns in the mobile app and customer dashboard.
          </p>
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
            placeholder="Search bank name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: 34, fontSize: 13 }}
          />
        </div>
      </div>

      {/* Banks Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
          gap: 16,
        }}
      >
        {filtered.map((bank) => (
          <div
            key={bank.id}
            className="card-standard"
            style={{
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 14,
              border: 'none',
              background: bank.is_common ? '#eff6ff' : '#ffffff',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 8,
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {bank.logo ? (
                    <img
                      src={bank.logo}
                      alt={bank.name}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <Building2 size={18} color="#94a3b8" />
                  )}
                </div>

                <div>
                  <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 14 }}>{bank.name}</div>
                  <div style={{ fontSize: 11.5, color: '#64748b', fontFamily: 'monospace' }}>
                    Code: {bank.code}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onToggleCommon(bank.id, !bank.is_common)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 'var(--r-full)',
                  background: bank.is_common ? '#ffffff' : '#f8fafc',
                  color: bank.is_common ? 'var(--primary)' : '#64748b',
                  border: bank.is_common
                    ? '1px solid #bfdbfe'
                    : '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Star
                  size={13}
                  fill={bank.is_common ? '#2563eb' : 'none'}
                  color={bank.is_common ? '#2563eb' : 'currentColor'}
                />
                <span>{bank.is_common ? 'Common' : 'Normal'}</span>
              </button>
            </div>

            {/* Logo Editing Tray */}
            {editingLogoId === bank.id ? (
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <input
                  type="text"
                  placeholder="https://... logo url"
                  value={logoInput}
                  onChange={(e) => setLogoInput(e.target.value)}
                  style={{ flex: 1, fontSize: 12, padding: '6px 10px' }}
                />
                <button
                  onClick={() => handleSaveLogo(bank.id)}
                  className="btn-primary"
                  style={{ padding: '6px 12px', fontSize: 12 }}
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => setEditingLogoId(null)}
                  className="btn-outline"
                  style={{ padding: '6px 10px', fontSize: 12 }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setEditingLogoId(bank.id);
                    setLogoInput(bank.logo || '');
                  }}
                  style={{
                    fontSize: 11.5,
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
                >
                  <ImageIcon size={13} />
                  <span>{bank.logo ? 'Change Logo' : 'Assign Logo'}</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
