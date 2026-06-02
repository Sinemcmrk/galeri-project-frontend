'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch('http://localhost:6000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setSuccessMsg('Giriş başarılı! Yönetim paneline yönlendiriliyorsunuz...');
        // Save user to localStorage for client side state
        localStorage.setItem('user_session', JSON.stringify(json.data.user));
        
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        setErrorMsg(json.error?.message || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.');
      }
    } catch (err) {
      console.error(err);
      // Client-side mock login fallback for development when backend connection is unavailable
      if (email === 'admin@galeriproject.com' && password === 'admin123456') {
        setSuccessMsg('Çevrimdışı giriş başarılı! Yönetim paneline yönlendiriliyorsunuz...');
        localStorage.setItem('user_session', JSON.stringify({
          id: 'admin-offline',
          email: 'admin@galeriproject.com',
          name: 'System Admin',
          role: 'ADMIN'
        }));
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        setErrorMsg('Sunucu bağlantısı kurulamadı. Giriş bilgilerinizi kontrol edin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.cardHeader}>
          <Link href="/" className={styles.logo}>
            <svg className={styles.logoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9C2 11.2 2 11.6 2 12v4c0 .6.4 1 1 1h2" />
              <circle cx="7" cy="17" r="2" />
              <circle cx="17" cy="17" r="2" />
            </svg>
            <span>Car</span>Spot
          </Link>
          <h2>Giriş Yap</h2>
          <p>Yönetici hesabı bilgilerinizi kullanarak oturum açın.</p>
        </div>

        {successMsg && <div className={styles.successAlert}>✅ {successMsg}</div>}
        {errorMsg && <div className={styles.errorAlert}>❌ {errorMsg}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>E-posta Adresi</label>
            <input 
              type="email" 
              placeholder="Örn: admin@galeriproject.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className={styles.formGroup}>
            <label>Şifre</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>

          <div className={styles.formActions}>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" />
              <span>Beni Hatırla</span>
            </label>
            <a href="#" className={styles.forgotLink}>Şifremi Unuttum</a>
          </div>

          <button type="submit" disabled={loading} className={styles.loginBtn}>
            {loading ? 'Giriş Yapılıyor...' : 'GİRİŞ YAP'}
          </button>
        </form>

        <div className={styles.cardFooter}>
          <p>Hesabınız yok mu? <Link href="/register">Kayıt Olun</Link></p>
        </div>
      </div>
    </div>
  );
}
