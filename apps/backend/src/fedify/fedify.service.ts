import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Accept, Create, Federation, Person, Follow, Note, Undo } from '@fedify/fedify';
import { FEDIFY_FEDERATION } from '@fedify/nestjs';
import { Temporal } from '@js-temporal/polyfill';
import { ActorService } from './actor.service';
import { KeypairService } from './keypair.service';
import { InboxService } from './inbox.service';
import { OutboxService } from './outbox.service';
import { MicroPost } from './entities/micro-post.entity';

@Injectable()
export class FedifyService implements OnModuleInit {
  constructor(
    @Inject(FEDIFY_FEDERATION)
    private federation: Federation<void>,
    private actorService: ActorService,
    private keypairService: KeypairService,
    private inboxService: InboxService,
    private outboxService: OutboxService,
    @InjectRepository(MicroPost)
    private microPostRepository: Repository<MicroPost>,
  ) {
    this.setupActorDispatcher();
    this.setupObjectDispatcher();
    this.setupInboxListeners();
    this.setupOutbox();
    this.setupFollowersDispatcher();
    this.setupFollowingDispatcher();
  }

  private setupObjectDispatcher() {
    this.federation.setObjectDispatcher(
      Note,
      '/users/{identifier}/notes/{id}',
      async (ctx, { identifier, id }) => {
        const actor = await this.actorService.getLocalActor(identifier);
        if (!actor) {
          return null;
        }

        const postId = Number(id);
        if (!Number.isFinite(postId)) {
          return null;
        }

        const post = await this.microPostRepository.findOne({
          where: {
            id: postId,
            actor_id: actor.id,
          },
        });

        if (!post) {
          return null;
        }

        return new Note({
          id: ctx.getObjectUri(Note, { identifier, id }),
          attribution: new URL(actor.id),
          content: post.content_html || post.content,
        });
      },
    );
  }

  async onModuleInit() {
    console.log(' Fedify service initialized');

    // 로컬 액터가 없으면 생성
    const localActor = await this.actorService.getLocalActor('crohasang');
    if (!localActor) {
      console.log('Creating local actor: crohasang');
      await this.actorService.createLocalActor({
        username: 'crohasang',
        display_name: process.env.ACTOR_DISPLAY_NAME || 'crohasang',
        bio: process.env.ACTOR_BIO || 'Web Developer',
      });
    }
  }

  /**
   * Actor Dispatcher 설정
   * /users/{identifier} 경로로 액터 정보 제공
   */
  private setupActorDispatcher() {
    this.federation
      .setActorDispatcher('/users/{identifier}', async (ctx, identifier) => {
        const actor = await this.actorService.getLocalActor(identifier);

        if (!actor) {
          return null;
        }

        // Fedify가 제공하는 getActorKeyPairs를 사용하여 키 가져오기
        const keys = await ctx.getActorKeyPairs(identifier);

        return new Person({
          id: ctx.getActorUri(identifier),
          name: actor.display_name,
          preferredUsername: actor.username,
          summary: actor.bio,
          inbox: ctx.getInboxUri(identifier),
          outbox: ctx.getOutboxUri(identifier),
          followers: ctx.getFollowersUri(identifier),
          following: ctx.getFollowingUri(identifier),
          url: new URL(actor.url || ''),
          published: actor.created_at
            ? Temporal.Instant.fromEpochMilliseconds(actor.created_at.getTime())
            : null,
          // 중요: publicKey와 assertionMethods 설정
          publicKey: keys[0]?.cryptographicKey,
          assertionMethods: keys.map((key) => key.multikey),
        });
      })
      .setKeyPairsDispatcher(async (ctx, identifier) => {
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
      const followingId = follow.objectId?.href;
      const follower = await this.actorService.getActorById(followerId || '');

      const actorIdentifier = (() => {
        if (!followingId) {
          return null;
        }
        try {
          const url = new URL(followingId);
          const parts = url.pathname.split('/').filter(Boolean);
          return parts[parts.length - 1] ?? null;
        } catch {
          return null;
        }
      })();

      if (followerId && follower?.inbox_url && follow.id?.href && actorIdentifier) {
        await this.outboxService.sendAccept(
          ctx,
          follow.id.href,
          followerId,
          follower.inbox_url,
          actorIdentifier,
        );
      }
    });

    // Undo 액티비티 처리
    inboxListeners.on(Undo, async (ctx, undo) => {
      await this.inboxService.handleUndo(ctx, undo);
    });

    // Accept 액티비티 처리 (내가 보낸 Follow가 수락되었을 때)
    inboxListeners.on(Accept, async (ctx, accept) => {
      await this.inboxService.handleAccept(ctx, accept);
    });

    // Create 액티비티 처리 (팔로우하는 사람의 새 글)
    inboxListeners.on(Create, async (ctx, create) => {
      await this.inboxService.handleCreate(ctx, create);
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

      const activities = await this.outboxService.getOutboxActivities(ctx, actor.id);

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
    this.federation
      .setFollowersDispatcher(
        '/users/{identifier}/followers',
        async (ctx, identifier, cursor) => {
          const actor = await this.actorService.getLocalActor(identifier);

          if (!actor) {
            return null;
          }

          const follows = await this.inboxService.getFollowers(actor.id);

          const recipients = await Promise.all(
            follows.map(async (f) => {
              const followerActor = await this.actorService.getActorById(f.follower_id);
              if (!followerActor?.inbox_url) {
                return null;
              }
              return {
                id: new URL(f.follower_id),
                inboxId: new URL(followerActor.inbox_url),
              };
            }),
          );

          return {
            items: recipients.filter(
              (r): r is { id: URL; inboxId: URL } => r !== null,
            ),
          };
        },
      )
      .setCounter(async (ctx, identifier) => {
        const actor = await this.actorService.getLocalActor(identifier);
        if (!actor) {
          return 0;
        }
        const follows = await this.inboxService.getFollowers(actor.id);
        return follows.length;
      });
  }

  /**
   * Following Dispatcher 설정
   * 팔로잉 목록 제공
   */
  private setupFollowingDispatcher() {
    this.federation
      .setFollowingDispatcher(
        '/users/{identifier}/following',
        async (ctx, identifier, cursor) => {
          const actor = await this.actorService.getLocalActor(identifier);

          if (!actor) {
            return null;
          }

          const following = await this.inboxService.getFollowing(actor.id);

          const recipients = await Promise.all(
            following.map(async (f) => {
              // 팔로잉하는 대상(following_id)이 원격일 수도 있음
              // 여기서는 ID만 반환하거나, 필요한 경우 ActorService를 통해 조회
              return new URL(f.following_id);
            }),
          );

          return {
            items: recipients,
          };
        },
      )
      .setCounter(async (ctx, identifier) => {
        const actor = await this.actorService.getLocalActor(identifier);
        if (!actor) {
          return 0;
        }
        const following = await this.inboxService.getFollowing(actor.id);
        return following.length;
      });
  }
}
