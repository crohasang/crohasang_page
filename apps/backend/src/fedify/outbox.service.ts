import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InboxService } from './inbox.service';
import { ActorService } from './actor.service';
import { Accept, Context, Create, Follow, Note } from '@fedify/fedify';
import { MicroPost } from './entities/micro-post.entity';

@Injectable()
export class OutboxService {
  constructor(
    private inboxService: InboxService,
    private actorService: ActorService,
    @InjectRepository(MicroPost)
    private microPostRepository: Repository<MicroPost>,
  ) {}

  /**
   * Accept 액티비티 발송
   * Follow 요청을 수락할 때
   */
  async sendAccept(
    ctx: Context<void>,
    followActivityId: string,
    followerId: string,
    followerInbox: string,
    actorIdentifier: string,
  ): Promise<void> {
    try {
      console.log(`📤 Sending Accept to: ${followerInbox}`);

      const actorUri = ctx.getActorUri(actorIdentifier);

      // Some implementations expect the Accept.object to be a full Follow activity
      // (not just an IRI), so include actor/object explicitly for compatibility.
      const follow = new Follow({
        id: new URL(followActivityId),
        actor: new URL(followerId),
        object: actorUri,
      });

      const accept = new Accept({
        id: new URL(`#accepts/${Date.now()}`, actorUri),
        actor: actorUri,
        object: follow,
      });

      // 팔로워의 Inbox로 Accept 발송
      await ctx.sendActivity(
        { identifier: actorIdentifier },
        {
          id: new URL(followerId),
          inboxId: new URL(followerInbox),
        },
        accept,
      );

      console.log(`✅ Accept sent to: ${followerInbox}`);
    } catch (error) {
      console.error('Error sending Accept activity:', error);
      throw error;
    }
  }

  /**
   * Create 액티비티 발송
   * 새 포스트를 작성했을 때 팔로워들에게 알림
   */
  async sendCreate(
    ctx: Context<void>,
    actorId: string,
    note: Note,
  ): Promise<void> {
    try {
      console.log(`📤 Sending Create activity for: ${note.id?.href}`);

      const actor = await this.actorService.getActorById(actorId);
      if (!actor) {
        throw new Error(`Actor not found: ${actorId}`);
      }

      const actorUri = ctx.getActorUri(actor.username);
      const noteId = note.id ?? new URL(`#notes/${Date.now()}`, actorUri);

      const create = new Create({
        id: new URL(`#creates/${Date.now()}`, noteId),
        actor: actorUri,
        object: note,
      });

      // 팔로워 목록 가져오기
      const followers = await this.inboxService.getFollowers(actorId);

      console.log(`📤 Sending to ${followers.length} followers`);

      // 각 팔로워의 Inbox로 발송
      for (const follow of followers) {
        try {
          const followerActor = await this.actorService.getActorById(
            follow.follower_id,
          );

          if (followerActor?.inbox_url) {
            await ctx.sendActivity(
              { identifier: actor.username },
              {
                id: new URL(follow.follower_id),
                inboxId: new URL(followerActor.inbox_url),
              },
              create,
            );

            console.log(`✅ Sent to: ${followerActor.inbox_url}`);
          }
        } catch (error) {
          console.error(
            `Failed to send to follower ${follow.follower_id}:`,
            error,
          );
          // 개별 실패는 무시하고 계속 진행
        }
      }

      console.log(`✅ Create activity sent to ${followers.length} followers`);
    } catch (error) {
      console.error('Error sending Create activity:', error);
      throw error;
    }
  }

  /**
   * Outbox 조회
   * 액터의 공개 포스트 목록 반환
   */
  async getOutboxActivities(ctx: Context<void>, actorId: string): Promise<any[]> {
    const actor = await this.actorService.getActorById(actorId);
    if (!actor?.username) {
      return [];
    }

    const posts = await this.microPostRepository.find({
      where: {
        actor_id: actorId,
        visibility: 'public',
      },
      order: { created_at: 'DESC' },
      take: 20,
    });

    const actorUri = ctx.getActorUri(actor.username);

    return posts.map((post) => {
      const note = new Note({
        id: ctx.getObjectUri(Note, { identifier: actor.username, id: String(post.id) }),
        attribution: new URL(actorId),
        content: post.content_html || post.content,
      });

      return new Create({
        id: new URL(`#creates/${post.id}`, note.id ?? actorUri),
        actor: actorUri,
        object: note,
      });
    });
  }
}
