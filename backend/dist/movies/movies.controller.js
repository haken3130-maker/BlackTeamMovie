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
exports.MoviesController = void 0;
const common_1 = require("@nestjs/common");
const movies_service_1 = require("./movies.service");
let MoviesController = class MoviesController {
    constructor(moviesService) {
        this.moviesService = moviesService;
    }
    getFeatured() {
        return this.moviesService.getFeatured();
    }
    getSeries(page) {
        return this.moviesService.getSeries(page || 1);
    }
    getSingles(page) {
        return this.moviesService.getSingles(page || 1);
    }
    getByCategory(slug, page) {
        return this.moviesService.getByCategory(slug, page || 1);
    }
    getByCountry(slug, page) {
        return this.moviesService.getByCountry(slug, page || 1);
    }
    search(keyword, page) {
        return this.moviesService.search(keyword, page || 1);
    }
    getList(type, category, country, year, page, limit, sort_field) {
        return this.moviesService.getList({
            type,
            category,
            country,
            year: year ? parseInt(year) : undefined,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 24,
            sort_field,
        });
    }
    getByType(type, category, page) {
        return this.moviesService.getByTypeAndCategory(type, category, page || 1);
    }
    getDetail(slug) {
        return this.moviesService.getDetail(slug);
    }
};
exports.MoviesController = MoviesController;
__decorate([
    (0, common_1.Get)('featured'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MoviesController.prototype, "getFeatured", null);
__decorate([
    (0, common_1.Get)('series'),
    __param(0, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], MoviesController.prototype, "getSeries", null);
__decorate([
    (0, common_1.Get)('single'),
    __param(0, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], MoviesController.prototype, "getSingles", null);
__decorate([
    (0, common_1.Get)('category/:slug'),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], MoviesController.prototype, "getByCategory", null);
__decorate([
    (0, common_1.Get)('country/:slug'),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], MoviesController.prototype, "getByCountry", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)('keyword')),
    __param(1, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], MoviesController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('list'),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('country')),
    __param(3, (0, common_1.Query)('year')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __param(6, (0, common_1.Query)('sort_field')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], MoviesController.prototype, "getList", null);
__decorate([
    (0, common_1.Get)('type/:type'),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", void 0)
], MoviesController.prototype, "getByType", null);
__decorate([
    (0, common_1.Get)('detail/:slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MoviesController.prototype, "getDetail", null);
exports.MoviesController = MoviesController = __decorate([
    (0, common_1.Controller)('api/movies'),
    __metadata("design:paramtypes", [movies_service_1.MoviesService])
], MoviesController);
//# sourceMappingURL=movies.controller.js.map