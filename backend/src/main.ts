import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setSecretKey } from './common/crypto.util';

async function bootstrap() {
  if (process.env.SECRET_KEY) {
    setSecretKey(process.env.SECRET_KEY);
  }

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET'],
  });

  await app.listen(process.env.PORT || 3001);
  console.log(`BlackTeam API running on port ${process.env.PORT || 3001}`);
}
bootstrap();
