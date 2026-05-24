export interface Movie {
  _id: string;
  name: string;
  slug: string;
  origin_name: string;
  poster_url: string;
  thumb_url: string;
  time: string;
  quality: string;
  lang: string;
  year: number;
  type: 'single' | 'series';
  category: { id: string; name: string; slug: string }[];
  country: { id: string; name: string; slug: string }[];
  episode_current: string;
  episode_total: string;
  view: number;
  content: string;
}

export interface Episode {
  name: string;
  slug: string;
  filename: string;
  link_embed: string;
  link_m3u8: string;
}

export interface EpisodeGroup {
  server_name: string;
  server_data: Episode[];
}

export interface MovieDetail extends Movie {
  episodes: EpisodeGroup[];
}

export interface Pagination {
  totalItems: number;
  totalItemsPerPage: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginatedResponse {
  status: boolean;
  items: Movie[];
  pagination: Pagination;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
}

export interface ViewHistoryItem {
  slug: string;
  name: string;
  thumb_url: string;
  episode: string;
  timestamp: number;
}
