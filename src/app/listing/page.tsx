'use client';

import React, { useState } from 'react';
import styles from './listing.module.css';

interface ListingInput {
  title: string;
  description: string;
  price: string;
  brand: string;
  modelName: string;
  year: string;
  fuel: string;
  gear: string;
  km: string;
  enginePower: string;
  engineCapacity: string;
  bodyType: string;
  photoUrl: string;
}

export default function ListingPage() {
  const [form, setForm] = useState<ListingInput>({
    title: '',
    description: '',
    price: '',
    brand: 'Porsche',
    modelName: '',
    year: '2024',
    fuel: 'Benzin',
    gear: 'Otomatik',
    km: '',
    enginePower: '',
    engineCapacity: '',
    bodyType: 'Coupe',
    photoUrl: '/uploads/images/porsche_911.jpg', // default
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mockPhotos = [
    { name: 'Kırmızı Porsche 911 şablonu', url: '/uploads/images/porsche_911.jpg' },
    { name: 'Mavi Shelby GT500 şablonu', url: '/uploads/images/shelby_gt500.jpg' },
    { name: 'Gümüş McLaren F1 şablonu', url: '/uploads/images/mclaren_f1.jpg' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    // Validate
    if (form.title.length < 5) {
      setErrorMsg('Başlık en az 5 karakter uzunluğunda olmalıdır.');
      setLoading(false);
      return;
    }
    if (form.description.length < 10) {
      setErrorMsg('Açıklama en az 10 karakter uzunluğunda olmalıdır.');
      setLoading(false);
      return;
    }

    const payload = {
      title: form.title,
      description: form.description,
      price: form.price ? parseFloat(form.price) : null,
      type: 'SALE',
      brand: form.brand,
      modelName: form.modelName || 'Model X',
      year: parseInt(form.year),
      fuel: form.fuel,
      gear: form.gear,
      km: form.km ? parseInt(form.km) : 0,
      enginePower: form.enginePower ? parseInt(form.enginePower) : 150,
      engineCapacity: form.engineCapacity ? parseInt(form.engineCapacity) : 1600,
      bodyType: form.bodyType,
      photos: [form.photoUrl],
      videos: [],
    };

    try {
      // 1. Try backend POST
      const res = await fetch('http://localhost:6000/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccessMsg('İlanınız başarıyla veritabanına eklendi!');
        setForm({
          title: '',
          description: '',
          price: '',
          brand: 'Porsche',
          modelName: '',
          year: '2024',
          fuel: 'Benzin',
          gear: 'Otomatik',
          km: '',
          enginePower: '',
          engineCapacity: '',
          bodyType: 'Coupe',
          photoUrl: '/uploads/images/porsche_911.jpg',
        });
      } else {
        // Fallback to local storage (unauthorized / session missing)
        const localListingsKey = 'local_listings_cars';
        const existing = localStorage.getItem(localListingsKey);
        const list = existing ? JSON.parse(existing) : [];
        
        const newLocalItem = {
          ...payload,
          id: 'local-' + Date.now(),
        };

        localStorage.setItem(localListingsKey, JSON.stringify([newLocalItem, ...list]));
        setSuccessMsg('İlanınız yerel olarak başarıyla kaydedildi ve tüm listelere eklendi!');
        
        // Reset form
        setForm({
          title: '',
          description: '',
          price: '',
          brand: 'Porsche',
          modelName: '',
          year: '2024',
          fuel: 'Benzin',
          gear: 'Otomatik',
          km: '',
          enginePower: '',
          engineCapacity: '',
          bodyType: 'Coupe',
          photoUrl: '/uploads/images/porsche_911.jpg',
        });
      }
    } catch (err) {
      console.warn('Backend POST failed. Saving locally.', err);
      // Fallback to local storage
      const localListingsKey = 'local_listings_cars';
      const existing = localStorage.getItem(localListingsKey);
      const list = existing ? JSON.parse(existing) : [];
      
      const newLocalItem = {
        ...payload,
        id: 'local-' + Date.now(),
      };

      localStorage.setItem(localListingsKey, JSON.stringify([newLocalItem, ...list]));
      setSuccessMsg('Sunucu bağlantısı kurulamadı. İlanınız yerel olarak başarıyla kaydedildi ve listelere eklendi!');
      
      // Reset form
      setForm({
        title: '',
        description: '',
        price: '',
        brand: 'Porsche',
        modelName: '',
        year: '2024',
        fuel: 'Benzin',
        gear: 'Otomatik',
        km: '',
        enginePower: '',
        engineCapacity: '',
        bodyType: 'Coupe',
        photoUrl: '/uploads/images/porsche_911.jpg',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerBanner}>
        <h1>Yeni İlan Oluştur</h1>
        <p>Satmak istediğiniz premium aracınızın detaylarını girin.</p>
      </div>

      <div className={styles.content}>
        <form onSubmit={handleSubmit} className={styles.formCard}>
          <h2>Araç Özellikleri</h2>
          
          {successMsg && <div className={styles.successAlert}>✅ {successMsg}</div>}
          {errorMsg && <div className={styles.errorAlert}>❌ {errorMsg}</div>}

          <div className={styles.formGrid}>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>İlan Başlığı *</label>
              <input 
                type="text" 
                name="title" 
                placeholder="Örn: Sahibinden Tertemiz Porsche 911 Carrera S" 
                value={form.title} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>İlan Açıklaması *</label>
              <textarea 
                name="description" 
                placeholder="Aracın boya, kaza durumu, servis bakımları hakkında detaylı bilgi verin..." 
                value={form.description} 
                onChange={handleChange} 
                rows={4}
                required 
              />
            </div>

            <div className={styles.formGroup}>
              <label>Fiyat ($) *</label>
              <input 
                type="number" 
                name="price" 
                placeholder="Fiyatı girin" 
                value={form.price} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className={styles.formGroup}>
              <label>Marka *</label>
              <select name="brand" value={form.brand} onChange={handleChange}>
                <option value="Porsche">Porsche</option>
                <option value="Ford">Ford</option>
                <option value="McLaren">McLaren</option>
                <option value="BMW">BMW</option>
                <option value="Mercedes">Mercedes</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Model İsmi *</label>
              <input 
                type="text" 
                name="modelName" 
                placeholder="Örn: 911 Carrera S, Mustang GT" 
                value={form.modelName} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className={styles.formGroup}>
              <label>Model Yılı *</label>
              <select name="year" value={form.year} onChange={handleChange}>
                {Array.from({ length: 30 }, (_, i) => 2026 - i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Kilometre (KM) *</label>
              <input 
                type="number" 
                name="km" 
                placeholder="Kilometre bilgisini girin" 
                value={form.km} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className={styles.formGroup}>
              <label>Yakıt Türü *</label>
              <select name="fuel" value={form.fuel} onChange={handleChange}>
                <option value="Benzin">Benzin</option>
                <option value="Dizel">Dizel</option>
                <option value="Elektrik">Elektrik</option>
                <option value="Hibrit">Hibrit</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Şanzıman *</label>
              <select name="gear" value={form.gear} onChange={handleChange}>
                <option value="Otomatik">Otomatik</option>
                <option value="Manuel">Manuel</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Kasa Tipi *</label>
              <select name="bodyType" value={form.bodyType} onChange={handleChange}>
                <option value="Coupe">Coupe</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Hatchback">Hatchback</option>
                <option value="Sports">Spor Araba</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Motor Gücü (HP)</label>
              <input 
                type="number" 
                name="enginePower" 
                placeholder="Örn: 350" 
                value={form.enginePower} 
                onChange={handleChange} 
              />
            </div>

            <div className={styles.formGroup}>
              <label>Motor Hacmi (CC)</label>
              <input 
                type="number" 
                name="engineCapacity" 
                placeholder="Örn: 2995" 
                value={form.engineCapacity} 
                onChange={handleChange} 
              />
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>Araç Görsel Şablonu</label>
              <select name="photoUrl" value={form.photoUrl} onChange={handleChange}>
                {mockPhotos.map(p => (
                  <option key={p.url} value={p.url}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? 'İlan Gönderiliyor...' : 'İLAN OLUŞTUR'}
          </button>
        </form>
      </div>
    </div>
  );
}
