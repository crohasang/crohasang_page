import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { MicroPostsService } from './micro-posts.service';

@Controller('micro-posts')
export class MicroPostsController {
  constructor(private readonly microPostsService: MicroPostsService) {}

  @Get()
  findAll() {
    return this.microPostsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.microPostsService.findOne(id);
  }

  @Post()
  create(@Body() body: { content: string; visibility?: string }) {
    return this.microPostsService.create({
      content: body.content,
      visibility: body.visibility,
    });
  }
}
