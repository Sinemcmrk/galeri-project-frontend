'use client';

import React, { useEffect, useState } from 'react';
import { XCircle } from 'lucide-react';
import styles from './ChatWidget.module.css';
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
  status: string;
  messages: Message[];
}

interface ChatWidgetProps {
  listingId: string;
}

function storageKey(listingId: string) {
  return `chat_conversation_${listingId}`;
}

export default function ChatWidget({ listingId }: ChatWidgetProps) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadExisting() {
      const storedId = localStorage.getItem(storageKey(listingId));
      if (!storedId) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/api/chat/conversations/${storedId}`);
        if (res.ok) {
          const json = await res.json();
          if (!cancelled && json.success && json.data) {
            setConversation(json.data);
          }
        } else {
          localStorage.removeItem(storageKey(listingId));
        }
      } catch {
        // Backend unreachable; fall back to the start-conversation form.
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadExisting();
    return () => {
      cancelled = true;
    };
  }, [listingId]);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorName: name, visitorEmail: email, listingId, message }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        localStorage.setItem(storageKey(listingId), json.data.id);
        setConversation(json.data);
      } else {
        setError(json.message || 'Mesaj gönderilemedi.');
      }
    } catch (err) {
      setError('Sunucuya bağlanılamadı. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setSending(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !conversation) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/conversations/${conversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: reply }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setConversation({ ...conversation, messages: [...conversation.messages, json.data] });
        setReply('');
      } else {
        setError(json.message || 'Mesaj gönderilemedi.');
      }
    } catch (err) {
      setError('Sunucuya bağlanılamadı. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setSending(false);
    }
  };

  if (loading) return null;

  return (
    <section className={styles.card}>
      <h2>Satıcıyla İletişime Geç</h2>

      {error && <div className={styles.errorAlert}><XCircle size={15} /> {error}</div>}

      {!conversation ? (
        <form onSubmit={handleStart} className={styles.form}>
          <p className={styles.hint}>Bu araç hakkında soru sormak için mesaj bırakın, size en kısa sürede dönüş yapılsın.</p>
          <div className={styles.row}>
            <input type="text" placeholder="Adınız Soyadınız" value={name} onChange={e => setName(e.target.value)} required minLength={2} />
            <input type="email" placeholder="E-posta Adresiniz" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <textarea placeholder="Mesajınızı yazın..." value={message} onChange={e => setMessage(e.target.value)} rows={3} required />
          <button type="submit" disabled={sending}>{sending ? 'Gönderiliyor...' : 'Mesaj Gönder'}</button>
        </form>
      ) : (
        <div className={styles.thread}>
          {conversation.status !== 'ACTIVE' && (
            <p className={styles.hint}>Bu görüşme sonlandırılmıştır.</p>
          )}
          <div className={styles.messages}>
            {conversation.messages.map(m => (
              <div key={m.id} className={`${styles.message} ${m.sender === 'ADMIN' ? styles.fromAdmin : styles.fromVisitor}`}>
                <p>{m.content}</p>
                <span>{new Date(m.createdAt).toLocaleString('tr-TR')}</span>
              </div>
            ))}
          </div>
          {conversation.status === 'ACTIVE' && (
            <form onSubmit={handleReply} className={styles.replyForm}>
              <input
                type="text"
                placeholder="Mesajınızı yazın..."
                value={reply}
                onChange={e => setReply(e.target.value)}
                required
              />
              <button type="submit" disabled={sending}>Gönder</button>
            </form>
          )}
        </div>
      )}
    </section>
  );
}
