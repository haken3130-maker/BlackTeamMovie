import { Cache } from 'cache-manager';
import { HttpService } from '../movies/http.service';
import { CategoryItem } from '../common/movie.interface';
export declare class CategoriesService {
    private readonly httpService;
    private cacheManager;
    private readonly baseUrl;
    constructor(httpService: HttpService, cacheManager: Cache);
    getCategories(): Promise<CategoryItem[]>;
    getCountries(): Promise<any[]>;
}
