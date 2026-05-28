import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Filter, ChevronDown } from 'lucide-react';
import MovieCard from '@/components/MovieCard';
import { moviesApi, categoriesApi } from '@/services/api';
import { Movie, PaginatedResponse, Category } from '@/types/movie';

const SORT_OPTIONS = [
  { value: '', label: 'Mới nhất' },
  { value: 'view', label: 'Xem nhiều' },
  { value: 'year', label: 'Năm sản xuất' },
];

const TYPE_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'series', label: 'Phim bộ' },
  { value: 'single', label: 'Phim lẻ' },
];

export default function MovieListPage() {
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse['pagination'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [countries, setCountries] = useState<Category[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [country, setCountry] = useState('');
  const [sortField, setSortField] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    categoriesApi.getAll().then(setCategories).catch(() => {});
    categoriesApi.getCountries().then(setCountries).catch(() => {});
  }, []);

  useEffect(() => {
    const { type: t, category: c, country: co, sort_field: s, page: p } = router.query;
    if (router.isReady) {
      setType((t as string) || '');
      setCategory((c as string) || '');
      setCountry((co as string) || '');
      setSortField((s as string) || '');
      setPage(p ? parseInt(p as string) : 1);
    }
  }, [router.isReady, router.query]);

  const fetchMovies = useCallback(async () => {
    setLoading(true);
    try {
      const data = await moviesApi.getList({
        type: type || undefined,
        category: category || undefined,
        country: country || undefined,
        sort_field: sortField || undefined,
        page,
        limit: 48,
      });
      setMovies(data.items || []);
      setPagination(data.pagination || null);
    } catch (err) {
      console.error('Failed to load movies:', err);
    } finally {
      setLoading(false);
    }
  }, [type, category, country, sortField, page]);

  useEffect(() => {
    fetchMovies();
    const params: Record<string, string> = {};
    if (type) params.type = type;
    if (category) params.category = category;
    if (country) params.country = country;
    if (sortField) params.sort_field = sortField;
    if (page > 1) params.page = page.toString();
    const qs = new URLSearchParams(params).toString();
    router.replace(`/danh-sach${qs ? `?${qs}` : ''}`, undefined, { shallow: true });
  }, [type, category, country, sortField, page, fetchMovies]);

  const handleFilterChange = (setter: Function, value: string) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="container" style={{ paddingTop: 80 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Danh sách phim</h1>
        <button onClick={() => setShowFilters(!showFilters)} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(255,255,255,0.08)', border: 'none',
          color: 'white', padding: '10px 16px', borderRadius: 8,
          cursor: 'pointer', fontSize: 14, fontWeight: 600,
        }}>
          <Filter size={16} /> Bộ lọc <ChevronDown size={14} style={{ transform: showFilters ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }} />
        </button>
      </div>

      {showFilters && (
        <div style={{
          background: 'var(--bg-card)', borderRadius: 12, padding: 20,
          marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            <FilterGroup label="Thể loại">
              <select value={category} onChange={(e) => handleFilterChange(setCategory, e.target.value)}
                style={selectStyle}>
                <option value="">Tất cả thể loại</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </FilterGroup>

            <FilterGroup label="Quốc gia">
              <select value={country} onChange={(e) => handleFilterChange(setCountry, e.target.value)}
                style={selectStyle}>
                <option value="">Tất cả quốc gia</option>
                {countries.map((c) => (
                  <option key={c._id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </FilterGroup>

            <FilterGroup label="Loại phim">
              <select value={type} onChange={(e) => handleFilterChange(setType, e.target.value)}
                style={selectStyle}>
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </FilterGroup>

            <FilterGroup label="Sắp xếp">
              <select value={sortField} onChange={(e) => handleFilterChange(setSortField, e.target.value)}
                style={selectStyle}>
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </FilterGroup>
          </div>
        </div>
      )}

      {loading ? (
        <div className="movie-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i}>
              <div className="skeleton" style={{ width: '100%', aspectRatio: '2/3', borderRadius: 10, marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 16, width: '70%', marginBottom: 6 }} />
              <div className="skeleton" style={{ height: 12, width: '40%' }} />
            </div>
          ))}
        </div>
      ) : movies.length > 0 ? (
        <>
          <div className="movie-grid">
            {movies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 32, marginBottom: 40 }}>
              <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} style={{
                ...paginationBtnStyle,
                opacity: page <= 1 ? 0.4 : 1,
              }}>Trước</button>

              {Array.from({ length: Math.min(pagination.totalPages, 7) }).map((_, i) => {
                let pageNum: number;
                if (pagination.totalPages <= 7) {
                  pageNum = i + 1;
                } else if (page <= 4) {
                  pageNum = i + 1;
                } else if (page >= pagination.totalPages - 3) {
                  pageNum = pagination.totalPages - 6 + i;
                } else {
                  pageNum = page - 3 + i;
                }
                return (
                  <button key={pageNum} onClick={() => setPage(pageNum)} style={{
                    ...paginationBtnStyle,
                    background: page === pageNum ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
                    color: page === pageNum ? 'white' : 'var(--text-secondary)',
                    fontWeight: page === pageNum ? 700 : 500,
                  }}>{pageNum}</button>
                );
              })}

              <button disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)} style={{
                ...paginationBtnStyle,
                opacity: page >= pagination.totalPages ? 0.4 : 1,
              }}>Sau</button>
            </div>
          )}
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: 18, marginBottom: 8 }}>Không tìm thấy phim</p>
          <p style={{ fontSize: 14 }}>Thử thay đổi bộ lọc hoặc tìm kiếm lại.</p>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ flex: 1, minWidth: 180 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.05)',
  color: 'white', fontSize: 14, outline: 'none',
  cursor: 'pointer',
};

const paginationBtnStyle: React.CSSProperties = {
  padding: '8px 14px', borderRadius: 6, border: 'none',
  cursor: 'pointer', fontSize: 14, transition: 'all 0.2s',
};
