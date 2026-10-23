'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { 
  Search, 
  ChevronDown, 
  Settings, 
  MessageCircle, 
  ShieldCheck, 
  Mail, 
  LogOut 
} from 'lucide-react';
import { AdminTab } from './AdminSidebar';
import { AdminUser, BillsSubTab, LogsSubTab, SettingsSubTab, WishlistSubTab } from '@/types/admin';

interface AdminHeaderProps {
  activeTab: AdminTab;
  wishlistSubTab?: WishlistSubTab;
  billsSubTab?: BillsSubTab;
  logsSubTab?: LogsSubTab;
  settingsSubTab?: SettingsSubTab;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onQuickAction?: (action: 'broadcast' | 'kyc_reminder') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  admin: AdminUser | null;
  onNavigateTab?: (tab: AdminTab) => void;
  onLogout?: () => void;
}

export default function AdminHeader({
  activeTab,
  wishlistSubTab = 'card',
  billsSubTab = 'categories',
  logsSubTab = 'system',
  settingsSubTab = 'profile',
  searchQuery,
  onSearchChange,
  admin,
  onNavigateTab,
  onLogout,
}: AdminHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const getTabTitle = (tab: AdminTab) => {
    switch (tab) {
      case 'overview':
        return { title: 'Executive Overview', subtitle: 'Live telemetry, operational volume, and queue processing' };
      case 'kyc':
        return { title: 'Identity & KYC Review', subtitle: 'Verify BVN, NIN, DOB records and enforce compliance limits' };
      case 'users':
        return { title: 'Users', subtitle: 'Inspect customer profiles, wallets, and manage account restrictions' };
      case 'wishlist':
        if (wishlistSubTab === 'wealth') {
          return {
            title: 'Wealth & Investment Waitlist',
            subtitle: 'Manage user reservations for Paydora Wealth, high-yield savings, and portfolio early access',
          };
        }
        return {
          title: 'Card Wishlist & Priority Access',
          subtitle: 'Track physical and virtual debit card waitlist subscribers, tier preferences, and beta invitations',
        };
      case 'transactions':
        return { title: 'Balance Transactions', subtitle: 'Track incoming and outgoing transfers, receipts, and settlement history' };
      case 'bills':
        if (billsSubTab === 'billers') {
          return { title: 'Standard Billers', subtitle: 'Manage telecom operators, utility companies, logos, and commission rates' };
        }
        if (billsSubTab === 'products') {
          return { title: 'Biller Products & Packages', subtitle: 'Configure data plans, TV bouquets, validity periods, and hot deals' };
        }
        return { title: 'Bill Categories & Routing', subtitle: 'Configure bill service categories, icons, cashback %, and validation rules' };
      case 'broadcast':
        return { title: 'Broadcast Communications', subtitle: 'Dispatch push notifications and transactional announcements' };
      case 'whatsapp':
        return { title: 'WhatsApp', subtitle: 'Real-time WebSocket customer care & WhatsApp Cloud API replies' };
      case 'banks':
        return { title: 'Bank Settlement Rails', subtitle: 'Manage active settlement routes, bank logos, and priority sorting' };
      case 'logs':
        if (logsSubTab === 'jobs') {
          return { title: 'Background Jobs & Queue', subtitle: 'Monitor BullMQ worker queues, delayed tasks, retries, and scheduled crons' };
        }
        if (logsSubTab === 'sms') {
          return { title: 'SMS & WhatsApp Delivery', subtitle: 'Track Termii SMS delivery reports, OTP dispatches, units consumed, and delivery status' };
        }
        if (logsSubTab === 'email') {
          return { title: 'Email Dispatch Logs', subtitle: 'Transactional receipt & broadcast email delivery, bounces, and open rates' };
        }
        if (logsSubTab === 'webhooks') {
          return { title: 'Webhook Ingestion Logs', subtitle: 'Incoming partner callbacks from Squad, Paystack, Termii, and Meta WhatsApp' };
        }
        if (logsSubTab === 'audit') {
          return { title: 'Security & Audit Trail', subtitle: 'Chronological activity history of admin operators, role changes, and balance overrides' };
        }
        return { title: 'System & API Logs', subtitle: 'Real-time HTTP requests, response latencies, server exceptions, and stack traces' };
      case 'settings':
        if (settingsSubTab === 'profile') {
          return { title: 'Admin Profile', subtitle: 'Manage operator account credentials, personal info, and active session details' };
        }
        if (settingsSubTab === 'security') {
          return { title: 'Security & Access Control', subtitle: 'Administrative API keys, password policy, 2FA enforcement, and IP whitelist' };
        }
        if (settingsSubTab === 'teams') {
          return { title: 'Team Members & RBAC', subtitle: 'Manage team operators, compliance officers, and role-based operational permissions' };
        }
        if (settingsSubTab === 'config') {
          return { title: 'App Configuration', subtitle: 'Fintech platform parameters, maintenance mode, daily limits, and settlement routing' };
        }
        return { title: 'Settings & Security', subtitle: 'Manage administrative API keys, team permissions, and app configurations' };
      default:
        return { title: 'Admin Console', subtitle: 'Paydora Operational Intelligence & Settlement' };
    }
  };

  const info = getTabTitle(activeTab) || { title: 'Admin Console', subtitle: 'Paydora Operational Intelligence & Settlement' };

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

          {/* Admin Avatar Pill & Dropdown */}
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '5px 12px 5px 6px',
                borderRadius: 'var(--r-full)',
                background: dropdownOpen ? '#eff6ff' : '#ffffff',
                border: dropdownOpen ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'all var(--transition)',
              }}
              onMouseEnter={(e) => {
                if (!dropdownOpen) e.currentTarget.style.borderColor = '#cbd5e1';
              }}
              onMouseLeave={(e) => {
                if (!dropdownOpen) e.currentTarget.style.borderColor = '#e2e8f0';
              }}
              id="admin-user-dropdown-btn"
              aria-expanded={dropdownOpen}
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
                {admin?.name?.charAt(0) || 'B'}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                {admin?.name?.split(' ')[0] || 'Benson'}
              </span>
              <ChevronDown
                size={14}
                style={{
                  color: '#64748b',
                  transition: 'transform 0.2s ease',
                  transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </button>

            {/* Dropdown Menu (Styled like Paydora Dashboard) */}
            {dropdownOpen && (
              <div
                className="animate-fade-in"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: 260,
                  background: '#ffffff',
                  borderRadius: 16,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12)',
                  padding: '16px 0',
                  zIndex: 1000,
                }}
                id="admin-dropdown-menu"
              >
                {/* User Header Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 18px 12px' }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: '#eff6ff',
                      color: 'var(--primary)',
                      fontWeight: 700,
                      fontSize: 15,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {admin?.name?.charAt(0) || 'B'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {admin?.name || 'Benson Arafat'}
                    </p>
                    <p style={{ fontSize: 11, fontWeight: 500, color: '#94A3B8', margin: 0 }}>
                      Admin account
                    </p>
                  </div>
                </div>

                <div style={{ height: 1, background: 'var(--border-light)', margin: '6px 0' }} />

                {/* Navigation Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '0 6px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      onNavigateTab?.('settings');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--r-md)',
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#475569',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all var(--transition)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f8fafc';
                      e.currentTarget.style.color = '#0f172a';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'none';
                      e.currentTarget.style.color = '#475569';
                    }}
                  >
                    <Settings size={17} />
                    <span>Settings & Security</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      onNavigateTab?.('whatsapp');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--r-md)',
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#475569',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all var(--transition)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f8fafc';
                      e.currentTarget.style.color = '#0f172a';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'none';
                      e.currentTarget.style.color = '#475569';
                    }}
                  >
                    <MessageCircle size={17} />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      onNavigateTab?.('kyc');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--r-md)',
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#475569',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all var(--transition)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f8fafc';
                      e.currentTarget.style.color = '#0f172a';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'none';
                      e.currentTarget.style.color = '#475569';
                    }}
                  >
                    <ShieldCheck size={17} />
                    <span>Identity & KYC Review</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      onNavigateTab?.('broadcast');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--r-md)',
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#475569',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all var(--transition)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f8fafc';
                      e.currentTarget.style.color = '#0f172a';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'none';
                      e.currentTarget.style.color = '#475569';
                    }}
                  >
                    <Mail size={17} />
                    <span>Broadcast & Mail</span>
                  </button>
                </div>

                <div style={{ height: 1, background: 'var(--border-light)', margin: '6px 0' }} />

                {/* Logout Option */}
                <div style={{ padding: '0 6px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      onLogout?.();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--r-md)',
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#ef4444',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all var(--transition)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#fef2f2';
                      e.currentTarget.style.color = '#dc2626';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'none';
                      e.currentTarget.style.color = '#ef4444';
                    }}
                    id="dropdown-logout-btn"
                  >
                    <LogOut size={17} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
