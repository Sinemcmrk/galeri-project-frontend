'use client';

import React, { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import styles from './PriceAlertForm.module.css';
import { API_BASE_URL } from '@/lib/listings';

interface PriceAlertFormProps {
  listingId: string;
}

export default function PriceAlertForm({ listingId }: PriceAlertFormProps) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/alerts/price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, listingId }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
        setErrorMsg(json.message || 'Alarm oluşturulamadı.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Sunucuya bağlanılamadı.');
    } finally {
      setSending(false);
    }
  };

  if (status === 'success') {
    return <p className={styles.successText}><CheckCircle2 size={15} /> Fiyat düştüğünde size e-posta ile haber vereceğiz.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <label className={styles.label}>Fiyat düşerse haberdar ol</label>
      <div className={styles.row}>
        <input
          type="email"
          placeholder="E-posta adresiniz"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={sending}>{sending ? '...' : 'Beni Uyar'}</button>
      </div>
      {status === 'error' && <p className={styles.errorText}><XCircle size={13} /> {errorMsg}</p>}
    </form>
  );
}
