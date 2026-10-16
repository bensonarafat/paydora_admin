'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AdminSidebar, { AdminTab } from '@/components/layout/AdminSidebar';
import AdminHeader from '@/components/layout/AdminHeader';
import OverviewView from '@/components/features/overview/OverviewView';
import KycReviewView from '@/components/features/kyc/KycReviewView';
import UserManagementView from '@/components/features/users/UserManagementView';
import TransactionsView from '@/components/features/transactions/TransactionsView';
import BroadcastMailView from '@/components/features/broadcast/BroadcastMailView';
import WhatsAppChatView from '@/components/features/whatsapp/WhatsAppChatView';
import BanksManagementView from '@/components/features/banks/BanksManagementView';
import SettingsView from '@/components/features/settings/SettingsView';
import AdminLoginPage from '@/components/features/auth/AdminLoginPage';
import { adminApi } from '@/lib/api';
import { 
  AdminUser, 
  AudienceStats, 
  BankConfigItem, 
  KycReviewItem, 
  KycStatus, 
  SystemMetrics, 
  TransactionItem, 
  UserAccount 
} from '@/types/admin';

export default function AdminPage() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Core Data Stores
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [kycItems, setKycItems] = useState<KycReviewItem[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [audienceStats, setAudienceStats] = useState<AudienceStats | null>(null);
  const [banks, setBanks] = useState<BankConfigItem[]>([]);
  const [isTriggeringKyc, setIsTriggeringKyc] = useState(false);

  // Initialize session
  useEffect(() => {
    const current = adminApi.getCurrentAdmin();
    setAdmin(current);
    setIsInitializing(false);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Load all telemetry
  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [m, k, u, tx, aud, b] = await Promise.all([
        adminApi.getMetrics(),
        adminApi.getKycSubmissions(),
        adminApi.getUsers(),
        adminApi.getTransactions(),
        adminApi.getAudienceStats(),
        adminApi.getBanks(),
      ]);
      setMetrics(m);
      setKycItems(k);
      setUsers(u);
      setTransactions(tx);
      setAudienceStats(aud);
      setBanks(b);
    } catch (err) {
      console.error('Failed to load admin telemetry:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (admin) {
      loadData();
    }
  }, [admin, loadData]);

  // Actions
  const handleUpdateKycStatus = async (userId: string, status: KycStatus, reason?: string) => {
    const res = await adminApi.updateKycStatus(userId, status, reason);
    if (res.success) {
      showToast(res.message);
      await loadData();
    }
  };

  const handleToggleUserBlock = async (userId: string, isBlocked: boolean, reason?: string) => {
    const res = await adminApi.toggleUserBlock(userId, isBlocked, reason);
    if (res.success) {
      showToast(res.message);
      await loadData();
    }
  };

  const handleTriggerKycReminder = async () => {
    setIsTriggeringKyc(true);
    const res = await adminApi.triggerKycReminder();
    setIsTriggeringKyc(false);
    if (res.success) {
      showToast(res.message);
      await loadData();
    }
  };

  const handleToggleBankCommon = async (bankId: string, isCommon: boolean) => {
    await adminApi.toggleBankCommon(bankId, isCommon);
    showToast(`Bank priority ${isCommon ? 'promoted to Common' : 'set to Standard'}`);
    await loadData();
  };

  const handleUpdateBankLogo = async (bankId: string, logoUrl: string) => {
    await adminApi.updateBankLogo(bankId, logoUrl);
    showToast('Bank logo updated successfully');
    await loadData();
  };

  const handleLogout = () => {
    adminApi.logout();
    setAdmin(null);
  };

  if (isInitializing) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-app)',
          color: 'var(--text-muted)',
        }}
      >
        Initializing Secure Admin Console...
      </div>
    );
  }

  if (!admin) {
    return <AdminLoginPage onLoginSuccess={(u) => setAdmin(u)} />;
  }

  const pendingKycCount = kycItems.filter(
    (k) => k.status === 'pending' || k.status === 'under_review'
  ).length;

  const blockedUsersCount = users.filter((u) => u.is_blocked).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--bg-app)' }}>
      {/* Topbar matching exact Paydora Dashboard layout */}
      <AdminHeader
        activeTab={activeTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        admin={admin}
      />

      {/* Body Shell */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
          }}
          admin={admin}
          onLogout={handleLogout}
          pendingKycCount={pendingKycCount}
          blockedUsersCount={blockedUsersCount}
          whatsappUnreadCount={1}
        />

        {/* Content Area */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
          {/* Toast Notification */}
          {toastMessage && (
            <div
              className="animate-fade-in"
              style={{
                position: 'fixed',
                bottom: 28,
                right: 28,
                padding: '12px 20px',
                borderRadius: 'var(--r-md)',
                background: '#ffffff',
                border: 'none',
                boxShadow: 'none',
                color: '#0f172a',
                fontSize: 13,
                fontWeight: 600,
                zIndex: 200,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)' }} />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Active Tab Routing */}
          {activeTab === 'overview' && (
            <OverviewView
              metrics={metrics}
              pendingKyc={kycItems.filter((k) => k.status === 'pending' || k.status === 'under_review')}
              recentTransactions={transactions}
              onNavigate={(tab) => setActiveTab(tab)}
              onTriggerKycReminder={handleTriggerKycReminder}
            />
          )}

          {activeTab === 'kyc' && (
            <KycReviewView
              items={kycItems}
              onUpdateStatus={handleUpdateKycStatus}
              isLoading={isRefreshing}
            />
          )}

          {activeTab === 'users' && (
            <UserManagementView
              users={users}
              onToggleBlock={handleToggleUserBlock}
              isLoading={isRefreshing}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsView transactions={transactions} isLoading={isRefreshing} />
          )}

          {activeTab === 'whatsapp' && (
            <WhatsAppChatView
              onNavigateToKyc={() => setActiveTab('kyc')}
              onNavigateToUser={() => setActiveTab('users')}
            />
          )}

          {activeTab === 'broadcast' && (
            <BroadcastMailView
              stats={audienceStats}
              onTriggerKycReminder={handleTriggerKycReminder}
              isTriggeringKyc={isTriggeringKyc}
            />
          )}

          {activeTab === 'banks' && (
            <BanksManagementView
              banks={banks}
              onToggleCommon={handleToggleBankCommon}
              onUpdateLogo={handleUpdateBankLogo}
              isLoading={isRefreshing}
            />
          )}

          {activeTab === 'settings' && <SettingsView admin={admin} />}
        </main>
      </div>
    </div>
  );
}
