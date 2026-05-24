import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { MoviesModule } from './movies/movies.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    CacheModule.register({
      ttl: parseInt(process.env.CACHE_TTL || '600'),
      max: 100,
      isGlobal: true,
    }),
    MoviesModule,
    CategoriesModule,
  ],
})
export class AppModule {}
