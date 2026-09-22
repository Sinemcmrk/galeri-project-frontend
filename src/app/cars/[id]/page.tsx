'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Heart, ArrowLeftRight, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './detail.module.css';
import { Listing, fetchListingById, getImageUrl, formatPrice, isRealListingId, getCompareList, saveCompareList, MAX_COMPARE } from '@/lib/listings';
import ChatWidget from '@/components/ChatWidget/ChatWidget';
import PriceAlertForm from '@/components/PriceAlertForm/PriceAlertForm';
import VideoPlayer from '@/components/VideoPlayer/VideoPlayer';

const FAVORITES_KEY = 'favorites_cars';

function readIds(key: string): string[] {
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function CarDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCompared, setIsCompared] = useState(false);
  const [compareCount, setCompareCount] = useState(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setNotFound(false);
      const data = await fetchListingById(id);
      if (cancelled) return;
      if (data) {
        setListing(data);
        setActivePhoto(0);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setIsFavorite(readIds(FAVORITES_KEY).includes(id));
    const compareItems = getCompareList();
    setIsCompared(compareItems.some(i => i.id === id));
    setCompareCount(compareItems.length);
  }, [id]);

  const toggleFavorite = () => {
    const current = readIds(FAVORITES_KEY);
    const updated = current.includes(id) ? current.filter(f => f !== id) : [...current, id];
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    setIsFavorite(updated.includes(id));
  };

  const toggleCompare = () => {
    if (!listing) return;
    const items = getCompareList();

    const exists = items.some(i => i.id === listing.id);
    let updated: Listing[];
    if (exists) {
      updated = items.filter(i => i.id !== listing.id);
    } else {
      if (items.length >= MAX_COMPARE) {
        alert(`En fazla ${MAX_COMPARE} aracı karşılaştırabilirsiniz.`);
        return;
      }
      updated = [...items, listing];
    }

    saveCompareList(updated);
    setIsCompared(!exists);
    setCompareCount(updated.length);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.spinnerContainer}>
          <div className={styles.spinner}></div>
        </div>
      </div>
    );
  }

  if (notFound || !listing) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>
          <h2>İlan Bulunamadı</h2>
          <p>Aradığınız ilan kaldırılmış veya hiç var olmamış olabilir.</p>
          <Link href="/cars" className={styles.backBtn}>İlanlara Geri Dön</Link>
        </div>
      </div>
    );
  }

  const photos = listing.photos && listing.photos.length > 0 ? listing.photos : [];

  const goPrevPhoto = () => setActivePhoto(i => (i - 1 + photos.length) % photos.length);
  const goNextPhoto = () => setActivePhoto(i => (i + 1) % photos.length);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      if (delta < 0) goNextPhoto();
      else goPrevPhoto();
    }
    touchStartX.current = null;
  };

  const specs: { label: string; value: string | number | null }[] = [
    { label: 'Marka', value: listing.brand },
    { label: 'Model', value: listing.modelName },
    { label: 'Model Yılı', value: listing.year },
    { label: 'Kilometre', value: listing.km ? `${listing.km.toLocaleString('tr-TR')} km` : null },
    { label: 'Yakıt Türü', value: listing.fuel },
    { label: 'Şanzıman', value: listing.gear },
    { label: 'Kasa Tipi', value: listing.bodyType },
    { label: 'Renk', value: listing.color },
    { label: 'Motor Gücü', value: listing.enginePower ? `${listing.enginePower} HP` : null },
    { label: 'Motor Hacmi', value: listing.engineCapacity ? `${listing.engineCapacity} cc` : null },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <Link href="/">Ana Sayfa</Link>
        <span>/</span>
        <Link href="/cars">İlanlar</Link>
        <span>/</span>
        <span className={styles.breadcrumbCurrent}>{listing.title}</span>
      </div>

      <div className={styles.content}>
        {/* Gallery */}
        <div className={styles.gallery}>
          <div className={styles.mainImageBox} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            <span className={styles.typeBadge}>{listing.type === 'RENT' ? 'KİRALIK' : 'SATILIK'}</span>
            <img
              src={getImageUrl(photos[activePhoto])}
              alt={listing.title}
              className={styles.mainImage}
            />
            {photos.length > 1 && (
              <>
                <button type="button" className={`${styles.galleryNavBtn} ${styles.galleryNavPrev}`} onClick={goPrevPhoto} aria-label="Önceki fotoğraf">
                  <ChevronLeft size={22} />
                </button>
                <button type="button" className={`${styles.galleryNavBtn} ${styles.galleryNavNext}`} onClick={goNextPhoto} aria-label="Sonraki fotoğraf">
                  <ChevronRight size={22} />
                </button>
                <span className={styles.photoCounter}>{activePhoto + 1} / {photos.length}</span>
              </>
            )}
          </div>
          {photos.length > 1 && (
            <div className={styles.thumbRow}>
              {photos.map((photo, idx) => (
                <button
                  key={photo + idx}
                  className={`${styles.thumbBtn} ${idx === activePhoto ? styles.thumbActive : ''}`}
                  onClick={() => setActivePhoto(idx)}
                  aria-label={`${idx + 1}. görsel`}
                >
                  <img src={getImageUrl(photo)} alt={`${listing.title} - ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Panel */}
        <aside className={styles.infoPanel}>
          <h1 className={styles.title}>{listing.title}</h1>
          <div className={styles.price}>{formatPrice(listing.price)}</div>

          <div className={styles.actionsRow}>
            <button
              className={`${styles.actionBtn} ${isFavorite ? styles.favActive : ''}`}
              onClick={toggleFavorite}
            >
              <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
              {isFavorite ? 'Favorilerde' : 'Favorilere Ekle'}
            </button>
            <button
              className={`${styles.actionBtn} ${isCompared ? styles.compareActive : ''}`}
              onClick={toggleCompare}
            >
              <ArrowLeftRight size={16} />
              {isCompared ? 'Karşılaştırmadan Çıkar' : 'Karşılaştırmaya Ekle'}
            </button>
          </div>
          {compareCount > 0 && (
            <Link href="/compare" className={styles.compareLink}>
              Karşılaştırma listesini görüntüle ({compareCount}/{MAX_COMPARE})
              <ArrowRight size={13} />
            </Link>
          )}

          <div className={styles.specGrid}>
            {specs.filter(s => s.value !== null && s.value !== undefined && s.value !== '').map(s => (
              <div className={styles.specItem} key={s.label}>
                <span className={styles.specLabel}>{s.label}</span>
                <span className={styles.specValue}>{s.value}</span>
              </div>
            ))}
          </div>

          {isRealListingId(listing.id) && <PriceAlertForm listingId={listing.id} />}
        </aside>
      </div>

      {/* Description */}
      {listing.description && (
        <section className={styles.descriptionSection}>
          <h2>Açıklama</h2>
          <p>{listing.description}</p>
        </section>
      )}

      {/* Videos */}
      {listing.videos && listing.videos.length > 0 && (
        <section className={styles.videosSection}>
          <h2>Videolar</h2>
          <div className={styles.videoGrid}>
            {listing.videos.map((videoUrl) => (
              <VideoPlayer key={videoUrl} src={videoUrl} className={styles.videoPlayer} />
            ))}
          </div>
        </section>
      )}

      {/* Price History */}
      {listing.priceHistory && listing.priceHistory.length > 1 && (
        <section className={styles.priceHistorySection}>
          <h2>Fiyat Geçmişi</h2>
          <table className={styles.priceHistoryTable}>
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Fiyat</th>
              </tr>
            </thead>
            <tbody>
              {listing.priceHistory.map(entry => (
                <tr key={entry.id}>
                  <td>{new Date(entry.createdAt).toLocaleDateString('tr-TR')}</td>
                  <td>{formatPrice(entry.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {isRealListingId(listing.id) && <ChatWidget listingId={listing.id} />}
    </div>
  );
}
