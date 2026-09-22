'use client';

import React, { useEffect, useRef } from 'react';

interface VideoPlayerProps {
  src: string;
  className?: string;
}

// Plays both progressive MP4 files and HLS (.m3u8) streams. Videos uploaded
// through the listing form start out as plain MP4, then the backend
// transcodes them into an HLS stream in the background and swaps the URL —
// so the player needs to support both transparently.
export default function VideoPlayer({ src, className }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src.endsWith('.m3u8')) return;

    // Safari supports HLS natively; everywhere else needs hls.js.
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      return;
    }

    let hls: import('hls.js').default | undefined;
    let cancelled = false;

    import('hls.js').then(({ default: Hls }) => {
      if (cancelled) return;
      if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
      }
    });

    return () => {
      cancelled = true;
      hls?.destroy();
    };
  }, [src]);

  const isHls = src.endsWith('.m3u8');

  return (
    <video
      ref={videoRef}
      controls
      className={className}
      {...(!isHls ? { src } : {})}
    />
  );
}
