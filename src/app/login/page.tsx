'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle } from 'lucide-react';
import styles from './login.module.css';
import { API_BASE_URL } from '@/lib/listings';
import { getSession, saveSession } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Already logged in? No need to see the login form again.
  useEffect(() => {
    const session = getSession();
    if (session) {
      router.replace(session.user.role === 'ADMIN' ? '/dashboard' : '/');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const json = await res.json();

      if (res.ok && json.success) {
        saveSession(json.data);
        setSuccessMsg('Giriş başarılı! Yönlendiriliyorsunuz...');

        setTimeout(() => {
          router.push(json.data.user.role === 'ADMIN' ? '/dashboard' : '/');
        }, 1000);
      } else {
        setErrorMsg(json.message || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Sunucuya bağlanılamadı. Lütfen daha sonra tekrar deneyin.');
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
          <p>Hesabınıza giriş yapmak için bilgilerinizi girin.</p>
        </div>

        {successMsg && <div className={styles.successAlert}><CheckCircle2 size={16} /> {successMsg}</div>}
        {errorMsg && <div className={styles.errorAlert}><XCircle size={16} /> {errorMsg}</div>}

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
