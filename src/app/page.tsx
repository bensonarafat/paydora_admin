'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AdminSidebar, { AdminTab } from '@/components/layout/AdminSidebar';
import AdminHeader from '@/components/layout/AdminHeader';
import OverviewView from '@/components/features/overview/OverviewView';
import KycReviewView from '@/components/features/kyc/KycReviewView';
import UserManagementView from '@/components/features/users/UserManagementView';
import TransactionsView from '@/components/features/transactions/TransactionsView';
import TransactionDetailsView from '@/components/features/transactions/TransactionDetailsView';
import KycDetailsView from '@/components/features/kyc/KycDetailsView';
import UserDetailsView from '@/components/features/users/UserDetailsView';
import BroadcastMailView from '@/components/features/broadcast/BroadcastMailView';
import WhatsAppChatView from '@/components/features/whatsapp/WhatsAppChatView';
import BanksManagementView from '@/components/features/banks/BanksManagementView';
import BillsManagementView from '@/components/features/bills/BillsManagementView';
import LogsManagementView from '@/components/features/logs/LogsManagementView';
import SettingsView from '@/components/features/settings/SettingsView';
import WishlistManagementView from '@/components/features/wishlist/WishlistManagementView';
import AdminLoginPage from '@/components/features/auth/AdminLoginPage';
import { adminApi } from '@/lib/api';
import { 
  AdminUser, 
  AudienceStats, 
  BankConfigItem, 
  BillCategoryConfigItem,
  BillerProductItem,
  BillsSubTab,
  LogsSubTab,
  SettingsSubTab,
  WishlistSubTab,
  CardWishlistItem,
  WealthWishlistItem,
  TeamMemberItem,
  AppConfigSettings,
  SystemLogItem,
  JobLogItem,
  SmsLogItem,
  EmailLogItem,
  WebhookLogItem,
  AuditLogItem,
  KycReviewItem, 
  KycStatus, 
  StandardBillerItem,
  SystemMetrics, 
  TransactionItem, 
  UserAccount 
} from '@/types/admin';

function parseRoute(pathname: string, search: string): {
  tab: AdminTab;
  subTab?: string;
  detailId?: string;
  detailRef?: string;
} {
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0]?.toLowerCase();
  const second = segments[1]?.toLowerCase();

  const validTabs: AdminTab[] = [
    'overview',
    'kyc',
    'users',
    'wishlist',
    'transactions',
    'bills',
    'whatsapp',
    'broadcast',
    'banks',
    'logs',
    'settings',
  ];

  let tab: AdminTab = 'overview';
  if (first && validTabs.includes(first as AdminTab)) {
    tab = first as AdminTab;
  }

  const searchParams = new URLSearchParams(search);
  const detailId = searchParams.get('id') || (tab === 'users' && segments[1] ? segments[1] : undefined);
  const detailRef = searchParams.get('ref') || (tab === 'transactions' && segments[1] ? segments[1] : undefined);

  return {
    tab,
    subTab: second,
    detailId,
    detailRef,
  };
}

