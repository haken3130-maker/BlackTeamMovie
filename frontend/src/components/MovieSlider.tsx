import { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';
import { Movie } from '@/types/movie';

interface MovieSliderProps {
  title: string;
  movies: Movie[];
  loading?: boolean;
  link?: string;
}

function SkeletonCard() {
  return (
    <div className="w-[140px] sm:w-[160px] md:w-[180px] flex-shrink-0">
      <div className="rounded-xl overflow-hidden bg-[#16213e]">
        <div className="pt-[150%] relative">
          <div className="absolute inset-0 skeleton rounded-none" />
        </div>
        <div className="px-2 py-2.5 space-y-2">
          <div className="skeleton h-4 w-4/5" />
          <div className="skeleton h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
}

export default function MovieSlider({ title, movies, loading, link }: MovieSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' });
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4 px-5">
        <h2 className="text-xl sm:text-2xl font-bold border-l-4 border-[#e50914] pl-3">{title}</h2>
        {link && (
          <Link href={link} className="text-[#e50914] text-sm font-semibold hover:opacity-80 transition-opacity">
            Xem tất cả →
          </Link>
        )}
      </div>

      <div className="relative group">
        {!loading && (
          <>
            <button onClick={() => scroll(-1)} className="absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 text-white w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => scroll(1)} className="absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 text-white w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <ChevronRight size={20} />
            </button>
          </>
        )}

        <div
          ref={scrollRef}
          className="flex gap-2 sm:gap-3 overflow-x-auto px-5 pb-2 scroll-smooth snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            movies.map((m) => (
              <div key={m._id} className="w-[140px] sm:w-[160px] md:w-[180px] flex-shrink-0 snap-start">
                <MovieCard movie={m} />
              </div>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}
