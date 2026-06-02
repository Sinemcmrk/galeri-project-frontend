import React from 'react';
import styles from './about.module.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hakkımızda | CarSpot',
  description: 'CarSpot hakkında daha fazla bilgi edinin. Vizyonumuz, misyonumuz ve başarılarımız.',
};

export default function AboutPage() {
  return (
    <div className={styles.aboutContainer}>
      <section className={styles.heroSection}>
        <h1 className={styles.title}>Hakkımızda</h1>
        <p className={styles.subtitle}>
          CarSpot olarak, hayalinizdeki araca en güvenilir, hızlı ve şeffaf yoldan ulaşmanızı sağlıyoruz.
        </p>
      </section>

      <section className={styles.contentSection}>
        <div className={styles.textBlock}>
          <h2>Biz Kimiz?</h2>
          <p>
            CarSpot, otomotiv sektöründe yılların verdiği deneyimle, alıcı ve satıcıları güvenilir bir platformda buluşturan öncü bir araç listeleme platformudur. Amacımız, ikinci el ve sıfır araç alım satım sürecini herkes için kolay, güvenli ve stressiz bir deneyime dönüştürmektir.
          </p>
          <p>
            Her gün binlerce yeni ilanın eklendiği platformumuzda, geniş filtreleme seçeneklerimizle tam aradığınız aracı dakikalar içinde bulabilirsiniz. Uzman ekibimiz, platformdaki ilanların kalitesini ve güvenilirliğini sürekli denetleyerek size en iyi hizmeti sunmak için çalışmaktadır.
          </p>
        </div>

        <div className={styles.textBlock}>
          <h2>Vizyonumuz & Misyonumuz</h2>
          <p>
            <strong>Vizyonumuz:</strong> Otomotiv ekosisteminde dijital dönüşüme liderlik ederek, Türkiye'nin en çok tercih edilen, en yenilikçi ve en güvenilir araç platformu olmak.
          </p>
          <p>
            <strong>Misyonumuz:</strong> Kullanıcı dostu arayüzümüz, ileri teknoloji altyapımız ve şeffaflık ilkemizle, araç alım satım sürecindeki tüm zorlukları ortadan kaldırmak ve kullanıcılarımıza kusursuz bir deneyim yaşatmak.
          </p>
        </div>

        <div className={styles.statsSection}>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>10B+</span>
            <span className={styles.statLabel}>Mutlu Müşteri</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>50B+</span>
            <span className={styles.statLabel}>Aktif İlan</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>15+</span>
            <span className={styles.statLabel}>Yıllık Deneyim</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>81</span>
            <span className={styles.statLabel}>İlde Hizmet</span>
          </div>
        </div>
      </section>
    </div>
  );
}
