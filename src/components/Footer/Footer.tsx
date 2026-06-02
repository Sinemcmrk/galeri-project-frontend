import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Brand Box */}
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              <svg className={styles.logoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9C2 11.2 2 11.6 2 12v4c0 .6.4 1 1 1h2" />
                <circle cx="7" cy="17" r="2" />
                <circle cx="17" cy="17" r="2" />
              </svg>
              <span>Car</span>Spot
            </Link>
            <p className={styles.brandDesc}>
              Hayalinizdeki lüks, spor ve premium otomobillere en güvenli ve en kolay yoldan ulaşmanızı sağlıyoruz.
            </p>
          </div>

          {/* Quick Links */}
          <div className={styles.links}>
            <h4>Hızlı Menü</h4>
            <ul>
              <li><Link href="/">Ana Sayfa</Link></li>
              <li><Link href="/cars">İlanlar</Link></li>
              <li><Link href="/compare">Karşılaştırma</Link></li>
              <li><Link href="/about">Hakkımızda</Link></li>
              <li><Link href="/faq">Sıkça Sorulan Sorular</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className={styles.links}>
            <h4>Kategoriler</h4>
            <ul>
              <li><Link href="/cars?bodyType=Coupe">Coupe İlanları</Link></li>
              <li><Link href="/cars?bodyType=Sports">Hiper Spor Araçlar</Link></li>
              <li><Link href="/cars?bodyType=SUV">Premium SUV</Link></li>
              <li><Link href="/cars?type=RENT">Kiralık Otomobiller</Link></li>
            </ul>
          </div>

          {/* Contact details */}
          <div className={styles.contact}>
            <h4>İletişim Bilgileri</h4>
            <p>
              <strong>Adres:</strong> Otomotiv Plaza Kat:2 No:12, Ataşehir, İstanbul
            </p>
            <p>
              <strong>Telefon:</strong> 555 222 333 444
            </p>
            <p>
              <strong>E-posta:</strong> destek@carspot.com
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className={styles.bottom}>
          <p>&copy; {new Date().getFullYear()} CarSpot. Tüm hakları saklıdır.</p>
          <div className={styles.bottomLinks}>
            <Link href="/privacy">Gizlilik Politikası</Link>
            <span className={styles.sep}>•</span>
            <Link href="/terms">Kullanım Koşulları</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
