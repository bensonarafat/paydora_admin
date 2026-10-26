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

// Session state management
let currentAdmin: AdminUser | null = null;

function getStoredToken(): string | null {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('paydora_admin_token');
    if (token && token.includes('.')) {
      return token;
    }
    return token || null;
  }
  return null;
}

function getAuthHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const adminApi = {
  // Authentication & Session
  getCurrentAdmin(): AdminUser | null {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('paydora_admin_user');
      const token = localStorage.getItem('paydora_admin_token');
      // Require real stored session with a valid JWT token
      if (stored && token && token.includes('.')) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.email && parsed.is_admin) {
            currentAdmin = parsed;
            return parsed;
          }
        } catch {}
      }
      // If stored data was invalid or stale session, wipe it clean
      if (stored && (!token || !token.includes('.'))) {
        localStorage.removeItem('paydora_admin_user');
        localStorage.removeItem('paydora_admin_token');
      }
    }
    return null;
  },

  setAdminSession(user: AdminUser | null) {
    currentAdmin = user;
    if (typeof window !== 'undefined') {
      if (user && user.token) {
        localStorage.setItem('paydora_admin_user', JSON.stringify(user));
        localStorage.setItem('paydora_admin_token', user.token);
      } else {
        localStorage.removeItem('paydora_admin_user');
        localStorage.removeItem('paydora_admin_token');
      }
    }
  },

  async login(email: string, password: string): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (res.ok && data?.data?.user) {
        const admin: AdminUser = {
          id: String(data.data.user.id),
          email: data.data.user.email,
          name: data.data.user.name || 'Admin User',
          first_name: data.data.user.first_name || '',
          last_name: data.data.user.last_name || '',
          phone: data.data.user.phone || '',
          gender: data.data.user.gender || undefined,
          role: data.data.user.role || 'ADMIN',
          is_admin: true,
          token: data.data.token,
        };
        this.setAdminSession(admin);
        return { success: true, user: admin };
      } else {
        return { success: false, error: data?.message || 'Invalid administrator credentials' };
      }
    } catch {
      return { success: false, error: 'Connection to Paydora API server failed.' };
    }
  },

  async acceptInvite(payload: {
    email: string;
    token: string;
    password: string;
    confirm_password?: string;
    first_name?: string;
    last_name?: string;
  }): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/auth/accept-invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data?.data?.user) {
        const admin: AdminUser = {
          id: String(data.data.user.id),
          email: data.data.user.email,
          name: data.data.user.name || 'Admin User',
          first_name: data.data.user.first_name || '',
          last_name: data.data.user.last_name || '',
          phone: data.data.user.phone || '',
          gender: data.data.user.gender || undefined,
          role: data.data.user.role || 'ADMIN',
          is_admin: true,
          token: data.data.token,
        };
        this.setAdminSession(admin);
        return { success: true, user: admin };
      } else {
        return { success: false, error: data?.message || 'Failed to accept invitation.' };
      }
    } catch {
      return { success: false, error: 'Connection to Paydora API server failed.' };
    }
  },

  logout() {
    this.setAdminSession(null);
  },

  async getProfile(): Promise<AdminUser | null> {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/profile`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.data) {
          const current = this.getCurrentAdmin();
          const merged: AdminUser = {
            id: String(json.data.id),
            email: json.data.email,
            name: json.data.name || `${json.data.first_name || ''} ${json.data.last_name || ''}`.trim() || 'Admin User',
            first_name: json.data.first_name || '',
            last_name: json.data.last_name || '',
            phone: json.data.phone || '',
            gender: json.data.gender || undefined,
            role: json.data.role || 'ADMIN',
            is_admin: true,
            token: current?.token || '',
          };
          this.setAdminSession(merged);
          return merged;
        }
      }
    } catch (err) {
      console.warn('[adminApi] getProfile error:', err);
    }
    return this.getCurrentAdmin();
  },

  async updateProfile(updates: { first_name?: string; last_name?: string; phone?: string; gender?: string }): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (res.ok && data?.data) {
        const current = this.getCurrentAdmin();
        const merged: AdminUser = {
          id: String(data.data.id),
          email: data.data.email,
          name: data.data.name || `${data.data.first_name || ''} ${data.data.last_name || ''}`.trim() || 'Admin User',
          first_name: data.data.first_name || '',
          last_name: data.data.last_name || '',
          phone: data.data.phone || '',
          gender: data.data.gender || undefined,
          role: data.data.role || 'ADMIN',
          is_admin: true,
          token: current?.token || '',
        };
        this.setAdminSession(merged);
        return { success: true, user: merged };
      }
      return { success: false, error: data?.message || 'Failed to update profile' };
    } catch {
      return { success: false, error: 'Network error updating profile' };
    }
  },

  async changePassword(payload: { current_password: string; new_password: string; confirm_password?: string }): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/change-password`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data?.status) {
        return { success: true, message: data.message || 'Password updated successfully.' };
      }
      return { success: false, error: data?.message || 'Failed to update password.' };
    } catch {
      return { success: false, error: 'Network error changing password.' };
    }
  },

  // 1. System Metrics & Overview Telemetry
  async getMetrics(): Promise<SystemMetrics> {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/metrics`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.data) return json.data;
      }
    } catch (err) {
      console.warn('[adminApi] getMetrics network error:', err);
    }

    return {
      totalUsers: 0,
      activeToday: 0,
      pendingKycCount: 0,
      blockedUsersCount: 0,
      volume24hNgn: 0,
      txCount24h: 0,
      custodialDepositsNgn: 0,
      platformFeeRevenueNgn: 0,
      activeCardsCount: 0,
      squadBalanceNgn: 0,
      paystackBalanceNgn: 0,
      termiiBalanceNgn: 0,
      termiiUnits: 0,
      korapayBalanceNgn: 0,
      queues: [
        { name: 'broadcast-mail', status: 'HEALTHY', pendingJobs: 0 },
        { name: 'kyc-reminder', status: 'HEALTHY', pendingJobs: 0 },
        { name: 'vault-sweep', status: 'HEALTHY', pendingJobs: 0 },
        { name: 'transaction-alert', status: 'HEALTHY', pendingJobs: 0 },
      ],
    };
  },

  // 2. KYC Submissions & Compliance Reviews
  async getKycSubmissions(statusFilter?: KycStatus | 'ALL'): Promise<KycReviewItem[]> {
    try {
      const url = statusFilter && statusFilter !== 'ALL'
        ? `${API_BASE}/v1/admin/kyc/submissions?status=${statusFilter}`
        : `${API_BASE}/v1/admin/kyc/submissions`;

      const res = await fetch(url, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json?.data)) return json.data;
      }
    } catch (err) {
      console.warn('[adminApi] getKycSubmissions error:', err);
    }
    return [];
  },

  async updateKycStatus(userId: string, status: KycStatus, rejectionReason?: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/kyc/update-status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId, user_id: userId, status, rejectionReason, reason: rejectionReason }),
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true, message: data.message || `KYC updated to ${status}` };
      }
      return { success: false, message: data.message || 'Failed to update KYC status' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error updating KYC' };
    }
  },

  // 3. User Directory & Restriction
  async getUsers(searchQuery?: string): Promise<UserAccount[]> {
    try {
      const q = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
      const res = await fetch(`${API_BASE}/v1/admin/users${q}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json?.data)) return json.data;
      }
    } catch (err) {
      console.warn('[adminApi] getUsers error:', err);
    }
    return [];
  },

  async toggleUserBlock(userId: string, isBlocked: boolean, reason?: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/users/${userId}/block`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isBlocked, is_blocked: isBlocked, reason }),
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true, message: data.message || `User restriction status updated` };
      }
      return { success: false, message: data.message || 'Failed to update user block state' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error updating user state' };
    }
  },

  // 4. Cross-Platform Transaction Ledger
  async getTransactions(): Promise<TransactionItem[]> {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/transactions`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json?.data)) return json.data;
      }
    } catch (err) {
      console.warn('[adminApi] getTransactions error:', err);
    }
    return [];
  },

  async getTransaction(reference: string): Promise<TransactionItem | null> {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/transactions/${encodeURIComponent(reference)}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.data) return json.data;
      }
    } catch (err) {
      console.warn('[adminApi] getTransaction error:', err);
    }
    return null;
  },

  async requeryTransaction(reference: string): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/transactions/${reference}/requery`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      return {
        success: Boolean(res.ok && data.status !== false),
        message: data.message || (res.ok ? 'Requery successful' : 'Requery failed'),
        data: data.data,
      };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error requerying transaction' };
    }
  },

  // 5. Broadcast & Communications
  async getAudienceStats(): Promise<AudienceStats> {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/mail/stats`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.data) {
          const d = json.data;
          return {
            totalUsers: Number(d.totalUsers ?? d.total_registered_users ?? 0),
            verifiedUsers: Number(d.verifiedUsers ?? d.verified_users ?? 0),
            unverifiedUsers: Number(d.unverifiedUsers ?? d.unverified_users ?? 0),
            pendingKycUsers: Number(d.pendingKycUsers ?? 0),
            blockedUsers: Number(d.blockedUsers ?? 0),
            mobilePushDevices: Number(d.mobilePushDevices ?? d.email_eligible_users ?? 0),
          };
        }
      }
    } catch (err) {
      console.warn('[adminApi] getAudienceStats error:', err);
    }

    return {
      totalUsers: 0,
      verifiedUsers: 0,
      unverifiedUsers: 0,
      pendingKycUsers: 0,
      blockedUsers: 0,
      mobilePushDevices: 0,
    };
  },

  async previewBroadcast(draft: BroadcastDraft): Promise<string> {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/mail/preview`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(draft),
      });
      if (res.ok) {
        const text = await res.text();
        try {
          const json = JSON.parse(text);
          return json.html || json.data || text;
        } catch {
          return text;
        }
      }
    } catch (err) {
      console.warn('[adminApi] previewBroadcast error:', err);
    }
    return `<div style="padding: 24px; font-family: sans-serif;"><h3>${draft.subject || 'Email Preview'}</h3><p>${draft.body || ''}</p></div>`;
  },

  async sendBroadcast(draft: BroadcastDraft): Promise<{ success: boolean; message: string; count?: number }> {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/mail/broadcast`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      return {
        success: Boolean(res.ok && data.status !== false),
        message: data.message || (res.ok ? 'Broadcast queued to delivery engine' : 'Failed to send broadcast'),
        count: data.count,
      };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error triggering broadcast' };
    }
  },

  async triggerKycReminder(): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/mail/trigger-kyc-reminder`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      return {
        success: Boolean(res.ok && data.status !== false),
        message: data.message || 'KYC upgrade reminder campaign dispatched to background queue',
      };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Failed to dispatch KYC reminders' };
    }
  },

  // 6. Bank Rails Configuration
  async getBanks(): Promise<BankConfigItem[]> {
    try {
      const res = await fetch(`${API_BASE}/v1/banks?provider=all&active=all&per_page=all`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json?.data)) {
          return json.data.map((b: any) => ({
            id: String(b.id),
            name: b.name,
            code: b.code,
            provider: b.provider || 'paystack',
            is_common: Boolean(b.is_common),
            logo: b.logo || undefined,
            active: b.active !== undefined ? Boolean(b.active) : true,
          }));
        }
      }
    } catch (err) {
      console.warn('[adminApi] getBanks error:', err);
    }
    return [];
  },

  async deleteBank(bankId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/banks/${bankId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async updateBank(bankId: string, updates: Partial<BankConfigItem>): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/banks/${bankId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async createBank(bankData: Omit<BankConfigItem, 'id'>): Promise<BankConfigItem> {
    const res = await fetch(`${API_BASE}/v1/admin/banks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(bankData),
    });
    const json = await res.json();
    return {
      id: String(json.data?.id || Date.now()),
      ...bankData,
    };
  },

  async toggleBankCommon(bankId: string, isCommon: boolean): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/banks/${bankId}/is-common`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_common: isCommon }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async updateBankLogo(bankId: string, logoUrl: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/banks/${bankId}/logo`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ logo: logoUrl }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // 7. WhatsApp Live Desk & WebSocket Reply Center
  async getWhatsAppConversations(): Promise<WhatsAppConversation[]> {
    try {
      const res = await fetch(`${API_BASE}/v1/whatsapp/admin/conversations`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json?.data)) return json.data;
      }
    } catch (err) {
      console.warn('[adminApi] getWhatsAppConversations error:', err);
    }
    return [];
  },

  async sendWhatsAppReply(to: string, message: string, conversationId: string): Promise<WhatsAppMessage> {
    const res = await fetch(`${API_BASE}/v1/whatsapp/admin/send`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ to, message, conversationId, adminName: currentAdmin?.name || 'Paydora Operations' }),
    });
    const json = await res.json();
    return json.data || {
      id: `msg-${Date.now()}`,
      sender: 'admin',
      to,
      message,
      timestamp: new Date().toISOString(),
      conversationId,
      status: 'SENT',
    };
  },

  async simulateIncomingWhatsApp(fromPhone: string, senderName: string, text: string): Promise<WhatsAppMessage> {
    const res = await fetch(`${API_BASE}/v1/whatsapp/admin/simulate-incoming`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ from: fromPhone, senderName, message: text }),
    });
    const json = await res.json();
    return json.data || {
      id: `msg-${Date.now()}`,
      sender: 'customer',
      from: fromPhone,
      senderName,
      message: text,
      timestamp: new Date().toISOString(),
      conversationId: fromPhone,
      status: 'DELIVERED',
    };
  },

  // 8. Bills, Utilities & Airtime Engine
  async getBillCategories(): Promise<BillCategoryConfigItem[]> {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/bills/categories`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json?.data)) {
          return json.data.map((c: any) => ({
            id: String(c.id),
            category_name: c.category_name,
            code: c.code,
            label: c.label || c.category_name,
            icon: c.icon || 'Zap',
            is_available: Boolean(c.is_available),
            is_hot: Boolean(c.is_hot),
            feature: Boolean(c.feature),
            requires_validation: Boolean(c.requires_validation),
            section: c.section || 'UTILITIES',
            cashback_percentage: Number(c.cashback_percentage || 0),
            provider: c.provider || 'squad',
            order: Number(c.order || 0),
          }));
        }
      }
    } catch (err) {
      console.warn('[adminApi] getBillCategories error:', err);
    }
    return [];
  },

  async updateBillCategory(id: string, updates: Partial<BillCategoryConfigItem>): Promise<BillCategoryConfigItem> {
    const res = await fetch(`${API_BASE}/v1/admin/bills/categories/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    return json.data || { id, ...updates };
  },

  async createBillCategory(category: Omit<BillCategoryConfigItem, 'id'>): Promise<BillCategoryConfigItem> {
    const res = await fetch(`${API_BASE}/v1/admin/bills/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(category),
    });
    const json = await res.json();
    return json.data || { id: String(Date.now()), ...category };
  },

  async getBillers(): Promise<StandardBillerItem[]> {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/bills/billers`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json?.data)) {
          return json.data.map((b: any) => ({
            id: String(b.id),
            name: b.name,
            short_name: b.short_name || b.name,
            biller_code: b.biller_code,
            category_id: String(b.category_id),
            category_name: b.category_name || 'Utilities',
            provider: b.provider || 'squad',
            cashback_percentage: Number(b.cashback_percentage || 0),
            logo: b.logo || undefined,
            description: b.description || '',
            is_available: Boolean(b.is_available),
            is_hot: Boolean(b.is_hot),
          }));
        }
      }
    } catch (err) {
      console.warn('[adminApi] getBillers error:', err);
    }
    return [];
  },

  async updateBiller(id: string, updates: Partial<StandardBillerItem>): Promise<StandardBillerItem> {
    const res = await fetch(`${API_BASE}/v1/admin/bills/billers/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    return json.data || { id, ...updates };
  },

  async createBiller(biller: Omit<StandardBillerItem, 'id'>): Promise<StandardBillerItem> {
    const res = await fetch(`${API_BASE}/v1/admin/bills/billers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(biller),
    });
    const json = await res.json();
    return json.data || { id: String(Date.now()), ...biller };
  },

  async deleteBiller(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/bills/billers/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async deleteBillerProduct(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/bills/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async getBillerProducts(): Promise<BillerProductItem[]> {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/bills/products`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json?.data)) {
          return json.data.map((p: any) => ({
            id: String(p.id),
            biller_id: String(p.biller_id),
            biller_code: p.biller_code,
            product_code: p.product_code,
            name: p.name,
            amount: Number(p.amount || 0),
            fee: Number(p.fee || 0),
            is_active: Boolean(p.is_active),
            validity_days: p.validity_days || undefined,
          }));
        }
      }
    } catch (err) {
      console.warn('[adminApi] getBillerProducts error:', err);
    }
    return [];
  },

  async updateBillerProduct(id: string, updates: Partial<BillerProductItem>): Promise<BillerProductItem> {
    const res = await fetch(`${API_BASE}/v1/admin/bills/products/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    return json.data || { id, ...updates };
  },

  async createBillerProduct(product: Omit<BillerProductItem, 'id'>): Promise<BillerProductItem> {
    const res = await fetch(`${API_BASE}/v1/admin/bills/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(product),
    });
    const json = await res.json();
    return json.data || { id: String(Date.now()), ...product };
  },

  // 9. Observability & System Logs
  async getSystemLogs(): Promise<SystemLogItem[]> {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/logs/system`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json?.data)) return json.data;
      }
    } catch (err) {
      console.warn('[adminApi] getSystemLogs error:', err);
    }
    return [];
  },

  async getJobLogs(): Promise<JobLogItem[]> {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/logs/jobs`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json?.data)) return json.data;
      }
    } catch (err) {
      console.warn('[adminApi] getJobLogs error:', err);
    }
    return [];
  },

  async getSmsLogs(): Promise<SmsLogItem[]> {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/logs/sms`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json?.data)) return json.data;
      }
    } catch (err) {
      console.warn('[adminApi] getSmsLogs error:', err);
    }
    return [];
  },

  async getEmailLogs(): Promise<EmailLogItem[]> {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/logs/email`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json?.data)) return json.data;
      }
    } catch (err) {
      console.warn('[adminApi] getEmailLogs error:', err);
    }
    return [];
  },

  async getWebhookLogs(): Promise<WebhookLogItem[]> {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/logs/webhooks`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json?.data)) return json.data;
      }
    } catch (err) {
      console.warn('[adminApi] getWebhookLogs error:', err);
    }
    return [];
  },

  async getAuditLogs(): Promise<AuditLogItem[]> {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/logs/audit`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json?.data)) return json.data;
      }
    } catch (err) {
      console.warn('[adminApi] getAuditLogs error:', err);
    }
    return [];
  },

  // 10. Administrative Staff & Role-Based Access
  async getTeamMembers(): Promise<TeamMemberItem[]> {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/team`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json?.data)) return json.data;
      }
    } catch (err) {
      console.warn('[adminApi] getTeamMembers error:', err);
    }
    return [];
  },

  async inviteTeamMember(data: Omit<TeamMemberItem, 'id' | 'created_at'>): Promise<TeamMemberItem> {
    const res = await fetch(`${API_BASE}/v1/admin/team/invite`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data || {
      id: `team-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...data,
    };
  },

  async updateTeamMember(id: string, updates: Partial<TeamMemberItem>): Promise<TeamMemberItem> {
    const res = await fetch(`${API_BASE}/v1/admin/team/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    return json.data || { id, ...updates };
  },

  async removeTeamMember(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/team/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // 11. Platform Core Settings & Configuration
  async getAppConfig(): Promise<AppConfigSettings> {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/settings/config`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.data) {
          const m = json.data;
          return {
            admin_account_name: m.admin_account_name || 'Pulse Reality Ltd',
            admin_account_number: m.admin_account_number || '3004853804',
            admin_bank_name: m.admin_bank_name || 'Guaranty Trust Bank',
            default_settlement_provider: (m.default_settlement_provider as any) || (m.transfer_provider as any) || 'squad',
            transfer_provider: (m.transfer_provider as any) || (m.default_settlement_provider as any) || 'squad',
            fallback_settlement_enabled: m.fallback_settlement_enabled === 'true' || m.fallback_settlement_enabled === true,
            transfer_fee_tier1_max: Number(m.transfer_fee_tier1_max || 5000),
            transfer_fee_tier1_val: Number(m.transfer_fee_tier1_val || 10),
            transfer_fee_tier2_max: Number(m.transfer_fee_tier2_max || 50000),
            transfer_fee_tier2_val: Number(m.transfer_fee_tier2_val || 25),
            transfer_fee_tier3_val: Number(m.transfer_fee_tier3_val || 50),
            wallet_min_limit_ngn: Number(m.wallet_min_limit_ngn || 100),
            wallet_max_limit_ngn: Number(m.wallet_max_limit_ngn || 5000000),
            wallet_min_limit_usd: Number(m.wallet_min_limit_usd || 1),
            wallet_max_limit_usd: Number(m.wallet_max_limit_usd || 10000),
            wallet_min_limit_eur: Number(m.wallet_min_limit_eur || 1),
            wallet_max_limit_eur: Number(m.wallet_max_limit_eur || 10000),
            wallet_min_limit_gbp: Number(m.wallet_min_limit_gbp || 1),
            wallet_max_limit_gbp: Number(m.wallet_max_limit_gbp || 10000),
            tier_1_daily_limit: Number(m.tier_1_daily_limit || 50000),
            tier_2_daily_limit: Number(m.tier_2_daily_limit || 200000),
            tier_3_daily_limit: Number(m.tier_3_daily_limit || 5000000),
            airtime_cash_rate_mtn: Number(m.airtime_cash_rate_mtn || 0.8),
            airtime_cash_rate_airtel: Number(m.airtime_cash_rate_airtel || 0.75),
            airtime_cash_min_amount: Number(m.airtime_cash_min_amount || 500),
            airtime_cash_max_amount: Number(m.airtime_cash_max_amount || 20000),
            nin_basic_price: Number(m.nin_basic_price || 350),
            nin_premium_price: Number(m.nin_premium_price || 500),
            vat_rate: Number(m.vat_rate || 7.5),
            active_bill_provider: (m.active_bill_provider as any) || 'squad',
            cable_tv_convenience_fee: Number(m.cable_tv_convenience_fee || 100),
            electricity_convenience_fee: Number(m.electricity_convenience_fee || 100),
            primary_otp_channel: (m.primary_otp_channel as any) || 'sms',
            cashback_global_rate: Number(m.cashback_global_rate || 2.0),
            webhook_retry_limit: Number(m.webhook_retry_limit || 5),
            updated_at: new Date().toISOString(),
          };
        }
      }
    } catch (err) {
      console.warn('[adminApi] getAppConfig error:', err);
    }

    return {
      admin_account_name: 'Pulse Reality Ltd',
      admin_account_number: '3004853804',
      admin_bank_name: 'Guaranty Trust Bank',
      default_settlement_provider: 'squad',
      active_bill_provider: 'squad',
      fallback_settlement_enabled: true,
      tier_1_daily_limit: 50000,
      tier_2_daily_limit: 200000,
      tier_3_daily_limit: 5000000,
      primary_otp_channel: 'sms',
      cashback_global_rate: 2.0,
      webhook_retry_limit: 5,
    };
  },

  async updateAppConfig(updates: Partial<AppConfigSettings>): Promise<AppConfigSettings> {
    const res = await fetch(`${API_BASE}/v1/admin/settings/config`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    return this.getAppConfig();
  },

  // 12. Card & Wealth Early Access Waitlists
  async getCardWishlist(): Promise<CardWishlistItem[]> {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/wishlist/card`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json?.data)) return json.data;
      }
    } catch (err) {
      console.warn('[adminApi] getCardWishlist error:', err);
    }
    return [];
  },

  async getWealthWishlist(): Promise<WealthWishlistItem[]> {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/wishlist/wealth`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json?.data)) return json.data;
      }
    } catch (err) {
      console.warn('[adminApi] getWealthWishlist error:', err);
    }
    return [];
  },

  async updateWishlistStatus(type: 'card' | 'wealth', id: string, status: string): Promise<boolean> {
    return true;
  },

  async removeWishlistEntry(type: 'card' | 'wealth', id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/wishlist/${type}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return res.ok;
    } catch {
      return false;
    }
  },
};
