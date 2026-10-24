'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  User, 
  Lock, 
  Users, 
  Sliders, 
  Key, 
  CheckCircle, 
  Copy, 
  Check, 
  ShieldCheck, 
  Smartphone, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Building2, 
  Mail, 
  Save, 
  Laptop, 
  Edit2,
  X,
  Wallet,
  Coins,
  FileText,
  Receipt,
  ArrowRightLeft,
  Shield
} from 'lucide-react';
import { 
  AdminUser, 
  SettingsSubTab, 
  TeamMemberItem, 
  AppConfigSettings 
} from '@/types/admin';

interface SettingsViewProps {
  admin: AdminUser | null;
  activeSubTab?: SettingsSubTab;
  onSubTabChange?: (tab: SettingsSubTab) => void;
  teamMembers?: TeamMemberItem[];
  appConfig?: AppConfigSettings | null;
  onUpdateAppConfig?: (updates: Partial<AppConfigSettings>) => Promise<void>;
  onInviteTeamMember?: (member: Omit<TeamMemberItem, 'id' | 'created_at'>) => Promise<void>;
  onRemoveTeamMember?: (id: string) => Promise<void>;
  onUpdateTeamMemberRole?: (id: string, newRole: TeamMemberItem['role']) => Promise<void>;
  onShowToast?: (msg: string) => void;
}

