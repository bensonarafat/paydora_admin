export type AdminRole = 'SUPER_ADMIN' | 'COMPLIANCE_OFFICER' | 'SUPPORT_AGENT' | 'FINANCE_OPS';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  is_admin: boolean;
  avatar_url?: string;
  token?: string;
}

export type KycStatus = 'unverified' | 'pending' | 'under_review' | 'verified' | 'rejected';

export interface KycReviewItem {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  bvn?: string;
  nin?: string;
  dob?: string;
  tier: number;
  status: KycStatus;
  submitted_at: string;
  rejection_reason?: string;
  risk_score?: 'LOW' | 'MEDIUM' | 'HIGH';
  channel?: 'SMS' | 'WHATSAPP';
}

export interface UserAccount {
  id: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  username: string;
  kyc_tier: number;
  kyc_status: KycStatus;
  is_blocked: boolean;
  blocked_reason?: string;
  blocked_at?: string;
  created_at: string;
  balance_ngn: number;
  virtual_account?: {
    account_number: string;
    bank_name: string;
    account_name: string;
  };
}

export type TransactionStatus = 'SUCCESS' | 'PENDING' | 'FAILED' | 'REVERSED';
export type TransactionType = 'TRANSFER' | 'BILL_PAYMENT' | 'AIRTIME_CASH' | 'CARD_FUNDING' | 'WALLET_TOPUP';

export interface TransactionItem {
  id: string;
  reference: string;
  user_id: string;
  user_name: string;
  user_email: string;
  amount: number;
  fee: number;
  currency: string;
  type: TransactionType;
  status: TransactionStatus;
  created_at: string;
  beneficiary?: {
    account_number: string;
    bank_name: string;
    account_name: string;
  };
}

export interface BankConfigItem {
  id: string;
  name: string;
  code: string;
  is_common: boolean;
  logo: string | null;
  active: boolean;
}

export interface BroadcastDraft {
  subject: string;
  preheader?: string;
  title: string;
  body: string;
  ctaText?: string;
  ctaUrl?: string;
  targetAudience: 'ALL' | 'VERIFIED_ONLY' | 'UNVERIFIED_ONLY' | 'PENDING_KYC' | 'BLOCKED_USERS';
}

export interface AudienceStats {
  totalUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  pendingKycUsers: number;
  blockedUsers: number;
}

export interface AuditLogItem {
  id: string;
  actor_email: string;
  action: string;
  target: string;
  details: string;
  ip_address: string;
  timestamp: string;
}

export interface SystemMetrics {
  totalUsers: number;
  activeToday: number;
  pendingKycCount: number;
  blockedUsersCount: number;
  volume24hNgn: number;
  txCount24h: number;
  queues: {
    name: string;
    status: 'HEALTHY' | 'WARNING' | 'DOWN';
    pendingJobs: number;
  }[];
}

export interface WhatsAppMessage {
  id: string;
  sender: 'customer' | 'admin';
  senderName: string;
  message: string;
  timestamp: string;
  status?: 'SENT' | 'DELIVERED' | 'READ';
}

export interface WhatsAppConversation {
  id: string;
  phone: string;
  customerName: string;
  avatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  kycTier: number;
  kycStatus: KycStatus;
  accountBalanceNgn: number;
  bvn?: string;
  messages: WhatsAppMessage[];
}

