import { Injectable } from '@nestjs/common';
import { InboxService } from './inbox.service';
import { ActorService } from './actor.service';
import { Accept, Create, type Context, type Note } from '@fedify/fedify';

@Injectable()
export class OutboxService {
  constructor(
    private inboxService: InboxService,
    private actorService: ActorService,
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

      const accept = new Accept({
        id: new URL(`#accepts/${Date.now()}`, actorUri),
        actor: actorUri,
        object: new URL(followActivityId),
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
  async getOutboxActivities(actorId: string): Promise<any[]> {
    // TODO: MicroPost 서비스가 구현되면 실제 포스트 조회
    // 지금은 빈 배열 반환
    return [];
  }
}
