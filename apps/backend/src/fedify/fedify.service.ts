import { Injectable, OnModuleInit } from '@nestjs/common';
import { createFederation, Person, Follow, Undo } from '@fedify/fedify';
import { MemoryKvStore } from '@fedify/fedify/kv';
import { ActorService } from './actor.service';
import { KeypairService } from './keypair.service';
import { InboxService } from './inbox.service';
import { OutboxService } from './outbox.service';

@Injectable()
export class FedifyService implements OnModuleInit {
  private federation: ReturnType<typeof createFederation<void>>;

  constructor(
    private actorService: ActorService,
    private keypairService: KeypairService,
    private inboxService: InboxService,
    private outboxService: OutboxService,
  ) {
    // Federation 객체 생성
    this.federation = createFederation<void>({
      kv: new MemoryKvStore(), // TODO: 프로덕션에서는 Redis 사용
    });

    this.setupActorDispatcher();
    this.setupKeyPairsDispatcher();
    this.setupInboxListeners();
    this.setupOutbox();
    this.setupFollowersDispatcher();
  }

  async onModuleInit() {
    console.log('🚀 Fedify service initialized');

    // 로컬 액터가 없으면 생성
    const localActor = await this.actorService.getLocalActor('crohasang');
    if (!localActor) {
      console.log('Creating local actor: crohasang');
      await this.actorService.createLocalActor({
        username: 'crohasang',
        display_name: process.env.ACTOR_DISPLAY_NAME || 'Hasang Cho',
        bio: process.env.ACTOR_BIO || 'Software Engineer & Blogger',
      });
    }
  }

  /**
   * Actor Dispatcher 설정
   * /users/{identifier} 경로로 액터 정보 제공
   */
  private setupActorDispatcher() {
    this.federation.setActorDispatcher('/users/{identifier}', async (ctx, identifier) => {
      const actor = await this.actorService.getLocalActor(identifier);

      if (!actor) {
        return null;
      }

      return new Person({
        id: ctx.getActorUri(identifier),
        name: actor.display_name,
        preferredUsername: actor.username,
        summary: actor.bio,
        inbox: ctx.getInboxUri(identifier),
        outbox: ctx.getOutboxUri(identifier),
        followers: ctx.getFollowersUri(identifier),
        url: new URL(actor.url || ''),
        published: actor.created_at,
      });
    });
  }

  /**
   * Key Pairs Dispatcher 설정
   * 액터의 암호화 키 쌍 제공
   */
  private setupKeyPairsDispatcher() {
    this.federation.setKeyPairsDispatcher('/users/{identifier}', async (ctx, identifier) => {
      const actor = await this.actorService.getLocalActor(identifier);

      if (!actor) {
        return [];
      }

      // 키 쌍이 없으면 생성
      const keyPairs = await this.keypairService.ensureKeyPairs(actor.id);

      return keyPairs;
    });
  }

  /**
   * Inbox Listeners 설정
   * 다른 서버로부터 받은 액티비티 처리
   */
  private setupInboxListeners() {
    const inboxListeners = this.federation.setInboxListeners('/users/{identifier}/inbox', '/inbox');

    // Follow 액티비티 처리
    inboxListeners.on(Follow, async (ctx, follow) => {
      await this.inboxService.handleFollow(ctx, follow);

      // Accept 응답 발송
      const followerId = follow.actorId?.href;
      const follower = await this.actorService.getActorById(followerId || '');

      if (follower?.inbox_url && follow.id?.href) {
        await this.outboxService.sendAccept(ctx, follow.id.href, follower.inbox_url);
      }
    });

    // Undo 액티비티 처리
    inboxListeners.on(Undo, async (ctx, undo) => {
      await this.inboxService.handleUndo(ctx, undo);
    });
  }

  /**
   * Outbox Dispatcher 설정
   * 액터의 공개 포스트 목록 제공
   */
  private setupOutbox() {
    this.federation.setOutboxDispatcher('/users/{identifier}/outbox', async (ctx, identifier) => {
      const actor = await this.actorService.getLocalActor(identifier);

      if (!actor) {
        return null;
      }

      const activities = await this.outboxService.getOutboxActivities(actor.id);

      return {
        items: activities,
      };
    });
  }

  /**
   * Followers Dispatcher 설정
   * 팔로워 목록 제공
   */
  private setupFollowersDispatcher() {
    this.federation.setFollowersDispatcher(
      '/users/{identifier}/followers',
      async (ctx, identifier, cursor) => {
        const actor = await this.actorService.getLocalActor(identifier);

        if (!actor) {
          return null;
        }

        const followers = await this.inboxService.getFollowers(actor.id);

        return {
          items: followers.map((f) => new URL(f.follower_id)),
        };
      },
    );

    // 팔로워 카운터
    this.federation.setCounter(
      '/users/{identifier}/followers',
      async (ctx, identifier) => {
        const actor = await this.actorService.getLocalActor(identifier);

        if (!actor) {
          return 0;
        }

        const followers = await this.inboxService.getFollowers(actor.id);
        return followers.length;
      },
    );
  }

  /**
   * Federation 객체 반환
   * main.ts에서 미들웨어로 사용
   */
  getFederation() {
    return this.federation;
  }
}
