import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { Play, Eye } from 'lucide-react';
import { Movie } from '@/types/movie';

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const formatView = (view: number) => {
    if (!view) return '';
    if (view >= 1000000) return `${(view / 1000000).toFixed(1)}M`;
    if (view >= 1000) return `${(view / 1000).toFixed(0)}K`;
    return view.toString();
  };

  return (
    <Link href={`/phim/${movie.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
      <div ref={ref} style={{
        position: 'relative', borderRadius: 10, overflow: 'hidden',
        transition: 'transform 0.3s, box-shadow 0.3s', cursor: 'pointer',
        height: '100%', display: 'flex', flexDirection: 'column',
      }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 12px 24px rgba(229,9,20,0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <div style={{
          position: 'relative', width: '100%',
          aspectRatio: '2/3', overflow: 'hidden', flexShrink: 0,
          background: '#1a1a2e',
        }}>
          {!imgLoaded && (
            <div className="skeleton" style={{
              position: 'absolute', inset: 0, borderRadius: 0,
            }} />
          )}
          {(isVisible || imgLoaded) && (
            <img
              src={movie.thumb_url || movie.poster_url}
              alt={movie.name}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                opacity: imgLoaded ? 1 : 0,
                transition: 'opacity 0.3s, transform 0.3s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            />
          )}

          <div style={{
            position: 'absolute', top: 8, left: 8, right: 8,
            display: 'flex', justifyContent: 'space-between', gap: 4,
            zIndex: 2,
          }}>
            {movie.quality && (
              <span style={{
                background: 'rgba(229,9,20,0.9)', padding: '2px 6px',
                borderRadius: 4, fontSize: 11, fontWeight: 700,
              }}>{movie.quality}</span>
            )}
            {movie.type === 'series' && movie.episode_current && (
              <span style={{
                background: 'rgba(0,0,0,0.7)', padding: '2px 6px',
                borderRadius: 4, fontSize: 11,
              }}>{movie.episode_current}</span>
            )}
          </div>

          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)',
            zIndex: 1,
          }} />

          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            zIndex: 3, opacity: 0, transition: 'opacity 0.3s',
            background: 'rgba(229,9,20,0.9)', borderRadius: '50%',
            width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }} className="play-icon">
            <Play size={22} fill="white" />
          </div>
        </div>

        <div style={{
          padding: '10px 4px', flex: 1, display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', minHeight: 56,
        }}>
          <div style={{
            fontSize: 14, fontWeight: 600, marginBottom: 4,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{movie.name}</div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 12, color: 'var(--text-muted)',
          }}>
            <span>{movie.year}</span>
            {movie.view > 0 && (
              <>
                <span>·</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Eye size={12} /> {formatView(movie.view)}
                </span>
              </>
            )}
            <span>·</span>
            <span>{movie.time || 'Đang cập nhật'}</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        div:hover .play-icon {
          opacity: 1 !important;
        }
      `}</style>
    </Link>
  );
}
