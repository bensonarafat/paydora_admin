'use client';

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  MessageCircle, 
  Send, 
  Search, 
  CheckCheck, 
  Phone, 
  ShieldCheck, 
  Zap, 
  Wifi, 
  WifiOff 
} from 'lucide-react';
import { WhatsAppConversation, WhatsAppMessage } from '@/types/admin';
import { adminApi } from '@/lib/api';

interface WhatsAppChatViewProps {
  onNavigateToKyc?: () => void;
  onNavigateToUser?: (userId: string) => void;
}

export default function WhatsAppChatView({
  onNavigateToKyc,
  onNavigateToUser,
}: WhatsAppChatViewProps) {
  const [conversations, setConversations] = useState<WhatsAppConversation[]>([]);
  const [selectedConvoId, setSelectedConvoId] = useState<string>('');
  const [inputText, setInputText] = useState('');
  const [search, setSearch] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    adminApi.getWhatsAppConversations().then((data) => {
      setConversations(data);
      if (data.length > 0 && !selectedConvoId) {
        setSelectedConvoId(data[0].id);
      }
    });
  }, [selectedConvoId]);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000';
    const socket: Socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      auth: { isAdmin: true },
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketConnected(true);
      socket.emit('join.admin.whatsapp');
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
    });

    socket.on('whatsapp.message.received', (data: {
      id: string;
      from: string;
      senderName: string;
      message: string;
      timestamp: string;
      conversationId: string;
    }) => {
      const incomingMsg: WhatsAppMessage = {
        id: data.id,
        sender: 'customer',
        senderName: data.senderName,
        message: data.message,
        timestamp: data.timestamp,
        status: 'DELIVERED',
      };

      setConversations((prev) => {
        const index = prev.findIndex((c) => c.id === data.conversationId || c.phone.includes(data.from));
        if (index >= 0) {
          const updated = [...prev];
          const convo = { ...updated[index] };
          convo.messages = [...convo.messages, incomingMsg];
          convo.lastMessage = data.message;
          convo.lastMessageTime = data.timestamp;
          convo.unreadCount += 1;
          updated[index] = convo;
          const [moved] = updated.splice(index, 1);
          return [moved, ...updated];
        } else {
          const newConvo: WhatsAppConversation = {
            id: data.conversationId || data.from,
            phone: data.from.startsWith('+') ? data.from : `+${data.from}`,
            customerName: data.senderName,
            lastMessage: data.message,
            lastMessageTime: data.timestamp,
            unreadCount: 1,
            kycTier: 1,
            kycStatus: 'pending',
            accountBalanceNgn: 0,
            messages: [incomingMsg],
          };
          return [newConvo, ...prev];
        }
      });
    });

    socket.on('whatsapp.message.sent', (data: {
      id: string;
      sender: 'admin';
      adminName: string;
      to: string;
      message: string;
      timestamp: string;
      conversationId: string;
      status: 'DELIVERED';
    }) => {
      setConversations((prev) => {
        return prev.map((c) => {
          if (c.id === data.conversationId || c.phone.includes(data.to)) {
            const exists = c.messages.some((m) => m.id === data.id);
            if (!exists) {
              const newMsg: WhatsAppMessage = {
                id: data.id,
                sender: 'admin',
                senderName: data.adminName,
                message: data.message,
                timestamp: data.timestamp,
                status: 'DELIVERED',
              };
              return {
                ...c,
                messages: [...c.messages, newMsg],
                lastMessage: data.message,
                lastMessageTime: data.timestamp,
              };
            }
          }
          return c;
        });
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, selectedConvoId]);

  const selectedConversation = conversations.find((c) => c.id === selectedConvoId);

  const handleSendReply = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || !selectedConversation) return;

    setIsSending(true);
    setInputText('');

    if (socketRef.current && socketConnected) {
      socketRef.current.emit('whatsapp.message.send', {
        to: selectedConversation.phone,
        message: text,
        conversationId: selectedConversation.id,
        adminName: 'Benson (Paydora Ops)',
      });
    }

    const sentMsg = await adminApi.sendWhatsAppReply(
      selectedConversation.phone,
      text,
      selectedConversation.id
    );

    setConversations((prev) => {
      return prev.map((c) => {
        if (c.id === selectedConversation.id) {
          const exists = c.messages.some((m) => m.id === sentMsg.id);
          return {
            ...c,
            unreadCount: 0,
            lastMessage: text,
            lastMessageTime: sentMsg.timestamp,
            messages: exists ? c.messages : [...c.messages, sentMsg],
          };
        }
        return c;
      });
    });

    setIsSending(false);
  };

  const quickTemplates = [
    'Hello! Thank you for contacting Paydora support. How can I assist you today?',
    'Please verify your BVN under Settings > KYC in the app to raise your limit to ₦5,000,000/day.',
    'Your pending KYC review has been prioritized by compliance and will be updated shortly.',
    'We have requeryed your transfer with NIBSS. The funds have been successfully settled.',
  ];

  const handleSimulateInbound = async () => {
    const sampleQuestions = [
      'Good day, is my BVN verification approved yet? I want to make a transfer of ₦300,000.',
      'Hello! I generated a virtual card but Spotify is declining it. Do I need to enable 3D Secure?',
      'Please why did my cashout to GTBank delay? Here is my ref PAYD-NIP-9912.',
    ];
    const randomMsg = sampleQuestions[Math.floor(Math.random() * sampleQuestions.length)];

    await adminApi.simulateIncomingWhatsApp('2348034567890', 'Chukwuebuka Obi', randomMsg);

    if (!socketConnected) {
      setConversations((prev) => {
        const updated = [...prev];
        const convo = updated.find((c) => c.id === '2348034567890');
        if (convo) {
          convo.messages.push({
            id: `wmsg-${Date.now()}`,
            sender: 'customer',
            senderName: 'Chukwuebuka Obi',
            message: randomMsg,
            timestamp: new Date().toISOString(),
            status: 'DELIVERED',
          });
          convo.lastMessage = randomMsg;
          convo.unreadCount += 1;
        }
        return updated;
      });
    }
  };

  const filteredConvos = conversations.filter((c) => {
    const matchFilter = filter === 'ALL' || (filter === 'UNREAD' && c.unreadCount > 0);
    const q = search.toLowerCase();
    const matchSearch =
      c.customerName.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.lastMessage.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  return (
    <div
      className="animate-fade-in"
      style={{
        display: 'grid',
        gridTemplateColumns: '320px 1fr 280px',
        gap: 16,
        height: 'calc(100vh - 145px)',
        minHeight: 620,
      }}
    >
      {/* COLUMN 1: Conversation List Card */}
      <div
        className="card-standard"
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
        }}
      >
        {/* Top Header */}
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: '#25D366',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}
              >
                <MessageCircle size={15} />
              </div>
              <span style={{ fontWeight: 700, fontSize: 14.5, color: '#0f172a' }}>WhatsApp Desk</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 10.5,
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: 'var(--r-full)',
                background: socketConnected ? '#f0fdf4' : '#fffbeb',
                color: socketConnected ? 'var(--green)' : 'var(--yellow)',
                border: `1px solid ${socketConnected ? '#bbf7d0' : '#fde68a'}`,
              }}
            >
              {socketConnected ? <Wifi size={11} /> : <WifiOff size={11} />}
              <span>{socketConnected ? 'LIVE SOCKET' : 'POLLING'}</span>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <Search
              size={13}
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }}
            />
            <input
              type="text"
              placeholder="Search chat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: 30, paddingTop: 6, paddingBottom: 6, fontSize: 12 }}
            />
          </div>

          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            <button
              onClick={() => setFilter('ALL')}
              style={{
                fontSize: 11,
                padding: '3px 10px',
                borderRadius: 'var(--r-full)',
                background: filter === 'ALL' ? 'var(--primary)' : '#f1f5f9',
                color: filter === 'ALL' ? '#fff' : '#64748b',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              All ({conversations.length})
            </button>
            <button
              onClick={() => setFilter('UNREAD')}
              style={{
                fontSize: 11,
                padding: '3px 10px',
                borderRadius: 'var(--r-full)',
                background: filter === 'UNREAD' ? 'var(--primary)' : '#f1f5f9',
                color: filter === 'UNREAD' ? '#fff' : '#64748b',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Unread ({conversations.filter((c) => c.unreadCount > 0).length})
            </button>
          </div>
        </div>

        {/* Conversation List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredConvos.map((convo) => {
            const isSelected = convo.id === selectedConvoId;
            return (
              <div
                key={convo.id}
                onClick={() => {
                  setSelectedConvoId(convo.id);
                  setConversations((prev) =>
                    prev.map((c) => (c.id === convo.id ? { ...c, unreadCount: 0 } : c))
                  );
                }}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #f1f5f9',
                  cursor: 'pointer',
                  background: isSelected ? '#eff6ff' : 'transparent',
                  borderLeft: isSelected ? '3px solid var(--primary)' : '3px solid transparent',
                  transition: 'background var(--transition)',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: '#eff6ff',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 12,
                      }}
                    >
                      {convo.customerName.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>
                        {convo.customerName}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{convo.phone}</div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10.5, color: '#94a3b8' }}>
                      {new Date(convo.lastMessageTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    {convo.unreadCount > 0 && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          background: '#16a34a',
                          color: '#fff',
                          padding: '1px 6px',
                          borderRadius: 'var(--r-full)',
                          display: 'inline-block',
                          marginTop: 4,
                        }}
                      >
                        {convo.unreadCount}
                      </span>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: convo.unreadCount > 0 ? '#0f172a' : '#64748b',
                    fontWeight: convo.unreadCount > 0 ? 600 : 400,
                    marginTop: 6,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {convo.lastMessage}
                </div>
              </div>
            );
          })}
        </div>

        {/* Inbound Simulator Tool */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={handleSimulateInbound}
            className="btn-outline"
            style={{ width: '100%', fontSize: 11.5, justifyContent: 'center', padding: '6px' }}
          >
            <Zap size={13} color="#25D366" />
            <span>Simulate Inbound Message</span>
          </button>
        </div>
      </div>

      {/* COLUMN 2: Active Chat Window Card */}
      <div
        className="card-standard"
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
        }}
      >
        {selectedConversation ? (
          <>
            {/* Header */}
            <div
              style={{
                padding: '14px 20px',
                borderBottom: '1px solid var(--border)',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
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
                  {selectedConversation.customerName.charAt(0)}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 14.5, color: '#0f172a' }}>
                      {selectedConversation.customerName}
                    </span>
                    <span className="badge badge-verified" style={{ fontSize: 10, padding: '1px 6px' }}>
                      TIER {selectedConversation.kycTier}
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Phone size={11} />
                    <span>{selectedConversation.phone} (WhatsApp Cloud API)</span>
                  </div>
                </div>
              </div>

              <div>
                <span
                  style={{
                    fontSize: 11,
                    color: '#64748b',
                    background: '#f8fafc',
                    padding: '4px 10px',
                    borderRadius: 'var(--r-sm)',
                    border: '1px solid var(--border)',
                  }}
                >
                  24h Care Window Active
                </span>
              </div>
            </div>

            {/* Chat Messages Area */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                background: '#f8fafc',
              }}
            >
              {selectedConversation.messages.map((msg) => {
                const isAdmin = msg.sender === 'admin';
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isAdmin ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '75%',
                        padding: '12px 16px',
                        borderRadius: isAdmin ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                        background: isAdmin ? 'var(--primary)' : '#ffffff',
                        border: 'none',
                        color: isAdmin ? '#ffffff' : '#0f172a',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          color: isAdmin ? '#bfdbfe' : '#16a34a',
                          marginBottom: 4,
                          textTransform: 'uppercase',
                        }}
                      >
                        {isAdmin ? 'Paydora Operator' : selectedConversation.customerName}
                      </div>

                      <div style={{ fontSize: 13.5, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                        {msg.message}
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          gap: 4,
                          marginTop: 6,
                          fontSize: 10.5,
                          color: isAdmin ? 'rgba(255,255,255,0.8)' : '#94a3b8',
                        }}
                      >
                        <span>
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {isAdmin && <CheckCheck size={13} color="#bfdbfe" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Reply Pills */}
            <div
              style={{
                padding: '8px 18px',
                background: '#ffffff',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                gap: 8,
                overflowX: 'auto',
              }}
            >
              {quickTemplates.map((tmpl, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendReply(tmpl)}
                  style={{
                    fontSize: 11,
                    padding: '4px 10px',
                    borderRadius: 'var(--r-full)',
                    background: '#f8fafc',
                    color: '#64748b',
                    border: '1px solid var(--border)',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--primary)';
                    e.currentTarget.style.borderColor = 'var(--primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#64748b';
                    e.currentTarget.style.borderColor = 'var(--border)';
                  }}
                >
                  <Zap size={11} color="var(--primary)" />
                  <span>{tmpl.slice(0, 32)}...</span>
                </button>
              ))}
            </div>

            {/* Message Input Box */}
            <div
              style={{
                padding: '14px 20px',
                borderTop: '1px solid var(--border)',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <input
                type="text"
                placeholder="Type your WhatsApp reply... (Press Enter to send)"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendReply();
                  }
                }}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: 'var(--r-md)',
                  background: '#f8fafc',
                  border: '1px solid var(--border)',
                  fontSize: 13.5,
                }}
              />

              <button
                onClick={() => handleSendReply()}
                disabled={isSending || !inputText.trim()}
                className="btn-primary"
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
            }}
          >
            Select a conversation on the left to start replying
          </div>
        )}
      </div>

      {/* COLUMN 3: Customer Intelligence Card */}
      <div
        className="card-standard"
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '20px',
          gap: 16,
          overflowY: 'auto',
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Customer Intelligence
        </div>

        {selectedConversation ? (
          <>
            <div
              style={{
                padding: '16px',
                borderRadius: 'var(--r-md)',
                background: '#f8fafc',
                border: '1px solid var(--border)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: '#eff6ff',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 16,
                  margin: '0 auto 10px auto',
                }}
              >
                {selectedConversation.customerName.charAt(0)}
              </div>
              <div style={{ fontWeight: 700, fontSize: 14.5, color: '#0f172a' }}>
                {selectedConversation.customerName}
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                {selectedConversation.phone}
              </div>

              <div style={{ marginTop: 10 }}>
                <span
                  className={`badge ${
                    selectedConversation.kycStatus === 'verified'
                      ? 'badge-verified'
                      : selectedConversation.kycStatus === 'rejected'
                      ? 'badge-danger'
                      : 'badge-pending'
                  }`}
                >
                  KYC {selectedConversation.kycStatus.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>

            <div
              style={{
                padding: '14px',
                borderRadius: 'var(--r-md)',
                background: '#f8fafc',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase' }}>
                Wallet Balance
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                ₦{selectedConversation.accountBalanceNgn.toLocaleString()}
              </div>
            </div>

            <div
              style={{
                padding: '14px',
                borderRadius: 'var(--r-md)',
                background: '#f8fafc',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase' }}>
                Bank Verification Number (BVN)
              </div>
              <div style={{ fontSize: 13, fontFamily: 'monospace', color: '#0f172a', fontWeight: 600, marginTop: 2 }}>
                {selectedConversation.bvn || 'Not verified'}
              </div>
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {onNavigateToKyc && (
                <button
                  onClick={onNavigateToKyc}
                  className="btn-outline"
                  style={{ fontSize: 12, width: '100%', justifyContent: 'center' }}
                >
                  <ShieldCheck size={14} color="var(--primary)" />
                  <span>Inspect KYC Records</span>
                </button>
              )}
            </div>
          </>
        ) : (
          <div style={{ fontSize: 12, color: '#64748b' }}>
            No customer selected
          </div>
        )}
      </div>
    </div>
  );
}
