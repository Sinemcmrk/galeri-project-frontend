'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { XCircle, Film, Image as ImageIcon } from 'lucide-react';
import styles from '../dashboard.module.css';
import { API_BASE_URL } from '@/lib/listings';

interface MediaItem {
  filename: string;
  path: string;
  sizeBytes: number;
  type: 'image' | 'video';
}

interface MediaAudit {
  stats: {
    totalReferenced: number;
    totalOrphaned: number;
    totalFilesOnDisk: number;
    totalReferencedSizeBytes: number;
    totalOrphanedSizeBytes: number;
  };
  orphanedMedia: MediaItem[];
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaSection({ token }: { token: string }) {
  const authHeaders = { Authorization: `Bearer ${token}` };

  const [audit, setAudit] = useState<MediaAudit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/media`, { headers: authHeaders });
      const json = await res.json();
      if (res.ok && json.success) {
        setAudit(json.data);
      } else {
        setError(json.message || 'Medya listesi alınamadı.');
      }
    } catch {
      setError('Sunucuya bağlanılamadı.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (item: MediaItem) => {
    if (!confirm(`"${item.filename}" dosyasını kalıcı olarak silmek istediğinize emin misiniz?`)) return;
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/media`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ path: item.path }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setAudit(prev => prev ? { ...prev, orphanedMedia: prev.orphanedMedia.filter(m => m.path !== item.path) } : prev);
      } else {
        setError(json.message || 'Dosya silinemedi.');
      }
    } catch {
      setError('Sunucuya bağlanılamadı.');
    }
  };

  if (loading) {
    return <div className={styles.managementCard}><p className={styles.mutedText}>Yükleniyor...</p></div>;
  }

  return (
    <div className={styles.managementCard}>
      <div className={styles.managementHeader}>
        <h2>Medya Yönetimi</h2>
        <button className={styles.newListingBtn} onClick={load}>Yenile</button>
      </div>

      {error && <div className={styles.actionErrorAlert}><XCircle size={15} /> {error}</div>}

      {audit && (
        <>
          <div className={styles.mediaStatsRow}>
            <div className={styles.mediaStatBox}>
              <strong>{audit.stats.totalFilesOnDisk}</strong>
              <span>Diskteki Dosya</span>
            </div>
            <div className={styles.mediaStatBox}>
              <strong>{audit.stats.totalReferenced}</strong>
              <span>Kullanımda ({formatBytes(audit.stats.totalReferencedSizeBytes)})</span>
            </div>
            <div className={styles.mediaStatBox}>
              <strong>{audit.stats.totalOrphaned}</strong>
              <span>Kullanılmayan ({formatBytes(audit.stats.totalOrphanedSizeBytes)})</span>
            </div>
          </div>

          <p className={styles.fieldHint}>
            Aşağıdaki dosyalar hiçbir ilanda kullanılmıyor ve güvenle silinebilir. İlanlarda kullanılan dosyalar burada listelenmez.
          </p>

          {audit.orphanedMedia.length === 0 ? (
            <p className={styles.mutedText}>Kullanılmayan dosya bulunmuyor.</p>
          ) : (
            <div className={styles.listingsTable}>
              {audit.orphanedMedia.map(item => (
                <div className={styles.listingRow} key={item.path}>
                  <div className={styles.listingInfo}>
                    <strong>{item.type === 'video' ? <Film size={14} /> : <ImageIcon size={14} />} {item.filename}</strong>
                    <span>{formatBytes(item.sizeBytes)}</span>
                  </div>
                  <div className={styles.listingActions}>
                    <button className={styles.dangerBtn} onClick={() => handleDelete(item)}>Sil</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
