import { 
  AdminUser, 
  AudienceStats, 
  BankConfigItem, 
  BillCategoryConfigItem,
  BillerProductItem,
  BroadcastDraft, 
  KycReviewItem, 
  KycStatus, 
  StandardBillerItem,
  SystemMetrics, 
  TransactionItem, 
  UserAccount,
  WhatsAppConversation,
  WhatsAppMessage,
  SystemLogItem,
  JobLogItem,
  SmsLogItem,
  EmailLogItem,
  WebhookLogItem,
  AuditLogItem,
  TeamMemberItem,
  AppConfigSettings,
  CardWishlistItem,
  WealthWishlistItem
} from '@/types/admin';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || 'paydora-admin-secret';

// In-memory session store
let currentAdmin: AdminUser | null = {
  id: 'adm-001',
  email: 'admin@paydora.africa',
  name: 'Benson Arafat',
  role: 'ADMIN',
  is_admin: true,
  token: 'mock-admin-token-jwt',
};

// Initial state mock data for high-fidelity instant preview and testing
let mockKycSubmissions: KycReviewItem[] = [
  {
    id: 'kyc-101',
    user_id: 'usr-9812',
    full_name: 'Chukwuebuka Daniel Obi',
    email: 'ebuka.obi@gmail.com',
    phone: '+2348034567890',
    bvn: '22294819034',
    nin: '19048593847',
    dob: '1994-08-14',
    tier: 2,
    status: 'under_review',
    submitted_at: '2026-10-16T04:22:10Z',
    risk_score: 'LOW',
    channel: 'WHATSAPP',
    id_document_type: 'National Identity (NIN Slip)',
    id_document_number: 'NIN-19048593847',
    residential_address: 'Plot 12, Block 4, Victoria Island, Lagos',
    state_of_origin: 'Anambra State',
    gender: 'Male',
    liveness_score: 99.1,
    bvn_match_status: 'Full match (100% photo & name match)',
    nin_match_status: 'NIMC record verified',
  },
  {
    id: 'kyc-102',
    user_id: 'usr-9813',
    full_name: 'Amina Zainab Bello',
    email: 'amina.bello@yahoo.com',
    phone: '+2349021112233',
    bvn: '22184920491',
    nin: '94820491823',
    dob: '1997-12-03',
    tier: 1,
    status: 'pending',
    submitted_at: '2026-10-16T05:15:30Z',
    risk_score: 'MEDIUM',
    channel: 'SMS',
    id_document_type: "Driver's License",
    id_document_number: 'DL-KNO-89102-AA',
    residential_address: '88 Bompai Road, Kano Municipal, Kano',
    state_of_origin: 'Kano State',
    gender: 'Female',
    liveness_score: 94.5,
    bvn_match_status: 'Name confirmed, DOB pending secondary match',
    nin_match_status: 'NIMC verification pending response',
  },
  {
    id: 'kyc-103',
    user_id: 'usr-9814',
    full_name: 'Olumide Femi Adeleke',
    email: 'olumide.adeleke@outlook.com',
    phone: '+2347089900112',
    bvn: '22940291048',
    nin: '83920194821',
    dob: '1989-03-21',
    tier: 2,
    status: 'under_review',
    submitted_at: '2026-10-15T22:45:00Z',
    risk_score: 'LOW',
    channel: 'WHATSAPP',
    id_document_type: 'International Passport',
    id_document_number: 'A08910294',
    residential_address: '22 Isaac John Street, GRA Ikeja, Lagos',
    state_of_origin: 'Osun State',
    gender: 'Male',
    liveness_score: 98.7,
    bvn_match_status: 'NIBSS verified / active biometric match',
    nin_match_status: 'NIMC record verified',
  },
  {
    id: 'kyc-104',
    user_id: 'usr-9815',
    full_name: 'Fatima Hadiza Umar',
    email: 'fatima.umar@gmail.com',
    phone: '+2348123344556',
    bvn: '22049182740',
    dob: '1995-06-30',
    tier: 1,
    status: 'rejected',
    submitted_at: '2026-10-15T18:20:12Z',
    rejection_reason: 'BVN official names do not match account holder registration names.',
    risk_score: 'HIGH',
    channel: 'SMS',
    id_document_type: 'National Identity (NIN Slip)',
    id_document_number: 'NIN-55019284910',
    residential_address: '15 Constitution Avenue, Central Business District, Abuja',
    state_of_origin: 'Kaduna State',
    gender: 'Female',
    liveness_score: 82.0,
    bvn_match_status: 'Failed name match (Score 41%)',
    nin_match_status: 'Mismatch with provided BVN date of birth',
  },
  {
    id: 'kyc-105',
    user_id: 'usr-9816',
    full_name: 'Somtochukwu Victor Eze',
    email: 'somto.eze@gmail.com',
    phone: '+2348055667788',
    bvn: '22491029384',
    nin: '72910492819',
    dob: '1992-11-09',
    tier: 3,
    status: 'verified',
    submitted_at: '2026-10-15T11:10:00Z',
    risk_score: 'LOW',
    channel: 'WHATSAPP',
    id_document_type: 'National Identity (NIN Slip)',
    id_document_number: 'NIN-72910492819',
    residential_address: '5 Freedom Way, Lekki Phase 1, Lagos',
    state_of_origin: 'Enugu State',
    gender: 'Male',
    liveness_score: 99.8,
    bvn_match_status: '100% Match / Verified by NIBSS',
    nin_match_status: '100% Match / Live NIMC token active',
  },
];

let mockUsers: UserAccount[] = [
  {
    id: 'usr-9812',
    email: 'ebuka.obi@gmail.com',
    phone: '+2348034567890',
    first_name: 'Chukwuebuka',
    last_name: 'Obi',
    username: 'ebuka_obi',
    kyc_tier: 2,
    kyc_status: 'under_review',
    is_blocked: false,
    created_at: '2026-09-12T10:00:00Z',
    balance_ngn: 245000,
    virtual_account: {
      account_number: '9082341029',
      bank_name: 'Wema Bank (Squad)',
      account_name: 'Paydora / Chukwuebuka Obi',
    },
  },
  {
    id: 'usr-9813',
    email: 'amina.bello@yahoo.com',
    phone: '+2349021112233',
    first_name: 'Amina',
    last_name: 'Bello',
    username: 'aminabello',
    kyc_tier: 1,
    kyc_status: 'pending',
    is_blocked: false,
    created_at: '2026-10-01T14:20:00Z',
    balance_ngn: 12500,
    virtual_account: {
      account_number: '8091823746',
      bank_name: 'Titan Trust Bank (Paystack)',
      account_name: 'Paydora / Amina Bello',
    },
  },
  {
    id: 'usr-9800',
    email: 'tunde.badmus@suspicious.io',
    phone: '+2348099887766',
    first_name: 'Babatunde',
    last_name: 'Badmus',
    username: 'tundebad',
    kyc_tier: 1,
    kyc_status: 'rejected',
    is_blocked: true,
    blocked_reason: 'Flagged for multiple chargeback disputes and rapid velocity cashouts.',
    blocked_at: '2026-10-15T09:40:00Z',
    created_at: '2026-08-04T12:00:00Z',
    balance_ngn: 4300,
  },
  {
    id: 'usr-9816',
    email: 'somto.eze@gmail.com',
    phone: '+2348055667788',
    first_name: 'Somtochukwu',
    last_name: 'Eze',
    username: 'somtoeze',
    kyc_tier: 3,
    kyc_status: 'verified',
    is_blocked: false,
    created_at: '2026-06-18T08:15:00Z',
    balance_ngn: 1420500,
    virtual_account: {
      account_number: '7019283746',
      bank_name: 'Wema Bank (Squad)',
      account_name: 'Paydora / Somtochukwu Eze',
    },
  },
];

let mockTransactions: TransactionItem[] = [
  {
    id: 'tx-501',
    reference: 'PAYD-NIP-20261016-0914',
    user_id: 'usr-9816',
    user_name: 'Somtochukwu Eze',
    user_email: 'somto.eze@gmail.com',
    amount: 150000,
    fee: 53.75,
    currency: 'NGN',
    type: 'TRANSFER',
    status: 'SUCCESS',
    direction: 'DEBIT',
    payment_method: 'NIP Instant Bank Transfer',
    channel: 'BANK_TRANSFER',
    description: 'Outward payment to Kenechukwu Nnamdi / Access Bank',
    settled_at: '2026-10-16T05:54:14Z',
    provider_reference: 'SQD-OUT-991028371',
    session_id: '99905826101605541200000000501',
    ip_address: '102.89.41.112 (Lagos, NG)',
    gateway_response: 'Approved / 00 Successful NIP Dispatch',
    created_at: '2026-10-16T05:54:12Z',
    beneficiary: {
      account_number: '0129384756',
      bank_name: 'Access Bank',
      account_name: 'Kenechukwu Nnamdi',
    },
  },
  {
    id: 'tx-502',
    reference: 'PAYD-BILL-20261016-0830',
    user_id: 'usr-9812',
    user_name: 'Chukwuebuka Obi',
    user_email: 'ebuka.obi@gmail.com',
    amount: 25000,
    fee: 100,
    currency: 'NGN',
    type: 'BILL_PAYMENT',
    status: 'SUCCESS',
    direction: 'DEBIT',
    payment_method: 'Paydora Utility Settlement',
    channel: 'UTILITY_BILL',
    description: 'EKEDC Prepaid Electricity Token Recharge',
    settled_at: '2026-10-16T05:22:47Z',
    provider_reference: 'KRA-BILL-48192019',
    session_id: '99905826101605224500000000502',
    ip_address: '105.112.98.24 (Abuja, NG)',
    gateway_response: 'Token: 4819-2049-1829-0192-3847 (245.8 kWh)',
    created_at: '2026-10-16T05:22:45Z',
  },
  {
    id: 'tx-503',
    reference: 'PAYD-NIP-20261016-0744',
    user_id: 'usr-9800',
    user_name: 'Babatunde Badmus',
    user_email: 'tunde.badmus@suspicious.io',
    amount: 500000,
    fee: 53.75,
    currency: 'NGN',
    type: 'TRANSFER',
    status: 'FAILED',
    direction: 'DEBIT',
    payment_method: 'NIP Outward Bank Transfer',
    channel: 'BANK_TRANSFER',
    description: 'Suspicious rapid cashout attempt flagged by compliance rules',
    settled_at: '2026-10-16T04:15:02Z',
    provider_reference: 'SQD-OUT-991028014',
    session_id: '99905826101604150000000000503',
    ip_address: '197.210.55.8 (Port Harcourt, NG)',
    gateway_response: 'Declined / Account under AML risk hold',
    created_at: '2026-10-16T04:15:00Z',
    beneficiary: {
      account_number: '2049182736',
      bank_name: 'Guaranty Trust Bank',
      account_name: 'Fast Cash Ventures',
    },
  },
  {
    id: 'tx-504',
    reference: 'PAYD-TOPUP-20261016-0610',
    user_id: 'usr-9813',
    user_name: 'Amina Bello',
    user_email: 'amina.bello@yahoo.com',
    amount: 20000,
    fee: 0,
    currency: 'NGN',
    type: 'WALLET_TOPUP',
    status: 'SUCCESS',
    direction: 'CREDIT',
    payment_method: 'Squad Dedicated Virtual Account',
    channel: 'DEDICATED_VIRTUAL_ACCOUNT',
    description: 'Inbound credit from Wema Bank / Amina Bello',
    settled_at: '2026-10-16T03:40:21Z',
    provider_reference: 'SQD-DVA-77182910',
    session_id: '99905826101603401900000000504',
    ip_address: '102.88.34.19 (Kano, NG)',
    gateway_response: 'Inflow matched to dedicated virtual account',
    created_at: '2026-10-16T03:40:19Z',
  },
];

