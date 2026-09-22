'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Fuel, Gauge, Cog, Calendar, Heart, ArrowLeftRight, ArrowRight, ChevronLeft, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import styles from './cars.module.css';
import { Listing, API_BASE_URL, FALLBACK_LISTINGS, getLocalListings, getCompareList, saveCompareList, MAX_COMPARE } from '@/lib/listings';
import Select from '@/components/Select/Select';
import PhotoCarousel from '@/components/PhotoCarousel/PhotoCarousel';

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { value: 'createdAt_desc', label: 'En Yeni İlanlar' },
  { value: 'createdAt_asc', label: 'En Eski İlanlar' },
  { value: 'price_asc', label: 'Fiyat: Düşükten Yükseğe' },
  { value: 'price_desc', label: 'Fiyat: Yüksekten Düşüğe' },
  { value: 'year_desc', label: 'Model Yılı: Yeniden Eskiye' },
  { value: 'year_asc', label: 'Model Yılı: Eskiden Yeniye' },
  { value: 'km_asc', label: 'Kilometre: Azdan Çoğa' },
  { value: 'viewCount_desc', label: 'En Çok İncelenenler' },
];

export default function CarsPage() {
  return (
    <Suspense fallback={<div className={styles.spinnerContainer}><div className={styles.spinner}></div></div>}>
      <CarsPageInner />
    </Suspense>
  );
}

