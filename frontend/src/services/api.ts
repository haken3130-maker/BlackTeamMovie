import { Movie, MovieDetail, PaginatedResponse, Category } from '@/types/movie';

const OPHIM_BASE = 'https://ophim1.com';
const CDN_URL = 'https://img.ophim.live/uploads/movies/';

function normalizeMovie(m: any): Movie {
  return {
    _id: m._id,
    name: m.name,
    slug: m.slug,
    origin_name: m.origin_name,
    poster_url: m.poster_url?.startsWith('http') ? m.poster_url : `${CDN_URL}${m.poster_url}`,
    thumb_url: m.thumb_url?.startsWith('http') ? m.thumb_url : `${CDN_URL}${m.thumb_url}`,
    time: m.time,
    quality: m.quality,
    lang: m.lang,
    year: m.year,
    type: m.type,
    category: Array.isArray(m.category) ? m.category.map((c: any) =>
      typeof c === 'object' ? { id: c.id || c._id, name: c.name, slug: c.slug } : { id: '', name: String(c), slug: '' }
    ) : [],
    country: Array.isArray(m.country) ? m.country.map((c: any) =>
      typeof c === 'object' ? { id: c.id || c._id, name: c.name, slug: c.slug } : { id: '', name: String(c), slug: '' }
    ) : [],
    episode_current: m.episode_current,
    episode_total: m.episode_total,
    view: typeof m.view === 'number' ? m.view : parseInt(m.view) || 0,
    content: m.content || '',
  };
}

async function fetchAPI<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const moviesApi = {
  getFeatured: () =>
    fetchAPI<{ status: boolean; data: { items: any[] } }>(`${OPHIM_BASE}/v1/api/danh-sach?sort_field=view&limit=8`)
      .then(res => (res.data?.items || []).map(normalizeMovie)),

  getSeries: (page = 1) =>
    fetchAPI<{ status: boolean; data: { items: any[]; pagination: any } }>(`${OPHIM_BASE}/v1/api/danh-sach?type=series&page=${page}`)
      .then(res => ({ status: true, items: (res.data?.items || []).map(normalizeMovie), pagination: res.data?.pagination })),

  getSingles: (page = 1) =>
    fetchAPI<{ status: boolean; data: { items: any[]; pagination: any } }>(`${OPHIM_BASE}/v1/api/danh-sach?type=single&page=${page}`)
      .then(res => ({ status: true, items: (res.data?.items || []).map(normalizeMovie), pagination: res.data?.pagination })),

  getByCategory: (slug: string, page = 1) =>
    fetchAPI<{ status: boolean; data: { items: any[]; pagination: any } }>(`${OPHIM_BASE}/v1/api/danh-sach?category=${slug}&page=${page}`)
      .then(res => ({ status: true, items: (res.data?.items || []).map(normalizeMovie), pagination: res.data?.pagination })),

  getByCountry: (slug: string, page = 1) =>
    fetchAPI<{ status: boolean; data: { items: any[]; pagination: any } }>(`${OPHIM_BASE}/v1/api/danh-sach?country=${slug}&page=${page}`)
      .then(res => ({ status: true, items: (res.data?.items || []).map(normalizeMovie), pagination: res.data?.pagination })),

  getByType: (type: string, category?: string, page = 1) => {
    let url = `${OPHIM_BASE}/v1/api/danh-sach?type=${type}&page=${page}`;
    if (category) url += `&category=${category}`;
    return fetchAPI<{ status: boolean; data: { items: any[]; pagination: any } }>(url)
      .then(res => ({ status: true, items: (res.data?.items || []).map(normalizeMovie), pagination: res.data?.pagination }));
  },

  search: (keyword: string, page = 1) =>
    fetchAPI<{ status: boolean; data: { items: any[]; pagination: any } }>(`${OPHIM_BASE}/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}`)
      .then(res => ({ status: true, items: (res.data?.items || []).map(normalizeMovie), pagination: res.data?.pagination })),

  getList: (params: Record<string, string | number | undefined>) => {
    const query = Object.entries(params)
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => `${k}=${v}`)
      .join('&');
    return fetchAPI<{ status: boolean; data: { items: any[]; pagination: any } }>(`${OPHIM_BASE}/v1/api/danh-sach?${query}`)
      .then(res => ({ status: true, items: (res.data?.items || []).map(normalizeMovie), pagination: res.data?.pagination }));
  },

  getDetail: (slug: string) =>
    fetchAPI<{ movie: any; episodes: any[] }>(`${OPHIM_BASE}/phim/${slug}`)
      .then((res) => {
        const movie = res.movie;
        const episodes = (res.episodes || []).map((s: any) => ({
          server_name: s.server_name,
          server_data: (s.server_data || []).map((ep: any) => ({
            name: ep.name,
            slug: ep.slug,
            filename: ep.filename,
            link_embed: ep.link_embed || '',
            link_m3u8: ep.link_m3u8 || '',
          })),
        }));
        return {
          ...movie,
          poster_url: movie.poster_url?.startsWith('http') ? movie.poster_url : `${CDN_URL}${movie.poster_url}`,
          thumb_url: movie.thumb_url?.startsWith('http') ? movie.thumb_url : `${CDN_URL}${movie.thumb_url}`,
          episodes,
        } as MovieDetail;
      }),
};

export const categoriesApi = {
  getAll: () =>
    fetchAPI<{ status: boolean; data: { items: any[] } }>(`${OPHIM_BASE}/v1/api/the-loai`)
      .then(res => (res.data?.items || []).map((c: any) => ({ _id: c._id, name: c.name, slug: c.slug }))),

  getCountries: () =>
    fetchAPI<{ status: boolean; data: { items: any[] } }>(`${OPHIM_BASE}/v1/api/quoc-gia`)
      .then(res => (res.data?.items || []).map((c: any) => ({ _id: c._id, name: c.name, slug: c.slug }))),
};
