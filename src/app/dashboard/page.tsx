'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Car, CheckCircle2, MessageCircle, Bell } from 'lucide-react';
import styles from './dashboard.module.css';
import { API_BASE_URL } from '@/lib/listings';
import { getSession, SessionUser } from '@/lib/auth';
import ListingsSection from './sections/ListingsSection';
import MessagesSection from './sections/MessagesSection';
import AlertsSection from './sections/AlertsSection';
import TemplatesSection from './sections/TemplatesSection';
import MediaSection from './sections/MediaSection';

interface DashboardStats {
  listings: { total: number; active: number; passive: number; archived: number; sale: number; rent: number };
  chats: { total: number; active: number; ended: number; archived: number };
  alerts: { totalPriceAlerts: number; totalSavedSearches: number; total: number };
}

type SectionKey = 'listings' | 'messages' | 'alerts' | 'templates' | 'media';

const SECTIONS: { key: SectionKey; label: string }[] = [
  { key: 'listings', label: 'İlanlar' },
  { key: 'messages', label: 'Mesajlar' },
  { key: 'alerts', label: 'Alarmlar' },
  { key: 'templates', label: 'E-posta Şablonları' },
  { key: 'media', label: 'Medya' },
];

export default function DashboardPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activeSection, setActiveSection] = useState<SectionKey>('listings');

  // Gate the whole dashboard behind an ADMIN session
  useEffect(() => {
    const session = getSession();
    if (!session || session.user.role !== 'ADMIN') {
      router.replace('/login');
      return;
    }
    setUser(session.user);
    setToken(session.token);
    setAuthChecked(true);
  }, [router]);

  const loadStats = useCallback(async (authToken: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/dashboard/stats`, { headers: { Authorization: `Bearer ${authToken}` } });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) setStats(json.data);
      }
    } catch (err) {
      console.warn('Could not load dashboard stats.', err);
    }
  }, []);

  useEffect(() => {
    if (authChecked && token) loadStats(token);
  }, [authChecked, token, loadStats]);

  if (!authChecked || !token) {
    return (
      <div className={styles.container}>
        <div className={styles.headerBanner}>
          <p>Yönlendiriliyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerBanner}>
        <h1>Yönetici Paneli</h1>
        <p>Hoş geldiniz, {user?.name || user?.email}. Araç envanteri, müşteri görüşmeleri ve sistem istatistikleri.</p>
      </div>

      <div className={styles.content}>
        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><Car size={26} /></div>
            <div className={styles.statInfo}>
              <h3>{stats?.listings.total ?? '-'}</h3>
              <p>Toplam Araç</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><CheckCircle2 size={26} /></div>
            <div className={styles.statInfo}>
              <h3>{stats?.listings.active ?? '-'}</h3>
              <p>Yayındaki İlan</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><MessageCircle size={26} /></div>
            <div className={styles.statInfo}>
              <h3>{stats?.chats.total ?? '-'}</h3>
              <p>Toplam Görüşme</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><Bell size={26} /></div>
            <div className={styles.statInfo}>
              <h3>{stats?.alerts.total ?? '-'}</h3>
              <p>Aktif Alarm Aboneliği</p>
            </div>
          </div>
        </div>

        {/* Section Navigation */}
        <div className={styles.sectionTabRow}>
          {SECTIONS.map(s => (
            <button
              key={s.key}
              className={`${styles.sectionTabBtn} ${activeSection === s.key ? styles.sectionTabBtnActive : ''}`}
              onClick={() => setActiveSection(s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>

        {activeSection === 'listings' && <ListingsSection token={token} />}
        {activeSection === 'messages' && <MessagesSection token={token} />}
        {activeSection === 'alerts' && <AlertsSection token={token} />}
        {activeSection === 'templates' && <TemplatesSection token={token} />}
        {activeSection === 'media' && <MediaSection token={token} />}
      </div>
    </div>
  );
}
