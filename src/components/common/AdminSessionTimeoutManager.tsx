'use client';

import { useEffect, useCallback, useRef } from 'react';
import {
  getTimeUntilAdminInactivityTimeout,
  updateAdminLastActivity,
  broadcastAdminSessionEvent,
  clearAdminSessionTimestamps,
  STORAGE_KEY_ADMIN_SESSION_BROADCAST,
} from '@/lib/session/sessionManager';

interface AdminSessionTimeoutManagerProps {
  onTimeout: (reason?: 'inactivity' | 'multi_tab_logout') => void;
}

export default function AdminSessionTimeoutManager({ onTimeout }: AdminSessionTimeoutManagerProps) {
  const isLoggingOutRef = useRef<boolean>(false);

  const triggerLogout = useCallback(
    (reason: 'inactivity' | 'multi_tab_logout') => {
      if (isLoggingOutRef.current) return;
      isLoggingOutRef.current = true;

      if (reason === 'inactivity') {
        clearAdminSessionTimestamps();
        broadcastAdminSessionEvent('logout');
      }

      onTimeout(reason);
    },
    [onTimeout]
  );

  useEffect(() => {
    // 1. Listen for user activity events to keep the session alive while actively working
    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleUserActivity = () => {
      updateAdminLastActivity();
    };

    activityEvents.forEach((evt) => {
      window.addEventListener(evt, handleUserActivity, { passive: true });
    });

    // 2. Multi-tab synchronization: sync logout across tabs
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_ADMIN_SESSION_BROADCAST && e.newValue) {
        try {
          const payload = JSON.parse(e.newValue);
          if (payload.type === 'logout') {
            triggerLogout('multi_tab_logout');
          }
        } catch {
          // Ignore parse errors
        }
      }
    };

    window.addEventListener('storage', handleStorageEvent);

    // 3. Heartbeat interval: check remaining inactivity time every 5 seconds
    const interval = setInterval(() => {
      if (isLoggingOutRef.current) return;

      const remainingMs = getTimeUntilAdminInactivityTimeout();

      if (remainingMs <= 0) {
        // Inactivity timeout exceeded -> log out directly
        triggerLogout('inactivity');
      }
    }, 5000);

    return () => {
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, handleUserActivity);
      });
      window.removeEventListener('storage', handleStorageEvent);
      clearInterval(interval);
    };
  }, [triggerLogout]);

  // Silently monitors inactivity and triggers onTimeout when exceeded
  return null;
}
