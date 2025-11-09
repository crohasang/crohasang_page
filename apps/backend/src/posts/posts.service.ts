import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  async findAll() {
    const posts = await this.postsRepository.find({
      order: { created_at: 'DESC' },
    });

    // displayId 추가
    const postsWithDisplayId = posts.map((post, index) => ({
      ...post,
      displayId: posts.length - index,
    }));

    return postsWithDisplayId;
  }

  async findByDisplayId(displayId: number) {
    const posts = await this.postsRepository.find({
      order: { created_at: 'DESC' },
    });

    const postIndex = posts.length - displayId;

    if (postIndex < 0 || postIndex >= posts.length) {
      throw new NotFoundException('Post not found');
    }

    return posts[postIndex];
  }
}