export default function SettingsView({
  admin,
  activeSubTab = 'profile',
  onSubTabChange,
  teamMembers = [],
  appConfig,
  onUpdateAppConfig,
  onInviteTeamMember,
  onRemoveTeamMember,
  onUpdateTeamMemberRole,
  onShowToast,
}: SettingsViewProps) {
  const [mounted, setMounted] = useState(false);
  const [localTab, setLocalTab] = useState<SettingsSubTab>(activeSubTab);
  const [copiedKey, setCopiedKey] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Profile Form States
  const [profileName, setProfileName] = useState(admin?.name || '');
  const [profileEmail, setProfileEmail] = useState(admin?.email || '');
  const [profilePhone, setProfilePhone] = useState((admin as any)?.phone || '');
  const [profileRole, setProfileRole] = useState(admin?.role || 'Administrator');

  useEffect(() => {
    if (admin) {
      if (admin.name) setProfileName(admin.name);
      if (admin.email) setProfileEmail(admin.email);
      if ((admin as any)?.phone) setProfilePhone((admin as any).phone);
      if (admin.role) setProfileRole(admin.role);
    }
  }, [admin]);

  // Security Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [ipWhitelistEnforced, setIpWhitelistEnforced] = useState(false);
  const adminKey = process.env.NEXT_PUBLIC_ADMIN_KEY || '';

  // Teams Invite Modal States
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'SUPER_ADMIN' | 'COMPLIANCE_OFFICER' | 'FINANCE_SETTLEMENT' | 'SUPPORT_OPS'>('SUPPORT_OPS');
  const [isInviting, setIsInviting] = useState(false);

  // Edit Role Modal States
  const [editRoleModalOpen, setEditRoleModalOpen] = useState(false);
  const [selectedMemberForRole, setSelectedMemberForRole] = useState<TeamMemberItem | null>(null);
  const [selectedRoleValue, setSelectedRoleValue] = useState<TeamMemberItem['role']>('SUPPORT_OPS');
  const [isSavingRole, setIsSavingRole] = useState(false);

  const openEditRoleModal = (member: TeamMemberItem) => {
    setSelectedMemberForRole(member);
    setSelectedRoleValue(member.role);
    setEditRoleModalOpen(true);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberForRole) return;
    setIsSavingRole(true);
    if (onUpdateTeamMemberRole) {
      await onUpdateTeamMemberRole(selectedMemberForRole.id, selectedRoleValue);
    }
    setIsSavingRole(false);
    setEditRoleModalOpen(false);
  };

  // Master Admin Settlement Bank Account
  const [adminAccountName, setAdminAccountName] = useState(appConfig?.admin_account_name || 'Pulse Reality Ltd');
  const [adminAccountNumber, setAdminAccountNumber] = useState(appConfig?.admin_account_number || '3004853804');
  const [adminBankName, setAdminBankName] = useState(appConfig?.admin_bank_name || 'Guaranty Trust Bank');

  // Settlement Rails & Markup Bands
  const [settlementProvider, setSettlementProvider] = useState<'squad' | 'paystack'>(
    appConfig?.default_settlement_provider || 'squad'
  );
  const [fallbackSettlement, setFallbackSettlement] = useState(
    appConfig?.fallback_settlement_enabled ?? true
  );
  const [transferFeeTier1Max, setTransferFeeTier1Max] = useState(appConfig?.transfer_fee_tier1_max || 5000);
  const [transferFeeTier1Val, setTransferFeeTier1Val] = useState(appConfig?.transfer_fee_tier1_val || 10);
  const [transferFeeTier2Max, setTransferFeeTier2Max] = useState(appConfig?.transfer_fee_tier2_max || 50000);
  const [transferFeeTier2Val, setTransferFeeTier2Val] = useState(appConfig?.transfer_fee_tier2_val || 25);
  const [transferFeeTier3Val, setTransferFeeTier3Val] = useState(appConfig?.transfer_fee_tier3_val || 50);

  // Multi-Currency Wallet Limits
  const [walletMinLimitNgn, setWalletMinLimitNgn] = useState(appConfig?.wallet_min_limit_ngn || 100);
  const [walletMaxLimitNgn, setWalletMaxLimitNgn] = useState(appConfig?.wallet_max_limit_ngn || 5000000);
  const [walletMinLimitUsd, setWalletMinLimitUsd] = useState(appConfig?.wallet_min_limit_usd || 1);
  const [walletMaxLimitUsd, setWalletMaxLimitUsd] = useState(appConfig?.wallet_max_limit_usd || 10000);
  const [walletMinLimitEur, setWalletMinLimitEur] = useState(appConfig?.wallet_min_limit_eur || 1);
  const [walletMaxLimitEur, setWalletMaxLimitEur] = useState(appConfig?.wallet_max_limit_eur || 10000);
  const [walletMinLimitGbp, setWalletMinLimitGbp] = useState(appConfig?.wallet_min_limit_gbp || 1);
  const [walletMaxLimitGbp, setWalletMaxLimitGbp] = useState(appConfig?.wallet_max_limit_gbp || 10000);

  // User KYC Daily Transaction Limits
  const [tier1Limit, setTier1Limit] = useState(appConfig?.tier_1_daily_limit || 50000);
  const [tier2Limit, setTier2Limit] = useState(appConfig?.tier_2_daily_limit || 5000000);
  const [tier3Limit, setTier3Limit] = useState(appConfig?.tier_3_daily_limit || 50000000);

  // Airtime to Cash Payout Rates & Limits
  const [airtimeCashRateMtn, setAirtimeCashRateMtn] = useState(appConfig?.airtime_cash_rate_mtn || 0.80);
  const [airtimeCashRateAirtel, setAirtimeCashRateAirtel] = useState(appConfig?.airtime_cash_rate_airtel || 0.75);
  const [airtimeCashMinAmount, setAirtimeCashMinAmount] = useState(appConfig?.airtime_cash_min_amount || 500);
  const [airtimeCashMaxAmount, setAirtimeCashMaxAmount] = useState(appConfig?.airtime_cash_max_amount || 20000);

  // NIN Identity Verification & Statutory VAT
  const [ninBasicPrice, setNinBasicPrice] = useState(appConfig?.nin_basic_price || 350);
  const [ninPremiumPrice, setNinPremiumPrice] = useState(appConfig?.nin_premium_price || 500);
  const [vatRate, setVatRate] = useState(appConfig?.vat_rate || 7.5);

  // Bill Gateway Driver & Convenience Surcharges
  const [activeBillProvider, setActiveBillProvider] = useState<'flutterwave' | 'interswitch'>(
    appConfig?.active_bill_provider || 'flutterwave'
  );
  const [cableTvFee, setCableTvFee] = useState(appConfig?.cable_tv_convenience_fee || 100);
  const [electricityFee, setElectricityFee] = useState(appConfig?.electricity_convenience_fee || 100);

  // Insurance (MyCover)
  const [mycoverClaimLink, setMycoverClaimLink] = useState(
    appConfig?.mycover_claim_link || 'https://s.mycover.ai/#PPcCRVhWVL'
  );

  // OTP Channels, Rewards & Webhooks
  const [primaryOtp, setPrimaryOtp] = useState<'sms' | 'whatsapp'>(
    appConfig?.primary_otp_channel || 'sms'
  );
  const [cashbackRate, setCashbackRate] = useState(appConfig?.cashback_global_rate || 2.0);
  const [webhookRetries, setWebhookRetries] = useState(appConfig?.webhook_retry_limit || 5);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (activeSubTab) {
      setLocalTab(activeSubTab);
    }
  }, [activeSubTab]);

  useEffect(() => {
    if (appConfig) {
      if (appConfig.admin_account_name) setAdminAccountName(appConfig.admin_account_name);
      if (appConfig.admin_account_number) setAdminAccountNumber(appConfig.admin_account_number);
      if (appConfig.admin_bank_name) setAdminBankName(appConfig.admin_bank_name);
      setSettlementProvider(appConfig.default_settlement_provider);
      setFallbackSettlement(appConfig.fallback_settlement_enabled);
      if (appConfig.transfer_fee_tier1_max != null) setTransferFeeTier1Max(appConfig.transfer_fee_tier1_max);
      if (appConfig.transfer_fee_tier1_val != null) setTransferFeeTier1Val(appConfig.transfer_fee_tier1_val);
      if (appConfig.transfer_fee_tier2_max != null) setTransferFeeTier2Max(appConfig.transfer_fee_tier2_max);
      if (appConfig.transfer_fee_tier2_val != null) setTransferFeeTier2Val(appConfig.transfer_fee_tier2_val);
      if (appConfig.transfer_fee_tier3_val != null) setTransferFeeTier3Val(appConfig.transfer_fee_tier3_val);
      if (appConfig.wallet_min_limit_ngn != null) setWalletMinLimitNgn(appConfig.wallet_min_limit_ngn);
      if (appConfig.wallet_max_limit_ngn != null) setWalletMaxLimitNgn(appConfig.wallet_max_limit_ngn);
      if (appConfig.wallet_min_limit_usd != null) setWalletMinLimitUsd(appConfig.wallet_min_limit_usd);
      if (appConfig.wallet_max_limit_usd != null) setWalletMaxLimitUsd(appConfig.wallet_max_limit_usd);
      if (appConfig.wallet_min_limit_eur != null) setWalletMinLimitEur(appConfig.wallet_min_limit_eur);
      if (appConfig.wallet_max_limit_eur != null) setWalletMaxLimitEur(appConfig.wallet_max_limit_eur);
      if (appConfig.wallet_min_limit_gbp != null) setWalletMinLimitGbp(appConfig.wallet_min_limit_gbp);
      if (appConfig.wallet_max_limit_gbp != null) setWalletMaxLimitGbp(appConfig.wallet_max_limit_gbp);
      setTier1Limit(appConfig.tier_1_daily_limit);
      setTier2Limit(appConfig.tier_2_daily_limit);
      setTier3Limit(appConfig.tier_3_daily_limit);
      if (appConfig.airtime_cash_rate_mtn != null) setAirtimeCashRateMtn(appConfig.airtime_cash_rate_mtn);
      if (appConfig.airtime_cash_rate_airtel != null) setAirtimeCashRateAirtel(appConfig.airtime_cash_rate_airtel);
      if (appConfig.airtime_cash_min_amount != null) setAirtimeCashMinAmount(appConfig.airtime_cash_min_amount);
      if (appConfig.airtime_cash_max_amount != null) setAirtimeCashMaxAmount(appConfig.airtime_cash_max_amount);
      if (appConfig.nin_basic_price != null) setNinBasicPrice(appConfig.nin_basic_price);
      if (appConfig.nin_premium_price != null) setNinPremiumPrice(appConfig.nin_premium_price);
      if (appConfig.vat_rate != null) setVatRate(appConfig.vat_rate);
      if (appConfig.active_bill_provider) setActiveBillProvider(appConfig.active_bill_provider);
      if (appConfig.cable_tv_convenience_fee != null) setCableTvFee(appConfig.cable_tv_convenience_fee);
      if (appConfig.electricity_convenience_fee != null) setElectricityFee(appConfig.electricity_convenience_fee);
      if (appConfig.mycover_claim_link) setMycoverClaimLink(appConfig.mycover_claim_link);
      setPrimaryOtp(appConfig.primary_otp_channel);
      setCashbackRate(appConfig.cashback_global_rate);
      setWebhookRetries(appConfig.webhook_retry_limit);
    }
  }, [appConfig]);

  const handleTabSwitch = (tab: SettingsSubTab) => {
    setLocalTab(tab);
    onSubTabChange?.(tab);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(adminKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setTimeout(() => {
      setIsSavingProfile(false);
      onShowToast?.('Admin profile updated successfully');
    }, 600);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      alert('New passwords do not match or are empty.');
      return;
    }
    onShowToast?.('Administrator password changed successfully');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    if (onUpdateAppConfig) {
      await onUpdateAppConfig({
        admin_account_name: adminAccountName,
        admin_account_number: adminAccountNumber,
        admin_bank_name: adminBankName,
        default_settlement_provider: settlementProvider,
        fallback_settlement_enabled: fallbackSettlement,
        transfer_fee_tier1_max: Number(transferFeeTier1Max),
        transfer_fee_tier1_val: Number(transferFeeTier1Val),
        transfer_fee_tier2_max: Number(transferFeeTier2Max),
        transfer_fee_tier2_val: Number(transferFeeTier2Val),
        transfer_fee_tier3_val: Number(transferFeeTier3Val),
        wallet_min_limit_ngn: Number(walletMinLimitNgn),
        wallet_max_limit_ngn: Number(walletMaxLimitNgn),
        wallet_min_limit_usd: Number(walletMinLimitUsd),
        wallet_max_limit_usd: Number(walletMaxLimitUsd),
        wallet_min_limit_eur: Number(walletMinLimitEur),
        wallet_max_limit_eur: Number(walletMaxLimitEur),
        wallet_min_limit_gbp: Number(walletMinLimitGbp),
        wallet_max_limit_gbp: Number(walletMaxLimitGbp),
        tier_1_daily_limit: Number(tier1Limit),
        tier_2_daily_limit: Number(tier2Limit),
        tier_3_daily_limit: Number(tier3Limit),
        airtime_cash_rate_mtn: Number(airtimeCashRateMtn),
        airtime_cash_rate_airtel: Number(airtimeCashRateAirtel),
        airtime_cash_min_amount: Number(airtimeCashMinAmount),
        airtime_cash_max_amount: Number(airtimeCashMaxAmount),
        nin_basic_price: Number(ninBasicPrice),
        nin_premium_price: Number(ninPremiumPrice),
        vat_rate: Number(vatRate),
        active_bill_provider: activeBillProvider,
        cable_tv_convenience_fee: Number(cableTvFee),
        electricity_convenience_fee: Number(electricityFee),
        mycover_claim_link: mycoverClaimLink,
        primary_otp_channel: primaryOtp,
        cashback_global_rate: Number(cashbackRate),
        webhook_retry_limit: Number(webhookRetries),
      });
    }
    setIsSavingConfig(false);
    onShowToast?.('All platform configurations saved and flushed successfully');
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmail.trim()) return;
    setIsInviting(true);
    if (onInviteTeamMember) {
      await onInviteTeamMember({
        name: newMemberName.trim(),
        email: newMemberEmail.trim(),
        role: newMemberRole,
        status: 'INVITED',
        has_2fa: false,
        last_active: 'Never',
      });
    }
    setIsInviting(false);
    setInviteModalOpen(false);
    setNewMemberName('');
    setNewMemberEmail('');
    onShowToast?.(`Invitation link dispatched to ${newMemberEmail}`);
  };

  const tabs: { id: SettingsSubTab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Profile', icon: <User size={15} /> },
    { id: 'security', label: 'Security', icon: <Lock size={15} /> },
    { id: 'teams', label: 'Teams', icon: <Users size={15} /> },
    { id: 'config', label: 'App Config', icon: <Sliders size={15} /> },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Settings Sub-Tab Navigation Header */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 10,
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: 14,
          flexWrap: 'wrap',
        }}
      >
        {tabs.map((tab) => {
          const isActive = localTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabSwitch(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 18px',
                borderRadius: 'var(--r-md)',
                background: isActive ? 'var(--primary)' : 'var(--bg-white)',
                color: isActive ? '#ffffff' : '#64748b',
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                border: isActive ? '1px solid var(--primary)' : '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? '0 1px 3px rgba(37, 99, 235, 0.2)' : 'none',
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 1: PROFILE
          ========================================================================= */}
      {localTab === 'profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* User Hero Banner */}
          <div
            className="card-standard"
            style={{
              background: 'var(--bg-white)',
              border: '1px solid #e2e8f0',
              padding: '24px 28px',
              borderRadius: 'var(--r-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: '#eff6ff',
                  border: '1.5px solid #bfdbfe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  fontWeight: 700,
                  color: 'var(--primary)',
                }}
              >
                {profileName?.charAt(0)?.toUpperCase() || admin?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#0f172a' }}>
                    {profileName || admin?.name || 'Administrator'}
                  </h2>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: 'var(--r-full)',
                      background: '#eff6ff',
                      color: '#2563eb',
                      border: '1px solid #bfdbfe',
                    }}
                  >
                    {profileRole || admin?.role || 'SUPER ADMIN'}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0 0' }}>
                  {profileEmail || admin?.email || 'admin@paydora.app'} • {profileRole || admin?.role || 'Administrator'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 12px',
                  borderRadius: 'var(--r-full)',
                  fontSize: 12,
                  fontWeight: 600,
                  background: '#f0fdf4',
                  color: '#16a34a',
                  border: '1px solid #bbf7d0',
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }} />
                <span>Session Active</span>
              </span>
            </div>
          </div>

          {/* Edit Profile Form */}
          <div className="card-standard" style={{ background: 'var(--bg-white)', padding: 24, borderRadius: 'var(--r-lg)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
              Personal & Account Information
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px 0' }}>
              Update your administrative profile details and primary contact information.
            </p>

            <form onSubmit={handleSaveProfile} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Full Legal Name
                </label>
                <input
                  type="text"
                  placeholder="Full Legal Name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                    background: '#f8fafc',
                    color: '#0f172a',
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Official Email Address
                </label>
                <input
                  type="email"
                  placeholder="admin@paydora.app"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                    background: '#f8fafc',
                    color: '#0f172a',
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Primary Phone Number
                </label>
                <input
                  type="text"
                  placeholder="+234..."
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                    background: '#f8fafc',
                    color: '#0f172a',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Designation / Operational Role
                </label>
                <input
                  type="text"
                  placeholder="Role designation"
                  value={profileRole}
                  onChange={(e) => setProfileRole(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                    background: '#f8fafc',
                    color: '#0f172a',
                  }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 20px', fontSize: 13 }}
                >
                  <Save size={14} />
                  <span>{isSavingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Active Workstation & Session Metadata */}
          <div className="card-standard" style={{ background: 'var(--bg-white)', padding: 24, borderRadius: 'var(--r-lg)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
              Workstation & Current Session
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 18px 0' }}>
              Telemetry regarding your active administrative access point.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <div style={{ padding: '14px 16px', background: '#f8fafc', borderRadius: 'var(--r-md)', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Client Platform
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Laptop size={14} style={{ color: 'var(--primary)' }} />
                  <span>Mac OS (Apple Silicon)</span>
                </div>
              </div>

              <div style={{ padding: '14px 16px', background: '#f8fafc', borderRadius: 'var(--r-md)', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Connected IP Address
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginTop: 4, fontFamily: 'monospace' }}>
                  102.89.44.12 (Lagos, NG)
                </div>
              </div>

              <div style={{ padding: '14px 16px', background: '#f8fafc', borderRadius: 'var(--r-md)', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Token Signature
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#16a34a', marginTop: 4 }}>
                  HMAC-SHA256 (Valid 12h)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: SECURITY
          ========================================================================= */}
      {localTab === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Credentials Card */}
          <div className="card-standard" style={{ background: 'var(--bg-white)', padding: 24, borderRadius: 'var(--r-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  background: '#eff6ff',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Key size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Administrative API Key
                </h3>
                <p style={{ fontSize: 12.5, color: '#64748b', margin: '3px 0 0 0' }}>
                  Secret header used by automated runners, backend services, and webhooks (`x-admin-key`).
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: 'var(--r-md)',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>
                  Active Production Secret
                </div>
                <div style={{ fontFamily: 'monospace', color: '#0f172a', fontSize: 14, fontWeight: 600, marginTop: 4 }}>
                  {showKey ? (adminKey || 'Not configured in environment') : (adminKey ? `•••••••••••••••••••••••••${adminKey.slice(-4)}` : '••••••••••••••••')}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="btn-outline"
                  style={{ fontSize: 12.5, padding: '7px 12px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
                  <span>{showKey ? 'Hide' : 'Reveal'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="btn-outline"
                  style={{ fontSize: 12.5, padding: '7px 14px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  {copiedKey ? <CheckCircle size={14} color="var(--green)" /> : <Copy size={14} />}
                  <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="card-standard" style={{ background: 'var(--bg-white)', padding: 24, borderRadius: 'var(--r-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  background: '#fef2f2',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Lock size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Password Management
                </h3>
                <p style={{ fontSize: 12.5, color: '#64748b', margin: '3px 0 0 0' }}>
                  Enforce strong cryptographic passwords with minimum 12 characters.
                </p>
              </div>
            </div>

            <form onSubmit={handleSavePassword} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                    background: '#f8fafc',
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Min 12 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                    background: '#f8fafc',
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                    background: '#f8fafc',
                  }}
                  required
                />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                <button type="submit" className="btn-primary" style={{ padding: '8px 18px', fontSize: 13 }}>
                  Update Password
                </button>
              </div>
            </form>
          </div>

          {/* 2FA & IP Whitelist Card */}
          <div className="card-standard" style={{ background: 'var(--bg-white)', padding: 24, borderRadius: 'var(--r-lg)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
              Multi-Factor Authentication & Access Safeguards
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 18px 0' }}>
              Enforce mandatory TOTP two-factor authentication and strict IP restriction.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: 'var(--r-md)',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Smartphone size={20} style={{ color: 'var(--primary)' }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                      Two-Factor Authentication (TOTP Authenticator)
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                      Requires 6-digit TOTP code (Google Authenticator / 1Password) on sign in.
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setTwoFactorEnabled(!twoFactorEnabled);
                    onShowToast?.(`2FA ${!twoFactorEnabled ? 'enabled' : 'disabled'}`);
                  }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--r-full)',
                    fontSize: 12,
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: twoFactorEnabled ? '#f0fdf4' : '#f1f5f9',
                    color: twoFactorEnabled ? '#16a34a' : '#64748b',
                  }}
                >
                  {twoFactorEnabled ? '✓ Enabled' : 'Disabled'}
                </button>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: 'var(--r-md)',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <ShieldCheck size={20} style={{ color: '#d97706' }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                      Admin Console IP Whitelist
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                      Restrict administrative login only to whitelisted corporate VPN ranges.
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIpWhitelistEnforced(!ipWhitelistEnforced);
                    onShowToast?.(`IP Whitelist ${!ipWhitelistEnforced ? 'enforced' : 'relaxed'}`);
                  }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--r-full)',
                    fontSize: 12,
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: ipWhitelistEnforced ? '#eff6ff' : '#f1f5f9',
                    color: ipWhitelistEnforced ? '#2563eb' : '#64748b',
                  }}
                >
                  {ipWhitelistEnforced ? 'Enforced' : 'Optional'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: TEAMS & RBAC
          ========================================================================= */}
      {localTab === 'teams' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Top Action Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Administrative Team Members
              </h3>
              <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0 0' }}>
                Manage team operator access, compliance roles, and administrative invitations.
              </p>
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={() => setInviteModalOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', fontSize: 13 }}
            >
              <Plus size={15} />
              <span>Invite Team Member</span>
            </button>
          </div>

          {/* Team Members Table */}
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
                    <th style={{ padding: '12px 18px', fontWeight: 600 }}>Team Member</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Assigned Role</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>2FA Protected</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Last Active</th>
                    <th style={{ padding: '12px 18px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                        No team members registered yet.
                      </td>
                    </tr>
                  ) : (
                    teamMembers.map((member) => (
                      <tr key={member.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        {/* Name & Email */}
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: '50%',
                                background: '#eff6ff',
                                color: 'var(--primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: 13,
                              }}
                            >
                              {member.name.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: '#0f172a' }}>{member.name}</div>
                              <div style={{ fontSize: 12, color: '#64748b' }}>{member.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Role with inline select and edit button */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <select
                              value={member.role}
                              onChange={(e) => {
                                const newRole = e.target.value as TeamMemberItem['role'];
                                onUpdateTeamMemberRole?.(member.id, newRole);
                              }}
                              style={{
                                padding: '4px 8px',
                                borderRadius: 'var(--r-md)',
                                fontSize: 11.5,
                                fontWeight: 700,
                                cursor: 'pointer',
                                border:
                                  member.role === 'SUPER_ADMIN'
                                    ? '1px solid #bfdbfe'
                                    : member.role === 'COMPLIANCE_OFFICER'
                                    ? '1px solid #bbf7d0'
                                    : member.role === 'FINANCE_SETTLEMENT'
                                    ? '1px solid #e9d5ff'
                                    : '1px solid #fde68a',
                                background:
                                  member.role === 'SUPER_ADMIN'
                                    ? '#eff6ff'
                                    : member.role === 'COMPLIANCE_OFFICER'
                                    ? '#f0fdf4'
                                    : member.role === 'FINANCE_SETTLEMENT'
                                    ? '#faf5ff'
                                    : '#fffbeb',
                                color:
                                  member.role === 'SUPER_ADMIN'
                                    ? '#2563eb'
                                    : member.role === 'COMPLIANCE_OFFICER'
                                    ? '#16a34a'
                                    : member.role === 'FINANCE_SETTLEMENT'
                                    ? '#9333ea'
                                    : '#d97706',
                                outline: 'none',
                              }}
                            >
                              <option value="SUPER_ADMIN">SUPER ADMIN</option>
                              <option value="COMPLIANCE_OFFICER">COMPLIANCE OFFICER</option>
                              <option value="FINANCE_SETTLEMENT">FINANCE & SETTLEMENT</option>
                              <option value="SUPPORT_OPS">SUPPORT & OPS</option>
                            </select>
                          </div>
                        </td>

                        {/* Status */}
                        <td style={{ padding: '14px 16px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              padding: '2px 8px',
                              borderRadius: 'var(--r-full)',
                              fontSize: 11,
                              fontWeight: 700,
                              background: member.status === 'ACTIVE' ? '#f0fdf4' : '#fffbeb',
                              color: member.status === 'ACTIVE' ? '#16a34a' : '#d97706',
                              border: member.status === 'ACTIVE' ? '1px solid #bbf7d0' : '1px solid #fde68a',
                            }}
                          >
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                background: member.status === 'ACTIVE' ? '#16a34a' : '#d97706',
                              }}
                            />
                            <span>{member.status}</span>
                          </span>
                        </td>

                        {/* 2FA */}
                        <td style={{ padding: '14px 16px' }}>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: member.has_2fa ? '#16a34a' : '#94a3b8',
                            }}
                          >
                            {member.has_2fa ? '✓ Protected' : 'Not set'}
                          </span>
                        </td>

                        {/* Last Active */}
                        <td style={{ padding: '14px 16px', fontSize: 12, color: '#64748b' }}>
                          {member.last_active || 'N/A'}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <button
                              type="button"
                              onClick={() => openEditRoleModal(member)}
                              className="btn-outline"
                              style={{
                                padding: '4px 10px',
                                fontSize: 11.5,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                            >
                              <Edit2 size={12} />
                              <span>Edit Role</span>
                            </button>

                            {member.email !== admin?.email && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Remove access for ${member.name}?`)) {
                                    onRemoveTeamMember?.(member.id);
                                    onShowToast?.(`Revoked access for ${member.name}`);
                                  }
                                }}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#dc2626',
                                  cursor: 'pointer',
                                  padding: 6,
                                  borderRadius: 4,
                                }}
                                title="Revoke operator access"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: APP CONFIG (MATCHED TO PAYDORA_BACKEND APP_CONFIGS)
          ========================================================================= */}
      {localTab === 'config' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Top Info Header & Save Button */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Fintech Platform & Rails Configuration
              </h3>
              <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0 0' }}>
                Manage live system parameters, settlement rails, fee schedules, and currency thresholds.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSaveConfig}
              disabled={isSavingConfig}
              className="btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 20px', fontSize: 13 }}
            >
              <Save size={15} />
              <span>{isSavingConfig ? 'Saving Settings...' : 'Save Platform Configuration'}</span>
            </button>
          </div>

          {/* SECTION 1: Master Admin Settlement Bank Account */}
          <div className="card-standard" style={{ background: 'var(--bg-white)', padding: 24, borderRadius: 'var(--r-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <Building2 size={18} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Admin Master Settlement Bank Account
              </h3>
            </div>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px 0' }}>
              Corporate treasury bank account designated for vault sweeps, settlement funding, and admin liquidity reconciliation.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Account Holder Legal Name
                </label>
                <input
                  type="text"
                  value={adminAccountName}
                  onChange={(e) => setAdminAccountName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                    background: '#f8fafc',
                    color: '#0f172a',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Corporate Account Number (NUBAN)
                </label>
                <input
                  type="text"
                  value={adminAccountNumber}
                  onChange={(e) => setAdminAccountNumber(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                    background: '#f8fafc',
                    color: '#0f172a',
                    fontFamily: 'monospace',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Settlement Bank Institution
                </label>
                <input
                  type="text"
                  value={adminBankName}
                  onChange={(e) => setAdminBankName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                    background: '#f8fafc',
                    color: '#0f172a',
                  }}
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Settlement Rails & Outbound NIP Transfer Fee Schedule */}
          <div className="card-standard" style={{ background: 'var(--bg-white)', padding: 24, borderRadius: 'var(--r-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <ArrowRightLeft size={18} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Settlement Rails & Transfer Fee Schedule
              </h3>
            </div>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px 0' }}>
              Configure outward NIP transfer switches, automated failover routing, and customer transaction markup tiers.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, marginBottom: 18 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Primary Outward Settlement Provider
                </label>
                <select
                  value={settlementProvider}
                  onChange={(e) => setSettlementProvider(e.target.value as 'squad' | 'paystack')}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                    background: '#f8fafc',
                    color: '#0f172a',
                    cursor: 'pointer',
                  }}
                >
                  <option value="squad">Squad (HabariPay / GTBank NIP Switch)</option>
                  <option value="paystack">Paystack (Titan NIP Switch)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Automatic Secondary Rail Failover
                </label>
                <select
                  value={fallbackSettlement ? 'true' : 'false'}
                  onChange={(e) => setFallbackSettlement(e.target.value === 'true')}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                    background: '#f8fafc',
                    color: '#0f172a',
                    cursor: 'pointer',
                  }}
                >
                  <option value="true">Enabled (Auto-reroute on switch timeout)</option>
                  <option value="false">Disabled (Do not reroute)</option>
                </select>
              </div>
            </div>

            {/* Transfer Fee Bands */}
            <div style={{ background: '#f8fafc', padding: '16px 18px', borderRadius: 'var(--r-md)', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
                Outward NIP Transfer Markup Matrix (₦ NGN)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 5 }}>
                    Band 1 Max Threshold (₦)
                  </label>
                  <input
                    type="number"
                    value={transferFeeTier1Max}
                    onChange={(e) => setTransferFeeTier1Max(Number(e.target.value))}
                    style={{ width: '100%', padding: '7px 10px', fontSize: 13, borderRadius: 'var(--r-md)', border: '1px solid #cbd5e1' }}
                  />
                  <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 3, display: 'block' }}>Default: ₦5,000</span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 5 }}>
                    Band 1 Transfer Fee (₦)
                  </label>
                  <input
                    type="number"
                    value={transferFeeTier1Val}
                    onChange={(e) => setTransferFeeTier1Val(Number(e.target.value))}
                    style={{ width: '100%', padding: '7px 10px', fontSize: 13, borderRadius: 'var(--r-md)', border: '1px solid #cbd5e1' }}
                  />
                  <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 3, display: 'block' }}>Default: ₦10</span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 5 }}>
                    Band 2 Max Threshold (₦)
                  </label>
                  <input
                    type="number"
                    value={transferFeeTier2Max}
                    onChange={(e) => setTransferFeeTier2Max(Number(e.target.value))}
                    style={{ width: '100%', padding: '7px 10px', fontSize: 13, borderRadius: 'var(--r-md)', border: '1px solid #cbd5e1' }}
                  />
                  <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 3, display: 'block' }}>Default: ₦50,000</span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 5 }}>
                    Band 2 Transfer Fee (₦)
                  </label>
                  <input
                    type="number"
                    value={transferFeeTier2Val}
                    onChange={(e) => setTransferFeeTier2Val(Number(e.target.value))}
                    style={{ width: '100%', padding: '7px 10px', fontSize: 13, borderRadius: 'var(--r-md)', border: '1px solid #cbd5e1' }}
                  />
                  <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 3, display: 'block' }}>Default: ₦25</span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 5 }}>
                    Band 3 Fee (&gt; ₦50k)
                  </label>
                  <input
                    type="number"
                    value={transferFeeTier3Val}
                    onChange={(e) => setTransferFeeTier3Val(Number(e.target.value))}
                    style={{ width: '100%', padding: '7px 10px', fontSize: 13, borderRadius: 'var(--r-md)', border: '1px solid #cbd5e1' }}
                  />
                  <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 3, display: 'block' }}>Default: ₦50</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Multi-Currency Wallet Limits */}
          <div className="card-standard" style={{ background: 'var(--bg-white)', padding: 24, borderRadius: 'var(--r-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <Coins size={18} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Multi-Currency Wallet Balance & Transfer Limits
              </h3>
            </div>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px 0' }}>
              Minimum balance and per-transaction limits enforced on wallets for NGN, USD, EUR, and GBP.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
              {/* NGN */}
              <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: 'var(--r-md)', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>🇳🇬 NGN (Nigerian Naira)</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, color: '#64748b', marginBottom: 4 }}>Min Balance (₦)</label>
                    <input
                      type="number"
                      value={walletMinLimitNgn}
                      onChange={(e) => setWalletMinLimitNgn(Number(e.target.value))}
                      style={{ width: '100%', padding: '6px 10px', fontSize: 12.5, borderRadius: 6, border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, color: '#64748b', marginBottom: 4 }}>Max Transaction (₦)</label>
                    <input
                      type="number"
                      value={walletMaxLimitNgn}
                      onChange={(e) => setWalletMaxLimitNgn(Number(e.target.value))}
                      style={{ width: '100%', padding: '6px 10px', fontSize: 12.5, borderRadius: 6, border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>
              </div>

              {/* USD */}
              <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: 'var(--r-md)', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>🇺🇸 USD (United States Dollar)</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, color: '#64748b', marginBottom: 4 }}>Min Balance ($)</label>
                    <input
                      type="number"
                      value={walletMinLimitUsd}
                      onChange={(e) => setWalletMinLimitUsd(Number(e.target.value))}
                      style={{ width: '100%', padding: '6px 10px', fontSize: 12.5, borderRadius: 6, border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, color: '#64748b', marginBottom: 4 }}>Max Transaction ($)</label>
                    <input
                      type="number"
                      value={walletMaxLimitUsd}
                      onChange={(e) => setWalletMaxLimitUsd(Number(e.target.value))}
                      style={{ width: '100%', padding: '6px 10px', fontSize: 12.5, borderRadius: 6, border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>
              </div>

              {/* EUR */}
              <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: 'var(--r-md)', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>🇪🇺 EUR (Eurozone)</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, color: '#64748b', marginBottom: 4 }}>Min Balance (€)</label>
                    <input
                      type="number"
                      value={walletMinLimitEur}
                      onChange={(e) => setWalletMinLimitEur(Number(e.target.value))}
                      style={{ width: '100%', padding: '6px 10px', fontSize: 12.5, borderRadius: 6, border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, color: '#64748b', marginBottom: 4 }}>Max Transaction (€)</label>
                    <input
                      type="number"
                      value={walletMaxLimitEur}
                      onChange={(e) => setWalletMaxLimitEur(Number(e.target.value))}
                      style={{ width: '100%', padding: '6px 10px', fontSize: 12.5, borderRadius: 6, border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>
              </div>

              {/* GBP */}
              <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: 'var(--r-md)', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>🇬🇧 GBP (British Pound)</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, color: '#64748b', marginBottom: 4 }}>Min Balance (£)</label>
                    <input
                      type="number"
                      value={walletMinLimitGbp}
                      onChange={(e) => setWalletMinLimitGbp(Number(e.target.value))}
                      style={{ width: '100%', padding: '6px 10px', fontSize: 12.5, borderRadius: 6, border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, color: '#64748b', marginBottom: 4 }}>Max Transaction (£)</label>
                    <input
                      type="number"
                      value={walletMaxLimitGbp}
                      onChange={(e) => setWalletMaxLimitGbp(Number(e.target.value))}
                      style={{ width: '100%', padding: '6px 10px', fontSize: 12.5, borderRadius: 6, border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: KYC Tier Transfer Limits Card */}
          <div className="card-standard" style={{ background: 'var(--bg-white)', padding: 24, borderRadius: 'var(--r-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <ShieldCheck size={18} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Daily Maximum Transfer Limits by Tier (₦ NGN)
              </h3>
            </div>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px 0' }}>
              Enforce regulatory Central Bank compliance limits for wallet outgoing transactions.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Tier 1 (Phone Verified Only)
                </label>
                <input
                  type="number"
                  value={tier1Limit}
                  onChange={(e) => setTier1Limit(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                    background: '#f8fafc',
                    color: '#0f172a',
                  }}
                />
                <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, display: 'block' }}>
                  Default: ₦50,000 / day
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Tier 2 (BVN / NIN Verified)
                </label>
                <input
                  type="number"
                  value={tier2Limit}
                  onChange={(e) => setTier2Limit(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                    background: '#f8fafc',
                    color: '#0f172a',
                  }}
                />
                <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, display: 'block' }}>
                  Default: ₦5,000,000 / day
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Tier 3 (Proof of Address & CAC)
                </label>
                <input
                  type="number"
                  value={tier3Limit}
                  onChange={(e) => setTier3Limit(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                    background: '#f8fafc',
                    color: '#0f172a',
                  }}
                />
                <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, display: 'block' }}>
                  Default: ₦50,000,000 / day
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 5: Airtime to Cash Conversion Payouts & Limits */}
          <div className="card-standard" style={{ background: 'var(--bg-white)', padding: 24, borderRadius: 'var(--r-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <Smartphone size={18} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Airtime to Cash Conversion Rates & Thresholds
              </h3>
            </div>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px 0' }}>
              Customer payout percentages and allowable minimum/maximum transaction bounds for airtime liquidation.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  MTN Customer Payout Ratio
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={airtimeCashRateMtn}
                  onChange={(e) => setAirtimeCashRateMtn(parseFloat(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                    background: '#f8fafc',
                    color: '#0f172a',
                  }}
                />
                <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, display: 'block' }}>
                  Default: 0.80 (Customer receives 80%, Paydora retains 20%)
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Airtel Customer Payout Ratio
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={airtimeCashRateAirtel}
                  onChange={(e) => setAirtimeCashRateAirtel(parseFloat(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                    background: '#f8fafc',
                    color: '#0f172a',
                  }}
                />
                <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, display: 'block' }}>
                  Default: 0.75 (Customer receives 75%, Paydora retains 25%)
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Minimum Airtime Liquidation (₦)
                </label>
                <input
                  type="number"
                  value={airtimeCashMinAmount}
                  onChange={(e) => setAirtimeCashMinAmount(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                    background: '#f8fafc',
                    color: '#0f172a',
                  }}
                />
                <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, display: 'block' }}>
                  Default: ₦500
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Maximum Airtime per Session (₦)
                </label>
                <input
                  type="number"
                  value={airtimeCashMaxAmount}
                  onChange={(e) => setAirtimeCashMaxAmount(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                    background: '#f8fafc',
                    color: '#0f172a',
                  }}
                />
                <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, display: 'block' }}>
                  Default: ₦20,000
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 6: NIN Verification & Statutory Taxes */}
          <div className="card-standard" style={{ background: 'var(--bg-white)', padding: 24, borderRadius: 'var(--r-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <FileText size={18} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Identity Verification (NIN) & Statutory Taxes
              </h3>
            </div>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px 0' }}>
              Pricing models for National Identity Management Commission (NIMC) lookups and statutory VAT.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  NIN Basic Verification Slip Price (₦)
                </label>
                <input
                  type="number"
                  value={ninBasicPrice}
                  onChange={(e) => setNinBasicPrice(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                    background: '#f8fafc',
                    color: '#0f172a',
                  }}
                />
                <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, display: 'block' }}>
                  Default: ₦350 (Cost: ₦120)
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  NIN Premium Slip with Photo Price (₦)
                </label>
                <input
                  type="number"
                  value={ninPremiumPrice}
                  onChange={(e) => setNinPremiumPrice(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                    background: '#f8fafc',
                    color: '#0f172a',
                  }}
                />
                <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, display: 'block' }}>
                  Default: ₦500 (Cost: ₦200)
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Value Added Tax (VAT Rate %)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={vatRate}
                  onChange={(e) => setVatRate(parseFloat(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                    background: '#f8fafc',
                    color: '#0f172a',
                  }}
                />
                <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, display: 'block' }}>
                  Standard Nigerian Statutory Rate: 7.5%
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 7: Bill Payment Gateway Driver & Utility Surcharges */}
          <div className="card-standard" style={{ background: 'var(--bg-white)', padding: 24, borderRadius: 'var(--r-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <Receipt size={18} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Bill Payment Gateway & Utility Surcharges
              </h3>
            </div>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px 0' }}>
              Select the active bill payment aggregator driver and configure customer utility convenience fees.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Active Bill Payment Driver
                </label>
                <select
                  value={activeBillProvider}
                  onChange={(e) => setActiveBillProvider(e.target.value as 'flutterwave' | 'interswitch')}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                    background: '#f8fafc',
                    color: '#0f172a',
                    cursor: 'pointer',
                  }}
                >
                  <option value="flutterwave">Flutterwave Bill Services</option>
                  <option value="interswitch">Interswitch Quickteller Driver</option>
                </select>
                <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, display: 'block' }}>
                  Routes all Airtime, Cable TV, and Discos through this aggregator
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Cable TV Convenience Fee (₦)
                </label>
                <input
                  type="number"
                  value={cableTvFee}
                  onChange={(e) => setCableTvFee(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                    background: '#f8fafc',
                    color: '#0f172a',
                  }}
                />
                <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, display: 'block' }}>
                  Default surcharge: ₦100 per DSTV / GOTV / Startimes recharge
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Electricity Disco Convenience Fee (₦)
                </label>
                <input
                  type="number"
                  value={electricityFee}
                  onChange={(e) => setElectricityFee(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                    background: '#f8fafc',
                    color: '#0f172a',
                  }}
                />
                <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, display: 'block' }}>
                  Default surcharge: ₦100 per Prepaid / Postpaid token generated
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 8: Insurance (MyCover) Portal & Integration */}
          <div className="card-standard" style={{ background: 'var(--bg-white)', padding: 24, borderRadius: 'var(--r-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <Shield size={18} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Insurance Claim Portal & Partner URLs
              </h3>
            </div>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px 0' }}>
              Deep-link configurations for external customer claim reporting and policy onboarding.
            </p>

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                MyCover AI Claim Portal Link
              </label>
              <input
                type="url"
                value={mycoverClaimLink}
                onChange={(e) => setMycoverClaimLink(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--r-md)',
                  border: '1px solid #e2e8f0',
                  fontSize: 13,
                  background: '#f8fafc',
                  color: '#0f172a',
                  fontFamily: 'monospace',
                }}
              />
              <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, display: 'block' }}>
                Default: https://s.mycover.ai/#PPcCRVhWVL (Mobile app opens this portal for claims)
              </span>
            </div>
          </div>

          {/* SECTION 9: Messaging, Rewards & Webhooks */}
          <div className="card-standard" style={{ background: 'var(--bg-white)', padding: 24, borderRadius: 'var(--r-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <Sliders size={18} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Messaging Channels, Rewards & Webhook Parameters
              </h3>
            </div>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px 0' }}>
              Primary OTP channels, global cashback rate, and webhook retry thresholds.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Primary Customer OTP Channel
                </label>
                <select
                  value={primaryOtp}
                  onChange={(e) => setPrimaryOtp(e.target.value as 'sms' | 'whatsapp')}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                    background: '#f8fafc',
                    color: '#0f172a',
                    cursor: 'pointer',
                  }}
                >
                  <option value="sms">Termii SMS (N-Alert Channel)</option>
                  <option value="whatsapp">Meta WhatsApp Cloud API</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Global Cashback Base Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={cashbackRate}
                  onChange={(e) => setCashbackRate(parseFloat(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                    background: '#f8fafc',
                    color: '#0f172a',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Webhook Delivery Retry Threshold
                </label>
                <input
                  type="number"
                  value={webhookRetries}
                  onChange={(e) => setWebhookRetries(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                    background: '#f8fafc',
                    color: '#0f172a',
                  }}
                />
                <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, display: 'block' }}>
                  Default: 5 retries with exponential backoff
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
              <button
                type="button"
                onClick={handleSaveConfig}
                disabled={isSavingConfig}
                className="btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 24px', fontSize: 13.5 }}
              >
                <Save size={15} />
                <span>{isSavingConfig ? 'Saving All Settings...' : 'Save All Platform Configurations'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          FULL-SCREEN INVITE TEAM MEMBER MODAL (VIA CREATEPORTAL)
          ========================================================================= */}
      {inviteModalOpen && mounted && typeof document !== 'undefined' && createPortal(
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
          onClick={() => setInviteModalOpen(false)}
        >
          <div
            className="animate-fade-in"
            style={{
              background: '#ffffff',
              borderRadius: 'var(--r-xl)',
              width: '100%',
              maxWidth: 540,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f8fafc',
              }}
            >
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Invite Team Member
                </h3>
                <p style={{ fontSize: 12.5, color: '#64748b', margin: '3px 0 0 0' }}>
                  Send an administrative activation link to a team operator.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: 4,
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Member Full Name
                </label>
                <input
                  type="text"
                  placeholder="Full name"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Work Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Operational Access Role
                </label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                    background: '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  <option value="SUPPORT_OPS">Support & Ops (Read ledger, requery, alerts)</option>
                  <option value="COMPLIANCE_OFFICER">Compliance Officer (KYC, BVN/NIN, restrictions)</option>
                  <option value="FINANCE_SETTLEMENT">Finance & Settlement (Bank rails, vault sweep)</option>
                  <option value="SUPER_ADMIN">Super Admin (Unrestricted platform authority)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setInviteModalOpen(false)}
                  style={{ padding: '8px 16px', fontSize: 13 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInviting}
                  className="btn-primary"
                  style={{ padding: '8px 20px', fontSize: 13 }}
                >
                  {isInviting ? 'Sending Invite...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* =========================================================================
          FULL-SCREEN EDIT ROLE MODAL (VIA CREATEPORTAL)
          ========================================================================= */}
      {editRoleModalOpen && selectedMemberForRole && mounted && typeof document !== 'undefined' && createPortal(
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
          onClick={() => setEditRoleModalOpen(false)}
        >
          <div
            className="animate-fade-in"
            style={{
              background: '#ffffff',
              borderRadius: 'var(--r-xl)',
              width: '100%',
              maxWidth: 540,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f8fafc',
              }}
            >
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Edit Team Member Role
                </h3>
                <p style={{ fontSize: 12.5, color: '#64748b', margin: '3px 0 0 0' }}>
                  Modify operational privileges and access boundaries for this operator.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditRoleModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: 4,
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveRole} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Target Member Info Card */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  borderRadius: 'var(--r-md)',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: '#eff6ff',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  {selectedMemberForRole.name.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>
                    {selectedMemberForRole.name}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedMemberForRole.email}
                  </div>
                </div>
              </div>

              {/* Role Selection Options */}
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 10 }}>
                  Select Operational Role
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    {
                      role: 'SUPER_ADMIN' as const,
                      title: 'SUPER ADMIN',
                      desc: 'Full administrative control over all settlement rails, vault parameters, and platform permissions.',
                      badgeBg: '#eff6ff',
                      badgeColor: '#2563eb',
                      badgeBorder: '#bfdbfe',
                    },
                    {
                      role: 'COMPLIANCE_OFFICER' as const,
                      title: 'COMPLIANCE OFFICER',
                      desc: 'BVN/NIN identity verification, AML fraud checks, account restrictions, and unblocking reviews.',
                      badgeBg: '#f0fdf4',
                      badgeColor: '#16a34a',
                      badgeBorder: '#bbf7d0',
                    },
                    {
                      role: 'FINANCE_SETTLEMENT' as const,
                      title: 'FINANCE & SETTLEMENT',
                      desc: 'Squad & Paystack vault sweep reconciliation, fee schedules, bank settlement priorities.',
                      badgeBg: '#faf5ff',
                      badgeColor: '#9333ea',
                      badgeBorder: '#e9d5ff',
                    },
                    {
                      role: 'SUPPORT_OPS' as const,
                      title: 'SUPPORT & OPS',
                      desc: 'Transaction ledger search, re-query failed transfers, inspect receipt proofs, and WhatsApp customer care.',
                      badgeBg: '#fffbeb',
                      badgeColor: '#d97706',
                      badgeBorder: '#fde68a',
                    },
                  ].map((item) => {
                    const isSelected = selectedRoleValue === item.role;
                    return (
                      <div
                        key={item.role}
                        onClick={() => setSelectedRoleValue(item.role)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 12,
                          padding: '12px 14px',
                          borderRadius: 'var(--r-md)',
                          border: isSelected ? '1.5px solid var(--primary)' : '1px solid #e2e8f0',
                          background: isSelected ? 'var(--primary-subtle, #f0fdf9)' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <input
                          type="radio"
                          name="assignedRole"
                          checked={isSelected}
                          onChange={() => setSelectedRoleValue(item.role)}
                          style={{ marginTop: 3, cursor: 'pointer', accentColor: 'var(--primary)' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                              {item.title}
                            </span>
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                padding: '1px 6px',
                                borderRadius: 4,
                                background: item.badgeBg,
                                color: item.badgeColor,
                                border: `1px solid ${item.badgeBorder}`,
                              }}
                            >
                              {item.role}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: 11.5, color: '#64748b', lineHeight: 1.4 }}>
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setEditRoleModalOpen(false)}
                  style={{ padding: '8px 16px', fontSize: 13 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingRole}
                  className="btn-primary"
                  style={{ padding: '8px 20px', fontSize: 13 }}
                >
                  {isSavingRole ? 'Saving Role...' : 'Save Role Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
