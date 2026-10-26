/**
 * Paydora Admin Financial Session Manager
 *
 * Implements fintech-grade inactivity tracking (15 minutes), absolute session caps (24 hours),
 * and cross-tab session synchronization matching paydora_dashboard.
 */

export const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes of inactivity
export const ABSOLUTE_SESSION_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours absolute max session

export const STORAGE_KEY_ADMIN_LAST_ACTIVITY = 'paydora_admin_last_activity';
export const STORAGE_KEY_ADMIN_SESSION_START = 'paydora_admin_session_start';
export const STORAGE_KEY_ADMIN_SESSION_BROADCAST = 'paydora_admin_session_broadcast';

let lastActivityUpdateThrottle = 0;

/**
 * Record a new session start when the administrator logs in
 */
export function recordAdminSessionStart(): void {
  if (typeof window === 'undefined') return;
  const now = Date.now().toString();
  try {
    localStorage.setItem(STORAGE_KEY_ADMIN_SESSION_START, now);
    localStorage.setItem(STORAGE_KEY_ADMIN_LAST_ACTIVITY, now);
  } catch {
    // Silently handle storage errors
  }
}

/**
 * Update the last active timestamp when administrator interaction occurs.
 * Throttled to avoid unnecessary localStorage writes.
 */
export function updateAdminLastActivity(force = false): void {
  if (typeof window === 'undefined') return;
  const now = Date.now();
  if (!force && now - lastActivityUpdateThrottle < 4000) {
    return;
  }
  lastActivityUpdateThrottle = now;
  try {
    localStorage.setItem(STORAGE_KEY_ADMIN_LAST_ACTIVITY, now.toString());
  } catch {
    // Silently handle storage errors
  }
}

/**
 * Get the last active timestamp in milliseconds
 */
export function getAdminLastActivity(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ADMIN_LAST_ACTIVITY);
    if (!raw) return null;
    const parsed = parseInt(raw, 10);
    return isNaN(parsed) ? null : parsed;
  } catch {
    return null;
  }
}

/**
 * Get the initial session creation timestamp
 */
export function getAdminSessionStartTime(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ADMIN_SESSION_START);
    if (!raw) return null;
    const parsed = parseInt(raw, 10);
    return isNaN(parsed) ? null : parsed;
  } catch {
    return null;
  }
}

/**
 * Determine whether the current authenticated admin session has timed out due to
 * either idle inactivity (> 15 minutes) or absolute session lifetime (> 24 hours).
 */
export function isAdminSessionTimedOut(): boolean {
  if (typeof window === 'undefined') return false;

  const hasToken = Boolean(localStorage.getItem('paydora_admin_token'));
  if (!hasToken) {
    return false;
  }

  const lastActivity = getAdminLastActivity();
  const sessionStart = getAdminSessionStartTime();
  const now = Date.now();

  // If authenticated but missing activity marker (e.g. existing session prior to upgrade),
  // initialize it now so we don't prematurely boot active users
  if (!lastActivity) {
    recordAdminSessionStart();
    return false;
  }

  // 1. Inactivity check (15 minutes without interaction)
  if (now - lastActivity > INACTIVITY_TIMEOUT_MS) {
    return true;
  }

  // 2. Absolute session limit check (24 hours maximum)
  if (sessionStart && now - sessionStart > ABSOLUTE_SESSION_TIMEOUT_MS) {
    return true;
  }

  return false;
}

/**
 * Get milliseconds remaining until the inactivity timeout triggers.
 */
export function getTimeUntilAdminInactivityTimeout(): number {
  if (typeof window === 'undefined') return INACTIVITY_TIMEOUT_MS;
  const lastActivity = getAdminLastActivity();
  if (!lastActivity) return INACTIVITY_TIMEOUT_MS;
  const elapsed = Date.now() - lastActivity;
  const remaining = INACTIVITY_TIMEOUT_MS - elapsed;
  return Math.max(0, remaining);
}

/**
 * Broadcast an authentication/session event to synchronize across all browser tabs
 */
export function broadcastAdminSessionEvent(type: 'logout' | 'activity' | 'refresh'): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      STORAGE_KEY_ADMIN_SESSION_BROADCAST,
      JSON.stringify({ type, timestamp: Date.now() })
    );
  } catch {
    // Silently handle storage errors
  }
}

/**
 * Clean up all session timestamps on logout or session expiration
 */
export function clearAdminSessionTimestamps(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY_ADMIN_LAST_ACTIVITY);
    localStorage.removeItem(STORAGE_KEY_ADMIN_SESSION_START);
    broadcastAdminSessionEvent('logout');
  } catch {
    // Silently handle storage errors
  }
}
