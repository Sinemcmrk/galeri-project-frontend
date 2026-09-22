import React from 'react';
import { Metadata } from 'next';
import styles from './terms.module.css';

export const metadata: Metadata = {
  title: 'Kullanım Koşulları | CarSpot',
  description: 'CarSpot platformunu kullanırken geçerli olan kurallar ve koşullar.',
};

export default function TermsPage() {
  return (
    <div className={styles.container}>
      <section className={styles.heroSection}>
        <h1 className={styles.title}>Kullanım Koşulları</h1>
        <p className={styles.subtitle}>Son güncelleme: 2026</p>
      </section>

      <div className={styles.content}>
        <div>
          <h2>1. Hizmet Tanımı</h2>
          <p>
            CarSpot, araç alıcılarını ve satıcılarını bir araya getiren bir ilan listeleme platformudur.
            İlanların oluşturulması ve yönetimi platform yöneticisine aittir; ziyaretçiler ilanları
            görüntüleyebilir, favorilere ekleyebilir, karşılaştırabilir ve ilan sahibiyle iletişime geçebilir.
          </p>
        </div>

        <div>
          <h2>2. İlan İçeriğinin Doğruluğu</h2>
          <p>
            İlanlarda yer alan fiyat, kilometre, teknik özellik ve fotoğraflar ilan sahibi tarafından girilir.
            CarSpot, ilan içeriklerinin doğruluğunu garanti etmez; alım satım öncesinde aracı yerinde
            incelemenizi öneririz.
          </p>
        </div>

        <div>
          <h2>3. İletişim ve Mesajlaşma</h2>
          <ul>
            <li>Sohbet üzerinden paylaşılan bilgilerin doğruluğundan gönderen taraf sorumludur.</li>
            <li>Yanıltıcı, uygunsuz veya kötüye kullanım amaçlı mesajlaşma yasaktır.</li>
            <li>Platform, gerekli gördüğü durumlarda bir görüşmeyi sonlandırma hakkını saklı tutar.</li>
          </ul>
        </div>

        <div>
          <h2>4. Fiyat ve Arama Alarmları</h2>
          <p>
            Bıraktığınız e-posta adresi yalnızca talep ettiğiniz fiyat düşüşü veya yeni ilan bildirimlerini
            göndermek için kullanılır; abonelikten istediğiniz zaman çıkabilirsiniz.
          </p>
        </div>

        <div>
          <h2>5. Değişiklikler</h2>
          <p>
            Bu koşullar zaman zaman güncellenebilir. Güncel sürüm her zaman bu sayfada yayınlanır.
          </p>
        </div>
      </div>
    </div>
  );
}
