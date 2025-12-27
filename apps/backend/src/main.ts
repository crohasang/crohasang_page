import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dns from 'node:dns';

if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS 설정
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://crohasang.com',
      'https://www.crohasang.com',
    ],
    credentials: true,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Backend server running on http://localhost:${port}`);
}
bootstrap();
