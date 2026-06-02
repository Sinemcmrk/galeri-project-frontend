'use client';

import React, { useState, useEffect } from 'react';
import styles from './cars.module.css';

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

export default function CarsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState('All');
  const [year, setYear] = useState('All');
  const [fuel, setFuel] = useState('All');
  const [gear, setGear] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Favorites & Compare
  const [favorites, setFavorites] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<Listing[]>([]);

  useEffect(() => {
    async function fetchListings() {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:6000/api/listings');
        if (!res.ok) throw new Error('API error');
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
        }
      } catch (err) {
        console.warn('Fallback static data loaded.', err);
        const fallbackData: Listing[] = [
          {
            id: 'porsche-911-fallback',
            title: 'Porsche 911 Carrera 2017',
            description: 'Kusursuz kondisyonda, tüm bakımları zamanında yapılmış Porsche 911 Carrera.',
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
            description: 'Amerikan kası efsanesi Ford Shelby GT500. Supercharged motor.',
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
            description: 'Efsanevi hiper otomobil McLaren F1. Koleksiyonluk değerde.',
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

  useEffect(() => {
    const saved = localStorage.getItem('favorites_cars');
    if (saved) {
      try { setFavorites(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

  // Filter Trigger
  const applyFilters = () => {
    let result = [...listings];

    if (search.trim() !== '') {
      const q = search.toLowerCase();
      result = result.filter(c => c.title.toLowerCase().includes(q) || (c.modelName && c.modelName.toLowerCase().includes(q)));
    }
    if (brand !== 'All') {
      result = result.filter(c => c.brand === brand);
    }
    if (year !== 'All') {
      result = result.filter(c => c.year === parseInt(year));
    }
    if (fuel !== 'All') {
      result = result.filter(c => c.fuel === fuel);
    }
    if (gear !== 'All') {
      result = result.filter(c => c.gear === gear);
    }
    if (minPrice.trim() !== '') {
      result = result.filter(c => c.price !== null && Number(c.price) >= parseFloat(minPrice));
    }
    if (maxPrice.trim() !== '') {
      result = result.filter(c => c.price !== null && Number(c.price) <= parseFloat(maxPrice));
    }

    setFilteredListings(result);
  };

  const handleReset = () => {
    setSearch('');
    setBrand('All');
    setYear('All');
    setFuel('All');
    setGear('All');
    setMinPrice('');
    setMaxPrice('');
    setFilteredListings(listings);
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
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
    e.stopPropagation();
    const exists = compareList.find(c => c.id === car.id);
    if (exists) {
      setCompareList(compareList.filter(c => c.id !== car.id));
    } else {
      if (compareList.length >= 3) {
        alert('En fazla 3 aracı karşılaştırabilirsiniz.');
        return;
      }
      setCompareList([...compareList, car]);
    }
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
            <label>Marka</label>
            <select value={brand} onChange={e => setBrand(e.target.value)} className={styles.sidebarSelect}>
              <option value="All">Tüm Markalar</option>
              <option value="Porsche">Porsche</option>
              <option value="Ford">Ford</option>
              <option value="McLaren">McLaren</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Model Yılı</label>
            <select value={year} onChange={e => setYear(e.target.value)} className={styles.sidebarSelect}>
              <option value="All">Tüm Yıllar</option>
              <option value="2017">2017</option>
              <option value="2014">2014</option>
              <option value="1996">1996</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Yakıt Türü</label>
            <select value={fuel} onChange={e => setFuel(e.target.value)} className={styles.sidebarSelect}>
              <option value="All">Tüm Yakıtlar</option>
              <option value="Benzin">Benzin</option>
              <option value="Dizel">Dizel</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Şanzıman</label>
            <select value={gear} onChange={e => setGear(e.target.value)} className={styles.sidebarSelect}>
              <option value="All">Tüm Şanzımanlar</option>
              <option value="Otomatik">Otomatik</option>
              <option value="Manuel">Manuel</option>
            </select>
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

          <button className={styles.applyBtn} onClick={applyFilters}>Filtreleri Uygula</button>
        </aside>

        {/* Right Listings Grid */}
        <section className={styles.listingsSection}>
          {loading ? (
            <div className={styles.spinnerContainer}>
              <div className={styles.spinner}></div>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className={styles.noResults}>
              <p>Eşleşen araç bulunamadı. Lütfen filtrelerinizi temizleyin.</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {filteredListings.map(car => {
                const isFav = favorites.includes(car.id);
                const isCompared = !!compareList.find(c => c.id === car.id);
                return (
                  <div className={styles.card} key={car.id}>
                    <div className={styles.imgBox}>
                      <span className={styles.badge}>ÖNE ÇIKAN</span>
                      <img src={getImageUrl(car.photos[0])} alt={car.title} className={styles.carImg} />
                      <div className={styles.price}>
                        ${typeof car.price === 'number' ? car.price.toLocaleString() : car.price}
                      </div>
                    </div>
                    <div className={styles.cardBody}>
                      <span className={styles.category}>{car.bodyType || 'Otomobil'}</span>
                      <h3>{car.title}</h3>
                      <div className={styles.specs}>
                        <span>⛽ {car.fuel || 'Benzin'}</span>
                        <span>🛣️ {car.km ? `${car.km.toLocaleString()} km` : '35k km'}</span>
                        <span>⚙️ {car.gear || 'Otomatik'}</span>
                        <span>📅 {car.year}</span>
                      </div>
                      <div className={styles.actions}>
                        <button 
                          className={`${styles.actionBtn} ${isFav ? styles.favActive : ''}`} 
                          onClick={e => toggleFavorite(car.id, e)}
                        >
                          ❤
                        </button>
                        <button 
                          className={`${styles.actionBtn} ${isCompared ? styles.compareActive : ''}`} 
                          onClick={e => toggleCompare(car, e)}
                        >
                          ⇄
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
