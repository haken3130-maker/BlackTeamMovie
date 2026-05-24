import { MoviesService } from './movies.service';
export declare class MoviesController {
    private readonly moviesService;
    constructor(moviesService: MoviesService);
    getFeatured(): Promise<import("../common/movie.interface").Movie[]>;
    getSeries(page?: number): Promise<any>;
    getSingles(page?: number): Promise<any>;
    getByCategory(slug: string, page?: number): Promise<any>;
    getByCountry(slug: string, page?: number): Promise<any>;
    search(keyword: string, page?: number): Promise<{
        status: boolean;
        items: import("../common/movie.interface").Movie[];
        pagination: import("../common/movie.interface").Pagination;
    }>;
    getList(type?: string, category?: string, country?: string, year?: string, page?: string, limit?: string, sort_field?: string): Promise<any>;
    getByType(type: string, category?: string, page?: number): Promise<any>;
    getDetail(slug: string): Promise<any>;
}
