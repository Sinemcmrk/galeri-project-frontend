'use client';

import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './PhotoCarousel.module.css';
import { getImageUrl } from '@/lib/listings';

interface PhotoCarouselProps {
  photos: string[];
  alt: string;
  imgClassName?: string;
}

// Renders as a fragment (image + nav arrows + dots) meant to be dropped
// directly inside an existing `position: relative` image box, so it slots
// into the card/gallery markup already used across the app without needing
// its own aspect-ratio wrapper.
export default function PhotoCarousel({ photos, alt, imgClassName }: PhotoCarouselProps) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const safePhotos = photos.length > 0 ? photos : [undefined];
  const hasMultiple = safePhotos.length > 1;
  const clampedIndex = Math.min(index, safePhotos.length - 1);

  const goPrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex(i => (i - 1 + safePhotos.length) % safePhotos.length);
  };

  const goNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex(i => (i + 1) % safePhotos.length);
  };

  const goTo = (i: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex(i);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      setIndex(i => (delta < 0 ? (i + 1) % safePhotos.length : (i - 1 + safePhotos.length) % safePhotos.length));
    }
    touchStartX.current = null;
  };

  return (
    <>
      <img
        src={getImageUrl(safePhotos[clampedIndex])}
        alt={alt}
        className={imgClassName}
        onTouchStart={hasMultiple ? onTouchStart : undefined}
        onTouchEnd={hasMultiple ? onTouchEnd : undefined}
      />
      {hasMultiple && (
        <>
          <button type="button" className={`${styles.navBtn} ${styles.navPrev}`} onClick={goPrev} aria-label="Önceki fotoğraf">
            <ChevronLeft size={18} />
          </button>
          <button type="button" className={`${styles.navBtn} ${styles.navNext}`} onClick={goNext} aria-label="Sonraki fotoğraf">
            <ChevronRight size={18} />
          </button>
          <div className={styles.dots}>
            {safePhotos.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`${styles.dot} ${i === clampedIndex ? styles.dotActive : ''}`}
                onClick={(e) => goTo(i, e)}
                aria-label={`${i + 1}. fotoğrafa git`}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}
