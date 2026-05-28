import { Movie, MovieDetail, PaginatedResponse, Category } from '@/types/movie';

const CACHE_BASE = typeof window !== 'undefined' ? `http://${location.hostname}:3002` : 'http://localhost:3002';
const OPHIM_BASE = 'https://ophim1.com';
const CDN_URL = 'https://img.ophim.live/uploads/movies/';
const USE_CACHE = true; // set false to use direct oPhim API

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

function ophimListUrl(type?: string, category?: string, country?: string, sort_field?: string, page = 1, limit = 24) {
  const params = new URLSearchParams();
  if (type) params.set('type', type);
  if (category) params.set('category', category);
  if (country) params.set('country', country);
  if (sort_field) params.set('sort_field', sort_field);
  params.set('page', String(page));
  params.set('limit', String(limit));
  return `${OPHIM_BASE}/v1/api/danh-sach?${params}`;
}

function parseOphimList(res: any) {
  return { status: true, items: (res.data?.items || []).map(normalizeMovie), pagination: res.data?.pagination };
}

function ophimDetail(slug: string) {
  return fetchAPI<{ movie: any; episodes: any[] }>(`${OPHIM_BASE}/phim/${slug}`)
    .then((res) => {
      const movie = res.movie;
      const episodes = (res.episodes || []).map((s: any) => ({
        server_name: s.server_name,
        server_data: (s.server_data || []).map((ep: any) => ({
          name: ep.name, slug: ep.slug, filename: ep.filename,
          link_embed: ep.link_embed || '', link_m3u8: ep.link_m3u8 || '',
        })),
      }));
      return {
        ...movie,
        poster_url: movie.poster_url?.startsWith('http') ? movie.poster_url : `${CDN_URL}${movie.poster_url}`,
        thumb_url: movie.thumb_url?.startsWith('http') ? movie.thumb_url : `${CDN_URL}${movie.thumb_url}`,
        episodes,
      } as MovieDetail;
    });
}

function cacheList(params: Record<string, string | number | undefined>) {
  const query = Object.entries(params)
    .filter(([_, v]) => v !== undefined)
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  return fetchAPI<{ status: boolean; items: any[]; pagination: any }>(`${CACHE_BASE}/api/movies/list?${query}`);
}

function cacheDetail(slug: string) {
  return fetchAPI<any>(`${CACHE_BASE}/api/movies/detail/${slug}`);
}

export const moviesApi = {
  getFeatured: () => {
    if (USE_CACHE) {
      return cacheList({ page: 1, limit: 12, sort_field: 'modified' })
        .then(res => (res.items || []).map(normalizeMovie));
    }
    return fetchAPI<any>(ophimListUrl(undefined, undefined, undefined, 'view', 1, 8))
      .then(res => (res.data?.items || []).map(normalizeMovie));
  },

  getSeries: (page = 1) => {
    if (USE_CACHE) return cacheList({ type: 'series', page, limit: 48 }).then(res => ({ status: true, items: (res.items || []).map(normalizeMovie), pagination: res.pagination }));
    return fetchAPI<any>(ophimListUrl('series', undefined, undefined, undefined, page)).then(parseOphimList);
  },

  getSingles: (page = 1) => {
    if (USE_CACHE) return cacheList({ type: 'single', page, limit: 48 }).then(res => ({ status: true, items: (res.items || []).map(normalizeMovie), pagination: res.pagination }));
    return fetchAPI<any>(ophimListUrl('single', undefined, undefined, undefined, page)).then(parseOphimList);
  },

  getByCategory: (slug: string, page = 1) => {
    if (USE_CACHE) return cacheList({ category: slug, page, limit: 48 }).then(res => ({ status: true, items: (res.items || []).map(normalizeMovie), pagination: res.pagination }));
    return fetchAPI<any>(ophimListUrl(undefined, slug, undefined, undefined, page)).then(parseOphimList);
  },

  getByCountry: (slug: string, page = 1) => {
    if (USE_CACHE) return cacheList({ country: slug, page, limit: 48 }).then(res => ({ status: true, items: (res.items || []).map(normalizeMovie), pagination: res.pagination }));
    return fetchAPI<any>(ophimListUrl(undefined, undefined, slug, undefined, page)).then(parseOphimList);
  },

  getByType: (type: string, category?: string, page = 1) => {
    if (USE_CACHE) {
      const params: Record<string, string | number | undefined> = { type, page, limit: 48 };
      if (category) params.category = category;
      return cacheList(params).then(res => ({ status: true, items: (res.items || []).map(normalizeMovie), pagination: res.pagination }));
    }
    return fetchAPI<any>(ophimListUrl(type, category, undefined, undefined, page)).then(parseOphimList);
  },

  search: (keyword: string, page = 1) =>
    fetchAPI<{ status: boolean; data: { items: any[]; pagination: any } }>(`${OPHIM_BASE}/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}`)
      .then(res => ({ status: true, items: (res.data?.items || []).map(normalizeMovie), pagination: res.data?.pagination })),

  getList: (params: Record<string, string | number | undefined>) => {
    if (USE_CACHE) return cacheList(params).then(res => ({ status: true, items: (res.items || []).map(normalizeMovie), pagination: res.pagination }));
    const { type, category, country, sort_field, page = 1, limit = 24 } = params;
    return fetchAPI<any>(ophimListUrl(type as string, category as string, country as string, sort_field as string, page as number, limit as number)).then(parseOphimList);
  },

  getDetail: (slug: string) => {
    if (USE_CACHE) {
      return cacheDetail(slug).then((res) => {
        const movie = res;
        const episodes = (movie.episodes || []).map((s: any) => ({
          server_name: s.server_name,
          server_data: (s.server_data || []).map((ep: any) => ({
            name: ep.name, slug: ep.slug, filename: ep.filename,
            link_embed: ep.link_embed || '', link_m3u8: ep.link_m3u8 || '',
          })),
        }));
        return {
          ...movie,
          poster_url: movie.poster_url?.startsWith('http') ? movie.poster_url : `${CDN_URL}${movie.poster_url}`,
          thumb_url: movie.thumb_url?.startsWith('http') ? movie.thumb_url : `${CDN_URL}${movie.thumb_url}`,
          episodes,
        } as MovieDetail;
      });
    }
    return ophimDetail(slug);
  },
};

export const categoriesApi = {
  getAll: () => {
    if (USE_CACHE) return fetchAPI<{ status: boolean; data: { items: any[] } }>(`${CACHE_BASE}/api/categories`).then(res => (res.data?.items || []).map((c: any) => ({ _id: c._id, name: c.name, slug: c.slug })));
    return fetchAPI<{ status: boolean; data: { items: any[] } }>(`${OPHIM_BASE}/v1/api/the-loai`).then(res => (res.data?.items || []).map((c: any) => ({ _id: c._id, name: c.name, slug: c.slug })));
  },

  getCountries: () => {
    if (USE_CACHE) return fetchAPI<{ status: boolean; data: { items: any[] } }>(`${CACHE_BASE}/api/countries`).then(res => (res.data?.items || []).map((c: any) => ({ _id: c._id, name: c.name, slug: c.slug })));
    return fetchAPI<{ status: boolean; data: { items: any[] } }>(`${OPHIM_BASE}/v1/api/quoc-gia`).then(res => (res.data?.items || []).map((c: any) => ({ _id: c._id, name: c.name, slug: c.slug })));
  },
};
