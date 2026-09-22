'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeftRight, X } from 'lucide-react';
import styles from './compare.module.css';
import { Listing, getImageUrl, getCompareList, saveCompareList } from '@/lib/listings';

export default function ComparePage() {
  const [compareList, setCompareList] = useState<Listing[]>([]);

  useEffect(() => {
    // Shared with the homepage, catalogue and detail pages via localStorage
    setCompareList(getCompareList());
  }, []);

  const handleRemove = (id: string) => {
    const updated = compareList.filter(c => c.id !== id);
    setCompareList(updated);
    saveCompareList(updated);
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerBanner}>
        <h1>Araç Karşılaştırma</h1>
        <p>Premium araçlarımızın detaylı özelliklerini yan yana kıyaslayın.</p>
      </div>

      <div className={styles.content}>
        {compareList.length === 0 ? (
          <div className={styles.emptyState}>
            <ArrowLeftRight size={56} strokeWidth={1.5} />
            <h2>Karşılaştırma Listeniz Boş</h2>
            <p>Kıyaslamak istediğiniz araçları katalog sayfamızdan ekleyebilirsiniz.</p>
            <Link href="/cars" className={styles.goBtn}>
              Kataloğa Git
            </Link>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.compareTable}>
              <thead>
                <tr>
                  <th>Özellikler</th>
                  {compareList.map(c => (
                    <th key={c.id} className={styles.carHeader}>
                      <button className={styles.removeBtn} onClick={() => handleRemove(c.id)} aria-label="Karşılaştırmadan çıkar"><X size={13} /></button>
                      <img src={getImageUrl(c.photos[0])} alt={c.title} className={styles.carImg} />
                      <h3>{c.title}</h3>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Fiyat</strong></td>
                  {compareList.map(c => (
                    <td key={c.id} className={styles.price}>
                      ${typeof c.price === 'number' ? c.price.toLocaleString() : c.price}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td><strong>Marka</strong></td>
                  {compareList.map(c => <td key={c.id}>{c.brand || '-'}</td>)}
                </tr>
                <tr>
                  <td><strong>Model</strong></td>
                  {compareList.map(c => <td key={c.id}>{c.modelName || '-'}</td>)}
                </tr>
                <tr>
                  <td><strong>Yıl</strong></td>
                  {compareList.map(c => <td key={c.id}>{c.year || '-'}</td>)}
                </tr>
                <tr>
                  <td><strong>Kasa Tipi</strong></td>
                  {compareList.map(c => <td key={c.id}>{c.bodyType || '-'}</td>)}
                </tr>
                <tr>
                  <td><strong>Yakıt Türü</strong></td>
                  {compareList.map(c => <td key={c.id}>{c.fuel || '-'}</td>)}
                </tr>
                <tr>
                  <td><strong>Şanzıman</strong></td>
                  {compareList.map(c => <td key={c.id}>{c.gear || '-'}</td>)}
                </tr>
                <tr>
                  <td><strong>Kilometre</strong></td>
                  {compareList.map(c => <td key={c.id}>{c.km ? `${c.km.toLocaleString()} km` : '-'}</td>)}
                </tr>
                <tr>
                  <td><strong>Motor Gücü (HP)</strong></td>
                  {compareList.map(c => <td key={c.id}>{c.enginePower ? `${c.enginePower} HP` : '-'}</td>)}
                </tr>
                <tr>
                  <td><strong>Motor Hacmi (CC)</strong></td>
                  {compareList.map(c => <td key={c.id}>{c.engineCapacity ? `${c.engineCapacity} cc` : '-'}</td>)}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
