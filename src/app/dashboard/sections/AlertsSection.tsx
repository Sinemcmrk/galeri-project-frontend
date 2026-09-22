'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { XCircle } from 'lucide-react';
import styles from '../dashboard.module.css';
import { API_BASE_URL, formatPrice } from '@/lib/listings';

interface PriceAlert {
  id: string;
  email: string;
  listingId: string;
  createdAt: string;
  listing?: { id: string; title: string; price: number | string | null };
}

interface SavedSearch {
  id: string;
  email: string;
  filters: Record<string, unknown>;
  createdAt: string;
}

const FILTER_LABELS: Record<string, string> = {
  type: 'Tip',
  brand: 'Marka',
  modelName: 'Model',
  fuel: 'Yakıt',
  gear: 'Şanzıman',
  minPrice: 'Min Fiyat',
  maxPrice: 'Max Fiyat',
  minYear: 'Min Yıl',
  maxYear: 'Max Yıl',
  maxKm: 'Max KM',
};

function summarizeFilters(filters: Record<string, unknown>): string {
  const parts = Object.entries(filters)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${FILTER_LABELS[k] || k}: ${v}`);
  return parts.length > 0 ? parts.join(' • ') : 'Kriter belirtilmemiş (tüm yeni ilanlar)';
}

export default function AlertsSection({ token }: { token: string }) {
  const authHeaders = { Authorization: `Bearer ${token}` };

  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [priceRes, searchRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/alerts/price`, { headers: authHeaders }),
        fetch(`${API_BASE_URL}/api/alerts/saved-searches`, { headers: authHeaders }),
      ]);
      if (priceRes.ok) {
        const json = await priceRes.json();
        if (json.success) setPriceAlerts(json.data);
      }
      if (searchRes.ok) {
        const json = await searchRes.json();
        if (json.success) setSavedSearches(json.data);
      }
    } catch (err) {
      console.warn('Could not load alert subscriptions.', err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDeletePriceAlert = async (id: string) => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/alerts/price/${id}`, { method: 'DELETE', headers: authHeaders });
      const json = await res.json();
      if (res.ok && json.success) {
        setPriceAlerts(prev => prev.filter(a => a.id !== id));
      } else {
        setError(json.message || 'Alarm silinemedi.');
      }
    } catch {
      setError('Sunucuya bağlanılamadı.');
    }
  };

  const handleDeleteSavedSearch = async (id: string) => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/alerts/saved-searches/${id}`, { method: 'DELETE', headers: authHeaders });
      const json = await res.json();
      if (res.ok && json.success) {
        setSavedSearches(prev => prev.filter(s => s.id !== id));
      } else {
        setError(json.message || 'Arama alarmı silinemedi.');
      }
    } catch {
      setError('Sunucuya bağlanılamadı.');
    }
  };

  if (loading) {
    return <div className={styles.managementCard}><p className={styles.mutedText}>Yükleniyor...</p></div>;
  }

  return (
    <div className={styles.sectionsColumn}>
      {error && <div className={styles.actionErrorAlert}><XCircle size={15} /> {error}</div>}

      <div className={styles.managementCard}>
        <div className={styles.managementHeader}>
          <h2>Fiyat Düşüş Alarmları ({priceAlerts.length})</h2>
        </div>
        {priceAlerts.length === 0 ? (
          <p className={styles.mutedText}>Henüz fiyat alarmı aboneliği yok.</p>
        ) : (
          <div className={styles.listingsTable}>
            {priceAlerts.map(alert => (
              <div className={styles.listingRow} key={alert.id}>
                <div className={styles.listingInfo}>
                  <strong>{alert.email}</strong>
                  <span>
                    {alert.listing ? `${alert.listing.title} • ${formatPrice(alert.listing.price)}` : 'İlan bulunamadı'}
                    {' • '}
                    {new Date(alert.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                <div className={styles.listingActions}>
                  <button className={styles.dangerBtn} onClick={() => handleDeletePriceAlert(alert.id)}>Sil</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.managementCard}>
        <div className={styles.managementHeader}>
          <h2>Kayıtlı Arama Alarmları ({savedSearches.length})</h2>
        </div>
        {savedSearches.length === 0 ? (
          <p className={styles.mutedText}>Henüz kayıtlı arama aboneliği yok.</p>
        ) : (
          <div className={styles.listingsTable}>
            {savedSearches.map(search => (
              <div className={styles.listingRow} key={search.id}>
                <div className={styles.listingInfo}>
                  <strong>{search.email}</strong>
                  <span>{summarizeFilters(search.filters)}</span>
                  <span>{new Date(search.createdAt).toLocaleDateString('tr-TR')}</span>
                </div>
                <div className={styles.listingActions}>
                  <button className={styles.dangerBtn} onClick={() => handleDeleteSavedSearch(search.id)}>Sil</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
