'use client';

import React, { useState } from 'react';
import { CheckCircle2, XCircle, X, Film } from 'lucide-react';
import styles from './ListingForm.module.css';
import { API_BASE_URL, Listing, getImageUrl } from '@/lib/listings';
import { getSession } from '@/lib/auth';
import Select from '@/components/Select/Select';

interface ListingFormProps {
  mode: 'create' | 'edit';
  listing?: Listing;
  onSuccess: (listing: Listing) => void;
  onCancel?: () => void;
}

interface FormState {
  title: string;
  description: string;
  price: string;
  type: 'SALE' | 'RENT';
  brand: string;
  modelName: string;
  year: string;
  color: string;
  fuel: string;
  gear: string;
  km: string;
  enginePower: string;
  engineCapacity: string;
  bodyType: string;
}

function toFormState(listing?: Listing): FormState {
  return {
    title: listing?.title ?? '',
    description: listing?.description ?? '',
    price: listing?.price !== null && listing?.price !== undefined ? String(listing.price) : '',
    type: listing?.type ?? 'SALE',
    brand: listing?.brand ?? '',
    modelName: listing?.modelName ?? '',
    year: listing?.year ? String(listing.year) : '',
    color: listing?.color ?? '',
    fuel: listing?.fuel ?? '',
    gear: listing?.gear ?? '',
    km: listing?.km !== null && listing?.km !== undefined ? String(listing.km) : '',
    enginePower: listing?.enginePower ? String(listing.enginePower) : '',
    engineCapacity: listing?.engineCapacity ? String(listing.engineCapacity) : '',
    bodyType: listing?.bodyType ?? '',
  };
}

