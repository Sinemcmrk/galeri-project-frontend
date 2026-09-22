'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Fuel, Gauge, Zap, Cog, Heart, ArrowLeftRight, Frown, X } from 'lucide-react';
import styles from './page.module.css';
import { Listing, API_BASE_URL, FALLBACK_LISTINGS, getLocalListings, getImageUrl, getCompareList, saveCompareList, MAX_COMPARE } from '@/lib/listings';
import Select from '@/components/Select/Select';
import PhotoCarousel from '@/components/PhotoCarousel/PhotoCarousel';

export default function Home() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  // Search and Filter States
  const [searchTab, setSearchTab] = useState<'condition' | 'bodyType'>('condition');
  const [keyword, setKeyword] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('Any');
  const [selectedYear, setSelectedYear] = useState('Any');
  const [selectedType, setSelectedType] = useState('Any');

  // Favorites (Saved Listings) State
  const [favorites, setFavorites] = useState<string[]>([]);

  // Comparison State
  const [compareList, setCompareList] = useState<Listing[]>([]);
  const [showCompareDrawer, setShowCompareDrawer] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Fetch listings on mount
  useEffect(() => {
    async function fetchListings() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/listings`);
        if (!res.ok) {
          throw new Error('Failed to fetch from backend API');
        }
        const json = await res.json();
        if (json.success && json.data) {
          setListings([...getLocalListings(), ...json.data]);
        } else {
          throw new Error('API response was unsuccessful');
        }
      } catch (err) {
        console.warn('Backend fetch failed, using fallback static data.', err);
        setListings([...getLocalListings(), ...FALLBACK_LISTINGS]);
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
  }, []);

  // Brand options derived from whatever is currently loaded, instead of a hardcoded list
  const dynamicBrands = useMemo(
    () => Array.from(new Set(listings.map(l => l.brand).filter(Boolean))).sort() as string[],
    [listings]
  );
  const dynamicYears = useMemo(
    () => Array.from(new Set(listings.map(l => l.year).filter(Boolean))).sort((a, b) => (b as number) - (a as number)) as number[],
    [listings]
  );

  // Load favorites and any previously started comparison on mount
  useEffect(() => {
    const saved = localStorage.getItem('favorites_cars');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
    const compare = getCompareList();
    setCompareList(compare);
    setShowCompareDrawer(compare.length > 0);
  }, []);

  // Handle Search Execution: navigate to the full catalogue page with the
  // selected filters applied, where pagination/sorting are also available.
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('search', keyword.trim());
    if (selectedBrand !== 'Any') params.set('brand', selectedBrand);
    if (selectedYear !== 'Any') {
      params.set('minYear', selectedYear);
      params.set('maxYear', selectedYear);
    }
    if (selectedType !== 'Any') params.set('type', selectedType);
    router.push(`/cars${params.toString() ? `?${params.toString()}` : ''}`);
  };

  // Toggle Favorite
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    let updated;
    if (favorites.includes(id)) {
      updated = favorites.filter((favId) => favId !== id);
    } else {
      updated = [...favorites, id];
    }
    setFavorites(updated);
    localStorage.setItem('favorites_cars', JSON.stringify(updated));
  };

  // Toggle Comparison
  const toggleCompare = (car: Listing, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const exists = compareList.find((c) => c.id === car.id);
    let updated;

    if (exists) {
      updated = compareList.filter((c) => c.id !== car.id);
    } else {
      if (compareList.length >= MAX_COMPARE) {
        alert(`En fazla ${MAX_COMPARE} aracı karşılaştırabilirsiniz.`);
        return;
      }
      updated = [...compareList, car];
    }

    setCompareList(updated);
    saveCompareList(updated);
    setShowCompareDrawer(updated.length > 0);
  };

  return (
    <main className={styles.main}>
      {/* Hero Section */}
      <section 
        className={styles.hero} 
        style={{ backgroundImage: 'url(/images/hero_bg.jpg)' }}
      >
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Ne arıyorsunuz?</h1>
          <p className={styles.heroSubtitle}>20.241 yeni ilan arasından arayın - 48 tanesi bugün eklendi</p>

          {/* Search Box */}
          <div className={styles.searchBox}>
            <div className={styles.searchTabs}>
              <button 
                className={`${styles.tabBtn} ${searchTab === 'condition' ? styles.activeTab : ''}`}
                onClick={() => setSearchTab('condition')}
              >
                DURUMA GÖRE ARA
              </button>
              <button 
                className={`${styles.tabBtn} ${searchTab === 'bodyType' ? styles.activeTab : ''}`}
                onClick={() => setSearchTab('bodyType')}
              >
                KASA TİPİNE GÖRE ARA
              </button>
            </div>

            <div className={styles.searchForm}>
              {/* Keyword Search */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Kelime Ara</label>
                <input 
                  type="text" 
                  placeholder="Örn: Honda Civic, Audi, Ford..." 
                  className={styles.formInput}
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>

              {/* Brand Select */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Marka Seçin</label>
                <Select
                  className={styles.formSelect}
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                >
                  <option value="Any">Tüm Markalar</option>
                  {dynamicBrands.map((b) => <option key={b} value={b}>{b}</option>)}
                </Select>
              </div>

              {/* Year Select */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Yıl Seçin</label>
                <Select
                  className={styles.formSelect}
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value="Any">Tüm Yıllar</option>
                  {dynamicYears.map((y) => <option key={y} value={y}>{y}</option>)}
                </Select>
              </div>

              {/* Listing Type Select */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>İlan Tipi</label>
                <Select
                  className={styles.formSelect}
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="Any">Tüm Tipler</option>
                  <option value="SALE">Satılık</option>
                  <option value="RENT">Kiralık</option>
                </Select>
              </div>

              {/* Search Button */}
              <button className={styles.searchBtn} onClick={handleSearch}>
                ŞİMDİ ARA
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Ads Section */}
      <section className={styles.adsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Son <span>Öne Çıkan</span> İlanlar
          </h2>
          <div className={styles.titleDivider}>
            <span className={styles.dividerLine}></span>
            <span className={styles.dividerDot}></span>
            <span className={styles.dividerLine}></span>
          </div>
        </div>

        {loading ? (
          <div className={styles.loadingSpinner}>
            <div className={styles.spinner}></div>
            <p>Yükleniyor...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className={styles.noResults}>
            <Frown size={44} strokeWidth={1.5} />
            <p>Henüz yayında ilan bulunmuyor.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {listings.slice(0, 6).map((car) => {
              const isFav = favorites.includes(car.id);
              const isCompared = !!compareList.find((c) => c.id === car.id);
              
              return (
                <Link href={`/cars/${car.id}`} className={styles.card} key={car.id}>
                  {/* Top Image Box */}
                  <div className={styles.imgBox}>
                    <span className={styles.featuredBadge}>ÖNE ÇIKAN</span>
                    <PhotoCarousel photos={car.photos} alt={car.title} imgClassName={styles.carImg} />
                    <div className={styles.priceTag}>
                      ${typeof car.price === 'number' ? car.price.toLocaleString() : car.price}
                    </div>
                  </div>

                  {/* Details Body */}
                  <div className={styles.cardBody}>
                    <span className={styles.category}>{car.bodyType || 'Otomobil'}</span>
                    <h3 className={styles.carTitle}>{car.title}</h3>
                    
                    <div className={styles.location}>
                      <MapPin size={12} />
                      <span>İstanbul, Türkiye</span>
                    </div>

                    {/* Specs Grid */}
                    <div className={styles.specsGrid}>
                      <div className={styles.specItem}>
                        <Fuel className={styles.specIcon} size={16} />
                        <span>{car.fuel || 'Benzin'}</span>
                      </div>
                      <div className={styles.specItem}>
                        <Gauge className={styles.specIcon} size={16} />
                        <span>{car.km ? `${car.km.toLocaleString()} km` : '35.000 km'}</span>
                      </div>
                      <div className={styles.specItem}>
                        <Zap className={styles.specIcon} size={16} />
                        <span>{car.engineCapacity ? `${car.engineCapacity} cc` : '1800 cc'}</span>
                      </div>
                      <div className={styles.specItem}>
                        <Cog className={styles.specIcon} size={16} />
                        <span>{car.gear === 'Manuel' ? 'Manuel' : 'Otomatik'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className={styles.cardFooter}>
                    <span className={styles.dateText}>3 gün önce</span>
                    <div className={styles.footerActions}>
                      <button
                        className={`${styles.actionBtn} ${isFav ? styles.favActive : ''}`}
                        onClick={(e) => toggleFavorite(car.id, e)}
                        title="Favorilere Ekle"
                      >
                        <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        className={`${styles.actionBtn} ${isCompared ? styles.compareActive : ''}`}
                        onClick={(e) => toggleCompare(car, e)}
                        title="Karşılaştır"
                      >
                        <ArrowLeftRight size={16} />
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Floating Compare Drawer */}
      {showCompareDrawer && (
        <div className={styles.compareDrawer}>
          <div className={styles.drawerContent}>
            <div className={styles.drawerText}>
              <h4>Karşılaştırma Listesi ({compareList.length}/3)</h4>
              <p>Özelliklerini kıyaslamak için araçları seçtiniz.</p>
            </div>
            <div className={styles.drawerItems}>
              {compareList.map((c) => (
                <div className={styles.drawerItem} key={c.id}>
                  <img src={getImageUrl(c.photos[0])} alt={c.title} className={styles.drawerItemImg} />
                  <span>{c.brand} {c.modelName}</span>
                  <button className={styles.removeItemBtn} onClick={(e) => toggleCompare(c, e)} aria-label="Karşılaştırmadan çıkar"><X size={12} /></button>
                </div>
              ))}
            </div>
            <div className={styles.drawerActions}>
              <button
                className={styles.clearBtn}
                onClick={() => { setCompareList([]); saveCompareList([]); setShowCompareDrawer(false); }}
              >
                Temizle
              </button>
              <button 
                className={styles.compareSubmitBtn}
                onClick={() => setShowCompareModal(true)}
              >
                Karşılaştır
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compare Modal */}
      {showCompareModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCompareModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Araç Teknik Karşılaştırması</h3>
              <button className={styles.closeModalBtn} onClick={() => setShowCompareModal(false)} aria-label="Kapat"><X size={16} /></button>
            </div>
            <div className={styles.modalBody}>
              <table className={styles.compareTable}>
                <thead>
                  <tr>
                    <th>Özellik</th>
                    {compareList.map((c) => (
                      <th key={c.id}>
                        <img src={getImageUrl(c.photos[0])} alt={c.title} className={styles.tableCarImg} />
                        <h4>{c.title}</h4>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Fiyat</strong></td>
                    {compareList.map((c) => (
                      <td key={c.id} className={styles.tablePrice}>
                        ${typeof c.price === 'number' ? c.price.toLocaleString() : c.price}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td><strong>Marka</strong></td>
                    {compareList.map((c) => <td key={c.id}>{c.brand || '-'}</td>)}
                  </tr>
                  <tr>
                    <td><strong>Model</strong></td>
                    {compareList.map((c) => <td key={c.id}>{c.modelName || '-'}</td>)}
                  </tr>
                  <tr>
                    <td><strong>Yıl</strong></td>
                    {compareList.map((c) => <td key={c.id}>{c.year || '-'}</td>)}
                  </tr>
                  <tr>
                    <td><strong>Kasa Tipi</strong></td>
                    {compareList.map((c) => <td key={c.id}>{c.bodyType || '-'}</td>)}
                  </tr>
                  <tr>
                    <td><strong>Yakıt Türü</strong></td>
                    {compareList.map((c) => <td key={c.id}>{c.fuel || '-'}</td>)}
                  </tr>
                  <tr>
                    <td><strong>Şanzıman</strong></td>
                    {compareList.map((c) => <td key={c.id}>{c.gear || '-'}</td>)}
                  </tr>
                  <tr>
                    <td><strong>Kilometre</strong></td>
                    {compareList.map((c) => <td key={c.id}>{c.km ? `${c.km.toLocaleString()} km` : '-'}</td>)}
                  </tr>
                  <tr>
                    <td><strong>Motor Gücü (HP)</strong></td>
                    {compareList.map((c) => <td key={c.id}>{c.enginePower ? `${c.enginePower} HP` : '-'}</td>)}
                  </tr>
                  <tr>
                    <td><strong>Motor Hacmi (CC)</strong></td>
                    {compareList.map((c) => <td key={c.id}>{c.engineCapacity ? `${c.engineCapacity} cc` : '-'}</td>)}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
