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
    category: any[];
    country: any[];
    episode_current: string;
    episode_total: string;
    view: number;
    content: string;
}
export interface EpisodeData {
    name: string;
    slug: string;
    filename: string;
    link_embed: string;
    link_m3u8: string;
}
export interface EpisodeServer {
    server_name: string;
    server_data: EpisodeData[];
}
export interface MovieDetail {
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
    type: string;
    category: string;
    country: string;
    episode_current: string;
    episode_total: string;
    content: string;
    status: string;
    view: number;
}
export interface DetailResponse {
    status: boolean;
    msg?: string;
    movie: MovieDetail;
    episodes: EpisodeServer[];
}
export interface ListData {
    items: Movie[];
    pagination: Pagination;
    seoOnPage?: any;
    params?: any;
    APP_DOMAIN_CDN_IMAGE?: string;
}
export interface ListResponse {
    status: string;
    message?: string;
    data: ListData;
}
export interface Pagination {
    totalItems: number;
    totalItemsPerPage: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
}
export interface CategoryItem {
    _id: string;
    name: string;
    slug: string;
}
export interface CategoryResponse {
    status: string;
    message?: string;
    data: {
        items: CategoryItem[];
    };
}
