import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { MicroPostsService } from './micro-posts.service';
import { AdminTokenGuard } from '../auth/admin-token.guard';

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
  @UseGuards(AdminTokenGuard)
  create(@Body() body: { content: string; visibility?: string }) {
    return this.microPostsService.create({
      content: body.content,
      visibility: body.visibility,
    });
  }
}
