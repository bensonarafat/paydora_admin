'use client';

import React from 'react';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { AdminTab } from './AdminSidebar';
import { AdminUser } from '@/types/admin';

interface AdminHeaderProps {
  activeTab: AdminTab;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onQuickAction?: (action: 'broadcast' | 'kyc_reminder') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  admin: AdminUser | null;
}

export default function AdminHeader({
  activeTab,
  searchQuery,
  onSearchChange,
  admin,
}: AdminHeaderProps) {
  const getTabTitle = (tab: AdminTab) => {
    switch (tab) {
      case 'overview':
        return { title: 'Executive Overview', subtitle: 'Live telemetry, operational volume, and queue processing' };
      case 'kyc':
        return { title: 'Identity & KYC Review', subtitle: 'Verify BVN, NIN, DOB records and enforce compliance limits' };
      case 'users':
        return { title: 'User Account Directory', subtitle: 'Inspect profiles, wallets, tiers, and manage account restrictions' };
      case 'transactions':
        return { title: 'Balance Transactions', subtitle: 'Track incoming and outgoing transfers, receipts, and settlement history' };
      case 'broadcast':
        return { title: 'Broadcast Communications', subtitle: 'Dispatch transactional announcements & scheduled KYC reminders' };
      case 'whatsapp':
        return { title: 'WhatsApp Live Desk', subtitle: 'Real-time WebSocket customer care & WhatsApp Cloud API replies' };
      case 'banks':
        return { title: 'Bank Settlement Rails', subtitle: 'Manage active settlement routes, bank logos, and priority sorting' };
      case 'settings':
        return { title: 'Settings & Security', subtitle: 'Manage administrative API keys, audit logs, and operator permissions' };
    }
  };

  const info = getTabTitle(activeTab);

  return (
    <header
      style={{
        height: 'var(--topbar-h)',
        background: 'var(--bg-white)',
        borderBottom: '1px solid rgb(240, 242, 245)',
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
        zIndex: 50,
        width: '100%',
      }}
    >
      {/* Exact Logo Area matching Paydora Dashboard Topbar */}
      <div
        style={{
          width: 'var(--sidebar-w)',
          flexShrink: 0,
          padding: '0 16px',
          borderRight: '1px solid rgb(240, 242, 245)',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Image
            src="/icon.png"
            alt="Paydora Logo"
            width={28}
            height={28}
            style={{ borderRadius: 6, objectFit: 'contain' }}
            priority
          />
          <span
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.6px',
              lineHeight: 1,
            }}
          >
            Paydora
          </span>
        </div>
      </div>

      {/* Main Topbar Content Header Area */}
      <div
        style={{
          flex: 1,
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minWidth: 0,
        }}
      >
        {/* Title & Subtitle */}
        <div style={{ minWidth: 0, paddingRight: 16 }}>
          <h1
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: '#0f172a',
              letterSpacing: '-0.02em',
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {info.title}
          </h1>
          <p
            style={{
              fontSize: 12.5,
              color: '#64748b',
              margin: 0,
              marginTop: 3,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {info.subtitle}
          </p>
        </div>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          {/* Search Input */}
          <div style={{ position: 'relative', width: 220 }}>
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
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: 34,
                paddingRight: 12,
                paddingTop: 8,
                paddingBottom: 8,
                fontSize: 12.5,
                borderRadius: 'var(--r-md)',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                color: '#0f172a',
              }}
            />
          </div>

          {/* Admin Avatar Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              padding: '5px 12px 5px 6px',
              borderRadius: 'var(--r-full)',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: '#2563eb',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              {admin?.name?.charAt(0) || 'A'}
            </div>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a' }}>
              {admin?.name?.split(' ')[0] || 'Admin'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
