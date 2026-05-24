import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { HttpService } from '../movies/http.service';
import { CategoryItem, CategoryResponse } from '../common/movie.interface';

@Injectable()
export class CategoriesService {
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.baseUrl = process.env.OPHIM_BASE_URL || 'https://ophim1.com';
  }

  async getCategories(): Promise<CategoryItem[]> {
    const cacheKey = 'categories:all';
    const cached = await this.cacheManager.get<CategoryItem[]>(cacheKey);
    if (cached) return cached;

    const response = await this.httpService.get<CategoryResponse>(
      `${this.baseUrl}/v1/api/the-loai`,
    );

    const categories = response.data?.items || [];
    await this.cacheManager.set(cacheKey, categories, 3600);
    return categories;
  }

  async getCountries() {
    const cacheKey = 'countries:all';
    const cached = await this.cacheManager.get<any[]>(cacheKey);
    if (cached) return cached;

    const response = await this.httpService.get<CategoryResponse>(
      `${this.baseUrl}/v1/api/quoc-gia`,
    );

    const countries = response.data?.items || [];
    await this.cacheManager.set(cacheKey, countries, 3600);
    return countries;
  }
}
