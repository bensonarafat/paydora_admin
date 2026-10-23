'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Terminal, 
  Clock, 
  Smartphone, 
  Mail, 
  Radio, 
  ShieldCheck, 
  Search, 
  RefreshCw, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Info, 
  Copy, 
  Check, 
  ExternalLink, 
  ChevronRight, 
  Code2, 
  ArrowUpRight,
  Database,
  Send,
  Eye,
  FileText
} from 'lucide-react';
import { 
  LogsSubTab, 
  SystemLogItem, 
  JobLogItem, 
  SmsLogItem, 
  EmailLogItem, 
  WebhookLogItem, 
  AuditLogItem,
  SystemLogLevel,
  JobStatus,
  SmsStatus,
  EmailDeliveryStatus
} from '@/types/admin';

interface LogsManagementViewProps {
  activeSubTab: LogsSubTab;
  onSubTabChange: (tab: LogsSubTab) => void;
  systemLogs: SystemLogItem[];
  jobLogs: JobLogItem[];
  smsLogs: SmsLogItem[];
  emailLogs: EmailLogItem[];
  webhookLogs: WebhookLogItem[];
  auditLogs: AuditLogItem[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export default function LogsManagementView({
  activeSubTab,
  onSubTabChange,
  systemLogs,
  jobLogs,
  smsLogs,
  emailLogs,
  webhookLogs,
  auditLogs,
  isLoading = false,
  onRefresh,
}: LogsManagementViewProps) {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [providerFilter, setProviderFilter] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Inspector modal state
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [inspectTitle, setInspectTitle] = useState('');
  const [inspectSubtitle, setInspectSubtitle] = useState('');
  const [inspectPayload, setInspectPayload] = useState<string>('');
  const [inspectMeta, setInspectMeta] = useState<{ [key: string]: string | number | undefined }>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openInspector = (
    title: string, 
    subtitle: string, 
    payload: string, 
    meta: { [key: string]: string | number | undefined }
  ) => {
    setInspectTitle(title);
    setInspectSubtitle(subtitle);
    setInspectPayload(payload);
    setInspectMeta(meta);
    setInspectModalOpen(true);
  };

  const closeInspector = () => {
    setInspectModalOpen(false);
  };

  // Filtered System Logs
  const filteredSystemLogs = systemLogs.filter((log) => {
    const q = search.toLowerCase();
    const matchesSearch = 
      !q || 
      log.message.toLowerCase().includes(q) || 
      log.service.toLowerCase().includes(q) || 
      (log.endpoint && log.endpoint.toLowerCase().includes(q)) ||
      log.ip_address.toLowerCase().includes(q);
    const matchesLevel = levelFilter === 'ALL' || log.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  // Filtered Job Logs
  const filteredJobLogs = jobLogs.filter((job) => {
    const q = search.toLowerCase();
    const matchesSearch = 
      !q || 
      job.name.toLowerCase().includes(q) || 
      job.queue.toLowerCase().includes(q) || 
      job.job_id.toLowerCase().includes(q) ||
      (job.error_message && job.error_message.toLowerCase().includes(q));
    const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered SMS Logs
  const filteredSmsLogs = smsLogs.filter((sms) => {
    const q = search.toLowerCase();
    const matchesSearch = 
      !q || 
      sms.recipient.toLowerCase().includes(q) || 
      sms.message.toLowerCase().includes(q) || 
      sms.sender_id.toLowerCase().includes(q) ||
      (sms.provider_reference && sms.provider_reference.toLowerCase().includes(q));
    const matchesStatus = statusFilter === 'ALL' || sms.status === statusFilter;
    const matchesProvider = providerFilter === 'ALL' || sms.provider === providerFilter;
    return matchesSearch && matchesStatus && matchesProvider;
  });

  // Filtered Email Logs
  const filteredEmailLogs = emailLogs.filter((eml) => {
    const q = search.toLowerCase();
    const matchesSearch = 
      !q || 
      eml.recipient.toLowerCase().includes(q) || 
      eml.subject.toLowerCase().includes(q) || 
      eml.template.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'ALL' || eml.status === statusFilter;
    const matchesProvider = providerFilter === 'ALL' || eml.provider === providerFilter;
    return matchesSearch && matchesStatus && matchesProvider;
  });

  // Filtered Webhook Logs
  const filteredWebhookLogs = webhookLogs.filter((wh) => {
    const q = search.toLowerCase();
    const matchesSearch = 
      !q || 
      wh.event.toLowerCase().includes(q) || 
      wh.provider.toLowerCase().includes(q) || 
      wh.payload.toLowerCase().includes(q);
    const matchesProvider = providerFilter === 'ALL' || wh.provider === providerFilter;
    const matchesStatus = statusFilter === 'ALL' || wh.status === statusFilter;
    return matchesSearch && matchesProvider && matchesStatus;
  });

  // Filtered Audit Logs
  const filteredAuditLogs = auditLogs.filter((aud) => {
    const q = search.toLowerCase();
    const matchesSearch = 
      !q || 
      aud.admin_name.toLowerCase().includes(q) || 
      aud.admin_email.toLowerCase().includes(q) || 
      aud.action.toLowerCase().includes(q) || 
      aud.target_resource.toLowerCase().includes(q) ||
      aud.ip_address.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'ALL' || aud.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const subNavItems: { id: LogsSubTab; label: string; count: number; icon: React.ReactNode }[] = [
    { id: 'system', label: 'System Logs', count: systemLogs.length, icon: <Terminal size={14} /> },
    { id: 'jobs', label: 'Jobs Log', count: jobLogs.length, icon: <Clock size={14} /> },
    { id: 'sms', label: 'SMS Log', count: smsLogs.length, icon: <Smartphone size={14} /> },
    { id: 'email', label: 'Email Logs', count: emailLogs.length, icon: <Mail size={14} /> },
    { id: 'webhooks', label: 'Webhook Logs', count: webhookLogs.length, icon: <Radio size={14} /> },
    { id: 'audit', label: 'Audit Trail', count: auditLogs.length, icon: <ShieldCheck size={14} /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Subnav Pill Headers & Refresh Button */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {subNavItems.map((item) => {
            const isActive = activeSubTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSubTabChange(item.id);
                  setSearch('');
                  setLevelFilter('ALL');
                  setStatusFilter('ALL');
                  setProviderFilter('ALL');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 14px',
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
                <span>{item.icon}</span>
                <span>{item.label}</span>
                <span
                  style={{
                    fontSize: 11,
                    padding: '1px 6px',
                    borderRadius: 10,
                    background: isActive ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                    color: isActive ? '#ffffff' : '#64748b',
                    fontWeight: 600,
                  }}
                >
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live Refresh Trigger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 'var(--r-md)',
                background: 'var(--bg-white)',
                border: '1px solid #e2e8f0',
                color: '#475569',
                fontSize: 12.5,
                fontWeight: 500,
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
              <span>Refresh Telemetry</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card-standard"
        style={{
          background: 'var(--bg-white)',
          padding: '14px 18px',
          borderRadius: 'var(--r-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 260 }}>
          <div
            style={{
              position: 'relative',
              flex: 1,
              maxWidth: 420,
            }}
          >
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }}
            />
            <input
              type="text"
              placeholder={
                activeSubTab === 'system'
                  ? 'Search by message, service name, or IP...'
                  : activeSubTab === 'jobs'
                  ? 'Search by job name, queue, or job ID...'
                  : activeSubTab === 'sms'
                  ? 'Search recipient phone, sender ID, or text...'
                  : activeSubTab === 'email'
                  ? 'Search recipient email, template, or subject...'
                  : activeSubTab === 'webhooks'
                  ? 'Search partner event or payload content...'
                  : 'Search admin email, action name, or resource...'
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                borderRadius: 'var(--r-md)',
                border: '1px solid #e2e8f0',
                fontSize: 13,
                outline: 'none',
                background: '#f8fafc',
              }}
            />
          </div>

          {/* Level Filter for System Logs */}
          {activeSubTab === 'system' && (
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--r-md)',
                border: '1px solid #e2e8f0',
                fontSize: 13,
                color: '#475569',
                background: '#f8fafc',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">All Levels</option>
              <option value="INFO">INFO</option>
              <option value="WARN">WARN</option>
              <option value="ERROR">ERROR</option>
              <option value="DEBUG">DEBUG</option>
            </select>
          )}

          {/* Status Filter for Jobs, SMS, Emails, Webhooks, Audit */}
          {activeSubTab === 'jobs' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--r-md)',
                border: '1px solid #e2e8f0',
                fontSize: 13,
                color: '#475569',
                background: '#f8fafc',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">All Job Statuses</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="FAILED">FAILED</option>
              <option value="DELAYED">DELAYED</option>
              <option value="ACTIVE">ACTIVE</option>
            </select>
          )}

          {activeSubTab === 'sms' && (
            <>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--r-md)',
                  border: '1px solid #e2e8f0',
                  fontSize: 13,
                  color: '#475569',
                  background: '#f8fafc',
                  cursor: 'pointer',
                }}
              >
                <option value="ALL">All SMS Statuses</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="SENT">SENT</option>
                <option value="FAILED">FAILED</option>
              </select>
              <select
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--r-md)',
                  border: '1px solid #e2e8f0',
                  fontSize: 13,
                  color: '#475569',
                  background: '#f8fafc',
                  cursor: 'pointer',
                }}
              >
                <option value="ALL">All Providers</option>
                <option value="termii">Termii SMS</option>
                <option value="meta-whatsapp">WhatsApp Cloud</option>
              </select>
            </>
          )}

          {activeSubTab === 'email' && (
            <>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--r-md)',
                  border: '1px solid #e2e8f0',
                  fontSize: 13,
                  color: '#475569',
                  background: '#f8fafc',
                  cursor: 'pointer',
                }}
              >
                <option value="ALL">All Email Statuses</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="OPENED">OPENED</option>
                <option value="BOUNCED">BOUNCED</option>
                <option value="FAILED">FAILED</option>
              </select>
              <select
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--r-md)',
                  border: '1px solid #e2e8f0',
                  fontSize: 13,
                  color: '#475569',
                  background: '#f8fafc',
                  cursor: 'pointer',
                }}
              >
                <option value="ALL">All Providers</option>
                <option value="sendgrid">SendGrid</option>
                <option value="resend">Resend</option>
              </select>
            </>
          )}

          {activeSubTab === 'webhooks' && (
            <>
              <select
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--r-md)',
                  border: '1px solid #e2e8f0',
                  fontSize: 13,
                  color: '#475569',
                  background: '#f8fafc',
                  cursor: 'pointer',
                }}
              >
                <option value="ALL">All Inbound Partners</option>
                <option value="squad">Squad (HabariPay)</option>
                <option value="paystack">Paystack</option>
                <option value="meta">Meta WhatsApp</option>
                <option value="termii">Termii</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--r-md)',
                  border: '1px solid #e2e8f0',
                  fontSize: 13,
                  color: '#475569',
                  background: '#f8fafc',
                  cursor: 'pointer',
                }}
              >
                <option value="ALL">All Processing Statuses</option>
                <option value="PROCESSED">PROCESSED</option>
                <option value="FAILED">FAILED</option>
                <option value="RETRYING">RETRYING</option>
              </select>
            </>
          )}
        </div>

        <div style={{ fontSize: 12.5, color: '#64748b' }}>
          {activeSubTab === 'system' && `${filteredSystemLogs.length} events logged`}
          {activeSubTab === 'jobs' && `${filteredJobLogs.length} queue worker records`}
          {activeSubTab === 'sms' && `${filteredSmsLogs.length} dispatches logged`}
          {activeSubTab === 'email' && `${filteredEmailLogs.length} emails dispatched`}
          {activeSubTab === 'webhooks' && `${filteredWebhookLogs.length} incoming events`}
          {activeSubTab === 'audit' && `${filteredAuditLogs.length} actions audited`}
        </div>
      </div>

      {/* =========================================================================
          TAB 1: SYSTEM LOGS TABLE
          ========================================================================= */}
      {activeSubTab === 'system' && (
        <div
          className="card-standard"
          style={{
            background: 'var(--bg-white)',
            borderRadius: 'var(--r-lg)',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Level</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Service / Module</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Endpoint / Method</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Log Message</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Latency</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Origin IP</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Timestamp</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600, textAlign: 'right' }}>Inspect</th>
                </tr>
              </thead>
              <tbody>
                {filteredSystemLogs.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                      No system logs found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredSystemLogs.map((log) => {
                    const isError = log.level === 'ERROR';
                    const isWarn = log.level === 'WARN';
                    const isInfo = log.level === 'INFO';

                    return (
                      <tr
                        key={log.id}
                        onClick={() =>
                          openInspector(
                            `System Log: [${log.level}] ${log.service}`,
                            log.endpoint || log.message,
                            log.details || JSON.stringify(log, null, 2),
                            {
                              'Log ID': log.id,
                              'Level': log.level,
                              'Service': log.service,
                              'Endpoint': log.endpoint || 'Internal',
                              'Method': log.method || 'N/A',
                              'Status Code': log.status_code || 200,
                              'Latency': log.latency_ms ? `${log.latency_ms} ms` : 'N/A',
                              'Origin IP': log.ip_address,
                              'Timestamp': new Date(log.created_at).toLocaleString(),
                            }
                          )
                        }
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                          background: isError ? '#fffaf8' : isWarn ? '#fffdf5' : 'transparent',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#f8fafc';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = isError ? '#fffaf8' : isWarn ? '#fffdf5' : 'transparent';
                        }}
                      >
                        {/* Level */}
                        <td style={{ padding: '12px 18px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              padding: '2px 8px',
                              borderRadius: 'var(--r-full)',
                              fontSize: 11,
                              fontWeight: 700,
                              background: isError ? '#fef2f2' : isWarn ? '#fffbeb' : isInfo ? '#eff6ff' : '#f1f5f9',
                              color: isError ? '#dc2626' : isWarn ? '#d97706' : isInfo ? '#2563eb' : '#475569',
                              border: isError
                                ? '1px solid #fecaca'
                                : isWarn
                                ? '1px solid #fde68a'
                                : isInfo
                                ? '1px solid #bfdbfe'
                                : '1px solid #e2e8f0',
                            }}
                          >
                            {isError && <XCircle size={11} />}
                            {isWarn && <AlertTriangle size={11} />}
                            {isInfo && <Info size={11} />}
                            <span>{log.level}</span>
                          </span>
                        </td>

                        {/* Service */}
                        <td style={{ padding: '12px 16px' }}>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontSize: 12,
                              fontWeight: 600,
                              color: '#334155',
                              background: '#f1f5f9',
                              padding: '2px 6px',
                              borderRadius: 4,
                            }}
                          >
                            {log.service}
                          </span>
                        </td>

                        {/* Endpoint & Method */}
                        <td style={{ padding: '12px 16px' }}>
                          {log.endpoint ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              {log.method && (
                                <span
                                  style={{
                                    fontSize: 10,
                                    fontWeight: 700,
                                    color: log.method === 'POST' ? '#16a34a' : '#2563eb',
                                    background: log.method === 'POST' ? '#f0fdf4' : '#eff6ff',
                                    padding: '1px 5px',
                                    borderRadius: 3,
                                  }}
                                >
                                  {log.method}
                                </span>
                              )}
                              <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#475569' }}>
                                {log.endpoint}
                              </span>
                            </div>
                          ) : (
                            <span style={{ fontSize: 12, color: '#94a3b8' }}>Internal</span>
                          )}
                        </td>

                        {/* Message */}
                        <td style={{ padding: '12px 16px', maxWidth: 360 }}>
                          <div
                            style={{
                              color: '#0f172a',
                              fontWeight: 500,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {log.message}
                          </div>
                          {log.details && (
                            <div
                              style={{
                                fontSize: 11,
                                color: '#dc2626',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                marginTop: 2,
                              }}
                            >
                              {log.details}
                            </div>
                          )}
                        </td>

                        {/* Latency */}
                        <td style={{ padding: '12px 16px' }}>
                          {log.latency_ms !== undefined ? (
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: log.latency_ms > 1000 ? '#dc2626' : log.latency_ms > 300 ? '#d97706' : '#16a34a',
                              }}
                            >
                              {log.latency_ms} ms
                            </span>
                          ) : (
                            <span style={{ fontSize: 12, color: '#94a3b8' }}>—</span>
                          )}
                        </td>

                        {/* Origin IP */}
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 12, color: '#64748b' }}>
                          {log.ip_address}
                        </td>

                        {/* Timestamp */}
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748b', whiteSpace: 'nowrap' }}>
                          {new Date(log.created_at).toLocaleTimeString()}
                        </td>

                        {/* Inspect Action */}
                        <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                          <button
                            type="button"
                            className="btn-outline"
                            style={{
                              padding: '4px 10px',
                              fontSize: 11.5,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <Eye size={12} />
                            <span>Details</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: JOBS LOG TABLE
          ========================================================================= */}
      {activeSubTab === 'jobs' && (
        <div
          className="card-standard"
          style={{
            background: 'var(--bg-white)',
            borderRadius: 'var(--r-lg)',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Queue Name</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Job Name & ID</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Attempts</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Duration</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Processed At</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600, textAlign: 'right' }}>Payload</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                      No background queue jobs found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredJobLogs.map((job) => {
                    const isCompleted = job.status === 'COMPLETED';
                    const isFailed = job.status === 'FAILED';

                    return (
                      <tr
                        key={job.id}
                        onClick={() =>
                          openInspector(
                            `Job: ${job.name} (${job.queue})`,
                            `BullMQ Job ID: ${job.job_id}`,
                            job.payload || 'No payload captured',
                            {
                              'Job ID': job.job_id,
                              'Queue': job.queue,
                              'Job Name': job.name,
                              'Status': job.status,
                              'Attempts': `${job.attempts} / ${job.max_attempts}`,
                              'Duration': `${job.duration_ms} ms`,
                              'Error Reason': job.error_message || 'None (Success)',
                              'Processed At': new Date(job.processed_at).toLocaleString(),
                            }
                          )
                        }
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                          background: isFailed ? '#fffaf8' : 'transparent',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#f8fafc';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = isFailed ? '#fffaf8' : 'transparent';
                        }}
                      >
                        {/* Queue Name */}
                        <td style={{ padding: '14px 18px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              fontFamily: 'monospace',
                              fontSize: 12,
                              fontWeight: 600,
                              color: '#2563eb',
                              background: '#eff6ff',
                              padding: '3px 8px',
                              borderRadius: 4,
                            }}
                          >
                            <Database size={12} />
                            <span>{job.queue}</span>
                          </span>
                        </td>

                        {/* Job Name & ID */}
                        <td style={{ padding: '14px 16px' }}>
                          <div>
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{job.name}</div>
                            <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>
                              {job.job_id}
                            </div>
                            {job.error_message && (
                              <div style={{ fontSize: 11, color: '#dc2626', marginTop: 2 }}>
                                {job.error_message}
                              </div>
                            )}
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
                              background: isCompleted ? '#f0fdf4' : isFailed ? '#fef2f2' : '#fffbeb',
                              color: isCompleted ? '#16a34a' : isFailed ? '#dc2626' : '#d97706',
                              border: isCompleted
                                ? '1px solid #bbf7d0'
                                : isFailed
                                ? '1px solid #fecaca'
                                : '1px solid #fde68a',
                            }}
                          >
                            {isCompleted && <CheckCircle2 size={11} />}
                            {isFailed && <XCircle size={11} />}
                            <span>{job.status}</span>
                          </span>
                        </td>

                        {/* Attempts */}
                        <td style={{ padding: '14px 16px', fontSize: 12.5, color: '#475569' }}>
                          <span style={{ fontWeight: 600 }}>{job.attempts}</span>
                          <span style={{ color: '#94a3b8' }}> / {job.max_attempts}</span>
                        </td>

                        {/* Duration */}
                        <td style={{ padding: '14px 16px', fontSize: 12.5, fontWeight: 600, color: '#475569' }}>
                          {job.duration_ms} ms
                        </td>

                        {/* Processed At */}
                        <td style={{ padding: '14px 16px', fontSize: 12, color: '#64748b' }}>
                          {new Date(job.processed_at).toLocaleTimeString()}
                        </td>

                        {/* Payload Inspect */}
                        <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                          <button
                            type="button"
                            className="btn-outline"
                            style={{
                              padding: '4px 10px',
                              fontSize: 11.5,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <Code2 size={12} />
                            <span>Payload</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: SMS & WHATSAPP LOG TABLE
          ========================================================================= */}
      {activeSubTab === 'sms' && (
        <div
          className="card-standard"
          style={{
            background: 'var(--bg-white)',
            borderRadius: 'var(--r-lg)',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Recipient</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Sender ID</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Type / Channel</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Message Content</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Units & Cost</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Provider</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600, textAlign: 'right' }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filteredSmsLogs.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                      No SMS or WhatsApp delivery logs found.
                    </td>
                  </tr>
                ) : (
                  filteredSmsLogs.map((sms) => {
                    const isDelivered = sms.status === 'DELIVERED';
                    const isFailed = sms.status === 'FAILED';

                    return (
                      <tr
                        key={sms.id}
                        onClick={() =>
                          openInspector(
                            `SMS Dispatch: ${sms.recipient}`,
                            `${sms.provider.toUpperCase()} (${sms.channel}) - Ref: ${sms.provider_reference || 'N/A'}`,
                            sms.message,
                            {
                              'Log ID': sms.id,
                              'Recipient': sms.recipient,
                              'Sender ID': sms.sender_id,
                              'Message Type': sms.type,
                              'Channel': sms.channel,
                              'Status': sms.status,
                              'SMS Units': sms.units,
                              'Cost': `₦${sms.cost_ngn.toFixed(2)}`,
                              'Provider': sms.provider,
                              'Provider Ref': sms.provider_reference || 'N/A',
                              'Timestamp': new Date(sms.created_at).toLocaleString(),
                            }
                          )
                        }
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#f8fafc';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        {/* Recipient */}
                        <td style={{ padding: '14px 18px', fontWeight: 600, color: '#0f172a' }}>
                          <span style={{ fontFamily: 'monospace' }}>{sms.recipient}</span>
                        </td>

                        {/* Sender ID */}
                        <td style={{ padding: '14px 16px', color: '#475569', fontWeight: 500 }}>
                          {sms.sender_id}
                        </td>

                        {/* Type / Channel */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                padding: '1px 6px',
                                borderRadius: 3,
                                background: '#f1f5f9',
                                color: '#475569',
                              }}
                            >
                              {sms.type}
                            </span>
                            <span style={{ fontSize: 11, color: '#94a3b8' }}>({sms.channel})</span>
                          </div>
                        </td>

                        {/* Message Content */}
                        <td style={{ padding: '14px 16px', maxWidth: 300 }}>
                          <div
                            style={{
                              color: '#334155',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              fontSize: 12.5,
                            }}
                          >
                            {sms.message}
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
                              background: isDelivered ? '#f0fdf4' : isFailed ? '#fef2f2' : '#eff6ff',
                              color: isDelivered ? '#16a34a' : isFailed ? '#dc2626' : '#2563eb',
                              border: isDelivered
                                ? '1px solid #bbf7d0'
                                : isFailed
                                ? '1px solid #fecaca'
                                : '1px solid #bfdbfe',
                            }}
                          >
                            {isDelivered && <CheckCircle2 size={11} />}
                            {isFailed && <XCircle size={11} />}
                            <span>{sms.status}</span>
                          </span>
                        </td>

                        {/* Units & Cost */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a' }}>
                            ₦{sms.cost_ngn.toFixed(2)}
                          </div>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>{sms.units} unit(s)</div>
                        </td>

                        {/* Provider */}
                        <td style={{ padding: '14px 16px' }}>
                          <span
                            style={{
                              fontSize: 11.5,
                              padding: '2px 7px',
                              borderRadius: 4,
                              background: sms.provider === 'meta-whatsapp' ? '#f0fdf4' : '#eff6ff',
                              color: sms.provider === 'meta-whatsapp' ? '#16a34a' : '#2563eb',
                              fontWeight: 600,
                            }}
                          >
                            {sms.provider === 'meta-whatsapp' ? 'WhatsApp' : 'Termii'}
                          </span>
                        </td>

                        {/* Timestamp */}
                        <td style={{ padding: '14px 18px', textAlign: 'right', fontSize: 12, color: '#64748b' }}>
                          {new Date(sms.created_at).toLocaleTimeString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: EMAIL LOGS TABLE
          ========================================================================= */}
      {activeSubTab === 'email' && (
        <div
          className="card-standard"
          style={{
            background: 'var(--bg-white)',
            borderRadius: 'var(--r-lg)',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Recipient Email</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Subject Line</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Template</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Delivery Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Provider</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Size</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600, textAlign: 'right' }}>Sent At</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmailLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                      No email delivery logs found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredEmailLogs.map((eml) => {
                    const isOpened = eml.status === 'OPENED';
                    const isDelivered = eml.status === 'DELIVERED';
                    const isBounced = eml.status === 'BOUNCED';

                    return (
                      <tr
                        key={eml.id}
                        onClick={() =>
                          openInspector(
                            `Email Dispatch: ${eml.subject}`,
                            `To: ${eml.recipient} | Template: ${eml.template}`,
                            eml.error_reason ? `Bounce/Error Reason:\n${eml.error_reason}` : `Email Template: ${eml.template}\nSubject: ${eml.subject}\nRecipient: ${eml.recipient}\nStatus: ${eml.status}\nOpened At: ${eml.opened_at || 'Not yet opened'}`,
                            {
                              'Log ID': eml.id,
                              'Recipient': eml.recipient,
                              'Subject': eml.subject,
                              'Template': eml.template,
                              'Delivery Status': eml.status,
                              'Provider': eml.provider,
                              'Size': eml.size_kb ? `${eml.size_kb} KB` : 'N/A',
                              'Opened At': eml.opened_at ? new Date(eml.opened_at).toLocaleString() : 'Unopened',
                              'Bounce Reason': eml.error_reason || 'None',
                              'Sent At': new Date(eml.created_at).toLocaleString(),
                            }
                          )
                        }
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                          background: isBounced ? '#fffaf8' : 'transparent',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#f8fafc';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = isBounced ? '#fffaf8' : 'transparent';
                        }}
                      >
                        {/* Recipient */}
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{eml.recipient}</div>
                          {eml.error_reason && (
                            <div style={{ fontSize: 11, color: '#dc2626', marginTop: 2 }}>
                              {eml.error_reason}
                            </div>
                          )}
                        </td>

                        {/* Subject */}
                        <td style={{ padding: '14px 16px', maxWidth: 280 }}>
                          <div
                            style={{
                              color: '#334155',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              fontWeight: 500,
                            }}
                          >
                            {eml.subject}
                          </div>
                        </td>

                        {/* Template */}
                        <td style={{ padding: '14px 16px' }}>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontSize: 11.5,
                              padding: '2px 6px',
                              borderRadius: 4,
                              background: '#f1f5f9',
                              color: '#475569',
                            }}
                          >
                            {eml.template}
                          </span>
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
                              background: isOpened ? '#eff6ff' : isDelivered ? '#f0fdf4' : isBounced ? '#fef2f2' : '#f8fafc',
                              color: isOpened ? '#2563eb' : isDelivered ? '#16a34a' : isBounced ? '#dc2626' : '#64748b',
                              border: isOpened
                                ? '1px solid #bfdbfe'
                                : isDelivered
                                ? '1px solid #bbf7d0'
                                : isBounced
                                ? '1px solid #fecaca'
                                : '1px solid #e2e8f0',
                            }}
                          >
                            {isOpened && <Eye size={11} />}
                            {isDelivered && <CheckCircle2 size={11} />}
                            {isBounced && <XCircle size={11} />}
                            <span>{eml.status}</span>
                          </span>
                        </td>

                        {/* Provider */}
                        <td style={{ padding: '14px 16px', fontSize: 12, color: '#475569', textTransform: 'capitalize' }}>
                          {eml.provider}
                        </td>

                        {/* Size */}
                        <td style={{ padding: '14px 16px', fontSize: 12, color: '#64748b' }}>
                          {eml.size_kb ? `${eml.size_kb} KB` : '—'}
                        </td>

                        {/* Sent At */}
                        <td style={{ padding: '14px 18px', textAlign: 'right', fontSize: 12, color: '#64748b' }}>
                          {new Date(eml.created_at).toLocaleTimeString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: WEBHOOK LOGS TABLE
          ========================================================================= */}
      {activeSubTab === 'webhooks' && (
        <div
          className="card-standard"
          style={{
            background: 'var(--bg-white)',
            borderRadius: 'var(--r-lg)',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Inbound Partner</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Event Topic</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Direction</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Response Code</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Latency</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Received At</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600, textAlign: 'right' }}>Payload</th>
                </tr>
              </thead>
              <tbody>
                {filteredWebhookLogs.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                      No incoming webhook payloads found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredWebhookLogs.map((wh) => {
                    const isSuccess = wh.status === 'PROCESSED';
                    const isFailed = wh.status === 'FAILED';

                    return (
                      <tr
                        key={wh.id}
                        onClick={() =>
                          openInspector(
                            `Webhook: ${wh.provider.toUpperCase()} - ${wh.event}`,
                            `Response Code: ${wh.response_code} | Duration: ${wh.duration_ms}ms`,
                            wh.payload,
                            {
                              'Webhook ID': wh.id,
                              'Partner Provider': wh.provider,
                              'Event Type': wh.event,
                              'Direction': wh.direction,
                              'Ingestion Status': wh.status,
                              'HTTP Response Code': wh.response_code,
                              'Processing Duration': `${wh.duration_ms} ms`,
                              'Received At': new Date(wh.created_at).toLocaleString(),
                            }
                          )
                        }
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                          background: isFailed ? '#fffaf8' : 'transparent',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#f8fafc';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = isFailed ? '#fffaf8' : 'transparent';
                        }}
                      >
                        {/* Partner Provider */}
                        <td style={{ padding: '14px 18px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              padding: '2px 8px',
                              borderRadius: 'var(--r-md)',
                              fontSize: 12,
                              fontWeight: 700,
                              background: wh.provider === 'squad' ? '#eff6ff' : wh.provider === 'paystack' ? '#f0fdf4' : '#faf5ff',
                              color: wh.provider === 'squad' ? '#2563eb' : wh.provider === 'paystack' ? '#16a34a' : '#9333ea',
                              textTransform: 'uppercase',
                            }}
                          >
                            {wh.provider}
                          </span>
                        </td>

                        {/* Event Topic */}
                        <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontWeight: 600, color: '#0f172a' }}>
                          {wh.event}
                        </td>

                        {/* Direction */}
                        <td style={{ padding: '14px 16px', fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>
                          {wh.direction}
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
                              background: isSuccess ? '#f0fdf4' : '#fef2f2',
                              color: isSuccess ? '#16a34a' : '#dc2626',
                              border: isSuccess ? '1px solid #bbf7d0' : '1px solid #fecaca',
                            }}
                          >
                            {isSuccess && <CheckCircle2 size={11} />}
                            {isFailed && <XCircle size={11} />}
                            <span>{wh.status}</span>
                          </span>
                        </td>

                        {/* Response Code */}
                        <td style={{ padding: '14px 16px' }}>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              fontFamily: 'monospace',
                              color: wh.response_code === 200 ? '#16a34a' : '#dc2626',
                            }}
                          >
                            {wh.response_code}
                          </span>
                        </td>

                        {/* Latency */}
                        <td style={{ padding: '14px 16px', fontSize: 12, color: '#475569', fontWeight: 600 }}>
                          {wh.duration_ms} ms
                        </td>

                        {/* Received At */}
                        <td style={{ padding: '14px 16px', fontSize: 12, color: '#64748b' }}>
                          {new Date(wh.created_at).toLocaleTimeString()}
                        </td>

                        {/* Payload Inspect */}
                        <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                          <button
                            type="button"
                            className="btn-outline"
                            style={{
                              padding: '4px 10px',
                              fontSize: 11.5,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <Code2 size={12} />
                            <span>Inspect</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: AUDIT TRAIL TABLE
          ========================================================================= */}
      {activeSubTab === 'audit' && (
        <div
          className="card-standard"
          style={{
            background: 'var(--bg-white)',
            borderRadius: 'var(--r-lg)',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Admin Operator</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Action Performed</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Target Resource</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Origin IP</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Timestamp</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600, textAlign: 'right' }}>Audit Diff</th>
                </tr>
              </thead>
              <tbody>
                {filteredAuditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                      No administrative audit records found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredAuditLogs.map((aud) => (
                    <tr
                      key={aud.id}
                      onClick={() =>
                        openInspector(
                          `Audit Trail: ${aud.action}`,
                          `Admin: ${aud.admin_name} (${aud.admin_email})`,
                          aud.metadata || 'No additional metadata logged',
                          {
                            'Audit ID': aud.id,
                            'Admin Name': aud.admin_name,
                            'Admin Email': aud.admin_email,
                            'Action': aud.action,
                            'Target Resource': aud.target_resource,
                            'Origin IP': aud.ip_address,
                            'Execution Status': aud.status,
                            'Timestamp': new Date(aud.created_at).toLocaleString(),
                          }
                        )
                      }
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      {/* Operator */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{aud.admin_name}</div>
                        <div style={{ fontSize: 11.5, color: '#64748b' }}>{aud.admin_email}</div>
                      </td>

                      {/* Action */}
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontSize: 11.5,
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 4,
                            background: '#eff6ff',
                            color: '#2563eb',
                          }}
                        >
                          {aud.action}
                        </span>
                      </td>

                      {/* Target Resource */}
                      <td style={{ padding: '14px 16px', color: '#334155', fontWeight: 500 }}>
                        {aud.target_resource}
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
                            background: aud.status === 'SUCCESS' ? '#f0fdf4' : '#fef2f2',
                            color: aud.status === 'SUCCESS' ? '#16a34a' : '#dc2626',
                            border: aud.status === 'SUCCESS' ? '1px solid #bbf7d0' : '1px solid #fecaca',
                          }}
                        >
                          <CheckCircle2 size={11} />
                          <span>{aud.status}</span>
                        </span>
                      </td>

                      {/* Origin IP */}
                      <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: 12, color: '#64748b' }}>
                        {aud.ip_address}
                      </td>

                      {/* Timestamp */}
                      <td style={{ padding: '14px 16px', fontSize: 12, color: '#64748b' }}>
                        {new Date(aud.created_at).toLocaleTimeString()}
                      </td>

                      {/* Inspect */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn-outline"
                          style={{
                            padding: '4px 10px',
                            fontSize: 11.5,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <FileText size={12} />
                          <span>View Diff</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          FULL-SCREEN INSPECT MODAL (VIA CREATEPORTAL)
          ========================================================================= */}
      {inspectModalOpen && mounted && typeof document !== 'undefined' && createPortal(
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
          onClick={closeInspector}
        >
          <div
            className="animate-fade-in"
            style={{
              background: '#ffffff',
              borderRadius: 'var(--r-xl)',
              width: '100%',
              maxWidth: 760,
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                background: '#f8fafc',
              }}
            >
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  {inspectTitle}
                </h3>
                <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0 0' }}>
                  {inspectSubtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={closeInspector}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: 6,
                  cursor: 'pointer',
                  color: '#94a3b8',
                  borderRadius: 6,
                  display: 'flex',
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Metadata Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 12,
                  background: '#f8fafc',
                  padding: 16,
                  borderRadius: 'var(--r-lg)',
                  border: '1px solid #e2e8f0',
                }}
              >
                {Object.entries(inspectMeta).map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                      {k}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginTop: 2 }}>
                      {v !== undefined && v !== null ? String(v) : '—'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Payload / Body Viewer */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155' }}>
                    Raw Payload / Structured Trace
                  </label>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(inspectPayload, 'payload')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 12,
                      color: copiedId === 'payload' ? '#16a34a' : 'var(--primary)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    {copiedId === 'payload' ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedId === 'payload' ? 'Copied' : 'Copy Payload'}</span>
                  </button>
                </div>

                <pre
                  style={{
                    background: '#0f172a',
                    color: '#f8fafc',
                    padding: 16,
                    borderRadius: 'var(--r-md)',
                    fontSize: 12,
                    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                    overflowX: 'auto',
                    maxHeight: 280,
                    lineHeight: 1.5,
                  }}
                >
                  {inspectPayload}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '14px 24px',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'flex-end',
                background: '#f8fafc',
              }}
            >
              <button
                type="button"
                className="btn-primary"
                onClick={closeInspector}
                style={{ padding: '8px 20px', fontSize: 13 }}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
