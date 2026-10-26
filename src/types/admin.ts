export type AdminRole = 'ADMIN' | 'COMPLIANCE_OFFICER' | 'SUPPORT_AGENT' | 'FINANCE_OPS';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  gender?: 'male' | 'female' | string;
  role: AdminRole;
  is_admin: boolean;
  avatar_url?: string;
  token?: string;
}

export type KycStatus = 'unverified' | 'pending' | 'under_review' | 'verified' | 'rejected';

export function formatKycStatus(status: KycStatus | string): string {
  const map: Record<string, string> = {
    unverified: 'Unverified',
    pending: 'Pending',
    under_review: 'Under review',
    verified: 'Verified',
    rejected: 'Rejected',
  };
  return map[status] || status.charAt(0).toUpperCase() + status.slice(1);
}

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
  id_document_type?: string;
  id_document_number?: string;
  residential_address?: string;
  state_of_origin?: string;
  gender?: string;
  liveness_score?: number;
  bvn_match_status?: string;
  nin_match_status?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  virtual_account_number?: string;
  virtual_account_bank?: string;
  virtual_account_name?: string;
}

export interface UserAccount {
  id: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  username: string;
  role?: string;
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

export function formatTransactionType(type: string): string {
  const map: Record<string, string> = {
    TRANSFER: 'Transfer',
    BILL_PAYMENT: 'Bill payment',
    WALLET_TOPUP: 'Wallet top-up',
    AIRTIME_CASH: 'Airtime to cash',
    CARD_FUNDING: 'Card funding',
  };
  if (map[type]) return map[type];
  return type
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase());
}

export function formatTransactionStatus(status: string): string {
  const map: Record<string, string> = {
    SUCCESS: 'Success',
    FAILED: 'Failed',
    PENDING: 'Pending',
    REVERSED: 'Reversed',
  };
  if (map[status]) return map[status];
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

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
  payment_method?: string;
  channel?: string;
  direction?: 'CREDIT' | 'DEBIT';
  description?: string;
  settled_at?: string;
  provider_reference?: string;
  session_id?: string;
  ip_address?: string;
  gateway_response?: string;
  beneficiary?: {
    account_number: string;
    bank_name: string;
    account_name: string;
  };
}

export type SettlementProvider = 'paystack' | 'squad';

export interface BankConfigItem {
  id: string;
  name: string;
  code: string;
  provider: SettlementProvider;
  is_common: boolean;
  logo: string | null;
  active: boolean;
}

export type BroadcastChannel = 'PUSH' | 'EMAIL' | 'BOTH';
export type MobilePlatform = 'ALL' | 'IOS' | 'ANDROID';

export interface BroadcastDraft {
  channel: BroadcastChannel;
  mobilePlatform?: MobilePlatform;
  pushTitle?: string;
  pushBody?: string;
  pushDeepLink?: string;
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
  mobilePushDevices?: number;
}

