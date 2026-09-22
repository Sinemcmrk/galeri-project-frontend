import React from 'react';
import { Metadata } from 'next';
import styles from './privacy.module.css';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası | CarSpot',
  description: 'CarSpot gizlilik politikası: hangi verileri topluyoruz, nasıl kullanıyoruz ve nasıl koruyoruz.',
};

export default function PrivacyPage() {
  return (
    <div className={styles.container}>
      <section className={styles.heroSection}>
        <h1 className={styles.title}>Gizlilik Politikası</h1>
        <p className={styles.subtitle}>Son güncelleme: 2026</p>
      </section>

      <div className={styles.content}>
        <div>
          <h2>1. Topladığımız Bilgiler</h2>
          <p>
            Bir ilan sahibiyle iletişime geçtiğinizde adınızı ve e-posta adresinizi, fiyat veya arama alarmına
            abone olduğunuzda yalnızca e-posta adresinizi alırız. İlanları görüntülemek, favorilere eklemek
            veya karşılaştırmak için herhangi bir kişisel bilgi paylaşmanız gerekmez.
          </p>
        </div>

        <div>
          <h2>2. Bilgilerinizi Nasıl Kullanıyoruz</h2>
          <ul>
            <li>İlan sahibiyle aranızdaki mesajlaşmayı iletmek için</li>
            <li>Talep ettiğiniz fiyat düşüşü ve yeni ilan bildirimlerini göndermek için</li>
            <li>Platformun güvenliğini ve hizmet kalitesini korumak için</li>
          </ul>
        </div>

        <div>
          <h2>3. Bilgilerinizi Kimlerle Paylaşıyoruz</h2>
          <p>
            İletişime geçtiğiniz ilanın sahibi dışında bilgileriniz üçüncü taraflarla paylaşılmaz veya
            pazarlama amacıyla satılmaz.
          </p>
        </div>

        <div>
          <h2>4. Verilerinizin Saklanması</h2>
          <p>
            Mesajlaşma geçmişiniz ve alarm abonelikleriniz, ilgili görüşme veya abonelik sona erene ya da
            silme talebinde bulunana kadar sistemde tutulur.
          </p>
        </div>

        <div>
          <h2>5. Haklarınız</h2>
          <p>
            Sakladığımız verilerin silinmesini veya düzeltilmesini talep etmek için{' '}
            <a href="mailto:destek@carspot.com">destek@carspot.com</a> adresinden bizimle iletişime geçebilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
}