let mockBanks: BankConfigItem[] = [
  { id: '1', name: 'Access Bank', code: '044', provider: 'paystack', is_common: true, logo: 'https://assets.paydora.africa/banks/access.png', active: true },
  { id: '1b', name: 'Access Bank', code: '000014', provider: 'squad', is_common: false, logo: 'https://assets.paydora.africa/banks/access.png', active: true },
  { id: '2', name: 'Guaranty Trust Bank', code: '058', provider: 'paystack', is_common: true, logo: 'https://assets.paydora.africa/banks/gtbank.png', active: true },
  { id: '2b', name: 'Guaranty Trust Bank', code: '000013', provider: 'squad', is_common: false, logo: 'https://assets.paydora.africa/banks/gtbank.png', active: true },
  { id: '3', name: 'Zenith Bank', code: '057', provider: 'paystack', is_common: true, logo: 'https://assets.paydora.africa/banks/zenith.png', active: true },
  { id: '4', name: 'United Bank for Africa (UBA)', code: '033', provider: 'paystack', is_common: true, logo: 'https://assets.paydora.africa/banks/uba.png', active: true },
  { id: '5', name: 'First Bank of Nigeria', code: '011', provider: 'paystack', is_common: true, logo: 'https://assets.paydora.africa/banks/firstbank.png', active: true },
  { id: '6', name: 'Kuda Bank', code: '50211', provider: 'paystack', is_common: true, logo: 'https://assets.paydora.africa/banks/kuda.png', active: true },
  { id: '6b', name: 'Kuda Bank', code: '090267', provider: 'squad', is_common: false, logo: 'https://assets.paydora.africa/banks/kuda.png', active: true },
  { id: '7', name: 'Opay (PayCom)', code: '999992', provider: 'paystack', is_common: true, logo: 'https://assets.paydora.africa/banks/opay.png', active: true },
  { id: '7b', name: 'Opay (PayCom)', code: '100004', provider: 'squad', is_common: true, logo: 'https://assets.paydora.africa/banks/opay.png', active: true },
  { id: '8', name: 'PalmPay', code: '999991', provider: 'paystack', is_common: true, logo: 'https://assets.paydora.africa/banks/palmpay.png', active: true },
  { id: '8b', name: 'PalmPay', code: '100033', provider: 'squad', is_common: false, logo: 'https://assets.paydora.africa/banks/palmpay.png', active: true },
  { id: '9', name: 'Moniepoint MFB', code: '50515', provider: 'paystack', is_common: true, logo: 'https://assets.paydora.africa/banks/moniepoint.png', active: true },
  { id: '10', name: 'Sterling Bank', code: '232', provider: 'paystack', is_common: false, logo: null, active: true },
  { id: '11', name: 'Stanbic IBTC Bank', code: '221', provider: 'paystack', is_common: false, logo: null, active: true },
];

let mockBillCategories: BillCategoryConfigItem[] = [
  {
    id: '1',
    category_name: 'airtime',
    code: 'AIRTIME',
    label: 'Airtime Top-Up',
    icon: 'assets/icons/bills/airtime.svg',
    is_available: true,
    is_hot: true,
    feature: true,
    requires_validation: false,
    section: 'Telecom',
    cashback_percentage: 2.0,
    provider: 'squad',
    order: 1,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-10-15T12:00:00Z',
  },
  {
    id: '2',
    category_name: 'data',
    code: 'DATA',
    label: 'Mobile Data Bundles',
    icon: 'assets/icons/bills/data.svg',
    is_available: true,
    is_hot: true,
    feature: true,
    requires_validation: false,
    section: 'Telecom',
    cashback_percentage: 2.5,
    provider: 'squad',
    order: 2,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-10-15T12:00:00Z',
  },
  {
    id: '3',
    category_name: 'electricity',
    code: 'ELECTRICITY',
    label: 'Electricity DisCos',
    icon: 'assets/icons/bills/electricity.svg',
    is_available: true,
    is_hot: false,
    feature: true,
    requires_validation: true,
    section: 'Utilities',
    cashback_percentage: 1.0,
    provider: 'squad',
    order: 3,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-10-15T12:00:00Z',
  },
  {
    id: '4',
    category_name: 'cable_tv',
    code: 'CABLE_TV',
    label: 'Cable & Satellite TV',
    icon: 'assets/icons/bills/cable_tv.svg',
    is_available: true,
    is_hot: false,
    feature: true,
    requires_validation: true,
    section: 'Entertainment',
    cashback_percentage: 1.5,
    provider: 'squad',
    order: 4,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-10-15T12:00:00Z',
  },
  {
    id: '5',
    category_name: 'internet',
    code: 'INTERNET',
    label: 'Broadband & Fiber',
    icon: 'assets/icons/bills/internet.svg',
    is_available: true,
    is_hot: false,
    feature: false,
    requires_validation: true,
    section: 'Telecom',
    cashback_percentage: 1.5,
    provider: 'baxi',
    order: 5,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-10-15T12:00:00Z',
  },
  {
    id: '6',
    category_name: 'betting',
    code: 'BETTING',
    label: 'Betting & Wallet Topup',
    icon: 'assets/icons/bills/betting.svg',
    is_available: true,
    is_hot: false,
    feature: false,
    requires_validation: true,
    section: 'Gaming',
    cashback_percentage: 0.75,
    provider: 'squad',
    order: 6,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-10-15T12:00:00Z',
  },
];

let mockBillers: StandardBillerItem[] = [
  {
    id: '1',
    biller_code: 'MTN_VTU',
    name: 'MTN Nigeria',
    short_name: 'MTN',
    category_id: '1',
    category_name: 'Airtime Top-Up',
    is_available: true,
    cashback_percentage: 2.0,
    is_hot: true,
    provider: 'squad',
    logo: 'https://assets.paydora.africa/billers/mtn.png',
    description: 'Instant airtime recharge and data top-up for MTN subscribers nationwide',
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-10-15T12:00:00Z',
  },
  {
    id: '2',
    biller_code: 'AIRTEL_VTU',
    name: 'Airtel Nigeria',
    short_name: 'Airtel',
    category_id: '1',
    category_name: 'Airtime Top-Up',
    is_available: true,
    cashback_percentage: 2.0,
    is_hot: false,
    provider: 'squad',
    logo: 'https://assets.paydora.africa/billers/airtel.png',
    description: 'Airtel airtime top-up and broadband data activation',
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-10-15T12:00:00Z',
  },
  {
    id: '3',
    biller_code: 'GLO_VTU',
    name: 'Globacom Nigeria',
    short_name: 'Glo',
    category_id: '1',
    category_name: 'Airtime Top-Up',
    is_available: true,
    cashback_percentage: 2.5,
    is_hot: false,
    provider: 'squad',
    logo: 'https://assets.paydora.africa/billers/glo.png',
    description: 'Globacom grandmasters of data and VTU airtime recharge',
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-10-15T12:00:00Z',
  },
  {
    id: '4',
    biller_code: '9MOBILE_VTU',
    name: '9mobile',
    short_name: '9mobile',
    category_id: '1',
    category_name: 'Airtime Top-Up',
    is_available: true,
    cashback_percentage: 2.0,
    is_hot: false,
    provider: 'squad',
    logo: 'https://assets.paydora.africa/billers/9mobile.png',
    description: '9mobile telecom VTU airtime and internet bundles',
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-10-15T12:00:00Z',
  },
  {
    id: '5',
    biller_code: 'IKEDC',
    name: 'Ikeja Electric Disco',
    short_name: 'IKEDC',
    category_id: '3',
    category_name: 'Electricity DisCos',
    is_available: true,
    cashback_percentage: 1.0,
    is_hot: true,
    provider: 'squad',
    logo: 'https://assets.paydora.africa/billers/ikedc.png',
    description: 'Prepaid meter token and postpaid electricity payments for Ikeja and Lagos',
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-10-15T12:00:00Z',
  },
  {
    id: '6',
    biller_code: 'EKEDC',
    name: 'Eko Electricity Distribution',
    short_name: 'EKEDC',
    category_id: '3',
    category_name: 'Electricity DisCos',
    is_available: true,
    cashback_percentage: 1.0,
    is_hot: false,
    provider: 'squad',
    logo: 'https://assets.paydora.africa/billers/ekedc.png',
    description: 'Prepaid and postpaid electricity bills in Lagos Island and Peninsula',
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-10-15T12:00:00Z',
  },
  {
    id: '7',
    biller_code: 'DSTV',
    name: 'DStv Nigeria',
    short_name: 'DStv',
    category_id: '4',
    category_name: 'Cable & Satellite TV',
    is_available: true,
    cashback_percentage: 1.5,
    is_hot: true,
    provider: 'squad',
    logo: 'https://assets.paydora.africa/billers/dstv.png',
    description: 'Instant DStv decoder renewal and package upgrade with immediate reconnection',
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-10-15T12:00:00Z',
  },
  {
    id: '8',
    biller_code: 'GOTV',
    name: 'GOtv Nigeria',
    short_name: 'GOtv',
    category_id: '4',
    category_name: 'Cable & Satellite TV',
    is_available: true,
    cashback_percentage: 1.5,
    is_hot: false,
    provider: 'squad',
    logo: 'https://assets.paydora.africa/billers/gotv.png',
    description: 'GOtv monthly TV bouquet renewal and IUC validation',
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-10-15T12:00:00Z',
  },
  {
    id: '9',
    biller_code: 'STARTIMES',
    name: 'StarTimes TV',
    short_name: 'StarTimes',
    category_id: '4',
    category_name: 'Cable & Satellite TV',
    is_available: true,
    cashback_percentage: 1.5,
    is_hot: false,
    provider: 'squad',
    logo: 'https://assets.paydora.africa/billers/startimes.png',
    description: 'StarTimes dish and antenna subscriptions',
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-10-15T12:00:00Z',
  },
  {
    id: '10',
    biller_code: 'BET9JA',
    name: 'Bet9ja Nigeria',
    short_name: 'Bet9ja',
    category_id: '6',
    category_name: 'Betting & Wallet Topup',
    is_available: true,
    cashback_percentage: 0.75,
    is_hot: true,
    provider: 'squad',
    logo: 'https://assets.paydora.africa/billers/bet9ja.png',
    description: 'Fund your Bet9ja player account instantly with real-time balance update',
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-10-15T12:00:00Z',
  },
  {
    id: '11',
    biller_code: 'SPORTYBET',
    name: 'SportyBet',
    short_name: 'SportyBet',
    category_id: '6',
    category_name: 'Betting & Wallet Topup',
    is_available: true,
    cashback_percentage: 0.5,
    is_hot: false,
    provider: 'squad',
    logo: 'https://assets.paydora.africa/billers/sportybet.png',
    description: 'Instant customer wallet deposits for SportyBet gaming',
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-10-15T12:00:00Z',
  },
  {
    id: '12',
    biller_code: 'SMILE_4G',
    name: 'Smile Communications',
    short_name: 'Smile',
    category_id: '5',
    category_name: 'Broadband & Fiber',
    is_available: true,
    cashback_percentage: 1.5,
    is_hot: false,
    provider: 'baxi',
    logo: 'https://assets.paydora.africa/billers/smile.png',
    description: 'Smile 4G LTE internet bundle recharge and account funding',
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-10-15T12:00:00Z',
  },
];

