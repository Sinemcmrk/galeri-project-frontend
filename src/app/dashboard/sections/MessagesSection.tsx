'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { XCircle } from 'lucide-react';
import styles from '../dashboard.module.css';
import { API_BASE_URL } from '@/lib/listings';

interface Message {
  id: string;
  sender: 'VISITOR' | 'ADMIN';
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  visitorName: string;
  visitorEmail: string;
  listingId: string;
  status: string;
  createdAt: string;
  listing?: { title: string; price: number | string | null };
  messages: Message[];
}

export default function MessagesSection({ token }: { token: string }) {
  const authHeaders = { Authorization: `Bearer ${token}` };

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [replyText, setReplyText] = useState('');
  const [chatActionError, setChatActionError] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/conversations`, { headers: authHeaders });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setConversations(json.data);
          setSelectedConv(prev => prev ?? json.data[0] ?? null);
        }
      }
    } catch (err) {
      console.warn('Could not load conversations.', err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConv) return;
    const content = replyText;
    setReplyText('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/conversations/${selectedConv.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ content }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        const updatedConv = { ...selectedConv, messages: [...selectedConv.messages, json.data] };
        setConversations(prev => prev.map(c => (c.id === selectedConv.id ? updatedConv : c)));
        setSelectedConv(updatedConv);
      }
    } catch (err) {
      console.warn('Could not send reply.', err);
    }
  };

  async function patchConversation(conv: Conversation, action: 'end' | 'archive' | 'unarchive') {
    setChatActionError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/conversations/${conv.id}/${action}`, { method: 'PUT', headers: authHeaders });
      const json = await res.json();
      if (res.ok && json.success) {
        const updated = { ...conv, status: json.data.status };
        setConversations(prev => prev.map(c => (c.id === conv.id ? updated : c)));
        setSelectedConv(prev => (prev?.id === conv.id ? updated : prev));
      } else {
        setChatActionError(json.message || 'İşlem gerçekleştirilemedi.');
      }
    } catch {
      setChatActionError('Sunucuya bağlanılamadı.');
    }
  }

  const handleDeleteConversation = async (conv: Conversation) => {
    if (!confirm(`${conv.visitorName} ile olan görüşmeyi kalıcı olarak silmek istediğinize emin misiniz?`)) return;
    setChatActionError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/conversations/${conv.id}`, { method: 'DELETE', headers: authHeaders });
      const json = await res.json();
      if (res.ok && json.success) {
        setConversations(prev => prev.filter(c => c.id !== conv.id));
        setSelectedConv(prev => (prev?.id === conv.id ? null : prev));
      } else {
        setChatActionError(json.message || 'Görüşme silinemedi.');
      }
    } catch {
      setChatActionError('Sunucuya bağlanılamadı.');
    }
  };

  return (
    <div className={styles.panelsGrid}>
      <div className={styles.inboxCard}>
        <h2>Müşteri Görüşmeleri</h2>
        <div className={styles.inboxList}>
          {conversations.length === 0 ? (
            <p className={styles.mutedText}>Henüz gelen mesaj yok.</p>
          ) : (
            conversations.map(c => (
              <div
                key={c.id}
                className={`${styles.inboxItem} ${selectedConv?.id === c.id ? styles.activeInboxItem : ''}`}
                onClick={() => setSelectedConv(c)}
              >
                <div className={styles.inboxItemHead}>
                  <strong>{c.visitorName}</strong>
                  <span className={styles.inboxDate}>{new Date(c.createdAt).toLocaleDateString('tr-TR')}</span>
                </div>
                <p className={styles.inboxEmail}>{c.visitorEmail}</p>
                <p className={styles.inboxCar}>İlgilenilen: {c.listing?.title}</p>
                <p className={styles.inboxMsgPreview}>
                  {c.messages[c.messages.length - 1]?.content || 'İlk konuşma başlatıldı.'}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className={styles.chatCard}>
        {selectedConv ? (
          <div className={styles.chatWrapper}>
            <div className={styles.chatHeader}>
              <div>
                <h3>{selectedConv.visitorName}</h3>
                <p>{selectedConv.visitorEmail} • {selectedConv.listing?.title}</p>
              </div>
              <div className={styles.chatHeaderActions}>
                <span className={styles.chatStatusBadge}>
                  {selectedConv.status === 'ACTIVE' ? 'AKTİF' : selectedConv.status === 'ENDED' ? 'SONLANDIRILDI' : 'ARŞİVLENDİ'}
                </span>
                {selectedConv.status === 'ACTIVE' && (
                  <button onClick={() => patchConversation(selectedConv, 'end')}>Sonlandır</button>
                )}
                {selectedConv.status === 'ENDED' && (
                  <button onClick={() => patchConversation(selectedConv, 'archive')}>Arşivle</button>
                )}
                {selectedConv.status === 'ARCHIVED' && (
                  <button onClick={() => patchConversation(selectedConv, 'unarchive')}>Arşivden Çıkar</button>
                )}
                {selectedConv.status !== 'ACTIVE' && (
                  <button className={styles.dangerBtn} onClick={() => handleDeleteConversation(selectedConv)}>Sil</button>
                )}
              </div>
            </div>

            {chatActionError && <div className={styles.actionErrorAlert}><XCircle size={15} /> {chatActionError}</div>}

            <div className={styles.chatHistory}>
              {selectedConv.messages.map(m => (
                <div key={m.id} className={`${styles.chatMessage} ${m.sender === 'ADMIN' ? styles.adminMessage : styles.visitorMessage}`}>
                  <div className={styles.msgBubble}>
                    <p>{m.content}</p>
                    <span className={styles.msgTime}>
                      {new Date(m.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {selectedConv.status === 'ACTIVE' ? (
              <form onSubmit={handleSendReply} className={styles.chatForm}>
                <input
                  type="text"
                  placeholder="Müşteriye cevap yazın..."
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  className={styles.chatInput}
                  required
                />
                <button type="submit" className={styles.chatSendBtn}>GÖNDER</button>
              </form>
            ) : (
              <p className={styles.chatEndedNote}>Bu sohbet sonlandırıldığı için yeni mesaj gönderilemez.</p>
            )}
          </div>
        ) : (
          <div className={styles.noChatSelected}>
            <p>Mesaj geçmişini görüntülemek için sol menüden bir konuşma seçin.</p>
          </div>
        )}
      </div>
    </div>
  );
}
