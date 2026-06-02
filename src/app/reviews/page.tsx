'use client';

import React, { useState, useEffect } from 'react';
import styles from './reviews.module.css';

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  carPurchased?: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [carPurchased, setCarPurchased] = useState('Porsche 911');

  const defaultReviews: Review[] = [
    {
      id: '1',
      name: 'Ahmet Yılmaz',
      rating: 5,
      comment: 'CarSpot ekibinden aldığım Porsche 911 Carrera kelimenin tam anlamıyla harika. Satış sürecindeki ilgi ve şeffaflık beni çok etkiledi. Teşekkürler!',
      date: '2026-05-20',
      carPurchased: 'Porsche 911 Carrera'
    },
    {
      id: '2',
      name: 'Ebru Şahin',
      rating: 5,
      comment: 'Ford Shelby GT500 hayalimdi ve CarSpot sayesinde bu hayalime ulaştım. Aracın tüm ekspertiz raporları ve geçmişi söylendiği gibi çıktı.',
      date: '2026-05-15',
      carPurchased: 'Ford Shelby GT500'
    },
    {
      id: '3',
      name: 'Can Demir',
      rating: 4,
      comment: 'Hızlı iletişim ve profesyonel hizmet. Aldığım hizmetten son derece memnun kaldım, herkese tavsiye ederim.',
      date: '2026-05-02',
      carPurchased: 'McLaren F1'
    }
  ];

  useEffect(() => {
    const saved = localStorage.getItem('local_reviews_cars');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setReviews([...parsed, ...defaultReviews]);
      } catch (e) {
        setReviews(defaultReviews);
      }
    } else {
      setReviews(defaultReviews);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    const newReview: Review = {
      id: Date.now().toString(),
      name,
      rating,
      comment,
      date: new Date().toISOString().split('T')[0],
      carPurchased
    };

    const updated = [newReview, ...reviews.filter(r => r.id !== '1' && r.id !== '2' && r.id !== '3')];
    localStorage.setItem('local_reviews_cars', JSON.stringify(updated));
    setReviews([newReview, ...reviews]);
    
    // Reset Form
    setName('');
    setComment('');
    setRating(5);
  };

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span key={i} className={i < count ? styles.starFilled : styles.starEmpty}>
        ★
      </span>
    ));
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerBanner}>
        <h1>Müşteri Yorumları</h1>
        <p>CarSpot ile otomobil sahibi olanların gerçek deneyimleri.</p>
      </div>

      <div className={styles.content}>
        {/* Left Side: Reviews Grid */}
        <section className={styles.reviewsList}>
          <h2>Kullanıcı Değerlendirmeleri</h2>
          <div className={styles.grid}>
            {reviews.map(r => (
              <div className={styles.reviewCard} key={r.id}>
                <div className={styles.cardHeader}>
                  <div className={styles.userInfo}>
                    <div className={styles.avatar}>
                      {r.name.charAt(0)}
                    </div>
                    <div>
                      <h3>{r.name}</h3>
                      {r.carPurchased && <span className={styles.tag}>{r.carPurchased} Aldı</span>}
                    </div>
                  </div>
                  <span className={styles.date}>{r.date}</span>
                </div>
                <div className={styles.starsBox}>
                  {renderStars(r.rating)}
                </div>
                <p className={styles.comment}>"{r.comment}"</p>
              </div>
            ))}
          </div>
        </section>

        {/* Right Side: Write a review form */}
        <section className={styles.formSection}>
          <div className={styles.formCard}>
            <h3>Deneyiminizi Paylaşın</h3>
            <p>CarSpot hizmeti hakkında yorum ve derecelendirme yazın.</p>
            
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Adınız Soyadınız *</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="Adınızı girin" 
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Satın Aldığınız Araç</label>
                <select value={carPurchased} onChange={e => setCarPurchased(e.target.value)}>
                  <option value="Porsche 911">Porsche 911 Carrera</option>
                  <option value="Ford Shelby">Ford Shelby GT500</option>
                  <option value="McLaren F1">McLaren F1</option>
                  <option value="Diğer / Hizmet">Diğer / Sadece Hizmet</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Puanınız</label>
                <select value={rating} onChange={e => setRating(parseInt(e.target.value))}>
                  <option value={5}>5 Yıldız (Mükemmel)</option>
                  <option value={4}>4 Yıldız (Çok İyi)</option>
                  <option value={3}>3 Yıldız (Orta)</option>
                  <option value={2}>2 Yıldız (Kötü)</option>
                  <option value={1}>1 Yıldız (Çok Kötü)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Değerlendirmeniz *</label>
                <textarea 
                  value={comment} 
                  onChange={e => setComment(e.target.value)} 
                  placeholder="Deneyimlerinizi buraya yazın..." 
                  rows={4}
                  required
                />
              </div>

              <button type="submit" className={styles.submitBtn}>
                DEĞERLENDİRME GÖNDER
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
