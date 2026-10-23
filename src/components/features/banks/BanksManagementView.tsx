'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Building2, 
  Search, 
  Star, 
  Upload, 
  Check, 
  X, 
  Edit2, 
  Plus, 
  Trash2,
  ShieldCheck
} from 'lucide-react';
import { BankConfigItem, SettlementProvider } from '@/types/admin';

interface BanksManagementViewProps {
  banks: BankConfigItem[];
  onToggleCommon: (bankId: string, isCommon: boolean) => Promise<void>;
  onUpdateLogo: (bankId: string, logoUrl: string) => Promise<void>;
  onUpdateBank?: (bankId: string, updates: Partial<BankConfigItem>) => Promise<void>;
  onCreateBank?: (bankData: Omit<BankConfigItem, 'id'>) => Promise<void>;
  isLoading: boolean;
}

export default function BanksManagementView({
  banks,
  onToggleCommon,
  onUpdateLogo,
  onUpdateBank,
  onCreateBank,
  isLoading,
}: BanksManagementViewProps) {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState<'ALL' | 'paystack' | 'squad'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'COMMON' | 'STANDARD'>('ALL');

  // Popup Modal State
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedBank, setSelectedBank] = useState<BankConfigItem | null>(null);

  // Form Fields - strictly squad and paystack
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formProvider, setFormProvider] = useState<SettlementProvider>('paystack');
  const [formIsCommon, setFormIsCommon] = useState(false);
  const [formActive, setFormActive] = useState(true);
  const [formLogo, setFormLogo] = useState<string | null>(null);
  const [urlInputMode, setUrlInputMode] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when popup modal is active
  useEffect(() => {
    if (isPopupOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isPopupOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPopupOpen && !isSaving) {
        setIsPopupOpen(false);
      }
    };
    if (isPopupOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPopupOpen, isSaving]);

  // Filter banks
  const filtered = banks.filter((b) => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      b.name.toLowerCase().includes(q) ||
      b.code.toLowerCase().includes(q) ||
      (b.provider && b.provider.toLowerCase().includes(q));

    const matchProvider =
      providerFilter === 'ALL' ||
      (b.provider && b.provider.toLowerCase() === providerFilter.toLowerCase());

    const matchPriority =
      priorityFilter === 'ALL' ||
      (priorityFilter === 'COMMON' && b.is_common) ||
      (priorityFilter === 'STANDARD' && !b.is_common);

    return matchSearch && matchProvider && matchPriority;
  });

  const paystackCount = banks.filter((b) => b.provider?.toLowerCase() === 'paystack').length;
  const squadCount = banks.filter((b) => b.provider?.toLowerCase() === 'squad').length;
  const commonCount = banks.filter((b) => b.is_common).length;

  const handleOpenEdit = (bank: BankConfigItem) => {
    setSelectedBank(bank);
    setIsCreating(false);
    setFormName(bank.name);
    setFormCode(bank.code);
    setFormProvider(bank.provider === 'squad' ? 'squad' : 'paystack');
    setFormIsCommon(bank.is_common);
    setFormActive(bank.active !== undefined ? bank.active : true);
    setFormLogo(bank.logo || null);
    setUrlInputMode(false);
    setUrlInputValue(bank.logo || '');
    setIsPopupOpen(true);
  };

  const handleOpenCreate = () => {
    setSelectedBank(null);
    setIsCreating(true);
    setFormName('');
    setFormCode('');
    setFormProvider('paystack');
    setFormIsCommon(false);
    setFormActive(true);
    setFormLogo(null);
    setUrlInputMode(false);
    setUrlInputValue('');
    setIsPopupOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, SVG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormLogo(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleToggleCommonInline = async (e: React.MouseEvent, bank: BankConfigItem) => {
    e.stopPropagation();
    try {
      if (onUpdateBank) {
        await onUpdateBank(bank.id, { is_common: !bank.is_common });
      } else {
        await onToggleCommon(bank.id, !bank.is_common);
      }
    } catch (err) {
      console.error('Failed to toggle common bank:', err);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formName.trim()) {
      alert('Please enter a bank name.');
      return;
    }
    if (!formCode.trim()) {
      alert('Please enter a settlement route code.');
      return;
    }

    setIsSaving(true);
    try {
      const finalLogo = urlInputMode && urlInputValue.trim() ? urlInputValue.trim() : formLogo;

      if (isCreating) {
        if (onCreateBank) {
          await onCreateBank({
            name: formName.trim(),
            code: formCode.trim(),
            provider: formProvider,
            is_common: formIsCommon,
            active: formActive,
            logo: finalLogo,
          });
        }
      } else if (selectedBank) {
        if (onUpdateBank) {
          await onUpdateBank(selectedBank.id, {
            name: formName.trim(),
            code: formCode.trim(),
            provider: formProvider,
            is_common: formIsCommon,
            active: formActive,
            logo: finalLogo,
          });
        } else {
          if (selectedBank.is_common !== formIsCommon) {
            await onToggleCommon(selectedBank.id, formIsCommon);
          }
          if (finalLogo && finalLogo !== selectedBank.logo) {
            await onUpdateLogo(selectedBank.id, finalLogo);
          }
        }
      }
      setIsPopupOpen(false);
    } catch (err) {
      console.error('Failed to save bank route:', err);
      alert('Failed to save bank details.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header & Filter Highlights */}
      <div
        className="card-standard"
        style={{
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Settlement Bank Rails & Providers
            </h2>
            <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0 0' }}>
              Manage Squad and Paystack settlement routes, configure custom bank logos, and manage common bank priorities.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={handleOpenCreate}
              className="btn-primary"
              style={{ fontSize: 13, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Plus size={15} />
              <span>Add Settlement Route</span>
            </button>
          </div>
        </div>

        {/* Quick Filter Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, paddingTop: 4 }}>
          <div
            onClick={() => { setProviderFilter('ALL'); setPriorityFilter('ALL'); }}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--r-full)',
              background: providerFilter === 'ALL' && priorityFilter === 'ALL' ? '#0f172a' : '#f1f5f9',
              color: providerFilter === 'ALL' && priorityFilter === 'ALL' ? '#ffffff' : '#475569',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>All Rails</span>
            <span style={{ opacity: 0.75 }}>({banks.length})</span>
          </div>

          <div
            onClick={() => setProviderFilter('paystack')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--r-full)',
              background: providerFilter === 'paystack' ? '#059669' : '#ecfdf5',
              color: providerFilter === 'paystack' ? '#ffffff' : '#059669',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>Paystack Rails</span>
            <span style={{ opacity: 0.85 }}>({paystackCount})</span>
          </div>

          <div
            onClick={() => setProviderFilter('squad')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--r-full)',
              background: providerFilter === 'squad' ? '#2563eb' : '#eff6ff',
              color: providerFilter === 'squad' ? '#ffffff' : '#2563eb',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>Squad Rails</span>
            <span style={{ opacity: 0.85 }}>({squadCount})</span>
          </div>

          <div
            onClick={() => setPriorityFilter(priorityFilter === 'COMMON' ? 'ALL' : 'COMMON')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--r-full)',
              background: priorityFilter === 'COMMON' ? '#f59e0b' : '#fffbeb',
              color: priorityFilter === 'COMMON' ? '#ffffff' : '#d97706',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Star size={12} fill={priorityFilter === 'COMMON' ? '#ffffff' : '#d97706'} />
            <span>Pinned Common ({commonCount})</span>
          </div>
        </div>

        {/* Search & Provider Filter Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', paddingTop: 6 }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
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
              placeholder="Search bank name, route code (e.g. 999992), or provider..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: 34, fontSize: 13 }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value as any)}
              style={{ fontSize: 12.5, padding: '8px 12px' }}
            >
              <option value="ALL">All Providers</option>
              <option value="paystack">Paystack</option>
              <option value="squad">Squad</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              style={{ fontSize: 12.5, padding: '8px 12px' }}
            >
              <option value="ALL">All Priorities</option>
              <option value="COMMON">Common Only</option>
              <option value="STANDARD">Standard Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Settlement Banks Table */}
      <div className="card-standard" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table-standard" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)', fontSize: 12, color: '#64748b' }}>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Bank & Brand</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Route Code</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Settlement Provider</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Priority</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '48px 20px', textAlign: 'center', color: '#64748b' }}>
                    <Building2 size={32} style={{ margin: '0 auto 10px', color: '#94a3b8' }} />
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>No banks match your filters</div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>Try clearing your search term or provider selection.</div>
                  </td>
                </tr>
              ) : (
                filtered.map((bank) => {
                  const isSquad = bank.provider?.toLowerCase() === 'squad';

                  return (
                    <tr
                      key={bank.id}
                      onClick={() => handleOpenEdit(bank)}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        cursor: 'pointer',
                        transition: 'background var(--transition)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Bank Logo & Name */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 8,
                              background: '#ffffff',
                              border: '1px solid #e2e8f0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              overflow: 'hidden',
                              flexShrink: 0,
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
                            <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0f172a' }}>
                              {bank.name}
                            </div>
                            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>
                              ID: {bank.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Route Code */}
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontSize: 12,
                            fontWeight: 600,
                            background: '#f1f5f9',
                            color: '#334155',
                            padding: '3px 8px',
                            borderRadius: 4,
                          }}
                        >
                          {bank.code}
                        </span>
                      </td>

                      {/* Settlement Provider */}
                      <td style={{ padding: '14px 16px' }}>
                        {isSquad ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              padding: '3px 10px',
                              borderRadius: 'var(--r-full)',
                              fontSize: 11.5,
                              fontWeight: 600,
                              background: '#eff6ff',
                              color: '#2563eb',
                              border: '1px solid #bfdbfe',
                            }}
                          >
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563eb' }} />
                            <span>Squad</span>
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              padding: '3px 10px',
                              borderRadius: 'var(--r-full)',
                              fontSize: 11.5,
                              fontWeight: 600,
                              background: '#ecfdf5',
                              color: '#059669',
                              border: '1px solid #a7f3d0',
                            }}
                          >
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669' }} />
                            <span>Paystack</span>
                          </span>
                        )}
                      </td>

                      {/* Priority (Common) */}
                      <td style={{ padding: '14px 16px' }}>
                        <button
                          type="button"
                          onClick={(e) => handleToggleCommonInline(e, bank)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: 'var(--r-full)',
                            background: bank.is_common ? '#eff6ff' : '#f8fafc',
                            color: bank.is_common ? 'var(--primary)' : '#64748b',
                            border: bank.is_common ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                          title="Click to toggle common bank priority"
                        >
                          <Star
                            size={12}
                            fill={bank.is_common ? '#2563eb' : 'none'}
                            color={bank.is_common ? '#2563eb' : '#94a3b8'}
                          />
                          <span>{bank.is_common ? 'Common' : 'Standard'}</span>
                        </button>
                      </td>

                      {/* Active Status */}
                      <td style={{ padding: '14px 16px' }}>
                        {bank.active !== false ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              fontSize: 12,
                              color: 'var(--green)',
                              fontWeight: 500,
                            }}
                          >
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              fontSize: 12,
                              color: '#94a3b8',
                              fontWeight: 500,
                            }}
                          >
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#cbd5e1' }} />
                            <span>Disabled</span>
                          </span>
                        )}
                      </td>

                      {/* Manage Action */}
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(bank);
                          }}
                          className="btn-outline"
                          style={{
                            padding: '5px 12px',
                            fontSize: 12,
                            gap: 4,
                            borderRadius: 'var(--r-full)',
                          }}
                        >
                          <Edit2 size={12} />
                          <span>Manage</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border)',
            background: '#fafafa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 12,
            color: '#64748b',
          }}
        >
          <span>
            Showing <strong>{filtered.length}</strong> of <strong>{banks.length}</strong> settlement routes
          </span>
          <span>Click any bank row to edit its logo, name, route code, or provider.</span>
        </div>
      </div>

      {/* Pop up Modal with Full-Screen Backdrop Overlay via Portal */}
      {isPopupOpen && mounted && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 999999,
            background: 'rgba(15, 23, 42, 0.72)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 16px',
            boxSizing: 'border-box',
          }}
          onClick={() => !isSaving && setIsPopupOpen(false)}
        >
          {/* Centered Modal Popup Window */}
          <div
            className="animate-fade-in"
            style={{
              background: '#ffffff',
              borderRadius: 16,
              width: '100%',
              maxWidth: 560,
              maxHeight: '92vh',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5)',
              border: 'none',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
              }}
            >
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  {isCreating ? 'Add Settlement Bank' : 'Edit Settlement Bank'}
                </h3>
                <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0 0' }}>
                  {isCreating
                    ? 'Configure new settlement route and partner provider'
                    : 'Update bank logo, name, settlement provider, and priority'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => !isSaving && setIsPopupOpen(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#f1f5f9',
                  color: '#64748b',
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div
              style={{
                padding: '22px 24px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
                flex: 1,
              }}
            >
              {/* Bank Logo Upload Section */}
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a', display: 'block', marginBottom: 8 }}>
                  Bank Logo
                </label>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {/* Logo Preview Square */}
                  <div
                    style={{
                      width: 68,
                      height: 68,
                      borderRadius: 12,
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      position: 'relative',
                      flexShrink: 0,
                    }}
                  >
                    {formLogo ? (
                      <img
                        src={formLogo}
                        alt="Bank Logo Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <Building2 size={28} color="#94a3b8" />
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/png, image/jpeg, image/svg+xml, image/webp"
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-outline"
                        style={{ fontSize: 12.5, padding: '7px 14px', gap: 6 }}
                      >
                        <Upload size={14} />
                        <span>Upload New Image</span>
                      </button>

                      {formLogo && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormLogo(null);
                            setUrlInputValue('');
                          }}
                          style={{
                            fontSize: 12,
                            color: '#ef4444',
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            padding: '6px 10px',
                            borderRadius: 'var(--r-md)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={13} />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div style={{ fontSize: 11, color: '#64748b' }}>
                      PNG, JPG, SVG or WebP. Transparent backgrounds recommended.
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => setUrlInputMode(!urlInputMode)}
                        style={{
                          fontSize: 11.5,
                          color: 'var(--primary)',
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          textDecoration: 'underline',
                        }}
                      >
                        {urlInputMode ? 'Hide URL input' : 'Or paste image URL manually'}
                      </button>
                    </div>
                  </div>
                </div>

                {urlInputMode && (
                  <div style={{ marginTop: 10 }}>
                    <input
                      type="text"
                      placeholder="https://assets.paydora.africa/banks/..."
                      value={urlInputValue}
                      onChange={(e) => {
                        setUrlInputValue(e.target.value);
                        setFormLogo(e.target.value);
                      }}
                      style={{ width: '100%', fontSize: 12 }}
                    />
                  </div>
                )}
              </div>

              {/* Bank Name */}
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a', display: 'block', marginBottom: 6 }}>
                  Bank Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Opay (PayCom) or Access Bank"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  style={{ width: '100%', fontSize: 13 }}
                />
              </div>

              {/* Settlement Provider (strictly Squad or Paystack) */}
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a', display: 'block', marginBottom: 6 }}>
                  Settlement Provider
                </label>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {/* Paystack Option */}
                  <div
                    onClick={() => setFormProvider('paystack')}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--r-md)',
                      border: formProvider === 'paystack' ? '2px solid #059669' : '1px solid var(--border)',
                      background: formProvider === 'paystack' ? '#ecfdf5' : '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all var(--transition)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: formProvider === 'paystack' ? '#059669' : '#cbd5e1',
                        }}
                      />
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: formProvider === 'paystack' ? '#059669' : '#0f172a' }}>
                        Paystack
                      </span>
                    </div>
                    {formProvider === 'paystack' && <Check size={16} color="#059669" />}
                  </div>

                  {/* Squad Option */}
                  <div
                    onClick={() => setFormProvider('squad')}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--r-md)',
                      border: formProvider === 'squad' ? '2px solid #2563eb' : '1px solid var(--border)',
                      background: formProvider === 'squad' ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all var(--transition)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: formProvider === 'squad' ? '#2563eb' : '#cbd5e1',
                        }}
                      />
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: formProvider === 'squad' ? '#2563eb' : '#0f172a' }}>
                        Squad
                      </span>
                    </div>
                    {formProvider === 'squad' && <Check size={16} color="#2563eb" />}
                  </div>
                </div>
              </div>

              {/* Route Code */}
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a', display: 'block', marginBottom: 6 }}>
                  Settlement Route / CBN Bank Code
                </label>
                <input
                  type="text"
                  placeholder={formProvider === 'paystack' ? 'e.g. 999992 (Paystack OPay)' : 'e.g. 100004 (Squad OPay)'}
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  style={{ width: '100%', fontSize: 13, fontFamily: 'monospace' }}
                />
              </div>

              {/* Multi-provider callout */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: '10px 14px',
                  fontSize: 11.5,
                  color: '#475569',
                  lineHeight: 1.45,
                }}
              >
                💡 <strong>Multi-Provider Notice:</strong> You can have 2 banks with the same name from different providers (e.g. 2 OPay banks: one via <strong>Paystack</strong> and another via <strong>Squad</strong>).
              </div>

              {/* Toggles: Common & Active */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Common Bank Toggle */}
                <div
                  onClick={() => setFormIsCommon(!formIsCommon)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    cursor: 'pointer',
                    padding: '10px 12px',
                    borderRadius: 10,
                    background: formIsCommon ? '#eff6ff' : '#f8fafc',
                    border: formIsCommon ? '1px solid #bfdbfe' : '1px solid var(--border)',
                    transition: 'all var(--transition)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formIsCommon}
                    onChange={(e) => setFormIsCommon(e.target.checked)}
                    style={{ marginTop: 2, width: 16, height: 16, accentColor: 'var(--primary)' }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>Pin as Common Bank</span>
                      <Star size={13} fill={formIsCommon ? '#2563eb' : 'none'} color={formIsCommon ? '#2563eb' : '#94a3b8'} />
                    </div>
                    <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                      Pinned to the top of customer transfer dropdowns in the mobile app and dashboard.
                    </div>
                  </div>
                </div>

                {/* Active Route Toggle */}
                <div
                  onClick={() => setFormActive(!formActive)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    cursor: 'pointer',
                    padding: '10px 12px',
                    borderRadius: 10,
                    background: formActive ? '#f0fdf4' : '#f8fafc',
                    border: formActive ? '1px solid #bbf7d0' : '1px solid var(--border)',
                    transition: 'all var(--transition)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    style={{ marginTop: 2, width: 16, height: 16, accentColor: 'var(--green)' }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                      Active Settlement Rail
                    </div>
                    <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                      Enables outbound transfers and account verification through this bank route.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid var(--border)',
                background: '#fafafa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 10,
                flexShrink: 0,
              }}
            >
              <button
                type="button"
                onClick={() => !isSaving && setIsPopupOpen(false)}
                disabled={isSaving}
                className="btn-outline"
                style={{ fontSize: 13, padding: '8px 18px' }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleSave()}
                disabled={isSaving}
                className="btn-primary"
                style={{ fontSize: 13, padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Check size={15} />
                <span>{isSaving ? 'Saving Route...' : isCreating ? 'Create Route' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
