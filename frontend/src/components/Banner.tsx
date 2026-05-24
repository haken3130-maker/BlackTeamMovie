import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Play, Info, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { Movie } from '@/types/movie';

interface BannerProps {
  movies: Movie[];
  loading?: boolean;
  videoMap?: Record<string, string>;
}

export default function Banner({ movies, loading, videoMap }: BannerProps) {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % movies.length);
  }, [movies.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + movies.length) % movies.length);
  }, [movies.length]);

  useEffect(() => {
    if (isHovered || loading || !movies.length) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [isHovered, loading, movies.length, next]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [current]);

  if (loading) {
    return (
      <div className="banner-container">
        <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: 0 }} />
      </div>
    );
  }

  if (!movies.length) return null;

  const movie = movies[current];
  const currentVideo = videoMap?.[movie.slug];

  const backdropUrl = movie.poster_url?.startsWith('http')
    ? movie.poster_url
    : movie.thumb_url;

  return (
    <section
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="banner-container"
      style={{
        position: 'relative', width: '100%', overflow: 'hidden', marginBottom: 0,
      }}
    >
      {movies.map((m, i) => (
        <div key={m._id} style={{
          position: 'absolute', inset: 0,
          opacity: i === current ? 1 : 0,
          transition: 'opacity 0.8s ease-in-out',
          zIndex: i === current ? 1 : 0,
        }}>
          {i === current && currentVideo ? (
            <video
              ref={videoRef}
              autoPlay
              muted={muted}
              loop
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              poster={backdropUrl}
            >
              <source src={currentVideo} type="application/x-mpegURL" />
            </video>
          ) : (
            <img
              src={i === current ? backdropUrl : (m.poster_url || m.thumb_url)}
              alt={m.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = m.thumb_url;
              }}
            />
          )}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(17,17,17,1) 0%, rgba(17,17,17,0.4) 50%, rgba(17,17,17,0.1) 100%)',
          }} />
        </div>
      ))}

      <div className="container" style={{
        position: 'relative', zIndex: 10, height: '100%',
        display: 'flex', alignItems: 'flex-end', paddingBottom: 80,
      }}>
        <div style={{ maxWidth: 560 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <span style={{
              background: 'rgba(229,9,20,0.9)', padding: '4px 10px',
              borderRadius: 4, fontSize: 12, fontWeight: 700,
            }}>{movie.quality}</span>
            <span style={{
              background: 'rgba(255,255,255,0.1)', padding: '4px 10px',
              borderRadius: 4, fontSize: 12,
            }}>{movie.time}</span>
            <span style={{
              background: 'rgba(255,255,255,0.1)', padding: '4px 10px',
              borderRadius: 4, fontSize: 12,
            }}>{movie.lang}</span>
          </div>

          <h1 className="banner-title" style={{ fontWeight: 900, lineHeight: 1.1, marginBottom: 12 }}>
            {movie.name}
          </h1>

          <p style={{
            color: 'var(--text-secondary)', fontSize: 14,
            lineHeight: 1.6, marginBottom: 24,
            display: '-webkit-box', WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {movie.content || movie.origin_name}
          </p>

          <div style={{ display: 'flex', gap: 12 }}>
            <Link href={`/phim/${movie.slug}`} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--accent)', color: 'white',
              padding: '12px 28px', borderRadius: 8,
              fontWeight: 700, fontSize: 15, transition: 'transform 0.2s',
              border: 'none', cursor: 'pointer',
            }}>
              <Play size={20} fill="white" /> Xem Ngay
            </Link>
            <Link href={`/phim/${movie.slug}`} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.1)', color: 'white',
              padding: '12px 24px', borderRadius: 8,
              fontWeight: 600, fontSize: 14,
              border: 'none', cursor: 'pointer',
            }}>
              <Info size={18} /> Chi Tiết
            </Link>
          </div>
        </div>
      </div>

      {currentVideo && (
        <button onClick={() => setMuted(!muted)} style={{
          position: 'absolute', bottom: 100, right: 24, zIndex: 20,
          background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white',
          width: 36, height: 36, borderRadius: '50%', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'opacity 0.3s',
        }}>
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      )}

      <button onClick={prev} style={{
        position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
        zIndex: 20, background: 'rgba(0,0,0,0.5)', border: 'none',
        color: 'white', width: 44, height: 44, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', opacity: isHovered ? 1 : 0,
        transition: 'opacity 0.3s',
      }}>
        <ChevronLeft size={24} />
      </button>
      <button onClick={next} style={{
        position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
        zIndex: 20, background: 'rgba(0,0,0,0.5)', border: 'none',
        color: 'white', width: 44, height: 44, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', opacity: isHovered ? 1 : 0,
        transition: 'opacity 0.3s',
      }}>
        <ChevronRight size={24} />
      </button>

      <div style={{
        position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
        zIndex: 20, display: 'flex', gap: 8,
      }}>
        {movies.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} style={{
            width: i === current ? 24 : 8, height: 8, borderRadius: 4,
            background: i === current ? 'var(--accent)' : 'rgba(255,255,255,0.3)',
            border: 'none', cursor: 'pointer', transition: 'all 0.3s',
          }} />
        ))}
      </div>
    </section>
  );
}
