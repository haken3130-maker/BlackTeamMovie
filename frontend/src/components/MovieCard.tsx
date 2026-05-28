import { useState } from 'react';
import Link from 'next/link';
import { Play, Eye, Film } from 'lucide-react';
import { Movie } from '@/types/movie';

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const imgSrc = movie.thumb_url || movie.poster_url;

  return (
    <Link href={`/phim/${movie.slug}`} className="block w-full h-full no-underline text-inherit group">
      <div className="relative rounded-xl overflow-hidden bg-[#16213e] h-full flex flex-col transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(229,9,20,0.2)]">
        <div className="w-full overflow-hidden flex-shrink-0" style={{ aspectRatio: '2/3' }}>
          {!error && (
            <img
              src={imgSrc}
              alt={movie.name}
              onLoad={() => setLoaded(true)}
              onError={() => setError(true)}
              className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            />
          )}
          {!loaded && !error && (
            <div className="w-full h-full skeleton rounded-none" />
          )}
          {error && (
            <div className="w-full h-full flex items-center justify-center bg-[#0d0d1a]">
              <Film size={28} className="text-gray-600" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-[1] pointer-events-none" />
          <div className="absolute top-2 left-2 right-2 flex justify-between gap-1 z-[2] pointer-events-none">
            {movie.quality && (
              <span className="bg-[#e50914] px-1.5 py-0.5 rounded text-[11px] font-bold leading-tight">{movie.quality}</span>
            )}
            {movie.type === 'series' && movie.episode_current && (
              <span className="bg-black/70 px-1.5 py-0.5 rounded text-[11px] leading-tight ml-auto">{movie.episode_current}</span>
            )}
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[3] opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[#e50914]/90 rounded-full w-[50px] h-[50px] flex items-center justify-center pointer-events-none">
            <Play size={22} fill="white" />
          </div>
        </div>
        <div className="px-2 py-2.5 flex flex-col justify-between flex-1 min-h-[56px]">
          <div className="text-sm font-semibold whitespace-nowrap overflow-hidden text-ellipsis mb-1">{movie.name}</div>
          <div className="flex items-center gap-1.5 text-xs text-[#6b6b6b] flex-wrap">
            <span>{movie.year}</span>
            {movie.view > 0 && (
              <><span>·</span><span className="flex items-center gap-1"><Eye size={11} /> {fmt(movie.view)}</span></>
            )}
            {movie.time && <><span>·</span><span>{movie.time}</span></>}
          </div>
        </div>
      </div>
    </Link>
  );
}

function fmt(v: number) {
  if (!v) return '';
  if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M';
  if (v >= 1e3) return (v / 1e3).toFixed(0) + 'K';
  return '' + v;
}
