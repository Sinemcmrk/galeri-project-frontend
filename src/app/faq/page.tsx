import React from 'react';
import { Metadata } from 'next';
import styles from './faq.module.css';

export const metadata: Metadata = {
  title: 'Sıkça Sorulan Sorular | CarSpot',
  description: 'CarSpot kullanımı, ilan verme ve satın alma süreciyle ilgili sıkça sorulan sorular.',
};

const FAQS = [
  {
    question: 'CarSpot üzerinden nasıl ilan verebilirim?',
    answer: 'Yönetici hesabınızla giriş yaptıktan sonra "Aracını Sat" butonuna tıklayarak aracınızın detaylarını ve fotoğraflarını girip ilanınızı yayınlayabilirsiniz.',
  },
  {
    question: 'Bir ilana nasıl mesaj gönderebilirim?',
    answer: 'İlan detay sayfasındaki "Satıcıyla İletişime Geç" bölümünden adınızı, e-posta adresinizi ve mesajınızı girerek satıcıyla doğrudan iletişime geçebilirsiniz. Üyelik gerekmez.',
  },
  {
    question: 'Fiyatı düşen ilanlardan nasıl haberdar olurum?',
    answer: 'İlgilendiğiniz ilanın detay sayfasında yer alan "Fiyat düşerse haberdar ol" formuna e-posta adresinizi girmeniz yeterli. Fiyat düştüğünde otomatik olarak e-posta ile bilgilendirilirsiniz.',
  },
  {
    question: 'Kriterlerime uygun yeni ilanlardan haberdar olabilir miyim?',
    answer: 'Evet. İlanlar sayfasındaki filtreleri ayarladıktan sonra "Bu aramayı kaydet" bölümünden e-posta adresinizi bırakabilirsiniz; kriterlerinize uyan yeni bir ilan yayınlandığında size haber veririz.',
  },
  {
    question: 'Araçları nasıl karşılaştırabilirim?',
    answer: 'İlan kartlarındaki karşılaştırma simgesine tıklayarak en fazla 3 aracı karşılaştırma listenize ekleyebilir, ardından "Karşılaştır" sayfasından özelliklerini yan yana inceleyebilirsiniz.',
  },
  {
    question: 'Bir üyelik oluşturmam gerekiyor mu?',
    answer: 'İlanları görüntülemek, favorilere eklemek, karşılaştırmak ve satıcıyla mesajlaşmak için üyelik gerekmez. İlan yayınlamak ise yalnızca yönetici hesaplarına açıktır.',
  },
];

export default function FaqPage() {
  return (
    <div className={styles.container}>
      <section className={styles.heroSection}>
        <h1 className={styles.title}>Sıkça Sorulan Sorular</h1>
        <p className={styles.subtitle}>
          Aklınıza takılan soruların cevaplarını burada bulabilirsiniz. Aradığınızı bulamazsanız bizimle iletişime geçmekten çekinmeyin.
        </p>
      </section>

      <div className={styles.list}>
        {FAQS.map((faq) => (
          <details className={styles.item} key={faq.question}>
            <summary>{faq.question}</summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
