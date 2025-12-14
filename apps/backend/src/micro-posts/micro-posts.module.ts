import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FedifyFeatureModule } from '../fedify/fedify.module';
import { MicroPost } from '../fedify/entities/micro-post.entity';
import { MicroPostsController } from './micro-posts.controller';
import { MicroPostsService } from './micro-posts.service';


@Module({
  imports: [TypeOrmModule.forFeature([MicroPost]), FedifyFeatureModule],
  controllers: [MicroPostsController],
  providers: [MicroPostsService],
})
export class MicroPostsModule {}