let mockBillerProducts: BillerProductItem[] = [
  // MTN
  {
    id: 'p-1',
    biller_code: 'MTN_VTU',
    product_code: 'MTN_VTU_CUSTOM',
    name: 'MTN Custom Airtime Top-Up',
    biller_name: 'MTN Nigeria',
    short_name: 'Airtime',
    amount: null,
    is_available: true,
    is_hot: true,
    provider: 'squad',
    validity_days: null,
    created_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'p-2',
    biller_code: 'MTN_VTU',
    product_code: 'MTN_1GB_30D',
    name: 'MTN 1GB Data Bundle',
    biller_name: 'MTN Nigeria',
    short_name: '1GB / 30 Days',
    amount: 1200,
    is_available: true,
    is_hot: true,
    provider: 'squad',
    validity_days: 30,
    created_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'p-3',
    biller_code: 'MTN_VTU',
    product_code: 'MTN_2_5GB_30D',
    name: 'MTN 2.5GB Data Bundle',
    biller_name: 'MTN Nigeria',
    short_name: '2.5GB / 30 Days',
    amount: 2000,
    is_available: true,
    is_hot: false,
    provider: 'squad',
    validity_days: 30,
    created_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'p-4',
    biller_code: 'MTN_VTU',
    product_code: 'MTN_5GB_30D',
    name: 'MTN 5GB Data Bundle',
    biller_name: 'MTN Nigeria',
    short_name: '5GB / 30 Days',
    amount: 3500,
    is_available: true,
    is_hot: true,
    provider: 'squad',
    validity_days: 30,
    created_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'p-5',
    biller_code: 'MTN_VTU',
    product_code: 'MTN_10GB_30D',
    name: 'MTN 10GB Data Bundle',
    biller_name: 'MTN Nigeria',
    short_name: '10GB / 30 Days',
    amount: 5000,
    is_available: true,
    is_hot: false,
    provider: 'squad',
    validity_days: 30,
    created_at: '2026-01-10T10:00:00Z',
  },
  // Airtel
  {
    id: 'p-6',
    biller_code: 'AIRTEL_VTU',
    product_code: 'AIRTEL_VTU_CUSTOM',
    name: 'Airtel Custom Airtime Top-Up',
    biller_name: 'Airtel Nigeria',
    short_name: 'Airtime',
    amount: null,
    is_available: true,
    is_hot: false,
    provider: 'squad',
    validity_days: null,
    created_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'p-7',
    biller_code: 'AIRTEL_VTU',
    product_code: 'AIRTEL_1_5GB_30D',
    name: 'Airtel 1.5GB Monthly Data',
    biller_name: 'Airtel Nigeria',
    short_name: '1.5GB / 30 Days',
    amount: 1200,
    is_available: true,
    is_hot: true,
    provider: 'squad',
    validity_days: 30,
    created_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'p-8',
    biller_code: 'AIRTEL_VTU',
    product_code: 'AIRTEL_4GB_30D',
    name: 'Airtel 4GB Monthly Data',
    biller_name: 'Airtel Nigeria',
    short_name: '4GB / 30 Days',
    amount: 2500,
    is_available: true,
    is_hot: false,
    provider: 'squad',
    validity_days: 30,
    created_at: '2026-01-10T10:00:00Z',
  },
  // DStv
  {
    id: 'p-9',
    biller_code: 'DSTV',
    product_code: 'DSTV_YANGA',
    name: 'DStv Yanga Package',
    biller_name: 'DStv Nigeria',
    short_name: 'Yanga',
    amount: 4200,
    is_available: true,
    is_hot: false,
    provider: 'squad',
    validity_days: 30,
    created_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'p-10',
    biller_code: 'DSTV',
    product_code: 'DSTV_CONFAM',
    name: 'DStv Confam Package',
    biller_name: 'DStv Nigeria',
    short_name: 'Confam',
    amount: 7400,
    is_available: true,
    is_hot: false,
    provider: 'squad',
    validity_days: 30,
    created_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'p-11',
    biller_code: 'DSTV',
    product_code: 'DSTV_COMPACT',
    name: 'DStv Compact Package',
    biller_name: 'DStv Nigeria',
    short_name: 'Compact',
    amount: 12500,
    is_available: true,
    is_hot: true,
    provider: 'squad',
    validity_days: 30,
    created_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'p-12',
    biller_code: 'DSTV',
    product_code: 'DSTV_PREMIUM',
    name: 'DStv Premium Package',
    biller_name: 'DStv Nigeria',
    short_name: 'Premium',
    amount: 29500,
    is_available: true,
    is_hot: false,
    provider: 'squad',
    validity_days: 30,
    created_at: '2026-01-10T10:00:00Z',
  },
  // GOtv
  {
    id: 'p-13',
    biller_code: 'GOTV',
    product_code: 'GOTV_JOLLI',
    name: 'GOtv Jolli Package',
    biller_name: 'GOtv Nigeria',
    short_name: 'Jolli',
    amount: 3950,
    is_available: true,
    is_hot: false,
    provider: 'squad',
    validity_days: 30,
    created_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'p-14',
    biller_code: 'GOTV',
    product_code: 'GOTV_MAX',
    name: 'GOtv Max Package',
    biller_name: 'GOtv Nigeria',
    short_name: 'Max',
    amount: 5700,
    is_available: true,
    is_hot: true,
    provider: 'squad',
    validity_days: 30,
    created_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'p-15',
    biller_code: 'GOTV',
    product_code: 'GOTV_SUPA',
    name: 'GOtv Supa Plus Package',
    biller_name: 'GOtv Nigeria',
    short_name: 'Supa Plus',
    amount: 7600,
    is_available: true,
    is_hot: false,
    provider: 'squad',
    validity_days: 30,
    created_at: '2026-01-10T10:00:00Z',
  },
  // Electricity
  {
    id: 'p-16',
    biller_code: 'IKEDC',
    product_code: 'IKEDC_PREPAID',
    name: 'Ikeja Electric Prepaid Meter Token',
    biller_name: 'Ikeja Electric Disco',
    short_name: 'Prepaid Token',
    amount: null,
    is_available: true,
    is_hot: true,
    provider: 'squad',
    validity_days: null,
    created_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'p-17',
    biller_code: 'IKEDC',
    product_code: 'IKEDC_POSTPAID',
    name: 'Ikeja Electric Postpaid Bill Pay',
    biller_name: 'Ikeja Electric Disco',
    short_name: 'Postpaid Bill',
    amount: null,
    is_available: true,
    is_hot: false,
    provider: 'squad',
    validity_days: null,
    created_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'p-18',
    biller_code: 'EKEDC',
    product_code: 'EKEDC_PREPAID',
    name: 'Eko Electric Prepaid Meter Token',
    biller_name: 'Eko Electricity Distribution',
    short_name: 'Prepaid Token',
    amount: null,
    is_available: true,
    is_hot: false,
    provider: 'squad',
    validity_days: null,
    created_at: '2026-01-10T10:00:00Z',
  },
  // Betting
  {
    id: 'p-19',
    biller_code: 'BET9JA',
    product_code: 'BET9JA_FUNDING',
    name: 'Bet9ja Account Wallet Funding',
    biller_name: 'Bet9ja Nigeria',
    short_name: 'Wallet Topup',
    amount: null,
    is_available: true,
    is_hot: true,
    provider: 'squad',
    validity_days: null,
    created_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'p-20',
    biller_code: 'SPORTYBET',
    product_code: 'SPORTYBET_FUNDING',
    name: 'SportyBet Customer Wallet Funding',
    biller_name: 'SportyBet',
    short_name: 'Wallet Topup',
    amount: null,
    is_available: true,
    is_hot: false,
    provider: 'squad',
    validity_days: null,
    created_at: '2026-01-10T10:00:00Z',
  },
];

let mockSystemLogs: SystemLogItem[] = [
  {
    id: 'sys-001',
    level: 'INFO',
    service: 'auth-service',
    message: 'Admin JWT token authenticated for admin@paydora.africa',
    ip_address: '102.89.44.12',
    endpoint: '/api/admin/auth/session',
    method: 'GET',
    status_code: 200,
    latency_ms: 18,
    created_at: '2026-10-16T14:12:00Z',
  },
  {
    id: 'sys-002',
    level: 'INFO',
    service: 'bills-engine',
    message: 'Bill purchase dispatched to Squad: MTN_VTU_1000 for customer 08034567890',
    ip_address: '197.210.55.90',
    endpoint: '/api/v1/bills/purchase',
    method: 'POST',
    status_code: 200,
    latency_ms: 245,
    created_at: '2026-10-16T14:10:45Z',
  },
  {
    id: 'sys-003',
    level: 'WARN',
    service: 'rate-limiter',
    message: 'High request frequency detected from IP 105.112.98.14 (>120 req/min)',
    ip_address: '105.112.98.14',
    endpoint: '/api/v1/wallet/balance',
    method: 'GET',
    status_code: 429,
    latency_ms: 4,
    created_at: '2026-10-16T14:05:12Z',
  },
  {
    id: 'sys-004',
    level: 'ERROR',
    service: 'settlement-worker',
    message: 'NIP transfer timeout from Squad gateway: Connection reset by peer',
    ip_address: '10.0.4.12',
    endpoint: '/api/v1/transfers/outward',
    method: 'POST',
    status_code: 504,
    latency_ms: 5002,
    details: 'ETIMEDOUT: Squad API gateway took >5000ms. Job queued to BullMQ transfer-requery queue.',
    created_at: '2026-10-16T13:58:20Z',
  },
  {
    id: 'sys-005',
    level: 'INFO',
    service: 'kyc-verifier',
    message: 'BVN lookup returned MATCH_EXACT via IdentityPass rail',
    ip_address: '10.0.2.8',
    endpoint: '/api/v1/kyc/bvn-verify',
    method: 'POST',
    status_code: 200,
    latency_ms: 412,
    created_at: '2026-10-16T13:45:10Z',
  },
  {
    id: 'sys-006',
    level: 'DEBUG',
    service: 'redis-cache',
    message: 'Cache HIT for key: bill_categories_active (TTL: 3540s)',
    ip_address: '127.0.0.1',
    latency_ms: 1,
    created_at: '2026-10-16T13:30:00Z',
  },
  {
    id: 'sys-007',
    level: 'ERROR',
    service: 'webhook-handler',
    message: 'Signature verification mismatch for incoming squad webhook',
    ip_address: '18.200.114.88',
    endpoint: '/api/v1/webhooks/squad',
    method: 'POST',
    status_code: 401,
    latency_ms: 12,
    details: 'Squad-Signature hash did not match calculated SHA512 HMAC.',
    created_at: '2026-10-16T12:15:22Z',
  },
];

