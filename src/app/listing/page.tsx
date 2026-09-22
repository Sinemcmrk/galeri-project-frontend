'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './listing.module.css';
import ListingForm from '@/components/ListingForm/ListingForm';
import { getSession, SessionUser } from '@/lib/auth';

export default function ListingPage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setUser(getSession()?.user ?? null);
    setChecked(true);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.headerBanner}>
        <h1>Yeni İlan Oluştur</h1>
        <p>Satmak istediğiniz premium aracınızın detaylarını girin.</p>
      </div>

      <div className={styles.content}>
        {!checked ? null : user?.role === 'ADMIN' ? (
          <ListingForm mode="create" onSuccess={() => {}} />
        ) : (
          <div className={styles.formCard}>
            <h2>Giriş Gerekli</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              Yeni bir ilan oluşturabilmek için yönetici hesabınızla giriş yapmanız gerekiyor.
            </p>
            <Link href="/login" className={styles.submitBtn} style={{ display: 'inline-block', textAlign: 'center', textDecoration: 'none' }}>
              GİRİŞ YAP
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