export default function ListingForm({ mode, listing, onSuccess, onCancel }: ListingFormProps) {
  const [form, setForm] = useState<FormState>(toFormState(listing));
  const [existingPhotos, setExistingPhotos] = useState<string[]>(listing?.photos ?? []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [existingVideos, setExistingVideos] = useState<string[]>(listing?.videos ?? []);
  const [newVideoFiles, setNewVideoFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setNewFiles(prev => [...prev, ...files]);
    e.target.value = '';
  };

  const removeExistingPhoto = (url: string) => {
    setExistingPhotos(prev => prev.filter(p => p !== url));
  };

  const removeNewFile = (index: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleVideosSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setNewVideoFiles(prev => [...prev, ...files]);
    e.target.value = '';
  };

  const removeExistingVideo = (url: string) => {
    setExistingVideos(prev => prev.filter(v => v !== url));
  };

  const removeNewVideoFile = (index: number) => {
    setNewVideoFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (form.title.trim().length < 5) {
      setErrorMsg('Başlık en az 5 karakter uzunluğunda olmalıdır.');
      return;
    }
    if (form.description.trim().length < 10) {
      setErrorMsg('Açıklama en az 10 karakter uzunluğunda olmalıdır.');
      return;
    }

    const session = getSession();
    if (!session || session.user.role !== 'ADMIN') {
      setErrorMsg('Bu işlem için yönetici olarak giriş yapmalısınız.');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('title', form.title);
      data.append('description', form.description);
      if (form.price) data.append('price', form.price);
      data.append('type', form.type);
      if (form.brand) data.append('brand', form.brand);
      if (form.modelName) data.append('modelName', form.modelName);
      if (form.year) data.append('year', form.year);
      if (form.color) data.append('color', form.color);
      if (form.fuel) data.append('fuel', form.fuel);
      if (form.gear) data.append('gear', form.gear);
      if (form.km) data.append('km', form.km);
      if (form.enginePower) data.append('enginePower', form.enginePower);
      if (form.engineCapacity) data.append('engineCapacity', form.engineCapacity);
      if (form.bodyType) data.append('bodyType', form.bodyType);

      // `photos[]`/`videos[]` force the backend's multipart parser to build an
      // array even when a single item is retained (see append-field's semantics).
      existingPhotos.forEach(url => data.append('photos[]', url));
      existingVideos.forEach(url => data.append('videos[]', url));
      newFiles.forEach(file => data.append('files', file));
      // The backend sorts uploaded "files" into photos/videos by mimetype automatically.
      newVideoFiles.forEach(file => data.append('files', file));

      const url = mode === 'create'
        ? `${API_BASE_URL}/api/listings`
        : `${API_BASE_URL}/api/listings/${listing!.id}`;

      const res = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
        body: data,
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setSuccessMsg(mode === 'create' ? 'İlan başarıyla oluşturuldu!' : 'İlan başarıyla güncellendi!');
        onSuccess(json.data);
        if (mode === 'create') {
          setForm(toFormState());
          setExistingPhotos([]);
          setNewFiles([]);
          setExistingVideos([]);
          setNewVideoFiles([]);
        }
      } else {
        setErrorMsg(json.message || 'İşlem gerçekleştirilemedi.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Sunucuya bağlanılamadı. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formCard}>
      <h2>{mode === 'create' ? 'Araç Özellikleri' : 'İlanı Düzenle'}</h2>

      {successMsg && <div className={styles.successAlert}><CheckCircle2 size={16} /> {successMsg}</div>}
      {errorMsg && <div className={styles.errorAlert}><XCircle size={16} /> {errorMsg}</div>}

      <div className={styles.formGrid}>
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label>İlan Başlığı *</label>
          <input type="text" name="title" placeholder="Örn: Sahibinden Tertemiz Porsche 911 Carrera S" value={form.title} onChange={handleChange} required />
        </div>

        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label>İlan Açıklaması *</label>
          <textarea name="description" placeholder="Aracın boya, kaza durumu, servis bakımları hakkında detaylı bilgi verin..." value={form.description} onChange={handleChange} rows={4} required />
        </div>

        <div className={styles.formGroup}>
          <label>İlan Tipi</label>
          <Select name="type" value={form.type} onChange={handleChange}>
            <option value="SALE">Satılık</option>
            <option value="RENT">Kiralık</option>
          </Select>
        </div>

        <div className={styles.formGroup}>
          <label>Fiyat ($)</label>
          <input type="number" name="price" placeholder="Fiyatı girin (opsiyonel)" value={form.price} onChange={handleChange} />
        </div>

        <div className={styles.formGroup}>
          <label>Marka</label>
          <input type="text" name="brand" placeholder="Örn: Porsche" value={form.brand} onChange={handleChange} />
        </div>

        <div className={styles.formGroup}>
          <label>Model İsmi</label>
          <input type="text" name="modelName" placeholder="Örn: 911 Carrera S" value={form.modelName} onChange={handleChange} />
        </div>

        <div className={styles.formGroup}>
          <label>Model Yılı</label>
          <input type="number" name="year" placeholder="Örn: 2022" value={form.year} onChange={handleChange} />
        </div>

        <div className={styles.formGroup}>
          <label>Renk</label>
          <input type="text" name="color" placeholder="Örn: Siyah" value={form.color} onChange={handleChange} />
        </div>

        <div className={styles.formGroup}>
          <label>Kilometre (KM)</label>
          <input type="number" name="km" placeholder="Kilometre bilgisini girin" value={form.km} onChange={handleChange} />
        </div>

        <div className={styles.formGroup}>
          <label>Yakıt Türü</label>
          <Select name="fuel" value={form.fuel} onChange={handleChange}>
            <option value="">Seçiniz</option>
            <option value="Benzin">Benzin</option>
            <option value="Dizel">Dizel</option>
            <option value="Elektrik">Elektrik</option>
            <option value="Hibrit">Hibrit</option>
          </Select>
        </div>

        <div className={styles.formGroup}>
          <label>Şanzıman</label>
          <Select name="gear" value={form.gear} onChange={handleChange}>
            <option value="">Seçiniz</option>
            <option value="Otomatik">Otomatik</option>
            <option value="Manuel">Manuel</option>
          </Select>
        </div>

        <div className={styles.formGroup}>
          <label>Kasa Tipi</label>
          <Select name="bodyType" value={form.bodyType} onChange={handleChange}>
            <option value="">Seçiniz</option>
            <option value="Coupe">Coupe</option>
            <option value="Sedan">Sedan</option>
            <option value="SUV">SUV</option>
            <option value="Hatchback">Hatchback</option>
            <option value="Sports Car">Spor Araba</option>
          </Select>
        </div>

        <div className={styles.formGroup}>
          <label>Motor Gücü (HP)</label>
          <input type="number" name="enginePower" placeholder="Örn: 350" value={form.enginePower} onChange={handleChange} />
        </div>

        <div className={styles.formGroup}>
          <label>Motor Hacmi (CC)</label>
          <input type="number" name="engineCapacity" placeholder="Örn: 2995" value={form.engineCapacity} onChange={handleChange} />
        </div>

        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label>Araç Görselleri</label>
          <input type="file" accept="image/*" multiple onChange={handleFilesSelected} />

          {(existingPhotos.length > 0 || newFiles.length > 0) && (
            <div className={styles.photoPreviewGrid}>
              {existingPhotos.map(url => (
                <div className={styles.photoThumb} key={url}>
                  <img src={getImageUrl(url)} alt="" />
                  <button type="button" onClick={() => removeExistingPhoto(url)} aria-label="Fotoğrafı kaldır"><X size={12} /></button>
                </div>
              ))}
              {newFiles.map((file, idx) => (
                <div className={styles.photoThumb} key={`${file.name}-${idx}`}>
                  <img src={URL.createObjectURL(file)} alt="" />
                  <button type="button" onClick={() => removeNewFile(idx)} aria-label="Fotoğrafı kaldır"><X size={12} /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label>Araç Videoları</label>
          <input type="file" accept="video/*" multiple onChange={handleVideosSelected} />
          <p className={styles.fieldHint}>MP4, MOV, AVI, MKV veya WebM — en fazla 100MB.</p>

          {(existingVideos.length > 0 || newVideoFiles.length > 0) && (
            <ul className={styles.videoList}>
              {existingVideos.map(url => (
                <li key={url}>
                  <span><Film size={14} /> <span className={styles.videoName}>{url.split('/').pop()}</span></span>
                  <button type="button" onClick={() => removeExistingVideo(url)} aria-label="Videoyu kaldır"><X size={13} /></button>
                </li>
              ))}
              {newVideoFiles.map((file, idx) => (
                <li key={`${file.name}-${idx}`}>
                  <span><Film size={14} /> <span className={styles.videoName}>{file.name}</span></span>
                  <button type="button" onClick={() => removeNewVideoFile(idx)} aria-label="Videoyu kaldır"><X size={13} /></button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className={styles.formActions}>
        <button type="submit" disabled={loading} className={styles.submitBtn}>
          {loading ? 'Gönderiliyor...' : mode === 'create' ? 'İLAN OLUŞTUR' : 'DEĞİŞİKLİKLERİ KAYDET'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className={styles.cancelBtn}>
            İptal
          </button>
        )}
      </div>
    </form>
  );
}