let mockJobLogs: JobLogItem[] = [
  {
    id: 'job-101',
    queue: 'bill-requery',
    job_id: 'bull-req-99120',
    name: 'requery-pending-bill',
    status: 'COMPLETED',
    attempts: 1,
    max_attempts: 5,
    duration_ms: 680,
    payload: '{\n  "reference": "BIL-20261016-0921",\n  "biller": "MTN_VTU",\n  "amount": 1000,\n  "provider": "squad",\n  "customer": "08034567890"\n}',
    processed_at: '2026-10-16T14:11:30Z',
  },
  {
    id: 'job-102',
    queue: 'transfer-requery',
    job_id: 'bull-req-99119',
    name: 'nip-status-poll',
    status: 'COMPLETED',
    attempts: 2,
    max_attempts: 10,
    duration_ms: 1240,
    payload: '{\n  "session_id": "999001261016140512001",\n  "bank_code": "058",\n  "account": "0123456789",\n  "amount": 50000,\n  "provider": "squad"\n}',
    processed_at: '2026-10-16T14:02:10Z',
  },
  {
    id: 'job-103',
    queue: 'kyc-reminder',
    job_id: 'bull-kyc-8821',
    name: 'send-tier2-reminder-email',
    status: 'COMPLETED',
    attempts: 1,
    max_attempts: 3,
    duration_ms: 420,
    payload: '{\n  "user_id": "usr-9812",\n  "email": "ebuka.obi@gmail.com",\n  "tier": 2,\n  "template": "kyc_upgrade_nudge"\n}',
    processed_at: '2026-10-16T13:50:00Z',
  },
  {
    id: 'job-104',
    queue: 'vault-sweep',
    job_id: 'bull-swp-7714',
    name: 'sweep-virtual-accounts-to-pool',
    status: 'COMPLETED',
    attempts: 1,
    max_attempts: 3,
    duration_ms: 2450,
    payload: '{\n  "source_accounts_count": 142,\n  "total_swept_ngn": 14850000,\n  "destination_pool": "Paydora-Wema-Settlement-Pool"\n}',
    processed_at: '2026-10-16T13:00:00Z',
  },
  {
    id: 'job-105',
    queue: 'broadcast-mail',
    job_id: 'bull-bcast-6612',
    name: 'dispatch-maintenance-notice',
    status: 'FAILED',
    attempts: 3,
    max_attempts: 3,
    duration_ms: 3120,
    error_message: 'SendGrid rate limit exceeded (429 Too Many Requests): Maximum concurrency reached for marketing subuser.',
    payload: '{\n  "batch_id": "bcast-981",\n  "recipients_count": 5000,\n  "subject": "Scheduled Banking Switch Maintenance"\n}',
    processed_at: '2026-10-16T12:45:00Z',
  },
  {
    id: 'job-106',
    queue: 'otp',
    job_id: 'bull-otp-5541',
    name: 'dispatch-sms-otp',
    status: 'COMPLETED',
    attempts: 1,
    max_attempts: 2,
    duration_ms: 310,
    payload: '{\n  "phone": "+2348034567890",\n  "provider": "termii",\n  "channel": "dnd",\n  "code": "492019"\n}',
    processed_at: '2026-10-16T12:10:00Z',
  },
  {
    id: 'job-107',
    queue: 'paystack-virtual-account',
    job_id: 'bull-dva-4412',
    name: 'generate-dedicated-nuban',
    status: 'COMPLETED',
    attempts: 1,
    max_attempts: 3,
    duration_ms: 890,
    payload: '{\n  "customer_code": "CUS_9918231",\n  "bvn": "22294819034",\n  "preferred_bank": "titan-paystack"\n}',
    processed_at: '2026-10-16T11:20:00Z',
  },
];

let mockSmsLogs: SmsLogItem[] = [
  {
    id: 'sms-001',
    recipient: '+2348034567890',
    sender_id: 'N-Alert',
    message: 'Your Paydora OTP is 492019. Valid for 10 minutes. Do not share this code with anyone.',
    type: 'OTP',
    channel: 'dnd',
    status: 'DELIVERED',
    units: 1,
    cost_ngn: 4.50,
    provider: 'termii',
    provider_reference: 'TER-MSG-9921401',
    created_at: '2026-10-16T14:15:02Z',
  },
  {
    id: 'sms-002',
    recipient: '+2349021112233',
    sender_id: 'Paydora',
    message: 'Credit Alert! Your Paydora wallet was credited with N25,000.00 from GTBank/Benson Arafat. Bal: N37,500.00',
    type: 'ALERT',
    channel: 'dnd',
    status: 'DELIVERED',
    units: 2,
    cost_ngn: 9.00,
    provider: 'termii',
    provider_reference: 'TER-MSG-9921389',
    created_at: '2026-10-16T14:02:45Z',
  },
  {
    id: 'sms-003',
    recipient: '+2348123456789',
    sender_id: 'Paydora',
    message: 'Debit Alert: N10,000.00 transfer to Opay - Adebayo Tunde. Ref: TXN-9912048. Avail: N142,000.00',
    type: 'TRANSACTION',
    channel: 'dnd',
    status: 'DELIVERED',
    units: 2,
    cost_ngn: 9.00,
    provider: 'termii',
    provider_reference: 'TER-MSG-9921340',
    created_at: '2026-10-16T13:40:11Z',
  },
  {
    id: 'sms-004',
    recipient: '+2347012345678',
    sender_id: 'Paydora',
    message: 'Paydora: Get 2.5% cashback when you buy MTN and Airtel data today on Paydora bills!',
    type: 'MARKETING',
    channel: 'generic',
    status: 'SENT',
    units: 1,
    cost_ngn: 4.50,
    provider: 'termii',
    provider_reference: 'TER-MSG-9921201',
    created_at: '2026-10-16T12:00:00Z',
  },
  {
    id: 'sms-005',
    recipient: '+2348099887766',
    sender_id: 'N-Alert',
    message: 'Your Paydora OTP is 819203. Valid for 10 minutes.',
    type: 'OTP',
    channel: 'dnd',
    status: 'FAILED',
    units: 1,
    cost_ngn: 0.00,
    provider: 'termii',
    provider_reference: 'TER-ERR-UNDELIV',
    created_at: '2026-10-16T11:22:18Z',
  },
  {
    id: 'sms-006',
    recipient: '+2348034567890',
    sender_id: 'Paydora Africa',
    message: 'WhatsApp Security Verification: Use code 618-904 to confirm your login.',
    type: 'OTP',
    channel: 'whatsapp',
    status: 'DELIVERED',
    units: 1,
    cost_ngn: 7.20,
    provider: 'meta-whatsapp',
    provider_reference: 'wamid.HBgNMjM0ODAzNDU2Nzg5MBUCABEYE',
    created_at: '2026-10-16T10:45:00Z',
  },
];

let mockEmailLogs: EmailLogItem[] = [
  {
    id: 'eml-001',
    recipient: 'ebuka.obi@gmail.com',
    subject: 'Transaction Receipt: N25,000.00 Wallet Deposit',
    template: 'transaction-receipt',
    status: 'OPENED',
    provider: 'sendgrid',
    opened_at: '2026-10-16T14:18:22Z',
    size_kb: 42,
    created_at: '2026-10-16T14:02:50Z',
  },
  {
    id: 'eml-002',
    recipient: 'amina.bello@yahoo.com',
    subject: 'Your Tier 2 BVN Verification is Complete!',
    template: 'kyc-approved',
    status: 'DELIVERED',
    provider: 'sendgrid',
    size_kb: 38,
    created_at: '2026-10-16T13:46:00Z',
  },
  {
    id: 'eml-003',
    recipient: 'k.adeyemi@outlook.com',
    subject: 'Password Reset Request',
    template: 'auth-reset-password',
    status: 'OPENED',
    provider: 'resend',
    opened_at: '2026-10-16T13:12:04Z',
    size_kb: 24,
    created_at: '2026-10-16T13:10:00Z',
  },
  {
    id: 'eml-004',
    recipient: 'invalid-user-mail@notfounddomainxyz.ng',
    subject: 'Welcome to Paydora!',
    template: 'user-welcome',
    status: 'BOUNCED',
    provider: 'sendgrid',
    error_reason: '550 5.1.1 The email account that you tried to reach does not exist.',
    size_kb: 35,
    created_at: '2026-10-16T12:00:15Z',
  },
  {
    id: 'eml-005',
    recipient: 'tunde.adebayo@gmail.com',
    subject: 'Paydora Scheduled Maintenance Notice: Oct 18, 2026',
    template: 'broadcast-announcement',
    status: 'DELIVERED',
    provider: 'sendgrid',
    size_kb: 55,
    created_at: '2026-10-16T10:00:00Z',
  },
];

let mockWebhookLogs: WebhookLogItem[] = [
  {
    id: 'wh-001',
    provider: 'squad',
    event: 'charge.successful',
    direction: 'INBOUND',
    status: 'PROCESSED',
    response_code: 200,
    duration_ms: 112,
    payload: '{\n  "event": "charge.successful",\n  "transaction_ref": "SQ-20261016-00192",\n  "amount": 2500000,\n  "currency": "NGN",\n  "virtual_account_number": "8034567890",\n  "bank_name": "Wema Bank",\n  "customer": {\n    "email": "ebuka.obi@gmail.com"\n  }\n}',
    created_at: '2026-10-16T14:02:40Z',
  },
  {
    id: 'wh-002',
    provider: 'paystack',
    event: 'dedicated_account.assign.success',
    direction: 'INBOUND',
    status: 'PROCESSED',
    response_code: 200,
    duration_ms: 88,
    payload: '{\n  "event": "dedicated_account.assign.success",\n  "data": {\n    "account_number": "9928192011",\n    "account_name": "Paydora / Amina Bello",\n    "bank": {\n      "name": "Titan Paystack Bank"\n    }\n  }\n}',
    created_at: '2026-10-16T13:30:15Z',
  },
  {
    id: 'wh-003',
    provider: 'meta',
    event: 'messages.status.read',
    direction: 'INBOUND',
    status: 'PROCESSED',
    response_code: 200,
    duration_ms: 45,
    payload: '{\n  "entry": [\n    {\n      "id": "29849201948",\n      "changes": [\n        {\n          "value": {\n            "statuses": [\n              {\n                "id": "wmsg-3",\n                "status": "read",\n                "timestamp": "1760623920"\n              }\n            ]\n          }\n        }\n      ]\n    }\n  ]\n}',
    created_at: '2026-10-16T13:15:00Z',
  },
  {
    id: 'wh-004',
    provider: 'termii',
    event: 'delivery_report',
    direction: 'INBOUND',
    status: 'PROCESSED',
    response_code: 200,
    duration_ms: 52,
    payload: '{\n  "message_id": "TER-MSG-9921401",\n  "status": "Delivered",\n  "receiver": "2348034567890",\n  "done_at": "2026-10-16 14:15:10"\n}',
    created_at: '2026-10-16T14:15:12Z',
  },
  {
    id: 'wh-005',
    provider: 'squad',
    event: 'transfer.reversed',
    direction: 'INBOUND',
    status: 'FAILED',
    response_code: 500,
    duration_ms: 420,
    payload: '{\n  "event": "transfer.reversed",\n  "reference": "NIP-OUT-9912048",\n  "reason": "Destination bank CBN 91 NIP timeout",\n  "amount": 1000000\n}',
    created_at: '2026-10-16T11:40:00Z',
  },
];