export default function AdminPage() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>(() => {
    if (typeof window !== 'undefined') {
      return parseRoute(window.location.pathname, window.location.search).tab;
    }
    return 'overview';
  });
  const [wishlistSubTab, setWishlistSubTab] = useState<WishlistSubTab>(() => {
    if (typeof window !== 'undefined') {
      const parsed = parseRoute(window.location.pathname, window.location.search);
      if (parsed.tab === 'wishlist' && (parsed.subTab === 'card' || parsed.subTab === 'wealth')) {
        return parsed.subTab;
      }
    }
    return 'card';
  });
  const [billsSubTab, setBillsSubTab] = useState<BillsSubTab>(() => {
    if (typeof window !== 'undefined') {
      const parsed = parseRoute(window.location.pathname, window.location.search);
      if (parsed.tab === 'bills' && (parsed.subTab === 'categories' || parsed.subTab === 'billers' || parsed.subTab === 'products')) {
        return parsed.subTab;
      }
    }
    return 'categories';
  });
  const [logsSubTab, setLogsSubTab] = useState<LogsSubTab>(() => {
    if (typeof window !== 'undefined') {
      const parsed = parseRoute(window.location.pathname, window.location.search);
      if (parsed.tab === 'logs' && ['system', 'jobs', 'sms', 'email', 'webhooks', 'audit'].includes(parsed.subTab || '')) {
        return parsed.subTab as LogsSubTab;
      }
    }
    return 'system';
  });
  const [settingsSubTab, setSettingsSubTab] = useState<SettingsSubTab>(() => {
    if (typeof window !== 'undefined') {
      const parsed = parseRoute(window.location.pathname, window.location.search);
      if (parsed.tab === 'settings' && ['profile', 'security', 'teams', 'config'].includes(parsed.subTab || '')) {
        return parsed.subTab as SettingsSubTab;
      }
    }
    return 'profile';
  });
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionItem | null>(null);
  const [selectedKycItem, setSelectedKycItem] = useState<KycReviewItem | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Core Data Stores
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [kycItems, setKycItems] = useState<KycReviewItem[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [cardWishlist, setCardWishlist] = useState<CardWishlistItem[]>([]);
  const [wealthWishlist, setWealthWishlist] = useState<WealthWishlistItem[]>([]);
  const [audienceStats, setAudienceStats] = useState<AudienceStats | null>(null);
  const [banks, setBanks] = useState<BankConfigItem[]>([]);
  const [billCategories, setBillCategories] = useState<BillCategoryConfigItem[]>([]);
  const [billers, setBillers] = useState<StandardBillerItem[]>([]);
  const [billerProducts, setBillerProducts] = useState<BillerProductItem[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLogItem[]>([]);
  const [jobLogs, setJobLogs] = useState<JobLogItem[]>([]);
  const [smsLogs, setSmsLogs] = useState<SmsLogItem[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLogItem[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLogItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMemberItem[]>([]);
  const [appConfig, setAppConfig] = useState<AppConfigSettings | null>(null);
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
      const [m, k, u, tx, aud, b, cats, blrs, prods, sysL, jobL, smsL, emlL, whL, audL, teams, cfg, cWish, wWish] = await Promise.all([
        adminApi.getMetrics(),
        adminApi.getKycSubmissions(),
        adminApi.getUsers(),
        adminApi.getTransactions(),
        adminApi.getAudienceStats(),
        adminApi.getBanks(),
        adminApi.getBillCategories(),
        adminApi.getBillers(),
        adminApi.getBillerProducts(),
        adminApi.getSystemLogs(),
        adminApi.getJobLogs(),
        adminApi.getSmsLogs(),
        adminApi.getEmailLogs(),
        adminApi.getWebhookLogs(),
        adminApi.getAuditLogs(),
        adminApi.getTeamMembers(),
        adminApi.getAppConfig(),
        adminApi.getCardWishlist(),
        adminApi.getWealthWishlist(),
      ]);
      setMetrics(m);
      setKycItems(k);
      setUsers(u);
      setTransactions(tx);
      setAudienceStats(aud);
      setBanks(b);
      setBillCategories(cats);
      setBillers(blrs);
      setBillerProducts(prods);
      setSystemLogs(sysL);
      setJobLogs(jobL);
      setSmsLogs(smsL);
      setEmailLogs(emlL);
      setWebhookLogs(whL);
      setAuditLogs(audL);
      setTeamMembers(teams);
      setAppConfig(cfg);
      setCardWishlist(cWish);
      setWealthWishlist(wWish);

      if (typeof window !== 'undefined') {
        const parsed = parseRoute(window.location.pathname, window.location.search);
        if (parsed.tab === 'users' && parsed.detailId) {
          const matchU = u.find((item) => item.id === parsed.detailId || item.email === parsed.detailId);
          if (matchU) setSelectedUser(matchU);
        }
        if (parsed.tab === 'transactions' && parsed.detailRef) {
          const matchTx = tx.find((item) => item.reference === parsed.detailRef || item.id === parsed.detailRef);
          if (matchTx) setSelectedTransaction(matchTx);
        }
        if (parsed.tab === 'kyc' && parsed.detailId) {
          const matchKyc = k.find((item) => item.id === parsed.detailId || item.user_id === parsed.detailId);
          if (matchKyc) setSelectedKycItem(matchKyc);
        }
      }
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

  // Deep route sync & navigation
  const navigateTo = useCallback(
    (tab: AdminTab, subTab?: string, queryParams?: Record<string, string>) => {
      let path = tab === 'overview' ? '/' : `/${tab}`;
      if (subTab) {
        path = `${path}/${subTab}`;
      }
      if (queryParams && Object.keys(queryParams).length > 0) {
        const sp = new URLSearchParams(queryParams);
        path = `${path}?${sp.toString()}`;
      }

      setActiveTab(tab);
      if (!queryParams?.id) {
        setSelectedUser(null);
        setSelectedKycItem(null);
      }
      if (!queryParams?.ref) {
        setSelectedTransaction(null);
      }

      if (subTab) {
        if (tab === 'wishlist' && (subTab === 'card' || subTab === 'wealth')) {
          setWishlistSubTab(subTab as WishlistSubTab);
        }
        if (tab === 'bills' && (subTab === 'categories' || subTab === 'billers' || subTab === 'products')) {
          setBillsSubTab(subTab as BillsSubTab);
        }
        if (tab === 'logs' && ['system', 'jobs', 'sms', 'email', 'webhooks', 'audit'].includes(subTab)) {
          setLogsSubTab(subTab as LogsSubTab);
        }
        if (tab === 'settings' && ['profile', 'security', 'teams', 'config'].includes(subTab)) {
          setSettingsSubTab(subTab as SettingsSubTab);
        }
      }

      if (typeof window !== 'undefined') {
        const currentFull = window.location.pathname + window.location.search;
        if (currentFull !== path) {
          window.history.pushState({ tab, subTab, queryParams }, '', path);
        }
      }
    },
    []
  );

  useEffect(() => {
    const handlePopState = () => {
      if (typeof window === 'undefined') return;
      const parsed = parseRoute(window.location.pathname, window.location.search);
      setActiveTab(parsed.tab);
      if (parsed.subTab) {
        if (parsed.tab === 'wishlist' && (parsed.subTab === 'card' || parsed.subTab === 'wealth')) {
          setWishlistSubTab(parsed.subTab as WishlistSubTab);
        }
        if (parsed.tab === 'bills' && (parsed.subTab === 'categories' || parsed.subTab === 'billers' || parsed.subTab === 'products')) {
          setBillsSubTab(parsed.subTab as BillsSubTab);
        }
        if (parsed.tab === 'logs' && ['system', 'jobs', 'sms', 'email', 'webhooks', 'audit'].includes(parsed.subTab)) {
          setLogsSubTab(parsed.subTab as LogsSubTab);
        }
        if (parsed.tab === 'settings' && ['profile', 'security', 'teams', 'config'].includes(parsed.subTab)) {
          setSettingsSubTab(parsed.subTab as SettingsSubTab);
        }
      }

      if (parsed.tab === 'users' && parsed.detailId) {
        const found = users.find((u) => u.id === parsed.detailId || u.email === parsed.detailId);
        if (found) setSelectedUser(found);
        else setSelectedUser(null);
      } else {
        setSelectedUser(null);
      }

      if (parsed.tab === 'transactions' && parsed.detailRef) {
        const found = transactions.find((t) => t.reference === parsed.detailRef || t.id === parsed.detailRef);
        if (found) setSelectedTransaction(found);
        else setSelectedTransaction(null);
      } else {
        setSelectedTransaction(null);
      }

      if (parsed.tab === 'kyc' && parsed.detailId) {
        const found = kycItems.find((k) => k.id === parsed.detailId || k.user_id === parsed.detailId);
        if (found) setSelectedKycItem(found);
        else setSelectedKycItem(null);
      } else {
        setSelectedKycItem(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [users, transactions, kycItems]);

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

  const handleUpdateBank = async (bankId: string, updates: Partial<BankConfigItem>) => {
    await adminApi.updateBank(bankId, updates);
    showToast('Bank details updated successfully');
    await loadData();
  };

  const handleCreateBank = async (bankData: Omit<BankConfigItem, 'id'>) => {
    await adminApi.createBank(bankData);
    showToast('New settlement route created successfully');
    await loadData();
  };

  const handleUpdateBillCategory = async (id: string, updates: Partial<BillCategoryConfigItem>) => {
    await adminApi.updateBillCategory(id, updates);
    showToast('Bill category updated successfully');
    await loadData();
  };

  const handleCreateBillCategory = async (categoryData: Omit<BillCategoryConfigItem, 'id'>) => {
    await adminApi.createBillCategory(categoryData);
    showToast('New bill category added successfully');
    await loadData();
  };

  const handleUpdateBiller = async (id: string, updates: Partial<StandardBillerItem>) => {
    await adminApi.updateBiller(id, updates);
    showToast('Biller details updated successfully');
    await loadData();
  };

  const handleCreateBiller = async (billerData: Omit<StandardBillerItem, 'id'>) => {
    await adminApi.createBiller(billerData);
    showToast('New biller added successfully');
    await loadData();
  };

  const handleUpdateBillerProduct = async (id: string, updates: Partial<BillerProductItem>) => {
    await adminApi.updateBillerProduct(id, updates);
    showToast('Biller package updated successfully');
    await loadData();
  };

  const handleCreateBillerProduct = async (productData: Omit<BillerProductItem, 'id'>) => {
    await adminApi.createBillerProduct(productData);
    showToast('New biller product package added successfully');
    await loadData();
  };

  const handleUpdateAppConfig = async (updates: Partial<AppConfigSettings>) => {
    const updated = await adminApi.updateAppConfig(updates);
    setAppConfig(updated);
    showToast('Platform configurations updated');
  };

  const handleInviteTeamMember = async (memberData: Omit<TeamMemberItem, 'id' | 'created_at'>) => {
    const newMember = await adminApi.inviteTeamMember(memberData);
    setTeamMembers((prev) => [...prev, newMember]);
    showToast(`Invitation sent to ${memberData.email}`);
  };

  const handleRemoveTeamMember = async (id: string) => {
    await adminApi.removeTeamMember(id);
    setTeamMembers((prev) => prev.filter((m) => m.id !== id));
    showToast('Team member removed');
  };

  const handleUpdateTeamMemberRole = async (id: string, newRole: TeamMemberItem['role']) => {
    await adminApi.updateTeamMember(id, { role: newRole });
    setTeamMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role: newRole } : m)));
    showToast(`Role updated to ${newRole.replace(/_/g, ' ')}`);
  };

  const handleUpdateWishlistStatus = async (type: 'card' | 'wealth', id: string, status: string) => {
    await adminApi.updateWishlistStatus(type, id, status);
    showToast(`${type === 'card' ? 'Card' : 'Wealth'} wishlist status updated to ${status}`);
    await loadData();
  };

  const handleRemoveWishlistEntry = async (type: 'card' | 'wealth', id: string) => {
    await adminApi.removeWishlistEntry(type, id);
    showToast(`${type === 'card' ? 'Card' : 'Wealth'} wishlist entry removed`);
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
        wishlistSubTab={wishlistSubTab}
        billsSubTab={billsSubTab}
        logsSubTab={logsSubTab}
        settingsSubTab={settingsSubTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        admin={admin}
        onNavigateTab={(tab) => navigateTo(tab)}
        onLogout={handleLogout}
      />

      {/* Body Shell */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <AdminSidebar
          activeTab={activeTab}
          wishlistSubTab={wishlistSubTab}
          onWishlistSubTabChange={(sub) => navigateTo('wishlist', sub)}
          billsSubTab={billsSubTab}
          onBillsSubTabChange={(sub) => navigateTo('bills', sub)}
          logsSubTab={logsSubTab}
          onLogsSubTabChange={(sub) => navigateTo('logs', sub)}
          settingsSubTab={settingsSubTab}
          onSettingsSubTabChange={(sub) => navigateTo('settings', sub)}
          onTabChange={(tab, subTab) => navigateTo(tab, subTab)}
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

          {/* Full Transaction Details Page */}
          {selectedTransaction ? (
            <TransactionDetailsView
              transaction={selectedTransaction}
              user={users.find(
                (u) => u.id === selectedTransaction.user_id || u.email === selectedTransaction.user_email
              )}
              onBack={() => {
                setSelectedTransaction(null);
                navigateTo('transactions');
              }}
              onNavigateTab={(tab) => {
                setSelectedTransaction(null);
                navigateTo(tab);
              }}
              onToggleUserBlock={handleToggleUserBlock}
            />
          ) : selectedKycItem ? (
            <KycDetailsView
              item={selectedKycItem}
              user={users.find(
                (u) => u.id === selectedKycItem.user_id || u.email === selectedKycItem.email
              )}
              onBack={() => {
                setSelectedKycItem(null);
                navigateTo('kyc');
              }}
              onNavigateTab={(tab) => {
                setSelectedKycItem(null);
                navigateTo(tab);
              }}
              onUpdateStatus={async (userId, status, reason) => {
                await handleUpdateKycStatus(userId, status, reason);
                setSelectedKycItem((prev) =>
                  prev ? { ...prev, status, rejection_reason: reason || prev.rejection_reason } : null
                );
              }}
            />
          ) : selectedUser ? (
            <UserDetailsView
              user={selectedUser}
              kycItem={kycItems.find((k) => k.user_id === selectedUser.id || k.email === selectedUser.email)}
              transactions={transactions.filter((t) => t.user_id === selectedUser.id || t.user_email === selectedUser.email)}
              onBack={() => {
                setSelectedUser(null);
                navigateTo('users');
              }}
              onToggleBlock={async (userId, isBlocked, reason) => {
                await handleToggleUserBlock(userId, isBlocked, reason);
                setSelectedUser((prev) => (prev ? { ...prev, is_blocked: isBlocked, blocked_reason: reason } : null));
              }}
              onNavigateTab={(tab) => {
                setSelectedUser(null);
                navigateTo(tab);
              }}
              onSelectTransaction={(tx) => {
                setSelectedUser(null);
                setSelectedTransaction(tx);
                navigateTo('transactions', undefined, { ref: tx.reference });
              }}
              onSelectKyc={(kyc) => {
                setSelectedUser(null);
                setSelectedKycItem(kyc);
                navigateTo('kyc', undefined, { id: kyc.id });
              }}
            />
          ) : (
            <>
              {/* Active Tab Routing */}
              {activeTab === 'overview' && (
                <OverviewView
                  metrics={metrics}
                  pendingKyc={kycItems.filter((k) => k.status === 'pending' || k.status === 'under_review')}
                  recentTransactions={transactions.slice(0, 10)}
                  onNavigate={(tab) => navigateTo(tab)}
                  onTriggerKycReminder={handleTriggerKycReminder}
                  onSelectTransaction={(tx) => {
                    setSelectedTransaction(tx);
                    navigateTo('transactions', undefined, { ref: tx.reference });
                  }}
                />
              )}

              {activeTab === 'kyc' && (
                <KycReviewView
                  items={kycItems}
                  onUpdateStatus={handleUpdateKycStatus}
                  isLoading={isRefreshing}
                  onSelectItem={(item) => {
                    setSelectedKycItem(item);
                    navigateTo('kyc', undefined, { id: item.id });
                  }}
                />
              )}

              {activeTab === 'users' && (
                <UserManagementView
                  users={users}
                  onToggleBlock={handleToggleUserBlock}
                  isLoading={isRefreshing}
                  onSelectUser={(u) => {
                    setSelectedUser(u);
                    navigateTo('users', undefined, { id: u.id });
                  }}
                />
              )}

              {activeTab === 'wishlist' && (
                <WishlistManagementView
                  activeSubTab={wishlistSubTab}
                  onSubTabChange={(sub) => navigateTo('wishlist', sub)}
                  cardWishlist={cardWishlist}
                  wealthWishlist={wealthWishlist}
                  onUpdateStatus={handleUpdateWishlistStatus}
                  onRemoveEntry={handleRemoveWishlistEntry}
                  onShowToast={showToast}
                  isLoading={isRefreshing}
                />
              )}

              {activeTab === 'transactions' && (
                <TransactionsView 
                  transactions={transactions} 
                  isLoading={isRefreshing} 
                  onSelectTransaction={(tx) => {
                    setSelectedTransaction(tx);
                    navigateTo('transactions', undefined, { ref: tx.reference });
                  }}
                />
              )}

              {activeTab === 'bills' && (
                <BillsManagementView
                  categories={billCategories}
                  billers={billers}
                  products={billerProducts}
                  activeSubTab={billsSubTab}
                  onSubTabChange={(sub) => navigateTo('bills', sub)}
                  onUpdateCategory={handleUpdateBillCategory}
                  onCreateCategory={handleCreateBillCategory}
                  onUpdateBiller={handleUpdateBiller}
                  onCreateBiller={handleCreateBiller}
                  onUpdateProduct={handleUpdateBillerProduct}
                  onCreateProduct={handleCreateBillerProduct}
                  isLoading={isRefreshing}
                />
              )}

              {activeTab === 'whatsapp' && (
                <WhatsAppChatView
                  users={users}
                  onNavigateToKyc={() => navigateTo('kyc')}
                  onSelectUser={(u) => {
                    setSelectedUser(u);
                    navigateTo('users', undefined, { id: u.id });
                  }}
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
                  onUpdateBank={handleUpdateBank}
                  onCreateBank={handleCreateBank}
                  isLoading={isRefreshing}
                />
              )}

              {activeTab === 'logs' && (
                <LogsManagementView
                  activeSubTab={logsSubTab}
                  onSubTabChange={(sub) => navigateTo('logs', sub)}
                  systemLogs={systemLogs}
                  jobLogs={jobLogs}
                  smsLogs={smsLogs}
                  emailLogs={emailLogs}
                  webhookLogs={webhookLogs}
                  auditLogs={auditLogs}
                  isLoading={isRefreshing}
                  onRefresh={loadData}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView
                  admin={admin}
                  activeSubTab={settingsSubTab}
                  onSubTabChange={(sub) => navigateTo('settings', sub)}
                  teamMembers={teamMembers}
                  appConfig={appConfig}
                  onUpdateAppConfig={handleUpdateAppConfig}
                  onInviteTeamMember={handleInviteTeamMember}
                  onRemoveTeamMember={handleRemoveTeamMember}
                  onUpdateTeamMemberRole={handleUpdateTeamMemberRole}
                  onShowToast={showToast}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
