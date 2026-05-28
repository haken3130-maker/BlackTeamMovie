import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { Play, Eye } from 'lucide-react';
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
        <div className="relative w-full pt-[150%] flex-shrink-0 overflow-hidden">
          {!error && (
            <img
              src={imgSrc}
              alt={movie.name}
              onLoad={() => setLoaded(true)}
              onError={() => setError(true)}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${loaded ? 'opacity-100' : 'opacity-0'}`}
              style={{ maxWidth: 'none', maxHeight: 'none' }}
            />
          )}
          {!loaded && !error && (
            <div className="absolute inset-0 skeleton rounded-none" />
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0d0d1a]">
              <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" /></svg>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-[1]" />
          <div className="absolute top-2 left-2 right-2 flex justify-between gap-1 z-[2]">
            {movie.quality && (
              <span className="bg-[#e50914] px-1.5 py-0.5 rounded text-[11px] font-bold leading-tight">{movie.quality}</span>
            )}
            {movie.type === 'series' && movie.episode_current && (
              <span className="bg-black/70 px-1.5 py-0.5 rounded text-[11px] leading-tight ml-auto">{movie.episode_current}</span>
            )}
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[3] opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[#e50914]/90 rounded-full w-[50px] h-[50px] flex items-center justify-center">
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
