import { Cache } from 'cache-manager';
import { HttpService } from './http.service';
import { Movie } from '../common/movie.interface';
export declare class MoviesService {
    private readonly httpService;
    private cacheManager;
    private readonly baseUrl;
    constructor(httpService: HttpService, cacheManager: Cache);
    getFeatured(): Promise<Movie[]>;
    getSeries(page?: number, limit?: number): Promise<any>;
    getSingles(page?: number, limit?: number): Promise<any>;
    getByCategory(slug: string, page?: number): Promise<any>;
    getByCountry(slug: string, page?: number): Promise<any>;
    getByTypeAndCategory(type: string, category?: string, page?: number): Promise<any>;
    search(keyword: string, page?: number): Promise<{
        status: boolean;
        items: Movie[];
        pagination: import("../common/movie.interface").Pagination;
    }>;
    getDetail(slug: string): Promise<any>;
    getList({ type, category, country, year, page, limit, sort_field, }: {
        type?: string;
        category?: string;
        country?: string;
        year?: number;
        page?: number;
        limit?: number;
        sort_field?: string;
    }): Promise<any>;
}
