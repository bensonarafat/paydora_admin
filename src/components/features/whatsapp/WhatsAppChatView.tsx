'use client';

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  MessageCircle, 
  Send, 
  Search, 
  CheckCheck, 
  Phone, 
  Wifi, 
  WifiOff,
  User
} from 'lucide-react';
import { WhatsAppConversation, WhatsAppMessage, UserAccount } from '@/types/admin';
import { adminApi } from '@/lib/api';

interface WhatsAppChatViewProps {
  users?: UserAccount[];
  onClose?: () => void;
  onNavigateToKyc?: () => void;
  onSelectUser?: (user: UserAccount) => void;
}

export default function WhatsAppChatView({
  users = [],
  onClose,
  onNavigateToKyc,
  onSelectUser,
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

  // Match active conversation with full registered user if exists
  const matchedUser = selectedConversation && users ? users.find((u) => {
    const normConvoPhone = selectedConversation.phone.replace(/[^0-9]/g, '');
    const normUserPhone = u.phone.replace(/[^0-9]/g, '');
    const phoneMatch = 
      (normConvoPhone.length >= 10 && normUserPhone.length >= 10) &&
      (normConvoPhone.endsWith(normUserPhone.slice(-10)) || normUserPhone.endsWith(normConvoPhone.slice(-10)));
    const nameMatch = 
      `${u.first_name} ${u.last_name}`.toLowerCase() === selectedConversation.customerName.toLowerCase();
    const idMatch = u.id === selectedConversation.id;
    return phoneMatch || nameMatch || idMatch;
  }) : null;

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
        adminName: 'Paydora Support',
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
        gridTemplateColumns: '340px 1fr',
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
          height: '100%',
        }}
      >
        {/* Top Search & Filter Bar */}
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
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
                placeholder="Search chats by name, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', paddingLeft: 30, paddingTop: 8, paddingBottom: 8, fontSize: 12.5 }}
              />
            </div>

            <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
              <button
                onClick={() => setFilter('ALL')}
                style={{
                  fontSize: 11.5,
                  padding: '4px 12px',
                  borderRadius: 'var(--r-full)',
                  background: filter === 'ALL' ? 'var(--primary)' : '#f1f5f9',
                  color: filter === 'ALL' ? '#fff' : '#64748b',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                All chats ({conversations.length})
              </button>
              <button
                onClick={() => setFilter('UNREAD')}
                style={{
                  fontSize: 11.5,
                  padding: '4px 12px',
                  borderRadius: 'var(--r-full)',
                  background: filter === 'UNREAD' ? 'var(--primary)' : '#f1f5f9',
                  color: filter === 'UNREAD' ? '#fff' : '#64748b',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
                          flexShrink: 0,
                        }}
                      >
                        {convo.customerName.charAt(0)}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {convo.customerName}
                        </div>
                        <div style={{ fontSize: 11.5, color: '#64748b' }}>{convo.phone}</div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
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
        </div>

        {/* COLUMN 2: Full-Width Active Chat Window Card */}
        <div
          className="card-standard"
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            overflow: 'hidden',
            height: '100%',
          }}
        >
          {selectedConversation ? (
            <>
              {/* Active Conversation Header */}
              <div
                style={{
                  padding: '14px 20px',
                  borderBottom: '1px solid var(--border)',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexShrink: 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    onClick={() => matchedUser && onSelectUser && onSelectUser(matchedUser)}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: '#eff6ff',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: matchedUser ? 'pointer' : 'default',
                      flexShrink: 0,
                    }}
                    title={matchedUser ? 'Click to open user details' : undefined}
                  >
                    {selectedConversation.customerName.charAt(0)}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        onClick={() => matchedUser && onSelectUser && onSelectUser(matchedUser)}
                        style={{
                          fontWeight: 700,
                          fontSize: 15,
                          color: '#0f172a',
                          cursor: matchedUser ? 'pointer' : 'default',
                          transition: 'color var(--transition)',
                        }}
                        onMouseEnter={(e) => {
                          if (matchedUser) e.currentTarget.style.color = 'var(--primary)';
                        }}
                        onMouseLeave={(e) => {
                          if (matchedUser) e.currentTarget.style.color = '#0f172a';
                        }}
                        title={matchedUser ? 'Click to open user details' : undefined}
                      >
                        {selectedConversation.customerName}
                      </span>

                      {matchedUser ? (
                        <span className={`badge ${matchedUser.is_blocked ? 'badge-danger' : 'badge-verified'}`}>
                          {matchedUser.is_blocked ? 'Blocked' : 'Active Account'}
                        </span>
                      ) : (
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>
                          Guest Applicant
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: 11.5, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <Phone size={11} />
                      <span>{selectedConversation.phone} (WhatsApp Cloud API)</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {/* Direct User Details Button if user exists */}
                  {matchedUser && onSelectUser && (
                    <button
                      onClick={() => onSelectUser(matchedUser)}
                      className="btn-outline"
                      style={{
                        fontSize: 12.5,
                        padding: '6px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        color: 'var(--primary)',
                        borderColor: '#bfdbfe',
                        background: '#eff6ff',
                      }}
                    >
                      <User size={14} color="var(--primary)" />
                      <span>View user details ➜</span>
                    </button>
                  )}

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
                  padding: '24px 32px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
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
                          maxWidth: '70%',
                          padding: '12px 18px',
                          borderRadius: isAdmin ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                          background: isAdmin ? 'var(--primary)' : '#ffffff',
                          border: 'none',
                          color: isAdmin ? '#ffffff' : '#0f172a',
                        }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: isAdmin ? '#bfdbfe' : '#16a34a',
                            marginBottom: 4,
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



              {/* Message Input Box */}
              <div
                style={{
                  padding: '14px 20px',
                  borderTop: '1px solid var(--border)',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  flexShrink: 0,
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
                    padding: '10px 16px',
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
                    flexShrink: 0,
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
                fontSize: 13.5,
              }}
            >
              Select a conversation on the left to start replying
            </div>
          )}
        </div>
      </div>
  );
}
