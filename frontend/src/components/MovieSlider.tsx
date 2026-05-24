import { useRef } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, FreeMode } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';
import { Movie } from '@/types/movie';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/free-mode';

interface MovieSliderProps {
  title: string;
  movies: Movie[];
  loading?: boolean;
  link?: string;
}

function SkeletonCard() {
  return (
    <div>
      <div className="skeleton" style={{ width: '100%', aspectRatio: '2/3', borderRadius: 10 }} />
      <div style={{ padding: '10px 4px' }}>
        <div className="skeleton" style={{ height: 16, width: '80%', marginBottom: 6 }} />
        <div className="skeleton" style={{ height: 12, width: '50%' }} />
      </div>
    </div>
  );
}

export default function MovieSlider({ title, movies, loading, link }: MovieSliderProps) {
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  return (
    <section>
      <div className="section-header container" style={{ marginBottom: 16 }}>
        <h2 className="section-title" style={{ marginBottom: 0 }}>{title}</h2>
        {link && (
          <Link href={link} className="see-all">
            Xem tất cả →
          </Link>
        )}
      </div>

      {loading ? (
        <div className="container">
          <div style={{ display: 'flex', gap: 14, overflow: 'hidden' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ minWidth: 180, flex: 1 }}>
                <SkeletonCard />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="movie-slider" style={{ position: 'relative' }}>
          <button ref={prevRef} style={{
            position: 'absolute', left: 8, top: '45%', zIndex: 10,
            background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white',
            width: 36, height: 36, borderRadius: '50%', cursor: 'pointer',
            display: 'none', alignItems: 'center', justifyContent: 'center',
          }} className="slider-nav slider-prev">
            <ChevronLeft size={20} />
          </button>

          <Swiper
            modules={[Navigation, FreeMode]}
            navigation={{
              prevEl: prevRef.current,
              nextEl: nextRef.current,
            }}
            onInit={(swiper) => {
              if (swiper.params.navigation && typeof swiper.params.navigation === 'object') {
                swiper.params.navigation.prevEl = prevRef.current;
                swiper.params.navigation.nextEl = nextRef.current;
              }
              swiper.navigation.init();
              swiper.navigation.update();
            }}
            freeMode={true}
            slidesPerView="auto"
            spaceBetween={14}
            style={{ padding: '0 20px' }}
            breakpoints={{
              320: { slidesPerView: 2.5, spaceBetween: 10 },
              480: { slidesPerView: 3, spaceBetween: 12 },
              768: { slidesPerView: 4.5, spaceBetween: 14 },
              1024: { slidesPerView: 6, spaceBetween: 14 },
              1280: { slidesPerView: 7, spaceBetween: 14 },
            }}
          >
            {movies.map((movie) => (
              <SwiperSlide key={movie._id} style={{ width: 180 }}>
                <MovieCard movie={movie} />
              </SwiperSlide>
            ))}
          </Swiper>

          <button ref={nextRef} style={{
            position: 'absolute', right: 8, top: '45%', zIndex: 10,
            background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white',
            width: 36, height: 36, borderRadius: '50%', cursor: 'pointer',
            display: 'none', alignItems: 'center', justifyContent: 'center',
          }} className="slider-nav slider-next">
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      <style jsx>{`
        .movie-slider:hover .slider-nav {
          display: flex !important;
        }
      `}</style>
    </section>
  );
}
