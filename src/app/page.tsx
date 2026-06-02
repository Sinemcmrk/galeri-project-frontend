'use client';

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number | string | null;
  type: 'SALE' | 'RENT';
  brand: string | null;
  modelName: string | null;
  year: number | null;
  color: string | null;
  fuel: string | null;
  gear: string | null;
  km: number | null;
  enginePower: number | null;
  engineCapacity: number | null;
  bodyType: string | null;
  photos: string[];
}

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        const res = await fetch('http://localhost:6000/api/listings');
        if (!res.ok) {
          throw new Error('Failed to fetch from backend API');
        }
        const json = await res.json();
        if (json.success && json.data) {
          let allListings = json.data;
          const local = localStorage.getItem('local_listings_cars');
          if (local) {
            try {
              const parsedLocal = JSON.parse(local);
              allListings = [...parsedLocal, ...allListings];
            } catch (e) {
              console.error(e);
            }
          }
          setListings(allListings);
          setFilteredListings(allListings);
        } else {
          throw new Error('API response was unsuccessful');
        }
      } catch (err) {
        console.warn('Backend fetch failed, using fallback static data.', err);
        // Fallback static data matching database seed exactly
        const fallbackData: Listing[] = [
          {
            id: 'porsche-911-fallback',
            title: 'Porsche 911 Carrera 2017',
            description: 'Kusursuz kondisyonda, tüm bakımları zamanında yapılmış Porsche 911 Carrera. Eşsiz sürüş deneyimi ve lüks tasarımıyla yeni sahibini bekliyor.',
            price: 420000,
            type: 'SALE',
            brand: 'Porsche',
            modelName: '911 Carrera',
            year: 2017,
            color: 'Kırmızı',
            fuel: 'Benzin',
            gear: 'Otomatik',
            km: 35000,
            enginePower: 370,
            engineCapacity: 3000,
            bodyType: 'Coupe',
            photos: ['/uploads/images/porsche_911.jpg'],
          },
          {
            id: 'shelby-gt500-fallback',
            title: '2014 Ford Shelby GT500 Coupe',
            description: 'Amerikan kası efsanesi Ford Shelby GT500. Supercharged motor, şeritli özel tasarım ve yüksek performanslı sürüş dinamikleri.',
            price: 117000,
            type: 'SALE',
            brand: 'Ford',
            modelName: 'Shelby GT500',
            year: 2014,
            color: 'Mavi',
            fuel: 'Benzin',
            gear: 'Manuel',
            km: 35000,
            enginePower: 662,
            engineCapacity: 5800,
            bodyType: 'Coupe',
            photos: ['/uploads/images/shelby_gt500.jpg'],
          },
          {
            id: 'mclaren-f1-fallback',
            title: 'McLaren F1 Sports Car',
            description: 'Efsanevi hiper otomobil McLaren F1. Sadece sınırlı sayıda üretilmiş, koleksiyonluk değerde ve kusursuz kondisyonda.',
            price: 77000,
            type: 'SALE',
            brand: 'McLaren',
            modelName: 'F1',
            year: 1996,
            color: 'Gümüş',
            fuel: 'Benzin',
            gear: 'Manuel',
            km: 35000,
            enginePower: 618,
            engineCapacity: 6100,
            bodyType: 'Sports Car',
            photos: ['/uploads/images/mclaren_f1.jpg'],
          }
        ];
        let allListings = fallbackData;
        const local = localStorage.getItem('local_listings_cars');
        if (local) {
          try {
            const parsedLocal = JSON.parse(local);
            allListings = [...parsedLocal, ...allListings];
          } catch (e) {
            console.error(e);
          }
        }
        setListings(allListings);
        setFilteredListings(allListings);
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
  }, []);

  // Load favorites on mount
  useEffect(() => {
    const saved = localStorage.getItem('favorites_cars');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Handle Search Execution
  const handleSearch = () => {
    let result = [...listings];

    if (keyword.trim() !== '') {
      const kw = keyword.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(kw) ||
          c.description.toLowerCase().includes(kw) ||
          (c.brand && c.brand.toLowerCase().includes(kw)) ||
          (c.modelName && c.modelName.toLowerCase().includes(kw))
      );
    }

    if (selectedBrand !== 'Any') {
      result = result.filter((c) => c.brand === selectedBrand);
    }

    if (selectedYear !== 'Any') {
      result = result.filter((c) => c.year === parseInt(selectedYear));
    }

    if (selectedType !== 'Any') {
      result = result.filter((c) => c.type === selectedType);
    }

    setFilteredListings(result);
  };

  // Toggle Favorite
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
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
    e.stopPropagation();
    const exists = compareList.find((c) => c.id === car.id);
    let updated;

    if (exists) {
      updated = compareList.filter((c) => c.id !== car.id);
    } else {
      if (compareList.length >= 3) {
        alert('En fazla 3 aracı karşılaştırabilirsiniz.');
        return;
      }
      updated = [...compareList, car];
    }

    setCompareList(updated);
    setShowCompareDrawer(updated.length > 0);
  };

  const getImageUrl = (photoPath: string | undefined) => {
    if (!photoPath) return '/images/hero_bg.jpg';
    if (photoPath.startsWith('/uploads/images/')) {
      const filename = photoPath.replace('/uploads/images/', '');
      return `/images/${filename}`;
    }
    return photoPath;
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
                <select 
                  className={styles.formSelect}
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                >
                  <option value="Any">Tüm Markalar</option>
                  <option value="Porsche">Porsche</option>
                  <option value="Ford">Ford</option>
                  <option value="McLaren">McLaren</option>
                </select>
              </div>

              {/* Year Select */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Yıl Seçin</label>
                <select 
                  className={styles.formSelect}
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value="Any">Tüm Yıllar</option>
                  <option value="2017">2017</option>
                  <option value="2014">2014</option>
                  <option value="1996">1996</option>
                </select>
              </div>

              {/* Listing Type Select */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>İlan Tipi</label>
                <select 
                  className={styles.formSelect}
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="Any">Tüm Tipler</option>
                  <option value="SALE">Satılık</option>
                  <option value="RENT">Kiralık</option>
                </select>
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
        ) : filteredListings.length === 0 ? (
          <div className={styles.noResults}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            <p>Aradığınız kriterlere uygun araç bulunamadı.</p>
            <button 
              className={styles.resetBtn}
              onClick={() => {
                setKeyword('');
                setSelectedBrand('Any');
                setSelectedYear('Any');
                setSelectedType('Any');
                setFilteredListings(listings);
              }}
            >
              Filtreleri Temizle
            </button>
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredListings.map((car) => {
              const isFav = favorites.includes(car.id);
              const isCompared = !!compareList.find((c) => c.id === car.id);
              
              return (
                <div className={styles.card} key={car.id}>
                  {/* Top Image Box */}
                  <div className={styles.imgBox}>
                    <span className={styles.featuredBadge}>ÖNE ÇIKAN</span>
                    <img 
                      src={getImageUrl(car.photos[0])} 
                      alt={car.title} 
                      className={styles.carImg}
                    />
                    <div className={styles.priceTag}>
                      ${typeof car.price === 'number' ? car.price.toLocaleString() : car.price}
                    </div>
                  </div>

                  {/* Details Body */}
                  <div className={styles.cardBody}>
                    <span className={styles.category}>{car.bodyType || 'Otomobil'}</span>
                    <h3 className={styles.carTitle}>{car.title}</h3>
                    
                    <div className={styles.location}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>İstanbul, Türkiye</span>
                    </div>

                    {/* Specs Grid */}
                    <div className={styles.specsGrid}>
                      <div className={styles.specItem}>
                        <svg className={styles.specIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 22h12M4 22V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v18M14 9h4a2 2 0 0 1 2 2v6" />
                        </svg>
                        <span>{car.fuel || 'Benzin'}</span>
                      </div>
                      <div className={styles.specItem}>
                        <svg className={styles.specIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                        <span>{car.km ? `${car.km.toLocaleString()} km` : '35.000 km'}</span>
                      </div>
                      <div className={styles.specItem}>
                        <svg className={styles.specIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="6" width="20" height="12" rx="2" />
                          <path d="M12 6v12M2 12h20" />
                        </svg>
                        <span>{car.engineCapacity ? `${car.engineCapacity} cc` : '1800 cc'}</span>
                      </div>
                      <div className={styles.specItem}>
                        <svg className={styles.specIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="3" />
                          <path d="M12 2v7M12 15v7M2 12h7M15 12h7" />
                        </svg>
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
                        <svg width="16" height="16" viewBox="0 0 24 24" fill={isFav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </button>
                      <button 
                        className={`${styles.actionBtn} ${isCompared ? styles.compareActive : ''}`} 
                        onClick={(e) => toggleCompare(car, e)}
                        title="Karşılaştır"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16 3h5v5M4 20L20 4M21 16v5h-5M4 4l16 16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
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
                  <button className={styles.removeItemBtn} onClick={(e) => toggleCompare(c, e)}>✕</button>
                </div>
              ))}
            </div>
            <div className={styles.drawerActions}>
              <button 
                className={styles.clearBtn}
                onClick={() => { setCompareList([]); setShowCompareDrawer(false); }}
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
              <button className={styles.closeModalBtn} onClick={() => setShowCompareModal(false)}>✕</button>
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
