import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { HttpService } from './http.service';
import { Movie, ListResponse, DetailResponse, EpisodeServer, MovieDetail } from '../common/movie.interface';
import { encrypt } from '../common/crypto.util';

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
    category: Array.isArray(m.category) ? m.category.map(normalizeCat) : [],
    country: Array.isArray(m.country) ? m.country.map(normalizeCat) : [],
    episode_current: m.episode_current,
    episode_total: m.episode_total,
    view: typeof m.view === 'number' ? m.view : parseInt(m.view) || 0,
    content: m.content || '',
  };
}

function normalizeCat(c: any) {
  if (typeof c === 'object' && c !== null) {
    return { id: c.id || c._id, name: c.name, slug: c.slug };
  }
  return { id: '', name: String(c), slug: '' };
}

function normalizeEpisodeServers(servers: any[]): EpisodeServer[] {
  return (servers || []).map((s) => ({
    server_name: s.server_name,
    server_data: (s.server_data || []).map((ep: any) => ({
      name: ep.name,
      slug: ep.slug,
      filename: ep.filename,
      link_embed: ep.link_embed ? encrypt(ep.link_embed) : '',
      link_m3u8: ep.link_m3u8 ? encrypt(ep.link_m3u8) : '',
    })),
  }));
}

@Injectable()
export class MoviesService {
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.baseUrl = process.env.OPHIM_BASE_URL || 'https://ophim1.com';
  }

  async getFeatured(): Promise<Movie[]> {
    const cacheKey = 'movies:featured';
    const cached = await this.cacheManager.get<Movie[]>(cacheKey);
    if (cached) return cached;

    const response = await this.httpService.get<ListResponse>(
      `${this.baseUrl}/v1/api/danh-sach?sort_field=view&limit=8`,
    );

    const movies = (response.data?.items || []).map(normalizeMovie);
    await this.cacheManager.set(cacheKey, movies, 300);
    return movies;
  }

  async getSeries(page: number = 1, limit: number = 20) {
    const cacheKey = `movies:series:${page}`;
    const cached = await this.cacheManager.get<any>(cacheKey);
    if (cached) return cached;

    const response = await this.httpService.get<ListResponse>(
      `${this.baseUrl}/v1/api/danh-sach?type=series&page=${page}&limit=${limit}`,
    );

    const result = {
      status: true,
      items: (response.data?.items || []).map(normalizeMovie),
      pagination: response.data?.pagination || null,
    };

    await this.cacheManager.set(cacheKey, result, 300);
    return result;
  }

  async getSingles(page: number = 1, limit: number = 20) {
    const cacheKey = `movies:single:${page}`;
    const cached = await this.cacheManager.get<any>(cacheKey);
    if (cached) return cached;

    const response = await this.httpService.get<ListResponse>(
      `${this.baseUrl}/v1/api/danh-sach?type=single&page=${page}&limit=${limit}`,
    );

    const result = {
      status: true,
      items: (response.data?.items || []).map(normalizeMovie),
      pagination: response.data?.pagination || null,
    };

    await this.cacheManager.set(cacheKey, result, 300);
    return result;
  }

  async getByCategory(slug: string, page: number = 1) {
    const cacheKey = `movies:category:${slug}:${page}`;
    const cached = await this.cacheManager.get<any>(cacheKey);
    if (cached) return cached;

    const response = await this.httpService.get<ListResponse>(
      `${this.baseUrl}/v1/api/danh-sach?category=${slug}&page=${page}`,
    );

    const result = {
      status: true,
      items: (response.data?.items || []).map(normalizeMovie),
      pagination: response.data?.pagination || null,
    };

    await this.cacheManager.set(cacheKey, result, 300);
    return result;
  }

  async getByCountry(slug: string, page: number = 1) {
    const cacheKey = `movies:country:${slug}:${page}`;
    const cached = await this.cacheManager.get<any>(cacheKey);
    if (cached) return cached;

    const response = await this.httpService.get<ListResponse>(
      `${this.baseUrl}/v1/api/danh-sach?country=${slug}&page=${page}`,
    );

    const result = {
      status: true,
      items: (response.data?.items || []).map(normalizeMovie),
      pagination: response.data?.pagination || null,
    };

    await this.cacheManager.set(cacheKey, result, 300);
    return result;
  }

  async getByTypeAndCategory(type: string, category?: string, page: number = 1) {
    let url = `${this.baseUrl}/v1/api/danh-sach?type=${type}&page=${page}`;
    if (category) url += `&category=${category}`;

    const cacheKey = `movies:${type}:${category || 'all'}:${page}`;
    const cached = await this.cacheManager.get<any>(cacheKey);
    if (cached) return cached;

    const response = await this.httpService.get<ListResponse>(url);

    const result = {
      status: true,
      items: (response.data?.items || []).map(normalizeMovie),
      pagination: response.data?.pagination || null,
    };

    await this.cacheManager.set(cacheKey, result, 300);
    return result;
  }

  async search(keyword: string, page: number = 1) {
    const response = await this.httpService.get<ListResponse>(
      `${this.baseUrl}/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}`,
    );

    return {
      status: true,
      items: (response.data?.items || []).map(normalizeMovie),
      pagination: response.data?.pagination || null,
    };
  }

  async getDetail(slug: string) {
    const cacheKey = `movies:detail:${slug}`;
    const cached = await this.cacheManager.get<any>(cacheKey);
    if (cached) return cached;

    const response = await this.httpService.get<DetailResponse>(
      `${this.baseUrl}/phim/${slug}`,
    );

    const movie = response.movie;
    const episodes = normalizeEpisodeServers(response.episodes || []);

    const detail = {
      ...movie,
      poster_url: movie.poster_url?.startsWith('http') ? movie.poster_url : `${CDN_URL}${movie.poster_url}`,
      thumb_url: movie.thumb_url?.startsWith('http') ? movie.thumb_url : `${CDN_URL}${movie.thumb_url}`,
      episodes,
    };

    await this.cacheManager.set(cacheKey, detail, 600);
    return detail;
  }

  async getList({
    type,
    category,
    country,
    year,
    page = 1,
    limit = 24,
    sort_field,
  }: {
    type?: string;
    category?: string;
    country?: string;
    year?: number;
    page?: number;
    limit?: number;
    sort_field?: string;
  }) {
    let url = `${this.baseUrl}/v1/api/danh-sach?page=${page}&limit=${limit}`;
    if (type) url += `&type=${type}`;
    if (category) url += `&category=${category}`;
    if (country) url += `&country=${country}`;
    if (year) url += `&year=${year}`;
    if (sort_field) url += `&sort_field=${sort_field}`;

    const cacheKey = `movies:list:${JSON.stringify({ type, category, country, year, page, limit, sort_field })}`;
    const cached = await this.cacheManager.get<any>(cacheKey);
    if (cached) return cached;

    const response = await this.httpService.get<ListResponse>(url);

    const result = {
      status: true,
      items: (response.data?.items || []).map(normalizeMovie),
      pagination: response.data?.pagination || null,
    };

    await this.cacheManager.set(cacheKey, result, 300);
    return result;
  }
}
