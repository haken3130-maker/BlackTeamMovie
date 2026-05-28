import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { TrendingUp, Film, Tv, Layers } from 'lucide-react';
import Banner from '@/components/Banner';
import MovieSlider from '@/components/MovieSlider';
import ViewHistory from '@/components/ViewHistory';
import CategoryFilter from '@/components/CategoryFilter';
import MovieCard from '@/components/MovieCard';
import { moviesApi } from '@/services/api';
import { Movie, PaginatedResponse } from '@/types/movie';

export default function HomePage() {
  const [featured, setFeatured] = useState<Movie[]>([]);
  const [series, setSeries] = useState<Movie[]>([]);
  const [singles, setSingles] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [seriesFilter, setSeriesFilter] = useState('');
  const [seriesPage, setSeriesPage] = useState(1);
  const [seriesAll, setSeriesAll] = useState<PaginatedResponse | null>(null);
  const [videoMap, setVideoMap] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadData() {
      try {
        const [featuredData, seriesData, singlesData] = await Promise.all([
          moviesApi.getFeatured(),
          moviesApi.getSeries(1),
          moviesApi.getSingles(1),
        ]);
        setFeatured(featuredData);
        setSeries(seriesData.items || []);
        setSeriesAll(seriesData);
        setSingles(singlesData.items || []);

        const detailPromises = featuredData.map(async (m: Movie) => {
          try {
            const detail = await moviesApi.getDetail(m.slug);
            const firstEp = detail.episodes?.[0]?.server_data?.[0];
            const url = firstEp?.link_m3u8 || firstEp?.link_embed;
            if (url) return { slug: m.slug, url };
          } catch {}
          return null;
        });
        const results = await Promise.all(detailPromises);
        const map: Record<string, string> = {};
        results.forEach((r) => { if (r) map[r.slug] = r.url; });
        setVideoMap(map);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const loadSeriesPage = useCallback(async (slug: string, page: number) => {
    try {
      const data = slug
        ? await moviesApi.getByType('series', slug, page)
        : await moviesApi.getSeries(page);
      setSeries(data.items || []);
      setSeriesAll(data);
    } catch {}
  }, []);

  const handleSeriesFilterChange = useCallback((slug: string) => {
    setSeriesFilter(slug);
    setSeriesPage(1);
    loadSeriesPage(slug, 1);
  }, [loadSeriesPage]);

  return (
    <>
      <Banner movies={featured} loading={loading} videoMap={videoMap} />

      <div style={{ paddingTop: 56 }}>
      <ViewHistory />

      <div className="container" style={{ display: 'flex', gap: 16, marginTop: 24, flexWrap: 'wrap' }}>
        {[
          { icon: <Tv size={20} />, label: 'Phim bộ', href: '/danh-sach?type=series', color: '#e50914' },
          { icon: <Film size={20} />, label: 'Phim lẻ', href: '/danh-sach?type=single', color: '#ff6b6b' },
          { icon: <TrendingUp size={20} />, label: 'Phim hot', href: '/danh-sach?sort_field=view', color: '#ffd93d' },
          { icon: <Layers size={20} />, label: 'Tất cả', href: '/danh-sach', color: '#6c5ce7' },
        ].map((item) => (
          <Link key={item.label} href={item.href} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '14px 20px', borderRadius: 12, background: 'var(--bg-card)',
            flex: 1, minWidth: 150, textDecoration: 'none', color: 'inherit',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${item.color}22`; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${item.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color }}>
              {item.icon}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{item.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Khám phá ngay</div>
            </div>
          </Link>
        ))}
      </div>

      <MovieSlider
        title="Phim bộ mới nhất"
        movies={series}
        loading={loading}
        link="/danh-sach?type=series"
      />

      <MovieSlider
        title="Phim lẻ mới nhất"
        movies={singles}
        loading={loading}
        link="/danh-sach?type=single"
      />

      <section className="container">
        <div className="section-header">
          <h2 className="section-title" style={{ marginBottom: 0 }}>Phim bộ theo thể loại</h2>
        </div>
        <CategoryFilter selected={seriesFilter} onChange={handleSeriesFilterChange} />

        {loading ? (
          <div className="movie-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i}>
                <div className="skeleton" style={{ width: '100%', aspectRatio: '2/3', borderRadius: 10 }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="movie-grid">
            {series.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        )}

        {seriesAll?.pagination && seriesAll.pagination.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 24, marginBottom: 8 }}>
            {seriesPage > 1 && (
              <button onClick={() => { const p = seriesPage - 1; setSeriesPage(p); loadSeriesPage(seriesFilter, p); }}
                style={{ padding: '8px 12px', borderRadius: 6, border: 'none', background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13 }}>Trước</button>
            )}
            {(() => {
              const total = seriesAll.pagination.totalPages;
              const pages: (number | string)[] = [];
              const range = 2;
              const start = Math.max(2, seriesPage - range);
              const end = Math.min(total - 1, seriesPage + range);
              pages.push(1);
              if (start > 2) pages.push('...');
              for (let i = start; i <= end; i++) pages.push(i);
              if (end < total - 1) pages.push('...');
              if (total > 1) pages.push(total);
              return pages.map((p) =>
                p === '...'
                  ? <span key={`e${pages.indexOf(p)}`} style={{ padding: '8px 4px', color: 'var(--text-muted)', fontSize: 13 }}>...</span>
                  : <button key={p} onClick={() => { setSeriesPage(p as number); loadSeriesPage(seriesFilter, p as number); }}
                      style={{
                        padding: '8px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                        background: p === seriesPage ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
                        color: p === seriesPage ? 'white' : 'var(--text-secondary)',
                      }}>{p}</button>
              );
            })()}
            {seriesPage < seriesAll.pagination.totalPages && (
              <button onClick={() => { const p = seriesPage + 1; setSeriesPage(p); loadSeriesPage(seriesFilter, p); }}
                style={{ padding: '8px 12px', borderRadius: 6, border: 'none', background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13 }}>Sau</button>
            )}
          </div>
        )}
      </section>
      </div>
    </>
  );
}
