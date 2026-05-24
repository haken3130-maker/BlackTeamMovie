"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const http_service_1 = require("../movies/http.service");
let CategoriesService = class CategoriesService {
    constructor(httpService, cacheManager) {
        this.httpService = httpService;
        this.cacheManager = cacheManager;
        this.baseUrl = process.env.OPHIM_BASE_URL || 'https://ophim1.com';
    }
    async getCategories() {
        const cacheKey = 'categories:all';
        const cached = await this.cacheManager.get(cacheKey);
        if (cached)
            return cached;
        const response = await this.httpService.get(`${this.baseUrl}/v1/api/the-loai`);
        const categories = response.data?.items || [];
        await this.cacheManager.set(cacheKey, categories, 3600);
        return categories;
    }
    async getCountries() {
        const cacheKey = 'countries:all';
        const cached = await this.cacheManager.get(cacheKey);
        if (cached)
            return cached;
        const response = await this.httpService.get(`${this.baseUrl}/v1/api/quoc-gia`);
        const countries = response.data?.items || [];
        await this.cacheManager.set(cacheKey, countries, 3600);
        return countries;
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [http_service_1.HttpService, Object])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map