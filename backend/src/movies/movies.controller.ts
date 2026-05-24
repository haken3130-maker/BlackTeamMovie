import { Controller, Get, Param, Query } from '@nestjs/common';
import { MoviesService } from './movies.service';

@Controller('api/movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get('featured')
  getFeatured() {
    return this.moviesService.getFeatured();
  }

  @Get('series')
  getSeries(@Query('page') page?: number) {
    return this.moviesService.getSeries(page || 1);
  }

  @Get('single')
  getSingles(@Query('page') page?: number) {
    return this.moviesService.getSingles(page || 1);
  }

  @Get('category/:slug')
  getByCategory(@Param('slug') slug: string, @Query('page') page?: number) {
    return this.moviesService.getByCategory(slug, page || 1);
  }

  @Get('country/:slug')
  getByCountry(@Param('slug') slug: string, @Query('page') page?: number) {
    return this.moviesService.getByCountry(slug, page || 1);
  }

  @Get('search')
  search(@Query('keyword') keyword: string, @Query('page') page?: number) {
    return this.moviesService.search(keyword, page || 1);
  }

  @Get('list')
  getList(
    @Query('type') type?: string,
    @Query('category') category?: string,
    @Query('country') country?: string,
    @Query('year') year?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort_field') sort_field?: string,
  ) {
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

  @Get('type/:type')
  getByType(
    @Param('type') type: string,
    @Query('category') category?: string,
    @Query('page') page?: number,
  ) {
    return this.moviesService.getByTypeAndCategory(type, category, page || 1);
  }

  @Get('detail/:slug')
  getDetail(@Param('slug') slug: string) {
    return this.moviesService.getDetail(slug);
  }
}
