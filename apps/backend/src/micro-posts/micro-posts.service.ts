import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FEDIFY_FEDERATION } from '@fedify/nestjs';
import { Federation, Note } from '@fedify/fedify';
import { MicroPost } from '../fedify/entities/micro-post.entity';
import { ActorService } from '../fedify/actor.service';
import { OutboxService } from '../fedify/outbox.service';

@Injectable()
export class MicroPostsService {
  constructor(
    @InjectRepository(MicroPost)
    private microPostRepository: Repository<MicroPost>,
    private actorService: ActorService,
    private outboxService: OutboxService,
    @Inject(FEDIFY_FEDERATION)
    private federation: Federation<void>,
  ) {}

  async findAll() {
    return this.microPostRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number) {
    const post = await this.microPostRepository.findOne({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException('MicroPost not found');
    }

    return post;
  }

  async create(input: { content: string; visibility?: string }) {
    const actorUsername = 'crohasang';
    const actor = await this.actorService.getLocalActor(actorUsername);

    if (!actor) {
      throw new NotFoundException(`Local actor not found: ${actorUsername}`);
    }

    const baseUrl = process.env.FEDIFY_BASE_URL || 'http://localhost:3001';

    const post = await this.microPostRepository.save({
      actor_id: actor.id,
      content: input.content,
      content_html: input.content,
      visibility: input.visibility || 'public',
    });

    const ctx = this.federation.createContext(new URL(baseUrl), undefined);

    const noteId = new URL(`/users/${actor.username}/notes/${post.id}`, baseUrl);

    const note = new Note({
      id: noteId,
      attribution: new URL(actor.id),
      content: post.content_html,
    });

    await this.outboxService.sendCreate(ctx, actor.id, note);

    return post;
  }
}
