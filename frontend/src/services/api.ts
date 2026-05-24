import { Movie, MovieDetail, PaginatedResponse, Category } from '@/types/movie';

const API_BASE = '/api';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const moviesApi = {
  getFeatured: () => fetchAPI<Movie[]>('/movies/featured'),

  getSeries: (page = 1) =>
    fetchAPI<PaginatedResponse>(`/movies/series?page=${page}`),

  getSingles: (page = 1) =>
    fetchAPI<PaginatedResponse>(`/movies/single?page=${page}`),

  getByCategory: (slug: string, page = 1) =>
    fetchAPI<PaginatedResponse>(`/movies/category/${slug}?page=${page}`),

  getByCountry: (slug: string, page = 1) =>
    fetchAPI<PaginatedResponse>(`/movies/country/${slug}?page=${page}`),

  getByType: (type: string, category?: string, page = 1) => {
    let url = `/movies/type/${type}?page=${page}`;
    if (category) url += `&category=${category}`;
    return fetchAPI<PaginatedResponse>(url);
  },

  search: (keyword: string, page = 1) =>
    fetchAPI<PaginatedResponse>(`/movies/search?keyword=${encodeURIComponent(keyword)}&page=${page}`),

  getList: (params: Record<string, string | number | undefined>) => {
    const query = Object.entries(params)
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => `${k}=${v}`)
      .join('&');
    return fetchAPI<PaginatedResponse>(`/movies/list?${query}`);
  },

  getDetail: (slug: string) =>
    fetchAPI<MovieDetail>(`/movies/detail/${slug}`),
};

export const categoriesApi = {
  getAll: () => fetchAPI<Category[]>('/categories'),
  getCountries: () => fetchAPI<Category[]>('/countries'),
};
