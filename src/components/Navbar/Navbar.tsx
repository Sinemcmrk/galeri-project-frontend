'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './Navbar.module.css';

export const Navbar: React.FC = () => {
  const [lang, setLang] = useState('TR');
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  return (
    <header className={styles.header}>
      {/* Top Utility Bar */}
      <div className={styles.topBar}>
        <div className={styles.topContainer}>
          <div className={styles.topLeft}>
            <Link href="/about" className={styles.topLink}>Hakkımızda</Link>
            <span className={styles.divider}>|</span>
            <Link href="/faq" className={styles.topLink}>SSS</Link>
            <span className={styles.divider}>|</span>
            <div className={styles.langSelector}>
              <button 
                className={styles.langButton}
                onClick={() => setShowLangDropdown(!showLangDropdown)}
              >
                🌐 Dil: {lang}
              </button>
              {showLangDropdown && (
                <div className={styles.langDropdown}>
                  <button onClick={() => { setLang('TR'); setShowLangDropdown(false); }}>Türkçe (TR)</button>
                  <button onClick={() => { setLang('EN'); setShowLangDropdown(false); }}>English (EN)</button>
                </div>
              )}
            </div>
          </div>
          <div className={styles.topRight}>
            <div className={styles.phoneSupport}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span>Destek Hattı:</span> <strong>555 222 333 444</strong>
            </div>
            <span className={styles.divider}>|</span>
            <Link href="/login" className={styles.topLink}>🔑 Giriş Yap</Link>
            <span className={styles.divider}>|</span>
            <Link href="/register" className={styles.topLink}>👤 Kayıt Ol</Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className={styles.mainNavbar}>
        <div className={styles.mainContainer}>
          <Link href="/" className={styles.logo}>
            <svg className={styles.logoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9C2 11.2 2 11.6 2 12v4c0 .6.4 1 1 1h2" />
              <circle cx="7" cy="17" r="2" />
              <circle cx="17" cy="17" r="2" />
            </svg>
            <span>Car</span>Spot
          </Link>
          
          <nav className={styles.nav}>
            <ul className={styles.navList}>
              <li><Link href="/" className={`${styles.navLink} ${styles.active}`}>ANA SAYFA</Link></li>
              <li><Link href="/cars" className={styles.navLink}>İLANLAR</Link></li>
              <li><Link href="/reviews" className={styles.navLink}>YORUMLAR</Link></li>
              <li><Link href="/compare" className={styles.navLink}>KARŞILAŞTIR</Link></li>
              <li><Link href="/dashboard" className={styles.navLink}>YÖNETİM</Link></li>
            </ul>
          </nav>

          <Link href="/listing" className={styles.sellBtn}>
            ARACINI SAT
          </Link>
        </div>
      </div>
    </header>
  );
};
