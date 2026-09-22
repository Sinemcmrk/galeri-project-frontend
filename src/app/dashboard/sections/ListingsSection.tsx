'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { XCircle } from 'lucide-react';
import styles from '../dashboard.module.css';
import { API_BASE_URL, Listing, getImageUrl, formatPrice } from '@/lib/listings';
import ListingForm from '@/components/ListingForm/ListingForm';

export default function ListingsSection({ token }: { token: string }) {
  const authHeaders = { Authorization: `Bearer ${token}` };

  const [listings, setListings] = useState<Listing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [tab, setTab] = useState<'active' | 'archived'>('active');
  const [archivedListings, setArchivedListings] = useState<Listing[]>([]);
  const [archivedLoading, setArchivedLoading] = useState(false);

  const loadListings = useCallback(async () => {
    setListingsLoading(true);
    try {
      const [activeRes, passiveRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/listings?limit=100&isActive=true`, { headers: authHeaders }),
        fetch(`${API_BASE_URL}/api/listings?limit=100&isActive=false`, { headers: authHeaders }),
      ]);
      const merged: Listing[] = [];
      for (const res of [activeRes, passiveRes]) {
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) merged.push(...json.data);
        }
      }
      setListings(merged);
    } catch (err) {
      console.warn('Could not load listings for management.', err);
    } finally {
      setListingsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const loadArchivedListings = useCallback(async () => {
    setArchivedLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/listings/archived?limit=100`, { headers: authHeaders });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) setArchivedListings(json.data);
      }
    } catch (err) {
      console.warn('Could not load archived listings.', err);
    } finally {
      setArchivedLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    loadListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (tab === 'archived') loadArchivedListings();
  }, [tab, loadArchivedListings]);

  const handleDelete = async (listing: Listing) => {
    if (!confirm(`"${listing.title}" ilanını kalıcı olarak silmek istediğinize emin misiniz?`)) return;
    setActionError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/listings/${listing.id}`, { method: 'DELETE', headers: authHeaders });
      const json = await res.json();
      if (res.ok && json.success) {
        setListings(prev => prev.filter(l => l.id !== listing.id));
      } else {
        setActionError(json.message || 'İlan silinemedi.');
      }
    } catch {
      setActionError('Sunucuya bağlanılamadı.');
    }
  };

  const handleArchive = async (listing: Listing) => {
    setActionError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/listings/${listing.id}/archive`, { method: 'PUT', headers: authHeaders });
      const json = await res.json();
      if (res.ok && json.success) {
        setListings(prev => prev.filter(l => l.id !== listing.id));
      } else {
        setActionError(json.message || 'İlan arşivlenemedi.');
      }
    } catch {
      setActionError('Sunucuya bağlanılamadı.');
    }
  };

  const handleUnarchive = async (listing: Listing) => {
    setActionError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/listings/${listing.id}/unarchive`, { method: 'PUT', headers: authHeaders });
      const json = await res.json();
      if (res.ok && json.success) {
        setArchivedListings(prev => prev.filter(l => l.id !== listing.id));
        loadListings();
      } else {
        setActionError(json.message || 'İlan arşivden çıkarılamadı.');
      }
    } catch {
      setActionError('Sunucuya bağlanılamadı.');
    }
  };

  const handleDeleteArchived = async (listing: Listing) => {
    if (!confirm(`"${listing.title}" ilanını kalıcı olarak silmek istediğinize emin misiniz?`)) return;
    setActionError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/listings/${listing.id}`, { method: 'DELETE', headers: authHeaders });
      const json = await res.json();
      if (res.ok && json.success) {
        setArchivedListings(prev => prev.filter(l => l.id !== listing.id));
      } else {
        setActionError(json.message || 'İlan silinemedi.');
      }
    } catch {
      setActionError('Sunucuya bağlanılamadı.');
    }
  };

  return (
    <div className={styles.managementCard}>
      <div className={styles.managementHeader}>
        <h2>İlan Yönetimi</h2>
        <a href="/listing" className={styles.newListingBtn}>+ Yeni İlan</a>
      </div>

      <div className={styles.tabRow}>
        <button className={`${styles.tabBtn} ${tab === 'active' ? styles.tabBtnActive : ''}`} onClick={() => setTab('active')}>
          Aktif İlanlar
        </button>
        <button className={`${styles.tabBtn} ${tab === 'archived' ? styles.tabBtnActive : ''}`} onClick={() => setTab('archived')}>
          Arşivlenmiş İlanlar
        </button>
      </div>

      {actionError && <div className={styles.actionErrorAlert}><XCircle size={15} /> {actionError}</div>}

      {editingListing && (
        <div className={styles.editModalOverlay} onClick={() => setEditingListing(null)}>
          <div className={styles.editModalContent} onClick={e => e.stopPropagation()}>
            <ListingForm
              mode="edit"
              listing={editingListing}
              onCancel={() => setEditingListing(null)}
              onSuccess={(updated) => {
                setListings(prev => prev.map(l => (l.id === updated.id ? updated : l)));
                setEditingListing(null);
              }}
            />
          </div>
        </div>
      )}

      {tab === 'active' ? (
        listingsLoading ? (
          <p className={styles.mutedText}>Yükleniyor...</p>
        ) : listings.length === 0 ? (
          <p className={styles.mutedText}>Henüz ilan bulunmuyor.</p>
        ) : (
          <div className={styles.listingsTable}>
            {listings.map(listing => (
              <div className={styles.listingRow} key={listing.id}>
                <img src={getImageUrl(listing.photos?.[0])} alt={listing.title} className={styles.listingThumb} />
                <div className={styles.listingInfo}>
                  <strong>{listing.title}</strong>
                  <span>{formatPrice(listing.price)} • {listing.viewCount ?? 0} görüntülenme</span>
                </div>
                <div className={styles.listingActions}>
                  <button onClick={() => setEditingListing(listing)}>Düzenle</button>
                  <button onClick={() => handleArchive(listing)}>Arşivle</button>
                  <button className={styles.dangerBtn} onClick={() => handleDelete(listing)}>Sil</button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : archivedLoading ? (
        <p className={styles.mutedText}>Yükleniyor...</p>
      ) : archivedListings.length === 0 ? (
        <p className={styles.mutedText}>Arşivlenmiş ilan bulunmuyor.</p>
      ) : (
        <div className={styles.listingsTable}>
          {archivedListings.map(listing => (
            <div className={styles.listingRow} key={listing.id}>
              <img src={getImageUrl(listing.photos?.[0])} alt={listing.title} className={styles.listingThumb} />
              <div className={styles.listingInfo}>
                <strong>{listing.title}</strong>
                <span>{formatPrice(listing.price)} • {listing.viewCount ?? 0} görüntülenme</span>
              </div>
              <div className={styles.listingActions}>
                <button onClick={() => handleUnarchive(listing)}>Arşivden Çıkar</button>
                <button className={styles.dangerBtn} onClick={() => handleDeleteArchived(listing)}>Sil</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
