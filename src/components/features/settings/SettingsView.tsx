'use client';

import React, { useState } from 'react';
import { 
  Key, 
  CheckCircle, 
  Copy, 
  Users, 
  FileText 
} from 'lucide-react';
import { AdminUser } from '@/types/admin';

interface SettingsViewProps {
  admin: AdminUser | null;
}

export default function SettingsView({ admin }: SettingsViewProps) {
  const [copiedKey, setCopiedKey] = useState(false);
  const adminKey = process.env.NEXT_PUBLIC_ADMIN_KEY || 'paydora-admin-secret';

  const handleCopyKey = () => {
    navigator.clipboard.writeText(adminKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const auditLogs = [
    { id: '1', actor: 'admin@paydora.africa', action: 'KYC_APPROVE', target: 'usr-9816', ip: '102.89.41.22', time: '10 mins ago' },
    { id: '2', actor: 'compliance@paydora.africa', action: 'BLOCK_USER', target: 'usr-9800', ip: '102.89.41.22', time: '1 hour ago' },
    { id: '3', actor: 'system-scheduler', action: 'VAULT_SWEEP', target: 'Wema Pool', ip: '127.0.0.1', time: '4 hours ago' },
    { id: '4', actor: 'admin@paydora.africa', action: 'TRIGGER_KYC_REMINDERS', target: '480 recipients', ip: '102.89.41.22', time: '12 hours ago' },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Credentials Panel */}
      <div className="card-standard">
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
              Administrative API Credentials
            </h3>
            <p style={{ fontSize: 12.5, color: '#64748b', margin: '3px 0 0 0' }}>
              Used by automated runners, background webhooks, and administrative microservices.
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
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
              Secret Header: <code>x-admin-key</code>
            </div>
            <div style={{ fontFamily: 'monospace', color: '#0f172a', fontSize: 14, fontWeight: 600, marginTop: 4 }}>
              •••••••••••••••••••••••••{adminKey.slice(-4)}
            </div>
          </div>

          <button
            onClick={handleCopyKey}
            className="btn-outline"
            style={{ fontSize: 12.5, padding: '7px 14px' }}
          >
            {copiedKey ? <CheckCircle size={14} color="var(--green)" /> : <Copy size={14} />}
            <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
          </button>
        </div>
      </div>

      {/* Role Privileges Grid */}
      <div className="card-standard">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
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
            <Users size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Role-Based Access Control (RBAC)
            </h3>
            <p style={{ fontSize: 12.5, color: '#64748b', margin: '3px 0 0 0' }}>
              Operational privileges segregated by regulatory compliance duties.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          <div
            style={{
              padding: 18,
              borderRadius: 'var(--r-md)',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="badge badge-info">SUPER ADMIN</span>
            </div>
            <p style={{ fontSize: 12.5, color: '#475569', marginTop: 8 }}>
              Full system control: settlement rails, broadcast dispatches, admin roles, and vault parameters.
            </p>
          </div>

          <div
            style={{
              padding: 18,
              borderRadius: 'var(--r-md)',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="badge badge-verified">COMPLIANCE OFFICER</span>
            </div>
            <p style={{ fontSize: 12.5, color: '#475569', marginTop: 8 }}>
              BVN & NIN identity verification, AML fraud checks, account restrictions, and unblocking reviews.
            </p>
          </div>

          <div
            style={{
              padding: 18,
              borderRadius: 'var(--r-md)',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="badge badge-pending">SUPPORT & OPS</span>
            </div>
            <p style={{ fontSize: 12.5, color: '#475569', marginTop: 8 }}>
              Transaction ledger search, re-query failed transfers, inspect receipt proofs, and resend user alerts.
            </p>
          </div>
        </div>
      </div>

      {/* Audit Log Trail */}
      <div className="card-standard" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileText size={18} color="var(--primary)" />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Immutable Administrative Audit Log
            </h3>
          </div>
          <p style={{ fontSize: 12.5, color: '#64748b', margin: '4px 0 0 0' }}>
            Every sensitive action is cryptographically recorded for regulatory compliance.
          </p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: '#64748b', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px 20px' }}>Actor</th>
                <th style={{ padding: '12px 20px' }}>Action</th>
                <th style={{ padding: '12px 20px' }}>Target Resource</th>
                <th style={{ padding: '12px 20px' }}>IP Origin</th>
                <th style={{ padding: '12px 20px' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 20px', color: '#0f172a', fontWeight: 500 }}>{log.actor}</td>
                  <td style={{ padding: '12px 20px' }}>
                    <span className="badge badge-info">{log.action}</span>
                  </td>
                  <td style={{ padding: '12px 20px', fontFamily: 'monospace', color: '#475569' }}>
                    {log.target}
                  </td>
                  <td style={{ padding: '12px 20px', color: '#64748b', fontFamily: 'monospace' }}>
                    {log.ip}
                  </td>
                  <td style={{ padding: '12px 20px', color: '#64748b' }}>{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
