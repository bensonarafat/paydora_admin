'use client';

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Users, 
  ReceiptText, 
  Receipt,
  Mail, 
  Building2, 
  Settings, 
  MessageCircle,
  ChevronDown,
  Tags,
  Store,
  Package,
  ScrollText,
  Terminal,
  Clock,
  Smartphone,
  Radio,
  User,
  Lock,
  Sliders,
  Sparkles,
  CreditCard,
  TrendingUp
} from 'lucide-react';
import { AdminUser, BillsSubTab, LogsSubTab, SettingsSubTab, WishlistSubTab } from '@/types/admin';

export type AdminTab = 
  | 'overview' 
  | 'kyc' 
  | 'users' 
  | 'wishlist'
  | 'transactions' 
  | 'bills'
  | 'whatsapp' 
  | 'broadcast' 
  | 'banks' 
  | 'logs'
  | 'settings';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab, subTab?: string) => void;
  admin?: AdminUser | null;
  onLogout?: () => void;
  pendingKycCount: number;
  blockedUsersCount: number;
  whatsappUnreadCount?: number;
  wishlistSubTab?: WishlistSubTab;
  onWishlistSubTabChange?: (subTab: WishlistSubTab) => void;
  billsSubTab?: BillsSubTab;
  onBillsSubTabChange?: (subTab: BillsSubTab) => void;
  logsSubTab?: LogsSubTab;
  onLogsSubTabChange?: (subTab: LogsSubTab) => void;
  settingsSubTab?: SettingsSubTab;
  onSettingsSubTabChange?: (subTab: SettingsSubTab) => void;
}