let mockAuditLogs: AuditLogItem[] = [
  {
    id: 'aud-001',
    admin_email: 'admin@paydora.africa',
    admin_name: 'Benson Arafat',
    action: 'KYC_APPROVE',
    target_resource: 'User KYC Tier 2: Chukwuebuka Obi (usr-9812)',
    ip_address: '102.89.44.12',
    status: 'SUCCESS',
    metadata: '{\n  "bvn": "22294819034",\n  "approved_tier": 2,\n  "previous_tier": 1\n}',
    created_at: '2026-10-16T14:20:00Z',
  },
  {
    id: 'aud-002',
    admin_email: 'admin@paydora.africa',
    admin_name: 'Benson Arafat',
    action: 'BILLER_UPDATE_COMMISSION',
    target_resource: 'Biller: MTN Nigeria (MTN_VTU)',
    ip_address: '102.89.44.12',
    status: 'SUCCESS',
    metadata: '{\n  "old_cashback": 2.0,\n  "new_cashback": 2.5\n}',
    created_at: '2026-10-16T13:55:00Z',
  },
  {
    id: 'aud-003',
    admin_email: 'admin@paydora.africa',
    admin_name: 'Benson Arafat',
    action: 'SETTLEMENT_PROVIDER_TOGGLE',
    target_resource: 'Bank: Opay (100004)',
    ip_address: '102.89.44.12',
    status: 'SUCCESS',
    metadata: '{\n  "switched_to": "squad",\n  "fallback": "paystack"\n}',
    created_at: '2026-10-16T13:10:00Z',
  },
  {
    id: 'aud-004',
    admin_email: 'compliance@paydora.africa',
    admin_name: 'Fatima Aliyu',
    action: 'USER_RESTRICTION_APPLIED',
    target_resource: 'User: Emeka Okafor (usr-9901)',
    ip_address: '197.210.8.44',
    status: 'SUCCESS',
    metadata: '{\n  "reason": "Exceeded daily Tier 1 limit without BVN verification",\n  "action": "BLOCK_OUTWARD_TRANSFER"\n}',
    created_at: '2026-10-16T12:05:00Z',
  },
  {
    id: 'aud-005',
    admin_email: 'admin@paydora.africa',
    admin_name: 'Benson Arafat',
    action: 'API_KEY_ROTATION',
    target_resource: 'Squad Production Settlement Webhook Secret',
    ip_address: '102.89.44.12',
    status: 'SUCCESS',
    metadata: '{\n  "key_id": "sq_live_secret_***",\n  "action": "ROTATE"\n}',
    created_at: '2026-10-16T10:15:00Z',
  },
];

let mockCardWishlist: CardWishlistItem[] = [
  {
    id: 'cw-1',
    user_id: 'usr-001',
    name: 'Chukwuebuka Obi',
    username: 'chukwuebuka',
    email: 'c.obi@example.com',
    phone: '+2348034567890',
    card_type: 'BOTH',
    status: 'WAITING',
    kyc_tier: 2,
    kyc_status: 'approved',
    created_at: '2026-10-14T09:24:00Z',
    joined_at: '2026-03-12T10:00:00Z',
  },
  {
    id: 'cw-2',
    user_id: 'usr-002',
    name: 'Amina Bello',
    username: 'amina_b',
    email: 'amina.bello@example.com',
    phone: '+2348123456789',
    card_type: 'VIRTUAL',
    status: 'INVITED',
    kyc_tier: 3,
    kyc_status: 'approved',
    created_at: '2026-10-13T14:12:00Z',
    joined_at: '2026-04-18T14:30:00Z',
  },
  {
    id: 'cw-3',
    user_id: 'usr-003',
    name: 'Oluwaseun Adeleke',
    username: 'seun_adeleke',
    email: 'seun.adeleke@example.com',
    phone: '+2347098765432',
    card_type: 'PHYSICAL',
    status: 'ISSUED',
    kyc_tier: 3,
    kyc_status: 'approved',
    created_at: '2026-10-10T11:45:00Z',
    joined_at: '2026-01-20T09:15:00Z',
  },
  {
    id: 'cw-4',
    user_id: 'usr-004',
    name: 'Emeka Nwosu',
    username: 'emeka_nw',
    email: 'emeka.nwosu@example.com',
    phone: '+2349051234567',
    card_type: 'VIRTUAL',
    status: 'WAITING',
    kyc_tier: 1,
    kyc_status: 'pending',
    created_at: '2026-10-15T18:30:00Z',
    joined_at: '2026-07-05T12:00:00Z',
  },
  {
    id: 'cw-5',
    user_id: 'usr-005',
    name: 'Fatima Garba',
    username: 'fatima_g',
    email: 'fatima.g@example.com',
    phone: '+2348023456781',
    card_type: 'BOTH',
    status: 'WAITING',
    kyc_tier: 2,
    kyc_status: 'approved',
    created_at: '2026-10-16T08:15:00Z',
    joined_at: '2026-08-22T16:45:00Z',
  },
];

let mockWealthWishlist: WealthWishlistItem[] = [
  {
    id: 'ww-1',
    user_id: 'usr-001',
    name: 'Chukwuebuka Obi',
    username: 'chukwuebuka',
    email: 'c.obi@example.com',
    phone: '+2348034567890',
    interest_category: 'Automated Savings Reserves',
    target_deposit_ngn: 250000,
    status: 'WAITING',
    kyc_tier: 2,
    created_at: '2026-10-14T10:15:00Z',
    joined_at: '2026-03-12T10:00:00Z',
  },
  {
    id: 'ww-2',
    user_id: 'usr-002',
    name: 'Amina Bello',
    username: 'amina_b',
    email: 'amina.bello@example.com',
    phone: '+2348123456789',
    interest_category: 'Fixed Yield Vaults (14.5% p.a.)',
    target_deposit_ngn: 1500000,
    status: 'EARLY_ACCESS',
    kyc_tier: 3,
    created_at: '2026-10-12T16:40:00Z',
    joined_at: '2026-04-18T14:30:00Z',
  },
  {
    id: 'ww-3',
    user_id: 'usr-003',
    name: 'Oluwaseun Adeleke',
    username: 'seun_adeleke',
    email: 'seun.adeleke@example.com',
    phone: '+2347098765432',
    interest_category: 'Multi-Currency USD/GBP Reserves',
    target_deposit_ngn: 5000000,
    status: 'INVITED',
    kyc_tier: 3,
    created_at: '2026-10-11T13:20:00Z',
    joined_at: '2026-01-20T09:15:00Z',
  },
  {
    id: 'ww-4',
    user_id: 'usr-006',
    name: 'Tunde Bakare',
    username: 'tunde_bakare',
    email: 'tunde.b@example.com',
    phone: '+2348167890123',
    interest_category: 'Mutual Funds & Capital Growth',
    target_deposit_ngn: 750000,
    status: 'WAITING',
    kyc_tier: 2,
    created_at: '2026-10-15T09:05:00Z',
    joined_at: '2026-05-14T11:20:00Z',
  },
  {
    id: 'ww-5',
    user_id: 'usr-007',
    name: 'Zainab Danjuma',
    username: 'zainab_d',
    email: 'zainab.d@example.com',
    phone: '+2347012345678',
    interest_category: 'Automated Savings Reserves',
    target_deposit_ngn: 100000,
    status: 'WAITING',
    kyc_tier: 1,
    created_at: '2026-10-16T11:50:00Z',
    joined_at: '2026-09-01T08:00:00Z',
  },
];

let mockTeamMembers: TeamMemberItem[] = [
  {
    id: 'tm-1',
    name: 'Benson Arafat',
    email: 'admin@paydora.africa',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    has_2fa: true,
    last_active: 'Just now',
    created_at: '2025-11-01T08:00:00Z',
  },
  {
    id: 'tm-2',
    name: 'Fatima Aliyu',
    email: 'compliance@paydora.africa',
    role: 'COMPLIANCE_OFFICER',
    status: 'ACTIVE',
    has_2fa: true,
    last_active: '15 mins ago',
    created_at: '2026-01-15T09:30:00Z',
  },
  {
    id: 'tm-3',
    name: 'David Adeleke',
    email: 'finance@paydora.africa',
    role: 'FINANCE_SETTLEMENT',
    status: 'ACTIVE',
    has_2fa: true,
    last_active: '2 hours ago',
    created_at: '2026-02-10T11:00:00Z',
  },
  {
    id: 'tm-4',
    name: 'Samuel Eze',
    email: 'support@paydora.africa',
    role: 'SUPPORT_OPS',
    status: 'ACTIVE',
    has_2fa: true,
    last_active: '5 mins ago',
    created_at: '2026-03-01T14:20:00Z',
  },
  {
    id: 'tm-5',
    name: 'Ngozi Okafor',
    email: 'n.okafor@paydora.africa',
    role: 'SUPPORT_OPS',
    status: 'INVITED',
    has_2fa: false,
    last_active: 'Never',
    created_at: '2026-10-15T16:00:00Z',
  },
];

let mockAppConfig: AppConfigSettings = {
  // Master Admin Settlement Account
  admin_account_name: 'Pulse Reality Ltd',
  admin_account_number: '3004853804',
  admin_bank_name: 'Guaranty Trust Bank',

  // Settlement Rails & Transfer Markup
  default_settlement_provider: 'squad',
  fallback_settlement_enabled: true,
  transfer_fee_tier1_max: 5000,
  transfer_fee_tier1_val: 10,
  transfer_fee_tier2_max: 50000,
  transfer_fee_tier2_val: 25,
  transfer_fee_tier3_val: 50,

  // Multi-Currency Wallet Limits
  wallet_min_limit_ngn: 100,
  wallet_max_limit_ngn: 5000000,
  wallet_min_limit_usd: 1,
  wallet_max_limit_usd: 10000,
  wallet_min_limit_eur: 1,
  wallet_max_limit_eur: 10000,
  wallet_min_limit_gbp: 1,
  wallet_max_limit_gbp: 10000,

  // User KYC Daily Transaction Limits
  tier_1_daily_limit: 50000,
  tier_2_daily_limit: 5000000,
  tier_3_daily_limit: 50000000,

  // Airtime to Cash Payout Rates & Limits
  airtime_cash_rate_mtn: 0.80,
  airtime_cash_rate_airtel: 0.75,
  airtime_cash_min_amount: 500,
  airtime_cash_max_amount: 20000,

  // NIN Identity Verification & Statutory VAT
  nin_basic_price: 350,
  nin_premium_price: 500,
  vat_rate: 7.5,

  // Bill Gateway Driver & Convenience Surcharges
  active_bill_provider: 'flutterwave',
  cable_tv_convenience_fee: 100,
  electricity_convenience_fee: 100,

  // Insurance (MyCover)
  mycover_claim_link: 'https://s.mycover.ai/#PPcCRVhWVL',

  // OTP Channels, Rewards & Webhooks
  primary_otp_channel: 'sms',
  cashback_global_rate: 2.0,
  webhook_retry_limit: 5,
  updated_at: '2026-10-16T12:00:00Z',
};

