'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import styles from '../dashboard.module.css';
import { API_BASE_URL } from '@/lib/listings';

type TemplateId = 'PRICE_DROP' | 'NEW_LISTING';

const TEMPLATES: { id: TemplateId; label: string; placeholders: string[] }[] = [
  {
    id: 'PRICE_DROP',
    label: 'Fiyat Düşüşü Bildirimi',
    placeholders: ['title', 'oldPrice', 'newPrice', 'savings', 'discountPercent', 'id'],
  },
  {
    id: 'NEW_LISTING',
    label: 'Yeni İlan Bildirimi',
    placeholders: ['title', 'description', 'price', 'brand', 'modelName', 'year', 'km', 'fuel', 'gear', 'id'],
  },
];

export default function TemplatesSection({ token }: { token: string }) {
  const authHeaders = { Authorization: `Bearer ${token}` };

  const [activeId, setActiveId] = useState<TemplateId>('PRICE_DROP');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      try {
        const res = await fetch(`${API_BASE_URL}/api/alerts/templates/${activeId}`, { headers: authHeaders });
        const json = await res.json();
        if (res.ok && json.success) {
          setSubject(json.data.subject);
          setBody(json.data.body);
        } else {
          setErrorMsg(json.message || 'Şablon yüklenemedi.');
        }
      } catch {
        setErrorMsg('Sunucuya bağlanılamadı.');
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/alerts/templates/${activeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ subject, body }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setSuccessMsg('Şablon başarıyla güncellendi.');
      } else {
        setErrorMsg(json.message || 'Şablon kaydedilemedi.');
      }
    } catch {
      setErrorMsg('Sunucuya bağlanılamadı.');
    } finally {
      setSaving(false);
    }
  };

  const active = TEMPLATES.find(t => t.id === activeId)!;

  return (
    <div className={styles.managementCard}>
      <div className={styles.managementHeader}>
        <h2>E-posta Şablonları</h2>
      </div>

      <div className={styles.tabRow}>
        {TEMPLATES.map(t => (
          <button
            key={t.id}
            className={`${styles.tabBtn} ${activeId === t.id ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveId(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {successMsg && <div className={styles.templateSuccessAlert}><CheckCircle2 size={15} /> {successMsg}</div>}
      {errorMsg && <div className={styles.actionErrorAlert}><XCircle size={15} /> {errorMsg}</div>}

      {loading ? (
        <p className={styles.mutedText}>Yükleniyor...</p>
      ) : (
        <form onSubmit={handleSave} className={styles.templateForm}>
          <div className={styles.templateFormGroup}>
            <label>Konu</label>
            <input type="text" value={subject} onChange={e => setSubject(e.target.value)} required />
          </div>

          <div className={styles.templateFormGroup}>
            <label>İçerik (HTML)</label>
            <textarea value={body} onChange={e => setBody(e.target.value)} rows={14} required />
          </div>

          <p className={styles.fieldHint}>
            Kullanılabilir yer tutucular: {active.placeholders.map(p => `{{${p}}}`).join(', ')}
          </p>

          <button type="submit" disabled={saving} className={styles.newListingBtn}>
            {saving ? 'Kaydediliyor...' : 'Şablonu Kaydet'}
          </button>
        </form>
      )}
    </div>
  );
}
