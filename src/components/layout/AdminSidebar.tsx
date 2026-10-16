'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Users, 
  ReceiptText, 
  Mail, 
  Building2, 
  Settings, 
  LogOut,
  MessageCircle
} from 'lucide-react';
import { AdminUser } from '@/types/admin';

export type AdminTab = 
  | 'overview' 
  | 'kyc' 
  | 'users' 
  | 'transactions' 
  | 'broadcast' 
  | 'whatsapp'
  | 'banks' 
  | 'settings';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  admin: AdminUser | null;
  onLogout: () => void;
  pendingKycCount: number;
  blockedUsersCount: number;
  whatsappUnreadCount?: number;
}

export default function AdminSidebar({
  activeTab,
  onTabChange,
  admin,
  onLogout,
  pendingKycCount,
  blockedUsersCount,
  whatsappUnreadCount = 0,
}: AdminSidebarProps) {
  const navItems: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    {
      id: 'overview',
      label: 'Home Overview',
      icon: <LayoutDashboard size={18} />,
    },
    {
      id: 'kyc',
      label: 'KYC Compliance',
      icon: <ShieldCheck size={18} />,
      badge: pendingKycCount,
      badgeColor: '#d97706',
    },
    {
      id: 'users',
      label: 'User Directory',
      icon: <Users size={18} />,
      badge: blockedUsersCount > 0 ? blockedUsersCount : undefined,
      badgeColor: '#dc2626',
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: <ReceiptText size={18} />,
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp Desk',
      icon: <MessageCircle size={18} />,
      badge: whatsappUnreadCount > 0 ? whatsappUnreadCount : undefined,
      badgeColor: '#16a34a',
    },
    {
      id: 'broadcast',
      label: 'Broadcast & Mail',
      icon: <Mail size={18} />,
    },
    {
      id: 'banks',
      label: 'Banks & Settlement',
      icon: <Building2 size={18} />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings size={18} />,
    },
  ];

  return (
    <aside
      style={{
        width: 'var(--sidebar-w)',
        flexShrink: 0,
        height: '100%',
        background: 'var(--bg-white)',
        borderRight: '1px solid rgb(240, 242, 245)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        padding: '16px',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Navigation List */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: 'var(--r-md)',
                background: isActive ? '#eff6ff' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                width: '100%',
                textAlign: 'left',
                border: 'none',
                cursor: 'pointer',
                transition: 'all var(--transition)',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.color = '#0f172a';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    color: isActive ? 'var(--primary)' : '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {item.icon}
                </span>
                <span style={{ fontSize: '0.875rem' }}>{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: 'var(--r-full)',
                    background: item.badgeColor ? `${item.badgeColor}18` : '#f1f5f9',
                    color: item.badgeColor || '#64748b',
                    border: `1px solid ${item.badgeColor ? `${item.badgeColor}40` : '#e2e8f0'}`,
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: 16,
          borderTop: '1px solid rgb(240, 242, 245)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 6px' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 12,
              flexShrink: 0,
            }}
          >
            {admin?.name?.charAt(0) || 'A'}
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {admin?.name || 'Administrator'}
            </div>
            <div style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {admin?.email || 'admin@paydora.africa'}
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            borderRadius: 'var(--r-md)',
            color: '#dc2626',
            fontSize: 12.5,
            fontWeight: 500,
            background: '#fef2f2',
            border: '1px solid #fee2e2',
            cursor: 'pointer',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#fecaca')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#fef2f2')}
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