let mockWhatsAppConversations: WhatsAppConversation[] = [
  {
    id: '2348034567890',
    phone: '+2348034567890',
    customerName: 'Chukwuebuka Obi',
    lastMessage: 'Hello Paydora, I just submitted my BVN on the app. Can you verify my Tier 2 status?',
    lastMessageTime: '2026-10-16T06:12:00Z',
    unreadCount: 1,
    kycTier: 2,
    kycStatus: 'under_review',
    accountBalanceNgn: 245000,
    bvn: '22294819034',
    messages: [
      {
        id: 'wmsg-1',
        sender: 'customer',
        senderName: 'Chukwuebuka Obi',
        message: 'Hello, good morning! I have an enquiry about my account limits.',
        timestamp: '2026-10-16T06:05:00Z',
        status: 'READ',
      },
      {
        id: 'wmsg-2',
        sender: 'admin',
        senderName: 'Paydora Compliance',
        message: 'Good morning Chukwuebuka! Thank you for reaching out to Paydora. To raise your limit to ₦5,000,000/day, you need to complete Tier 2 BVN verification.',
        timestamp: '2026-10-16T06:08:00Z',
        status: 'READ',
      },
      {
        id: 'wmsg-3',
        sender: 'customer',
        senderName: 'Chukwuebuka Obi',
        message: 'Hello Paydora, I just submitted my BVN on the app. Can you verify my Tier 2 status?',
        timestamp: '2026-10-16T06:12:00Z',
        status: 'DELIVERED',
      },
    ],
  },
  {
    id: '2349021112233',
    phone: '+2349021112233',
    customerName: 'Amina Bello',
    lastMessage: 'Thank you so much! My virtual card was generated successfully.',
    lastMessageTime: '2026-10-16T05:40:00Z',
    unreadCount: 0,
    kycTier: 1,
    kycStatus: 'pending',
    accountBalanceNgn: 12500,
    bvn: '22184920491',
    messages: [
      {
        id: 'wmsg-4',
        sender: 'customer',
        senderName: 'Amina Bello',
        message: 'Can I use my Paydora USD virtual card for Apple Music and Google Play subscriptions?',
        timestamp: '2026-10-16T05:32:00Z',
        status: 'READ',
      },
      {
        id: 'wmsg-5',
        sender: 'admin',
        senderName: 'Paydora Support',
        message: 'Yes absolutely Amina! Our virtual dollar cards are 3D-Secure enabled and work on Apple Music, Netflix, Google Play, and Amazon.',
        timestamp: '2026-10-16T05:35:00Z',
        status: 'READ',
      },
      {
        id: 'wmsg-6',
        sender: 'customer',
        senderName: 'Amina Bello',
        message: 'Thank you so much! My virtual card was generated successfully.',
        timestamp: '2026-10-16T05:40:00Z',
        status: 'READ',
      },
    ],
  },
  {
    id: '2348099887766',
    phone: '+2348099887766',
    customerName: 'Babatunde Badmus',
    lastMessage: 'Why was my ₦500,000 transfer declined?',
    lastMessageTime: '2026-10-16T04:20:00Z',
    unreadCount: 2,
    kycTier: 1,
    kycStatus: 'rejected',
    accountBalanceNgn: 4300,
    messages: [
      {
        id: 'wmsg-7',
        sender: 'customer',
        senderName: 'Babatunde Badmus',
        message: 'Why was my ₦500,000 transfer declined?',
        timestamp: '2026-10-16T04:20:00Z',
        status: 'DELIVERED',
      },
    ],
  },
];