function CarsPageInner() {
  const searchParams = useSearchParams();

  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  // Filters State — seeded synchronously from the URL (e.g. footer links like
  // /cars?bodyType=Coupe, or the homepage hero search) so the very first
  // fetch already uses them; no extra effect/render round-trip needed.
  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [brand, setBrand] = useState(() => searchParams.get('brand') || 'All');
  const [minYear, setMinYear] = useState(() => searchParams.get('minYear') || '');
  const [maxYear, setMaxYear] = useState(() => searchParams.get('maxYear') || '');
  const [fuel, setFuel] = useState('All');
  const [gear, setGear] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [type, setType] = useState<'All' | 'SALE' | 'RENT'>(() => {
    const t = searchParams.get('type');
    return t === 'SALE' || t === 'RENT' ? t : 'All';
  });
  const [bodyType, setBodyType] = useState(() => searchParams.get('bodyType') || 'All');
  const [sortBy, setSortBy] = useState('createdAt_desc');

  const [allBrands, setAllBrands] = useState<string[]>([]);
  const [allBodyTypes, setAllBodyTypes] = useState<string[]>([]);

  // Favorites & Compare
  const [favorites, setFavorites] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<Listing[]>([]);

  // Saved search alert
  const [savedSearchEmail, setSavedSearchEmail] = useState('');
  const [savedSearchStatus, setSavedSearchStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  // One-time broad fetch to build the brand / body type facet options dynamically
  useEffect(() => {
    async function loadFacets() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/listings?limit=100`);
        if (!res.ok) throw new Error('facet fetch failed');
        const json = await res.json();
        if (json.success && json.data) {
          const brands = Array.from(new Set(json.data.map((l: Listing) => l.brand).filter(Boolean))) as string[];
          const bodyTypes = Array.from(new Set(json.data.map((l: Listing) => l.bodyType).filter(Boolean))) as string[];
          setAllBrands(brands.sort());
          setAllBodyTypes(bodyTypes.sort());
        }
      } catch {
        const brands = Array.from(new Set(FALLBACK_LISTINGS.map(l => l.brand).filter(Boolean))) as string[];
        const bodyTypes = Array.from(new Set(FALLBACK_LISTINGS.map(l => l.bodyType).filter(Boolean))) as string[];
        setAllBrands(brands.sort());
        setAllBodyTypes(bodyTypes.sort());
      }
    }
    loadFacets();
  }, []);

  const fetchListings = useCallback(async (targetPage: number) => {
    setLoading(true);
    setUsingFallback(false);
    try {
      const params = new URLSearchParams();
      params.set('page', String(targetPage));
      params.set('limit', String(PAGE_SIZE));
      params.set('sortBy', sortBy);
      if (search.trim()) params.set('search', search.trim());
      if (brand !== 'All') params.set('brand', brand);
      if (fuel !== 'All') params.set('fuel', fuel);
      if (gear !== 'All') params.set('gear', gear);
      if (type !== 'All') params.set('type', type);
      if (minPrice.trim()) params.set('minPrice', minPrice.trim());
      if (maxPrice.trim()) params.set('maxPrice', maxPrice.trim());
      if (minYear.trim()) params.set('minYear', minYear.trim());
      if (maxYear.trim()) params.set('maxYear', maxYear.trim());

      const res = await fetch(`${API_BASE_URL}/api/listings?${params.toString()}`);
      if (!res.ok) throw new Error('API error');
      const json = await res.json();
      if (json.success && json.data) {
        const local = targetPage === 1 ? getLocalListings() : [];
        setListings([...local, ...json.data]);
        setTotal(json.total ?? json.data.length);
        setPage(targetPage);
      }
    } catch (err) {
      console.warn('Fallback static data loaded.', err);
      const allListings = [...getLocalListings(), ...FALLBACK_LISTINGS];
      setListings(allListings);
      setTotal(allListings.length);
      setPage(1);
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, brand, fuel, gear, type, minPrice, maxPrice, minYear, maxYear, sortBy]);

  useEffect(() => {
    fetchListings(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy]);

  useEffect(() => {
    const saved = localStorage.getItem('favorites_cars');
    if (saved) {
      try { setFavorites(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
    setCompareList(getCompareList());
  }, []);

  const handleReset = () => {
    setSearch('');
    setBrand('All');
    setMinYear('');
    setMaxYear('');
    setFuel('All');
    setGear('All');
    setMinPrice('');
    setMaxPrice('');
    setType('All');
    setBodyType('All');
    setSortBy('createdAt_desc');
    fetchListings(1);
  };

  const handleSaveSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSearchStatus('sending');
    try {
      const filters: Record<string, unknown> = {};
      if (brand !== 'All') filters.brand = brand;
      if (fuel !== 'All') filters.fuel = fuel;
      if (gear !== 'All') filters.gear = gear;
      if (type !== 'All') filters.type = type;
      if (minPrice.trim()) filters.minPrice = Number(minPrice);
      if (maxPrice.trim()) filters.maxPrice = Number(maxPrice);
      if (minYear.trim()) filters.minYear = Number(minYear);
      if (maxYear.trim()) filters.maxYear = Number(maxYear);

      const res = await fetch(`${API_BASE_URL}/api/alerts/saved-searches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: savedSearchEmail, filters }),
      });
      const json = await res.json();
      setSavedSearchStatus(res.ok && json.success ? 'success' : 'error');
    } catch {
      setSavedSearchStatus('error');
    }
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    let updated;
    if (favorites.includes(id)) {
      updated = favorites.filter(favId => favId !== id);
    } else {
      updated = [...favorites, id];
    }
    setFavorites(updated);
    localStorage.setItem('favorites_cars', JSON.stringify(updated));
  };

  const toggleCompare = (car: Listing, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const exists = compareList.find(c => c.id === car.id);
    let updated: Listing[];
    if (exists) {
      updated = compareList.filter(c => c.id !== car.id);
    } else {
      if (compareList.length >= MAX_COMPARE) {
        alert(`En fazla ${MAX_COMPARE} aracı karşılaştırabilirsiniz.`);
        return;
      }
      updated = [...compareList, car];
    }
    setCompareList(updated);
    saveCompareList(updated);
  };

  const visibleListings = bodyType !== 'All' ? listings.filter(l => l.bodyType === bodyType) : listings;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className={styles.container}>
      <div className={styles.headerBanner}>
        <h1>Otomobil Arama</h1>
        <p>Premium ve lüks araç filomuzu filtreleyin.</p>
      </div>

      <div className={styles.content}>
        {/* Left Sidebar Filters */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h3>Filtreler</h3>
            <button className={styles.clearBtn} onClick={handleReset}>Temizle</button>
          </div>

          <div className={styles.filterGroup}>
            <label>Kelime ile Ara</label>
            <input
              type="text"
              placeholder="Marka, model..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={styles.sidebarInput}
            />
          </div>

          <div className={styles.filterGroup}>
            <label>İlan Tipi</label>
            <Select value={type} onChange={e => setType(e.target.value as 'All' | 'SALE' | 'RENT')} className={styles.sidebarSelect}>
              <option value="All">Tüm Tipler</option>
              <option value="SALE">Satılık</option>
              <option value="RENT">Kiralık</option>
            </Select>
          </div>

          <div className={styles.filterGroup}>
            <label>Marka</label>
            <Select value={brand} onChange={e => setBrand(e.target.value)} className={styles.sidebarSelect}>
              <option value="All">Tüm Markalar</option>
              {allBrands.map(b => <option key={b} value={b}>{b}</option>)}
            </Select>
          </div>

          <div className={styles.filterGroup}>
            <label>Kasa Tipi</label>
            <Select value={bodyType} onChange={e => setBodyType(e.target.value)} className={styles.sidebarSelect}>
              <option value="All">Tüm Kasa Tipleri</option>
              {allBodyTypes.map(b => <option key={b} value={b}>{b}</option>)}
            </Select>
          </div>

          <div className={styles.filterGroup}>
            <label>Model Yılı</label>
            <div className={styles.priceInputs}>
              <input type="number" placeholder="Min" value={minYear} onChange={e => setMinYear(e.target.value)} className={styles.priceInput} />
              <span>-</span>
              <input type="number" placeholder="Max" value={maxYear} onChange={e => setMaxYear(e.target.value)} className={styles.priceInput} />
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label>Yakıt Türü</label>
            <Select value={fuel} onChange={e => setFuel(e.target.value)} className={styles.sidebarSelect}>
              <option value="All">Tüm Yakıtlar</option>
              <option value="Benzin">Benzin</option>
              <option value="Dizel">Dizel</option>
              <option value="Elektrik">Elektrik</option>
              <option value="Hibrit">Hibrit</option>
            </Select>
          </div>

          <div className={styles.filterGroup}>
            <label>Şanzıman</label>
            <Select value={gear} onChange={e => setGear(e.target.value)} className={styles.sidebarSelect}>
              <option value="All">Tüm Şanzımanlar</option>
              <option value="Otomatik">Otomatik</option>
              <option value="Manuel">Manuel</option>
            </Select>
          </div>

          <div className={styles.filterGroup}>
            <label>Fiyat Aralığı ($)</label>
            <div className={styles.priceInputs}>
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
                className={styles.priceInput}
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                className={styles.priceInput}
              />
            </div>
          </div>

          <button className={styles.applyBtn} onClick={() => fetchListings(1)}>Filtreleri Uygula</button>

          {/* Saved search alert */}
          <div className={styles.savedSearchBox}>
            {savedSearchStatus === 'success' ? (
              <p className={styles.savedSearchSuccess}><CheckCircle2 size={15} /> Bu kritere uygun yeni ilan olunca haberdar edileceksiniz.</p>
            ) : (
              <form onSubmit={handleSaveSearch}>
                <label>Bu aramayı kaydet</label>
                <p className={styles.savedSearchHint}>Kriterlere uygun yeni ilan yayınlandığında e-posta ile haberdar olun.</p>
                <input
                  type="email"
                  placeholder="E-posta adresiniz"
                  value={savedSearchEmail}
                  onChange={e => setSavedSearchEmail(e.target.value)}
                  required
                />
                <button type="submit" disabled={savedSearchStatus === 'sending'}>
                  {savedSearchStatus === 'sending' ? 'Kaydediliyor...' : 'Aramayı Kaydet'}
                </button>
                {savedSearchStatus === 'error' && <p className={styles.savedSearchError}><XCircle size={13} /> Kaydedilemedi, tekrar deneyin.</p>}
              </form>
            )}
          </div>
        </aside>

        {/* Right Listings Grid */}
        <section className={styles.listingsSection}>
          <div className={styles.sortRow}>
            <span className={styles.resultsCount}>{usingFallback ? visibleListings.length : total} ilan bulundu</span>
            <Select value={sortBy} onChange={e => setSortBy(e.target.value)} className={styles.sidebarSelect} wrapperStyle={{ width: 'auto', minWidth: 220 }}>
              {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </Select>
          </div>

          {compareList.length > 0 && (
            <Link href="/compare" className={styles.compareBanner}>
              Karşılaştırma listenizde {compareList.length} araç var — görüntülemek için tıklayın ({compareList.length}/{MAX_COMPARE})
              <ArrowRight size={14} className={styles.inlineIcon} />
            </Link>
          )}

          {loading ? (
            <div className={styles.spinnerContainer}>
              <div className={styles.spinner}></div>
            </div>
          ) : visibleListings.length === 0 ? (
            <div className={styles.noResults}>
              <p>Eşleşen araç bulunamadı. Lütfen filtrelerinizi temizleyin.</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {visibleListings.map(car => {
                const isFav = favorites.includes(car.id);
                const isCompared = !!compareList.find(c => c.id === car.id);
                return (
                  <Link href={`/cars/${car.id}`} className={styles.card} key={car.id}>
                    <div className={styles.imgBox}>
                      <span className={styles.badge}>{car.type === 'RENT' ? 'KİRALIK' : 'SATILIK'}</span>
                      <PhotoCarousel photos={car.photos} alt={car.title} imgClassName={styles.carImg} />
                      <div className={styles.price}>
                        ${typeof car.price === 'number' ? car.price.toLocaleString() : car.price}
                      </div>
                    </div>
                    <div className={styles.cardBody}>
                      <span className={styles.category}>{car.bodyType || 'Otomobil'}</span>
                      <h3>{car.title}</h3>
                      <div className={styles.specs}>
                        <span><Fuel size={13} /> {car.fuel || 'Benzin'}</span>
                        <span><Gauge size={13} /> {car.km ? `${car.km.toLocaleString()} km` : '35k km'}</span>
                        <span><Cog size={13} /> {car.gear || 'Otomatik'}</span>
                        <span><Calendar size={13} /> {car.year}</span>
                      </div>
                      <div className={styles.actions}>
                        <button
                          className={`${styles.actionBtn} ${isFav ? styles.favActive : ''}`}
                          onClick={e => toggleFavorite(car.id, e)}
                          aria-label="Favorilere ekle"
                        >
                          <Heart size={15} fill={isFav ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          className={`${styles.actionBtn} ${isCompared ? styles.compareActive : ''}`}
                          onClick={e => toggleCompare(car, e)}
                          aria-label="Karşılaştır"
                        >
                          <ArrowLeftRight size={15} />
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {!loading && !usingFallback && totalPages > 1 && (
            <div className={styles.paginationBar}>
              <button disabled={page <= 1} onClick={() => fetchListings(page - 1)}><ChevronLeft size={16} /> Önceki</button>
              <span>Sayfa {page} / {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => fetchListings(page + 1)}>Sonraki <ChevronRight size={16} /></button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
