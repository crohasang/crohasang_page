import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get(':displayId')
  findOne(@Param('displayId', ParseIntPipe) displayId: number) {
    return this.postsService.findByDisplayId(displayId);
  }
}