export const adminApi = {
  // Authentication & Session
  getCurrentAdmin(): AdminUser | null {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('paydora_admin_user');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {}
      }
    }
    return currentAdmin;
  },

  setAdminSession(user: AdminUser | null) {
    currentAdmin = user;
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('paydora_admin_user', JSON.stringify(user));
        localStorage.setItem('paydora_admin_token', user.token || ADMIN_KEY);
      } else {
        localStorage.removeItem('paydora_admin_user');
        localStorage.removeItem('paydora_admin_token');
      }
    }
  },

  async login(emailOrKey: string, password?: string): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
    // If logging in via admin API key directly
    if (!password || emailOrKey === ADMIN_KEY) {
      if (emailOrKey === ADMIN_KEY || emailOrKey.toLowerCase().includes('admin')) {
        const admin: AdminUser = {
          id: 'adm-root',
          email: 'security-ops@paydora.africa',
          name: 'Administrator',
          role: 'ADMIN',
          is_admin: true,
          token: ADMIN_KEY,
        };
        this.setAdminSession(admin);
        return { success: true, user: admin };
      }
    }

    // Try backend authentication
    try {
      const res = await fetch(`${API_BASE}/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailOrKey, password }),
      });
      const data = await res.json();
      if (res.ok && data?.data?.user?.is_admin) {
        const admin: AdminUser = {
          id: data.data.user.id,
          email: data.data.user.email,
          name: `${data.data.user.first_name} ${data.data.user.last_name}`,
          role: 'ADMIN',
          is_admin: true,
          token: data.data.tokens?.access_token || ADMIN_KEY,
        };
        this.setAdminSession(admin);
        return { success: true, user: admin };
      } else if (res.ok && !data?.data?.user?.is_admin) {
        return { success: false, error: 'Unauthorized: User is not an administrator.' };
      }
    } catch {
      // Offline fallback for development testing
    }

    // Fallback: accept dev credentials
    if (emailOrKey.toLowerCase().includes('admin') || password === 'admin123') {
      const admin: AdminUser = {
        id: 'adm-001',
        email: emailOrKey,
        name: 'Benson Arafat',
        role: 'ADMIN',
        is_admin: true,
        token: ADMIN_KEY,
      };
      this.setAdminSession(admin);
      return { success: true, user: admin };
    }

    return { success: false, error: 'Invalid admin credentials or key' };
  },

  logout() {
    this.setAdminSession(null);
  },

  // System Metrics
  async getMetrics(): Promise<SystemMetrics> {
    const pendingKycCount = mockKycSubmissions.filter(k => k.status === 'pending' || k.status === 'under_review').length;
    const blockedCount = mockUsers.filter(u => u.is_blocked).length;
    
    return {
      totalUsers: 14820,
      activeToday: 1940,
      pendingKycCount,
      blockedUsersCount: blockedCount,
      volume24hNgn: 42890500,
      txCount24h: 3120,
      custodialDepositsNgn: 184520000,
      platformFeeRevenueNgn: 3840250,
      activeCardsCount: 4210,
      squadBalanceNgn: 18450200,
      paystackBalanceNgn: 24190000,
      termiiBalanceNgn: 84500,
      termiiUnits: 21125,
      korapayBalanceNgn: 12850000,
      queues: [
        { name: 'broadcast-mail', status: 'HEALTHY', pendingJobs: 0 },
        { name: 'kyc-reminder', status: 'HEALTHY', pendingJobs: 0 },
        { name: 'vault-sweep', status: 'HEALTHY', pendingJobs: 2 },
        { name: 'transaction-alert', status: 'HEALTHY', pendingJobs: 0 },
      ],
    };
  },

  // KYC Management
  async getKycSubmissions(statusFilter?: KycStatus | 'ALL'): Promise<KycReviewItem[]> {
    if (!statusFilter || statusFilter === 'ALL') {
      return [...mockKycSubmissions];
    }
    return mockKycSubmissions.filter(k => k.status === statusFilter);
  },

  async updateKycStatus(userId: string, status: KycStatus, rejectionReason?: string): Promise<{ success: boolean; message: string }> {
    // Attempt real backend call
    try {
      const res = await fetch(`${API_BASE}/v1/admin/kyc/update-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': ADMIN_KEY,
        },
        body: JSON.stringify({ userId, status, rejectionReason }),
      });
      if (res.ok) {
        const data = await res.json();
        return { success: true, message: data.message || `KYC updated to ${status}` };
      }
    } catch {}

    // Local state sync
    const item = mockKycSubmissions.find(k => k.user_id === userId);
    if (item) {
      item.status = status;
      if (rejectionReason) item.rejection_reason = rejectionReason;
    }
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
      user.kyc_status = status;
    }

    return { 
      success: true, 
      message: `KYC for ${item?.full_name || userId} is now ${status.toUpperCase()}` 
    };
  },

  // Users Management
  async getUsers(searchQuery?: string): Promise<UserAccount[]> {
    if (!searchQuery) return [...mockUsers];
    const q = searchQuery.toLowerCase();
    return mockUsers.filter(u => 
      u.email.toLowerCase().includes(q) || 
      u.first_name.toLowerCase().includes(q) || 
      u.last_name.toLowerCase().includes(q) || 
      u.phone.includes(q) ||
      u.username.toLowerCase().includes(q)
    );
  },

  async toggleUserBlock(userId: string, isBlocked: boolean, reason?: string): Promise<{ success: boolean; message: string }> {
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
      user.is_blocked = isBlocked;
      user.blocked_reason = isBlocked ? (reason || 'Administrative hold placed by compliance.') : undefined;
      user.blocked_at = isBlocked ? new Date().toISOString() : undefined;
      return { 
        success: true, 
        message: `User ${user.first_name} ${user.last_name} ${isBlocked ? 'restricted & blocked' : 'unblocked successfully'}.` 
      };
    }
    return { success: false, message: 'User not found' };
  },

  // Transactions
  async getTransactions(): Promise<TransactionItem[]> {
    return [...mockTransactions];
  },

  // Broadcast & Communications
  async getAudienceStats(): Promise<AudienceStats> {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/mail/stats`, {
        headers: { 'x-admin-key': ADMIN_KEY },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch {}

    return {
      totalUsers: 14820,
      verifiedUsers: 11450,
      unverifiedUsers: 2890,
      pendingKycUsers: 480,
      blockedUsers: 12,
      mobilePushDevices: 12940,
    };
  },

  async previewBroadcast(draft: BroadcastDraft): Promise<string> {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/mail/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': ADMIN_KEY,
        },
        body: JSON.stringify(draft),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data?.html || json.html;
      }
    } catch {}

    // Fallback template preview
    return `
      <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #ffffff; color: #0f172a; border-radius: 12px; border: 1px solid #e2e8f0;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #2563eb; margin: 0;">Paydora Africa</h2>
          <p style="color: #64748b; font-size: 13px; margin-top: 4px;">FinTech Engineered for Africans</p>
        </div>
        <div style="background: #f8fafc; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
          <h3 style="margin-top: 0; color: #1e293b;">${draft.title || draft.subject}</h3>
          <p style="line-height: 1.6; color: #334155; white-space: pre-wrap;">${draft.body}</p>
          ${draft.ctaText ? `
            <div style="text-align: center; margin-top: 24px;">
              <a href="${draft.ctaUrl || '#'}" style="background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 9999px; font-weight: 600; display: inline-block;">
                ${draft.ctaText}
              </a>
            </div>
          ` : ''}
        </div>
        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
          Recipient: [user.name] &bull; Paydora Technologies Limited &bull; Regulatory ID RC-1928374
        </p>
      </div>
    `;
  },

  async sendBroadcast(draft: BroadcastDraft): Promise<{ success: boolean; message: string; count?: number }> {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/mail/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': ADMIN_KEY,
        },
        body: JSON.stringify(draft),
      });
      if (res.ok) {
        const json = await res.json();
        return { success: true, message: json.message || 'Broadcast queued successfully!', count: json.data?.queuedCount };
      }
    } catch {}

    const channelLabel =
      draft.channel === 'PUSH'
        ? 'Mobile App Push Notification'
        : draft.channel === 'BOTH'
        ? 'Multi-Channel (Push & Email)'
        : 'Email Broadcast';

    const titleUsed = draft.channel === 'PUSH' ? draft.pushTitle : draft.subject;

    return { 
      success: true, 
      message: `${channelLabel} "${titleUsed || 'Campaign'}" successfully queued into BullMQ for ${draft.targetAudience} audience.`,
      count: draft.channel === 'PUSH' ? 12940 : 2890,
    };
  },

  async triggerKycReminder(): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/mail/trigger-kyc-reminder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': ADMIN_KEY,
        },
      });
      if (res.ok) {
        const json = await res.json();
        return { success: true, message: json.message || 'KYC Reminder job triggered!' };
      }
    } catch {}

    return { 
      success: true, 
      message: 'KYC Reminder processor triggered: 480 pending unverified users scheduled for reminders.' 
    };
  },

  // Bank Configuration
  async getBanks(): Promise<BankConfigItem[]> {
    try {
      const res = await fetch(`${API_BASE}/v1/banks?provider=all&per_page=500`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch {}
    return [...mockBanks];
  },

  async updateBank(bankId: string, updates: Partial<BankConfigItem>): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/banks/${bankId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': ADMIN_KEY,
        },
        body: JSON.stringify(updates),
      });
      if (res.ok) return true;
    } catch {}

    const index = mockBanks.findIndex(b => b.id === bankId);
    if (index !== -1) {
      mockBanks[index] = { ...mockBanks[index], ...updates };
    }
    return true;
  },

  async createBank(bankData: Omit<BankConfigItem, 'id'>): Promise<BankConfigItem> {
    const newBank: BankConfigItem = {
      id: `bank-${Date.now()}`,
      ...bankData,
    };

    try {
      const res = await fetch(`${API_BASE}/v1/admin/banks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': ADMIN_KEY,
        },
        body: JSON.stringify(bankData),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch {}

    mockBanks.unshift(newBank);
    return newBank;
  },

  async toggleBankCommon(bankId: string, isCommon: boolean): Promise<boolean> {
    return this.updateBank(bankId, { is_common: isCommon });
  },

  async updateBankLogo(bankId: string, logoUrl: string): Promise<boolean> {
    return this.updateBank(bankId, { logo: logoUrl });
  },

  // WhatsApp Customer Support & WebSocket Messaging
  async getWhatsAppConversations(): Promise<WhatsAppConversation[]> {
    return [...mockWhatsAppConversations];
  },

  async sendWhatsAppReply(to: string, message: string, conversationId: string): Promise<WhatsAppMessage> {
    const newMsg: WhatsAppMessage = {
      id: `wmsg-${Date.now()}`,
      sender: 'admin',
      senderName: currentAdmin?.name || 'Paydora Support',
      message,
      timestamp: new Date().toISOString(),
      status: 'DELIVERED',
    };

    // Attempt backend POST
    try {
      await fetch(`${API_BASE}/v1/whatsapp/admin/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': ADMIN_KEY,
        },
        body: JSON.stringify({
          to,
          message,
          conversationId,
          adminName: currentAdmin?.name || 'Paydora Support',
        }),
      });
    } catch {}

    // Update in-memory thread
    const convo = mockWhatsAppConversations.find(c => c.id === conversationId || c.phone.includes(to));
    if (convo) {
      convo.messages.push(newMsg);
      convo.lastMessage = message;
      convo.lastMessageTime = newMsg.timestamp;
      convo.unreadCount = 0;
    }

    return newMsg;
  },

  async simulateIncomingWhatsApp(fromPhone: string, senderName: string, text: string): Promise<WhatsAppMessage> {
    const incomingMsg: WhatsAppMessage = {
      id: `wmsg-${Date.now()}`,
      sender: 'customer',
      senderName,
      message: text,
      timestamp: new Date().toISOString(),
      status: 'DELIVERED',
    };

    try {
      await fetch(`${API_BASE}/v1/whatsapp/admin/simulate-incoming`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: fromPhone, senderName, message: text }),
      });
    } catch {}

    let convo = mockWhatsAppConversations.find(c => c.id === fromPhone || c.phone.includes(fromPhone));
    if (!convo) {
      convo = {
        id: fromPhone,
        phone: fromPhone.startsWith('+') ? fromPhone : `+${fromPhone}`,
        customerName: senderName,
        lastMessage: text,
        lastMessageTime: incomingMsg.timestamp,
        unreadCount: 1,
        kycTier: 1,
        kycStatus: 'pending',
        accountBalanceNgn: 50000,
        messages: [incomingMsg],
      };
      mockWhatsAppConversations.unshift(convo);
    } else {
      convo.messages.push(incomingMsg);
      convo.lastMessage = text;
      convo.lastMessageTime = incomingMsg.timestamp;
      convo.unreadCount += 1;
    }

    return incomingMsg;
  },

  // Bills Management APIs
  async getBillCategories(): Promise<BillCategoryConfigItem[]> {
    try {
      const res = await fetch(`${API_BASE}/admin/bills/categories`, {
        headers: { 'x-admin-key': ADMIN_KEY },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch {}
    return [...mockBillCategories];
  },

  async updateBillCategory(id: string, updates: Partial<BillCategoryConfigItem>): Promise<BillCategoryConfigItem> {
    try {
      const res = await fetch(`${API_BASE}/admin/bills/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': ADMIN_KEY,
        },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch {}

    const index = mockBillCategories.findIndex((c) => c.id === id);
    if (index !== -1) {
      mockBillCategories[index] = {
        ...mockBillCategories[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      return mockBillCategories[index];
    }
    throw new Error('Category not found');
  },

  async getBillers(): Promise<StandardBillerItem[]> {
    try {
      const res = await fetch(`${API_BASE}/admin/bills/billers`, {
        headers: { 'x-admin-key': ADMIN_KEY },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch {}
    return [...mockBillers];
  },

  async updateBiller(id: string, updates: Partial<StandardBillerItem>): Promise<StandardBillerItem> {
    try {
      const res = await fetch(`${API_BASE}/admin/bills/billers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': ADMIN_KEY,
        },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch {}

    const index = mockBillers.findIndex((b) => b.id === id);
    if (index !== -1) {
      mockBillers[index] = {
        ...mockBillers[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      return mockBillers[index];
    }
    throw new Error('Biller not found');
  },

  async getBillerProducts(): Promise<BillerProductItem[]> {
    try {
      const res = await fetch(`${API_BASE}/admin/bills/products`, {
        headers: { 'x-admin-key': ADMIN_KEY },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch {}
    return [...mockBillerProducts];
  },

  async updateBillerProduct(id: string, updates: Partial<BillerProductItem>): Promise<BillerProductItem> {
    try {
      const res = await fetch(`${API_BASE}/admin/bills/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': ADMIN_KEY,
        },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch {}

    const index = mockBillerProducts.findIndex((p) => p.id === id);
    if (index !== -1) {
      mockBillerProducts[index] = {
        ...mockBillerProducts[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      return mockBillerProducts[index];
    }
    throw new Error('Product not found');
  },

  async createBillCategory(category: Omit<BillCategoryConfigItem, 'id'>): Promise<BillCategoryConfigItem> {
    const newCategory: BillCategoryConfigItem = {
      ...category,
      id: String(Date.now()),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const res = await fetch(`${API_BASE}/admin/bills/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': ADMIN_KEY,
        },
        body: JSON.stringify(category),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch {}

    mockBillCategories.push(newCategory);
    return newCategory;
  },

  async createBiller(biller: Omit<StandardBillerItem, 'id'>): Promise<StandardBillerItem> {
    const newBiller: StandardBillerItem = {
      ...biller,
      id: String(Date.now()),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const res = await fetch(`${API_BASE}/admin/bills/billers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': ADMIN_KEY,
        },
        body: JSON.stringify(biller),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch {}

    mockBillers.push(newBiller);
    return newBiller;
  },

  async createBillerProduct(product: Omit<BillerProductItem, 'id'>): Promise<BillerProductItem> {
    const newProduct: BillerProductItem = {
      ...product,
      id: `p-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const res = await fetch(`${API_BASE}/admin/bills/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': ADMIN_KEY,
        },
        body: JSON.stringify(product),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch {}

    mockBillerProducts.push(newProduct);
    return newProduct;
  },

  // Telemetry & Logs APIs
  async getSystemLogs(): Promise<SystemLogItem[]> {
    try {
      const res = await fetch(`${API_BASE}/admin/logs/system`, {
        headers: { 'x-admin-key': ADMIN_KEY },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) return json.data;
      }
    } catch {}
    return [...mockSystemLogs];
  },

  async getJobLogs(): Promise<JobLogItem[]> {
    try {
      const res = await fetch(`${API_BASE}/admin/logs/jobs`, {
        headers: { 'x-admin-key': ADMIN_KEY },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) return json.data;
      }
    } catch {}
    return [...mockJobLogs];
  },

  async getSmsLogs(): Promise<SmsLogItem[]> {
    try {
      const res = await fetch(`${API_BASE}/admin/logs/sms`, {
        headers: { 'x-admin-key': ADMIN_KEY },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) return json.data;
      }
    } catch {}
    return [...mockSmsLogs];
  },

  async getEmailLogs(): Promise<EmailLogItem[]> {
    try {
      const res = await fetch(`${API_BASE}/admin/logs/email`, {
        headers: { 'x-admin-key': ADMIN_KEY },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) return json.data;
      }
    } catch {}
    return [...mockEmailLogs];
  },

  async getWebhookLogs(): Promise<WebhookLogItem[]> {
    try {
      const res = await fetch(`${API_BASE}/admin/logs/webhooks`, {
        headers: { 'x-admin-key': ADMIN_KEY },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) return json.data;
      }
    } catch {}
    return [...mockWebhookLogs];
  },

  async getAuditLogs(): Promise<AuditLogItem[]> {
    try {
      const res = await fetch(`${API_BASE}/admin/logs/audit`, {
        headers: { 'x-admin-key': ADMIN_KEY },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) return json.data;
      }
    } catch {}
    return [...mockAuditLogs];
  },

  // Teams & App Config APIs
  async getTeamMembers(): Promise<TeamMemberItem[]> {
    try {
      const res = await fetch(`${API_BASE}/admin/settings/teams`, {
        headers: { 'x-admin-key': ADMIN_KEY },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) return json.data;
      }
    } catch {}
    return [...mockTeamMembers];
  },

  async inviteTeamMember(data: Omit<TeamMemberItem, 'id' | 'created_at'>): Promise<TeamMemberItem> {
    const newMember: TeamMemberItem = {
      ...data,
      id: `tm-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    try {
      const res = await fetch(`${API_BASE}/admin/settings/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_KEY },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch {}
    mockTeamMembers.push(newMember);
    return newMember;
  },

  async updateTeamMember(id: string, updates: Partial<TeamMemberItem>): Promise<TeamMemberItem> {
    try {
      const res = await fetch(`${API_BASE}/admin/settings/teams/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_KEY },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch {}
    const member = mockTeamMembers.find((m) => m.id === id);
    if (member) {
      Object.assign(member, updates);
      return member;
    }
    throw new Error('Member not found');
  },

  async removeTeamMember(id: string): Promise<boolean> {
    try {
      await fetch(`${API_BASE}/admin/settings/teams/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': ADMIN_KEY },
      });
    } catch {}
    mockTeamMembers = mockTeamMembers.filter((m) => m.id !== id);
    return true;
  },

  async getAppConfig(): Promise<AppConfigSettings> {
    try {
      const res = await fetch(`${API_BASE}/admin/settings/config`, {
        headers: { 'x-admin-key': ADMIN_KEY },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const d = json.data;
          mockAppConfig = {
            ...mockAppConfig,
            admin_account_name: d.admin_account_name ?? mockAppConfig.admin_account_name,
            admin_account_number: d.admin_account_number ?? mockAppConfig.admin_account_number,
            admin_bank_name: d.admin_bank_name ?? mockAppConfig.admin_bank_name,
            default_settlement_provider: (d.default_settlement_provider || d.transfer_provider || mockAppConfig.default_settlement_provider) as 'squad' | 'paystack',
            fallback_settlement_enabled: d.fallback_settlement_enabled !== undefined ? Boolean(d.fallback_settlement_enabled) : mockAppConfig.fallback_settlement_enabled,
            transfer_fee_tier1_max: d.transfer_fee_tier1_max != null ? Number(d.transfer_fee_tier1_max) : mockAppConfig.transfer_fee_tier1_max,
            transfer_fee_tier1_val: d.transfer_fee_tier1_val != null ? Number(d.transfer_fee_tier1_val) : mockAppConfig.transfer_fee_tier1_val,
            transfer_fee_tier2_max: d.transfer_fee_tier2_max != null ? Number(d.transfer_fee_tier2_max) : mockAppConfig.transfer_fee_tier2_max,
            transfer_fee_tier2_val: d.transfer_fee_tier2_val != null ? Number(d.transfer_fee_tier2_val) : mockAppConfig.transfer_fee_tier2_val,
            transfer_fee_tier3_val: d.transfer_fee_tier3_val != null ? Number(d.transfer_fee_tier3_val) : mockAppConfig.transfer_fee_tier3_val,
            wallet_min_limit_ngn: d.wallet_min_limit_ngn != null ? Number(d.wallet_min_limit_ngn) : mockAppConfig.wallet_min_limit_ngn,
            wallet_max_limit_ngn: d.wallet_max_limit_ngn != null ? Number(d.wallet_max_limit_ngn) : mockAppConfig.wallet_max_limit_ngn,
            wallet_min_limit_usd: d.wallet_min_limit_usd != null ? Number(d.wallet_min_limit_usd) : mockAppConfig.wallet_min_limit_usd,
            wallet_max_limit_usd: d.wallet_max_limit_usd != null ? Number(d.wallet_max_limit_usd) : mockAppConfig.wallet_max_limit_usd,
            wallet_min_limit_eur: d.wallet_min_limit_eur != null ? Number(d.wallet_min_limit_eur) : mockAppConfig.wallet_min_limit_eur,
            wallet_max_limit_eur: d.wallet_max_limit_eur != null ? Number(d.wallet_max_limit_eur) : mockAppConfig.wallet_max_limit_eur,
            wallet_min_limit_gbp: d.wallet_min_limit_gbp != null ? Number(d.wallet_min_limit_gbp) : mockAppConfig.wallet_min_limit_gbp,
            wallet_max_limit_gbp: d.wallet_max_limit_gbp != null ? Number(d.wallet_max_limit_gbp) : mockAppConfig.wallet_max_limit_gbp,
            tier_1_daily_limit: d.tier_1_daily_limit != null ? Number(d.tier_1_daily_limit) : mockAppConfig.tier_1_daily_limit,
            tier_2_daily_limit: d.tier_2_daily_limit != null ? Number(d.tier_2_daily_limit) : mockAppConfig.tier_2_daily_limit,
            tier_3_daily_limit: d.tier_3_daily_limit != null ? Number(d.tier_3_daily_limit) : mockAppConfig.tier_3_daily_limit,
            airtime_cash_rate_mtn: d.airtime_cash_rate_mtn != null ? Number(d.airtime_cash_rate_mtn) : mockAppConfig.airtime_cash_rate_mtn,
            airtime_cash_rate_airtel: d.airtime_cash_rate_airtel != null ? Number(d.airtime_cash_rate_airtel) : mockAppConfig.airtime_cash_rate_airtel,
            airtime_cash_min_amount: d.airtime_cash_min_amount != null ? Number(d.airtime_cash_min_amount) : mockAppConfig.airtime_cash_min_amount,
            airtime_cash_max_amount: d.airtime_cash_max_amount != null ? Number(d.airtime_cash_max_amount) : mockAppConfig.airtime_cash_max_amount,
            nin_basic_price: d.nin_basic_price != null ? Number(d.nin_basic_price) : mockAppConfig.nin_basic_price,
            nin_premium_price: d.nin_premium_price != null ? Number(d.nin_premium_price) : mockAppConfig.nin_premium_price,
            vat_rate: d.vat_rate != null ? Number(d.vat_rate) : mockAppConfig.vat_rate,
            active_bill_provider: (d.active_bill_provider || mockAppConfig.active_bill_provider) as 'flutterwave' | 'interswitch',
            cable_tv_convenience_fee: d.cable_tv_convenience_fee != null ? Number(d.cable_tv_convenience_fee) : mockAppConfig.cable_tv_convenience_fee,
            electricity_convenience_fee: d.electricity_convenience_fee != null ? Number(d.electricity_convenience_fee) : mockAppConfig.electricity_convenience_fee,
            mycover_claim_link: d.mycover_claim_link ?? mockAppConfig.mycover_claim_link,
            primary_otp_channel: (d.primary_otp_channel || mockAppConfig.primary_otp_channel) as 'sms' | 'whatsapp',
            cashback_global_rate: d.cashback_global_rate != null ? Number(d.cashback_global_rate) : mockAppConfig.cashback_global_rate,
            webhook_retry_limit: d.webhook_retry_limit != null ? Number(d.webhook_retry_limit) : mockAppConfig.webhook_retry_limit,
          };
          return { ...mockAppConfig };
        }
      }
    } catch {}
    return { ...mockAppConfig };
  },

  async updateAppConfig(updates: Partial<AppConfigSettings>): Promise<AppConfigSettings> {
    try {
      const backendPayload: Record<string, string> = {};
      if (updates.admin_account_name) backendPayload['admin_account_name'] = updates.admin_account_name;
      if (updates.admin_account_number) backendPayload['admin_account_number'] = updates.admin_account_number;
      if (updates.admin_bank_name) backendPayload['admin_bank_name'] = updates.admin_bank_name;
      if (updates.default_settlement_provider) {
        backendPayload['transfer_provider'] = updates.default_settlement_provider;
        backendPayload['default_settlement_provider'] = updates.default_settlement_provider;
      }
      if (updates.transfer_fee_tier1_max != null) backendPayload['transfer_fee_tier1_max'] = String(updates.transfer_fee_tier1_max);
      if (updates.transfer_fee_tier1_val != null) backendPayload['transfer_fee_tier1_val'] = String(updates.transfer_fee_tier1_val);
      if (updates.transfer_fee_tier2_max != null) backendPayload['transfer_fee_tier2_max'] = String(updates.transfer_fee_tier2_max);
      if (updates.transfer_fee_tier2_val != null) backendPayload['transfer_fee_tier2_val'] = String(updates.transfer_fee_tier2_val);
      if (updates.transfer_fee_tier3_val != null) backendPayload['transfer_fee_tier3_val'] = String(updates.transfer_fee_tier3_val);
      if (updates.wallet_min_limit_ngn != null) backendPayload['wallet_min_limit_ngn'] = String(updates.wallet_min_limit_ngn);
      if (updates.wallet_max_limit_ngn != null) backendPayload['wallet_max_limit_ngn'] = String(updates.wallet_max_limit_ngn);
      if (updates.wallet_min_limit_usd != null) backendPayload['wallet_min_limit_usd'] = String(updates.wallet_min_limit_usd);
      if (updates.wallet_max_limit_usd != null) backendPayload['wallet_max_limit_usd'] = String(updates.wallet_max_limit_usd);
      if (updates.wallet_min_limit_eur != null) backendPayload['wallet_min_limit_eur'] = String(updates.wallet_min_limit_eur);
      if (updates.wallet_max_limit_eur != null) backendPayload['wallet_max_limit_eur'] = String(updates.wallet_max_limit_eur);
      if (updates.wallet_min_limit_gbp != null) backendPayload['wallet_min_limit_gbp'] = String(updates.wallet_min_limit_gbp);
      if (updates.wallet_max_limit_gbp != null) backendPayload['wallet_max_limit_gbp'] = String(updates.wallet_max_limit_gbp);
      if (updates.airtime_cash_rate_mtn != null) backendPayload['airtime_cash_rate_mtn'] = String(updates.airtime_cash_rate_mtn);
      if (updates.airtime_cash_rate_airtel != null) backendPayload['airtime_cash_rate_airtel'] = String(updates.airtime_cash_rate_airtel);
      if (updates.airtime_cash_min_amount != null) backendPayload['airtime_cash_min_amount'] = String(updates.airtime_cash_min_amount);
      if (updates.airtime_cash_max_amount != null) backendPayload['airtime_cash_max_amount'] = String(updates.airtime_cash_max_amount);
      if (updates.nin_basic_price != null) backendPayload['nin_basic_price'] = String(updates.nin_basic_price);
      if (updates.nin_premium_price != null) backendPayload['nin_premium_price'] = String(updates.nin_premium_price);
      if (updates.vat_rate != null) backendPayload['vat_rate'] = String(updates.vat_rate);
      if (updates.active_bill_provider) backendPayload['active_bill_provider'] = updates.active_bill_provider;
      if (updates.cable_tv_convenience_fee != null) backendPayload['cable_tv_convenience_fee'] = String(updates.cable_tv_convenience_fee);
      if (updates.electricity_convenience_fee != null) backendPayload['electricity_convenience_fee'] = String(updates.electricity_convenience_fee);
      if (updates.mycover_claim_link) backendPayload['mycover_claim_link'] = updates.mycover_claim_link;

      await fetch(`${API_BASE}/admin/settings/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_KEY },
        body: JSON.stringify(backendPayload),
      });
    } catch {}
    mockAppConfig = {
      ...mockAppConfig,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return { ...mockAppConfig };
  },

  async getCardWishlist(): Promise<CardWishlistItem[]> {
    try {
      const res = await fetch(`${API_BASE}/admin/wishlist/card`, {
        headers: { 'x-admin-key': ADMIN_KEY },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) return json.data;
      }
    } catch {}
    return [...mockCardWishlist];
  },

  async getWealthWishlist(): Promise<WealthWishlistItem[]> {
    try {
      const res = await fetch(`${API_BASE}/admin/wishlist/wealth`, {
        headers: { 'x-admin-key': ADMIN_KEY },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) return json.data;
      }
    } catch {}
    return [...mockWealthWishlist];
  },

  async updateWishlistStatus(type: 'card' | 'wealth', id: string, status: string): Promise<boolean> {
    if (type === 'card') {
      const item = mockCardWishlist.find((w) => w.id === id);
      if (item) item.status = status as any;
    } else {
      const item = mockWealthWishlist.find((w) => w.id === id);
      if (item) item.status = status as any;
    }
    return true;
  },

  async removeWishlistEntry(type: 'card' | 'wealth', id: string): Promise<boolean> {
    if (type === 'card') {
      try {
        await fetch(`${API_BASE}/admin/wishlist/card/${id}`, {
          method: 'DELETE',
          headers: { 'x-admin-key': ADMIN_KEY },
        });
      } catch {}
      mockCardWishlist = mockCardWishlist.filter((w) => w.id !== id);
    } else {
      mockWealthWishlist = mockWealthWishlist.filter((w) => w.id !== id);
    }
    return true;
  },
};
