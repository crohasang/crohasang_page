import { Inject, MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { join } from 'node:path';
import * as express from 'express';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';
import { FedifyFeatureModule } from './fedify/fedify.module';
import { FEDIFY_FEDERATION, FedifyModule, integrateFederation } from '@fedify/nestjs';
import { Federation, InProcessMessageQueue, MemoryKvStore } from '@fedify/fedify';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(__dirname, '..', '.env'),
        join(__dirname, '..', '.env.local'),
      ],
    }),
    FedifyModule.forRoot({
      kv: new MemoryKvStore(),
      queue: new InProcessMessageQueue(),
      origin: process.env.FEDIFY_BASE_URL || 'http://localhost:3001',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'crohasang_page',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
    }),
    PostsModule,
    FedifyFeatureModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  constructor(
    @Inject(FEDIFY_FEDERATION)
    private federation: Federation<void>,
  ) {}

  configure(consumer: MiddlewareConsumer) {
    const origin = process.env.FEDIFY_BASE_URL || 'http://localhost:3001';
    const fedifyMiddleware = integrateFederation(
      this.federation,
      async (req, res) => {
        return {
          request: req,
          response: res,
          url: new URL(req.url, origin),
        };
      },
    );

    consumer
      .apply(express.raw({ type: '*/*' }), fedifyMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
