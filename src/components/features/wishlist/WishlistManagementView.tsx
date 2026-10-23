'use client';

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  TrendingUp, 
  Search, 
  Download, 
  Mail,
  User,
  AtSign,
  Calendar
} from 'lucide-react';
import { CardWishlistItem, WealthWishlistItem, WishlistSubTab } from '@/types/admin';

interface WishlistManagementViewProps {
  activeSubTab?: WishlistSubTab;
  onSubTabChange?: (tab: WishlistSubTab) => void;
  cardWishlist: CardWishlistItem[];
  wealthWishlist: WealthWishlistItem[];
  onUpdateStatus?: (type: 'card' | 'wealth', id: string, status: string) => Promise<void>;
  onRemoveEntry?: (type: 'card' | 'wealth', id: string) => Promise<void>;
  onShowToast?: (msg: string) => void;
  isLoading?: boolean;
}

export default function WishlistManagementView({
  activeSubTab = 'card',
  onSubTabChange,
  cardWishlist,
  wealthWishlist,
  onShowToast,
  isLoading = false,
}: WishlistManagementViewProps) {
  const [localSubTab, setLocalSubTab] = useState<WishlistSubTab>(activeSubTab);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (activeSubTab) {
      setLocalSubTab(activeSubTab);
    }
  }, [activeSubTab]);

  const handleTabSwitch = (tab: WishlistSubTab) => {
    setLocalSubTab(tab);
    onSubTabChange?.(tab);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Filtered lists (name, username, email searching)
  const currentList = localSubTab === 'card' ? cardWishlist : wealthWishlist;

  const filteredList = currentList.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.username && item.username.toLowerCase().includes(q)) ||
      (item.email && item.email.toLowerCase().includes(q))
    );
  });

  const handleExportCsv = () => {
    if (filteredList.length === 0) {
      alert('No records available to export.');
      return;
    }

    const headers = ['Name', 'Username', 'Email', 'Date Joined'];
    const rows = filteredList.map((item) => [
      `"${(item.name || '').replace(/"/g, '""')}"`,
      `"${(item.username || '').replace(/"/g, '""')}"`,
      `"${(item.email || '').replace(/"/g, '""')}"`,
      `"${formatDate(item.joined_at || item.created_at)}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `paydora_${localSubTab}_wishlist_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast?.(`Exported ${filteredList.length} records to CSV`);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Sub-Tab Navigation Header */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: 14,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {[
            { id: 'card' as const, label: 'Card Wishlist', icon: <CreditCard size={15} />, count: cardWishlist.length },
            { id: 'wealth' as const, label: 'Wealth Wishlist', icon: <TrendingUp size={15} />, count: wealthWishlist.length },
          ].map((tab) => {
            const isActive = localSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabSwitch(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  borderRadius: 'var(--r-full)',
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  border: 'none',
                  background: isActive ? 'var(--primary)' : '#ffffff',
                  color: isActive ? '#ffffff' : '#64748b',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 1px 3px rgba(37, 99, 235, 0.2)' : 'none',
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: 'var(--r-full)',
                    background: isActive ? 'rgba(255, 255, 255, 0.25)' : '#f1f5f9',
                    color: isActive ? '#ffffff' : '#475569',
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="btn-outline"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: 12.5 }}
        >
          <Download size={14} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Search Bar */}
      <div
        className="card-standard"
        style={{
          background: 'var(--bg-white)',
          padding: '14px 18px',
          borderRadius: 'var(--r-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
        }}
      >
        <div style={{ position: 'relative', width: '100%', maxWidth: 380 }}>
          <Search
            size={15}
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
            placeholder={`Search ${localSubTab === 'card' ? 'Card' : 'Wealth'} wishlist by name, username, email...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: 34,
              paddingRight: 12,
              paddingTop: 8,
              paddingBottom: 8,
              fontSize: 13,
              borderRadius: 'var(--r-md)',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
            }}
          />
        </div>

        <div style={{ fontSize: 12.5, color: '#64748b', fontWeight: 500 }}>
          Showing <span style={{ fontWeight: 700, color: '#0f172a' }}>{filteredList.length}</span> {localSubTab === 'card' ? 'card' : 'wealth'} subscribers
        </div>
      </div>

      {/* Main Table: Name, Username, Email, Date Joined */}
      <div
        className="card-standard"
        style={{
          background: 'var(--bg-white)',
          borderRadius: 'var(--r-lg)',
          overflow: 'hidden',
          padding: 0,
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                <th style={{ padding: '14px 20px', fontWeight: 600, width: '28%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <User size={14} style={{ color: '#94a3b8' }} />
                    <span>Name</span>
                  </div>
                </th>
                <th style={{ padding: '14px 20px', fontWeight: 600, width: '22%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AtSign size={14} style={{ color: '#94a3b8' }} />
                    <span>Username</span>
                  </div>
                </th>
                <th style={{ padding: '14px 20px', fontWeight: 600, width: '28%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Mail size={14} style={{ color: '#94a3b8' }} />
                    <span>Email</span>
                  </div>
                </th>
                <th style={{ padding: '14px 20px', fontWeight: 600, width: '22%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={14} style={{ color: '#94a3b8' }} />
                    <span>Date Joined</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                    Loading waitlist subscribers...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '48px 20px', textAlign: 'center', color: '#94a3b8' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <User size={24} style={{ color: '#cbd5e1' }} />
                      <div style={{ fontSize: 13.5, fontWeight: 500, color: '#64748b' }}>
                        No subscribers found in {localSubTab === 'card' ? 'Card Wishlist' : 'Wealth Wishlist'}
                      </div>
                      {searchQuery && (
                        <div style={{ fontSize: 12, color: '#94a3b8' }}>
                          Try adjusting your search query "{searchQuery}"
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr 
                    key={item.id} 
                    style={{ 
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    {/* Name Column */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: '50%',
                            background: localSubTab === 'card' ? '#eff6ff' : '#f0fdf4',
                            color: localSubTab === 'card' ? 'var(--primary)' : '#16a34a',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: 13,
                            flexShrink: 0,
                          }}
                        >
                          {item.name ? item.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <span style={{ fontWeight: 600, color: '#0f172a', fontSize: 13.5 }}>
                          {item.name || 'Paydora User'}
                        </span>
                      </div>
                    </td>

                    {/* Username Column */}
                    <td style={{ padding: '14px 20px' }}>
                      {item.username ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '3px 8px',
                            borderRadius: 'var(--r-md)',
                            background: '#f1f5f9',
                            color: '#334155',
                            fontSize: 12,
                            fontWeight: 600,
                            fontFamily: 'monospace',
                            letterSpacing: '-0.2px',
                          }}
                        >
                          @{item.username.replace(/^@/, '')}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: 12 }}>—</span>
                      )}
                    </td>

                    {/* Email Column */}
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ color: '#334155', fontSize: 13, fontWeight: 500 }}>
                        {item.email}
                      </span>
                    </td>

                    {/* Date Joined Column */}
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ color: '#64748b', fontSize: 12.5, fontWeight: 500 }}>
                        {formatDate(item.joined_at || item.created_at)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