export interface SystemMetrics {
  totalUsers: number;
  activeToday: number;
  pendingKycCount: number;
  blockedUsersCount: number;
  volume24hNgn: number;
  txCount24h: number;
  custodialDepositsNgn: number;
  platformFeeRevenueNgn: number;
  activeCardsCount: number;
  squadBalanceNgn: number;
  paystackBalanceNgn: number;
  termiiBalanceNgn: number;
  termiiUnits: number;
  korapayBalanceNgn: number;
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

export type BillsSubTab = 'categories' | 'billers' | 'products';

export interface BillCategoryConfigItem {
  id: string;
  category_name: string;
  code: string;
  label: string;
  icon?: string | null;
  is_available: boolean;
  is_hot: boolean;
  feature: boolean;
  requires_validation: boolean;
  section?: string | null;
  cashback_percentage: number;
  provider?: string | null;
  order: number;
  created_at?: string;
  updated_at?: string;
}

export interface StandardBillerItem {
  id: string;
  biller_code: string;
  name: string;
  category_id: string;
  category_name?: string;
  is_available: boolean;
  cashback_percentage: number;
  is_hot: boolean;
  provider: string;
  logo?: string | null;
  description?: string | null;
  short_name?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BillerProductItem {
  id: string;
  biller_code: string;
  product_code: string;
  name: string;
  biller_name?: string | null;
  short_name?: string | null;
  amount: number | null;
  is_available: boolean;
  is_hot: boolean;
  provider?: string | null;
  validity_days?: number | null;
  created_at?: string;
  updated_at?: string;
}

export type LogsSubTab = 'system' | 'jobs' | 'sms' | 'email' | 'webhooks' | 'audit';

export type SystemLogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

export interface SystemLogItem {
  id: string;
  level: SystemLogLevel;
  service: string;
  message: string;
  ip_address: string;
  endpoint?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  status_code?: number;
  latency_ms?: number;
  details?: string;
  created_at: string;
}

export type JobStatus = 'COMPLETED' | 'FAILED' | 'DELAYED' | 'ACTIVE' | 'WAITING';

export interface JobLogItem {
  id: string;
  queue: string;
  job_id: string;
  name: string;
  status: JobStatus;
  attempts: number;
  max_attempts: number;
  duration_ms: number;
  error_message?: string;
  payload?: string;
  processed_at: string;
}

export type SmsStatus = 'DELIVERED' | 'SENT' | 'FAILED' | 'PENDING';
export type SmsType = 'OTP' | 'ALERT' | 'TRANSACTION' | 'MARKETING';

export interface SmsLogItem {
  id: string;
  recipient: string;
  sender_id: string;
  message: string;
  type: SmsType;
  channel: 'dnd' | 'whatsapp' | 'generic';
  status: SmsStatus;
  units: number;
  cost_ngn: number;
  provider: 'termii' | 'meta-whatsapp';
  provider_reference?: string;
  created_at: string;
}

export type EmailDeliveryStatus = 'DELIVERED' | 'BOUNCED' | 'OPENED' | 'SENT' | 'QUEUED' | 'FAILED';

export interface EmailLogItem {
  id: string;
  recipient: string;
  subject: string;
  template: string;
  status: EmailDeliveryStatus;
  provider: 'resend' | 'sendgrid' | 'smtp';
  opened_at?: string;
  error_reason?: string;
  size_kb?: number;
  created_at: string;
}

export interface WebhookLogItem {
  id: string;
  provider: 'squad' | 'paystack' | 'termii' | 'meta' | 'korapay';
  event: string;
  direction: 'INBOUND' | 'OUTBOUND';
  status: 'PROCESSED' | 'FAILED' | 'RETRYING' | 'IGNORED';
  response_code: number;
  duration_ms: number;
  payload: string;
  created_at: string;
}

export interface AuditLogItem {
  id: string;
  admin_email: string;
  admin_name: string;
  action: string;
  target_resource: string;
  ip_address: string;
  user_agent?: string;
  status: 'SUCCESS' | 'BLOCKED' | 'FAILED';
  metadata?: string;
  created_at: string;
}

export type WishlistSubTab = 'card' | 'wealth';

export interface CardWishlistItem {
  id: string;
  user_id: string;
  name: string;
  username?: string;
  email: string;
  phone: string;
  card_type: 'VIRTUAL' | 'PHYSICAL' | 'BOTH';
  status: 'WAITING' | 'INVITED' | 'ISSUED';
  kyc_tier: number;
  kyc_status?: string;
  created_at: string;
  joined_at?: string;
}

export interface WealthWishlistItem {
  id: string;
  user_id: string;
  name: string;
  username?: string;
  email: string;
  phone: string;
  interest_category: string;
  target_deposit_ngn: number;
  status: 'WAITING' | 'INVITED' | 'EARLY_ACCESS';
  kyc_tier: number;
  created_at: string;
  joined_at?: string;
}

export type SettingsSubTab = 'profile' | 'security' | 'teams' | 'config';

export interface TeamMemberItem {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'COMPLIANCE_OFFICER' | 'FINANCE_SETTLEMENT' | 'SUPPORT_OPS';
  status: 'ACTIVE' | 'INVITED' | 'SUSPENDED';
  has_2fa: boolean;
  avatar_url?: string;
  last_active?: string;
  created_at: string;
}

export interface AppConfigSettings {
  // Master Admin Settlement Account
  admin_account_name?: string;
  admin_account_number?: string;
  admin_bank_name?: string;

  // Settlement Rails & Transfer Markup
  default_settlement_provider: 'squad' | 'paystack';
  transfer_provider?: 'squad' | 'paystack';
  fallback_settlement_enabled: boolean;
  transfer_fee_tier1_max?: number;
  transfer_fee_tier1_val?: number;
  transfer_fee_tier2_max?: number;
  transfer_fee_tier2_val?: number;
  transfer_fee_tier3_val?: number;

  // Multi-Currency Wallet Limits
  wallet_min_limit_ngn?: number;
  wallet_max_limit_ngn?: number;
  wallet_min_limit_usd?: number;
  wallet_max_limit_usd?: number;
  wallet_min_limit_eur?: number;
  wallet_max_limit_eur?: number;
  wallet_min_limit_gbp?: number;
  wallet_max_limit_gbp?: number;

  // User KYC Daily Transaction Limits
  tier_1_daily_limit: number;
  tier_2_daily_limit: number;
  tier_3_daily_limit: number;

  // Airtime to Cash Payout Rates & Limits
  airtime_cash_rate_mtn?: number;
  airtime_cash_rate_airtel?: number;
  airtime_cash_min_amount?: number;
  airtime_cash_max_amount?: number;

  // NIN Identity Verification & Statutory VAT
  nin_basic_price?: number;
  nin_premium_price?: number;
  vat_rate?: number;

  // Bill Gateway Driver & Convenience Surcharges
  active_bill_provider?: 'squad';
  cable_tv_convenience_fee?: number;
  electricity_convenience_fee?: number;


  // OTP Channels, Rewards & Webhooks
  primary_otp_channel: 'sms' | 'whatsapp';
  cashback_global_rate: number;
  webhook_retry_limit: number;

  updated_at?: string;
}


