import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    getCategories(): Promise<import("../common/movie.interface").CategoryItem[]>;
    getCountries(): Promise<any[]>;
}