export default function AdminSidebar({
  activeTab,
  onTabChange,
  pendingKycCount,
  blockedUsersCount,
  whatsappUnreadCount = 0,
  wishlistSubTab = 'card',
  onWishlistSubTabChange,
  billsSubTab = 'categories',
  onBillsSubTabChange,
  logsSubTab = 'system',
  onLogsSubTabChange,
  settingsSubTab = 'profile',
  onSettingsSubTabChange,
}: AdminSidebarProps) {
  const [wishlistExpanded, setWishlistExpanded] = useState<boolean>(true);
  const [billsExpanded, setBillsExpanded] = useState<boolean>(true);
  const [logsExpanded, setLogsExpanded] = useState<boolean>(true);
  const [settingsExpanded, setSettingsExpanded] = useState<boolean>(true);

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
      badgeColor: '#2563eb',
    },
    {
      id: 'users',
      label: 'Users',
      icon: <Users size={18} />,
    },
    {
      id: 'wishlist',
      label: 'Wishlist',
      icon: <Sparkles size={18} />,
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: <ReceiptText size={18} />,
    },
    {
      id: 'bills',
      label: 'Bills',
      icon: <Receipt size={18} />,
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: <MessageCircle size={18} />,
      badge: whatsappUnreadCount > 0 ? whatsappUnreadCount : undefined,
      badgeColor: '#2563eb',
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
      id: 'logs',
      label: 'Logs',
      icon: <ScrollText size={18} />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings size={18} />,
    },
  ];

  const wishlistSubNavItems: { id: WishlistSubTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'card',
      label: 'Card Wishlist',
      icon: <CreditCard size={15} />,
    },
    {
      id: 'wealth',
      label: 'Wealth Wishlist',
      icon: <TrendingUp size={15} />,
    },
  ];

  const billsSubNavItems: { id: BillsSubTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'categories',
      label: 'Bill Category',
      icon: <Tags size={15} />,
    },
    {
      id: 'billers',
      label: 'Billers',
      icon: <Store size={15} />,
    },
    {
      id: 'products',
      label: 'Products',
      icon: <Package size={15} />,
    },
  ];

  const logsSubNavItems: { id: LogsSubTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'system',
      label: 'System Logs',
      icon: <Terminal size={15} />,
    },
    {
      id: 'jobs',
      label: 'Jobs Log',
      icon: <Clock size={15} />,
    },
    {
      id: 'sms',
      label: 'SMS Log',
      icon: <Smartphone size={15} />,
    },
    {
      id: 'email',
      label: 'Email Logs',
      icon: <Mail size={15} />,
    },
    {
      id: 'webhooks',
      label: 'Webhook Logs',
      icon: <Radio size={15} />,
    },
    {
      id: 'audit',
      label: 'Audit Trail',
      icon: <ShieldCheck size={15} />,
    },
  ];

  const settingsSubNavItems: { id: SettingsSubTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'profile',
      label: 'Profile',
      icon: <User size={15} />,
    },
    {
      id: 'security',
      label: 'Security',
      icon: <Lock size={15} />,
    },
    {
      id: 'teams',
      label: 'Teams',
      icon: <Users size={15} />,
    },
    {
      id: 'config',
      label: 'App Config',
      icon: <Sliders size={15} />,
    },
  ];

  const handleWishlistClick = () => {
    if (activeTab !== 'wishlist') {
      onTabChange('wishlist', wishlistSubTab);
      setWishlistExpanded(true);
    } else {
      setWishlistExpanded((prev) => !prev);
    }
  };

  const handleBillsClick = () => {
    if (activeTab !== 'bills') {
      onTabChange('bills', billsSubTab);
      setBillsExpanded(true);
    } else {
      setBillsExpanded((prev) => !prev);
    }
  };

  const handleLogsClick = () => {
    if (activeTab !== 'logs') {
      onTabChange('logs', logsSubTab);
      setLogsExpanded(true);
    } else {
      setLogsExpanded((prev) => !prev);
    }
  };

  const handleSettingsClick = () => {
    if (activeTab !== 'settings') {
      onTabChange('settings', settingsSubTab);
      setSettingsExpanded(true);
    } else {
      setSettingsExpanded((prev) => !prev);
    }
  };

  const handleWishlistSubClick = (sub: WishlistSubTab, e: React.MouseEvent) => {
    e.stopPropagation();
    onTabChange('wishlist', sub);
    onWishlistSubTabChange?.(sub);
  };

  const handleBillsSubClick = (sub: BillsSubTab, e: React.MouseEvent) => {
    e.stopPropagation();
    onTabChange('bills', sub);
    onBillsSubTabChange?.(sub);
  };

  const handleLogsSubClick = (sub: LogsSubTab, e: React.MouseEvent) => {
    e.stopPropagation();
    onTabChange('logs', sub);
    onLogsSubTabChange?.(sub);
  };

  const handleSettingsSubClick = (sub: SettingsSubTab, e: React.MouseEvent) => {
    e.stopPropagation();
    onTabChange('settings', sub);
    onSettingsSubTabChange?.(sub);
  };

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
          const isWishlist = item.id === 'wishlist';
          const isBills = item.id === 'bills';
          const isLogs = item.id === 'logs';
          const isSettings = item.id === 'settings';
          const isActive = activeTab === item.id;

          if (isWishlist) {
            return (
              <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <a
                  href="/wishlist"
                  onClick={(e) => {
                    e.preventDefault();
                    handleWishlistClick();
                  }}
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
                    textDecoration: 'none',
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

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ChevronDown
                      size={14}
                      style={{
                        color: isActive ? 'var(--primary)' : '#94a3b8',
                        transform: wishlistExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                        transition: 'transform 0.2s ease',
                      }}
                    />
                  </div>
                </a>

                {/* Wishlist Sub-navigation */}
                {wishlistExpanded && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      paddingLeft: 12,
                      marginLeft: 16,
                      borderLeft: '1.5px solid #e2e8f0',
                      marginTop: 2,
                      marginBottom: 4,
                    }}
                  >
                    {wishlistSubNavItems.map((sub) => {
                      const isSubActive = isActive && wishlistSubTab === sub.id;
                      return (
                        <a
                          key={sub.id}
                          href={`/wishlist/${sub.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleWishlistSubClick(sub.id, e);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '7px 10px',
                            borderRadius: 'var(--r-md)',
                            background: isSubActive ? '#eff6ff' : 'transparent',
                            color: isSubActive ? 'var(--primary)' : '#64748b',
                            fontSize: 12.5,
                            fontWeight: isSubActive ? 600 : 500,
                            width: '100%',
                            textAlign: 'left',
                            border: 'none',
                            cursor: 'pointer',
                            textDecoration: 'none',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            if (!isSubActive) {
                              e.currentTarget.style.background = '#f8fafc';
                              e.currentTarget.style.color = '#0f172a';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSubActive) {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = '#64748b';
                            }
                          }}
                        >
                          <span
                            style={{
                              color: isSubActive ? 'var(--primary)' : '#94a3b8',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            {sub.icon}
                          </span>
                          <span>{sub.label}</span>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          if (isBills) {
            return (
              <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <a
                  href="/bills"
                  onClick={(e) => {
                    e.preventDefault();
                    handleBillsClick();
                  }}
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
                    textDecoration: 'none',
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

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ChevronDown
                      size={14}
                      style={{
                        color: isActive ? 'var(--primary)' : '#94a3b8',
                        transform: billsExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                        transition: 'transform 0.2s ease',
                      }}
                    />
                  </div>
                </a>

                {/* Bills Sub-navigation */}
                {billsExpanded && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      paddingLeft: 12,
                      marginLeft: 16,
                      borderLeft: '1.5px solid #e2e8f0',
                      marginTop: 2,
                      marginBottom: 4,
                    }}
                  >
                    {billsSubNavItems.map((sub) => {
                      const isSubActive = isActive && billsSubTab === sub.id;
                      return (
                        <a
                          key={sub.id}
                          href={`/bills/${sub.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleBillsSubClick(sub.id, e);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '7px 10px',
                            borderRadius: 'var(--r-md)',
                            background: isSubActive ? '#eff6ff' : 'transparent',
                            color: isSubActive ? 'var(--primary)' : '#64748b',
                            fontSize: 12.5,
                            fontWeight: isSubActive ? 600 : 500,
                            width: '100%',
                            textAlign: 'left',
                            border: 'none',
                            cursor: 'pointer',
                            textDecoration: 'none',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            if (!isSubActive) {
                              e.currentTarget.style.background = '#f8fafc';
                              e.currentTarget.style.color = '#0f172a';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSubActive) {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = '#64748b';
                            }
                          }}
                        >
                          <span
                            style={{
                              color: isSubActive ? 'var(--primary)' : '#94a3b8',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            {sub.icon}
                          </span>
                          <span>{sub.label}</span>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          if (isLogs) {
            return (
              <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <a
                  href="/logs"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogsClick();
                  }}
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
                    textDecoration: 'none',
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

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ChevronDown
                      size={14}
                      style={{
                        color: isActive ? 'var(--primary)' : '#94a3b8',
                        transform: logsExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                        transition: 'transform 0.2s ease',
                      }}
                    />
                  </div>
                </a>

                {/* Logs Sub-navigation */}
                {logsExpanded && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      paddingLeft: 12,
                      marginLeft: 16,
                      borderLeft: '1.5px solid #e2e8f0',
                      marginTop: 2,
                      marginBottom: 4,
                    }}
                  >
                    {logsSubNavItems.map((sub) => {
                      const isSubActive = isActive && logsSubTab === sub.id;
                      return (
                        <a
                          key={sub.id}
                          href={`/logs/${sub.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleLogsSubClick(sub.id, e);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '7px 10px',
                            borderRadius: 'var(--r-md)',
                            background: isSubActive ? '#eff6ff' : 'transparent',
                            color: isSubActive ? 'var(--primary)' : '#64748b',
                            fontSize: 12.5,
                            fontWeight: isSubActive ? 600 : 500,
                            width: '100%',
                            textAlign: 'left',
                            border: 'none',
                            cursor: 'pointer',
                            textDecoration: 'none',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            if (!isSubActive) {
                              e.currentTarget.style.background = '#f8fafc';
                              e.currentTarget.style.color = '#0f172a';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSubActive) {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = '#64748b';
                            }
                          }}
                        >
                          <span
                            style={{
                              color: isSubActive ? 'var(--primary)' : '#94a3b8',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            {sub.icon}
                          </span>
                          <span>{sub.label}</span>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          if (isSettings) {
            return (
              <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <a
                  href="/settings"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSettingsClick();
                  }}
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
                    textDecoration: 'none',
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

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ChevronDown
                      size={14}
                      style={{
                        color: isActive ? 'var(--primary)' : '#94a3b8',
                        transform: settingsExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                        transition: 'transform 0.2s ease',
                      }}
                    />
                  </div>
                </a>

                {/* Settings Sub-navigation */}
                {settingsExpanded && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      paddingLeft: 12,
                      marginLeft: 16,
                      borderLeft: '1.5px solid #e2e8f0',
                      marginTop: 2,
                      marginBottom: 4,
                    }}
                  >
                    {settingsSubNavItems.map((sub) => {
                      const isSubActive = isActive && settingsSubTab === sub.id;
                      return (
                        <a
                          key={sub.id}
                          href={`/settings/${sub.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleSettingsSubClick(sub.id, e);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '7px 10px',
                            borderRadius: 'var(--r-md)',
                            background: isSubActive ? '#eff6ff' : 'transparent',
                            color: isSubActive ? 'var(--primary)' : '#64748b',
                            fontSize: 12.5,
                            fontWeight: isSubActive ? 600 : 500,
                            width: '100%',
                            textAlign: 'left',
                            border: 'none',
                            cursor: 'pointer',
                            textDecoration: 'none',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            if (!isSubActive) {
                              e.currentTarget.style.background = '#f8fafc';
                              e.currentTarget.style.color = '#0f172a';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSubActive) {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = '#64748b';
                            }
                          }}
                        >
                          <span
                            style={{
                              color: isSubActive ? 'var(--primary)' : '#94a3b8',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            {sub.icon}
                          </span>
                          <span>{sub.label}</span>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <a
              key={item.id}
              href={item.id === 'overview' ? '/' : `/${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                onTabChange(item.id);
              }}
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
                textDecoration: 'none',
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
            </a>
          );
        })}
      </nav>
    </aside>
  );
}

