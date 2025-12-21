import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FEDIFY_FEDERATION } from '@fedify/nestjs';
import { Federation, Follow as FedifyFollow, Undo } from '@fedify/fedify';
import { ActorService } from './actor.service';
import { Follow } from './entities/follow.entity';
import { InboxActivity } from './entities/inbox-activity.entity';

type WebFingerResponse = {
  links?: Array<{ rel?: string; type?: string; href?: string }>;
};

type RemoteActorJson = {
  id?: string;
  inbox?: string;
  endpoints?: {
    sharedInbox?: string;
  };
  preferredUsername?: string;
  name?: string;
  summary?: string;
  url?: string;
};

@Injectable()
export class FollowingService {
  constructor(
    private actorService: ActorService,
    @InjectRepository(Follow)
    private followRepository: Repository<Follow>,
    @InjectRepository(InboxActivity)
    private inboxActivityRepository: Repository<InboxActivity>,
    @Inject(FEDIFY_FEDERATION)
    private federation: Federation<void>,
  ) {}

  private normalizeTarget(target: string) {
    const t = target.trim();
    if (t.startsWith('http://') || t.startsWith('https://')) {
      return { type: 'actorUrl' as const, actorUrl: t };
    }

    const acct = t.startsWith('@') ? t.slice(1) : t;
    return { type: 'acct' as const, acct };
  }

  private async resolveActorUrlFromAcct(acct: string): Promise<string> {
    const parts = acct.split('@').filter(Boolean);
    if (parts.length < 2) {
      throw new Error('Invalid acct format. Use @user@domain or user@domain');
    }

    const username = parts[0];
    const domain = parts.slice(1).join('@');

    const webfingerUrl = `https://${domain}/.well-known/webfinger?resource=acct:${encodeURIComponent(
      `${username}@${domain}`,
    )}`;

    const res = await fetch(webfingerUrl, {
      cache: 'no-store',
      headers: { Accept: 'application/jrd+json, application/json' },
    });

    if (!res.ok) {
      throw new Error(`WebFinger lookup failed: ${res.status}`);
    }

    const data = (await res.json()) as WebFingerResponse;
    const selfLink = data.links?.find(
      (l) =>
        l.rel === 'self' &&
        typeof l.href === 'string' &&
        typeof l.type === 'string' &&
        (l.type.includes('application/activity+json') || l.type.includes('application/ld+json')),
    );

    if (!selfLink?.href) {
      throw new Error('WebFinger response missing ActivityPub self link');
    }

    return selfLink.href;
  }

  private async fetchRemoteActor(actorUrl: string): Promise<RemoteActorJson> {
    const res = await fetch(actorUrl, {
      cache: 'no-store',
      headers: {
        Accept: 'application/activity+json',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch remote actor: ${res.status}`);
    }

    return (await res.json()) as RemoteActorJson;
  }

  private async resolveRemote(target: string): Promise<{ remoteId: string; inbox: string; actorUrl: string }> {
    const normalized = this.normalizeTarget(target);
    const actorUrl =
      normalized.type === 'actorUrl'
        ? normalized.actorUrl
        : await this.resolveActorUrlFromAcct(normalized.acct);

    const remote = await this.fetchRemoteActor(actorUrl);

    if (!remote.id) {
      throw new Error('Remote actor JSON missing id');
    }

    const inboxUrl = typeof remote.inbox === 'string' ? remote.inbox : null;
    const sharedInboxUrl =
      remote.endpoints && typeof remote.endpoints.sharedInbox === 'string'
        ? remote.endpoints.sharedInbox
        : null;

    const targetInbox = sharedInboxUrl ?? inboxUrl;
    if (!targetInbox) {
      throw new Error('Remote actor JSON missing inbox/sharedInbox');
    }

    await this.actorService.createOrUpdateRemoteActor({
      id: remote.id,
      username: typeof remote.preferredUsername === 'string' ? remote.preferredUsername : undefined,
      display_name: typeof remote.name === 'string' ? remote.name : undefined,
      bio: typeof remote.summary === 'string' ? remote.summary : undefined,
      inbox_url: inboxUrl ?? undefined,
      shared_inbox_url: sharedInboxUrl ?? undefined,
      url: typeof remote.url === 'string' ? remote.url : actorUrl,
      type: 'Person',
    });

    return { remoteId: remote.id, inbox: targetInbox, actorUrl };
  }

  async follow(target: string) {
    const localUsername = 'crohasang';
    const localActor = await this.actorService.getLocalActor(localUsername);
    if (!localActor) {
      throw new NotFoundException(`Local actor not found: ${localUsername}`);
    }

    const { remoteId, inbox: targetInbox } = await this.resolveRemote(target);

    const existing = await this.followRepository.findOne({
      where: {
        follower_id: localActor.id,
        following_id: remoteId,
      },
    });

    if (!existing) {
      await this.followRepository.save({
        follower_id: localActor.id,
        following_id: remoteId,
        status: 'pending',
      });
    }

    const baseUrl = process.env.FEDIFY_BASE_URL || 'http://localhost:3001';
    const ctx = this.federation.createContext(new URL(baseUrl), undefined);

    const actorUri = ctx.getActorUri(localUsername);
    const follow = new FedifyFollow({
      id: new URL(`#follows/${Date.now()}`, actorUri),
      actor: actorUri,
      object: new URL(remoteId),
    });

    await ctx.sendActivity(
      { identifier: localUsername },
      {
        id: new URL(remoteId),
        inboxId: new URL(targetInbox),
      },
      follow,
    );

    if (follow.id?.href) {
      try {
        await this.inboxActivityRepository.save({
          activity_id: follow.id.href,
          type: 'OutgoingFollow',
          actor_id: localActor.id,
          object_id: remoteId,
          raw_data: {
            type: 'Follow',
            id: follow.id.href,
            actor: actorUri.href,
            object: remoteId,
          },
          processed: true,
        });
      } catch {
        // ignore duplicate key or serialization errors
      }
    }

    return {
      ok: true,
      actor: actorUri.href,
      object: remoteId,
      inbox: targetInbox,
      activityId: follow.id?.href,
    };
  }

  async unfollow(target: string) {
    const localUsername = 'crohasang';
    const localActor = await this.actorService.getLocalActor(localUsername);
    if (!localActor) {
      throw new NotFoundException(`Local actor not found: ${localUsername}`);
    }

    const { remoteId, inbox: targetInbox } = await this.resolveRemote(target);

    const followActivity = await this.inboxActivityRepository.findOne({
      where: {
        type: 'OutgoingFollow',
        actor_id: localActor.id,
        object_id: remoteId,
      },
      order: { created_at: 'DESC' },
    });

    if (!followActivity?.activity_id) {
      throw new Error('No outgoing Follow activity found for this target. Follow first.');
    }

    const baseUrl = process.env.FEDIFY_BASE_URL || 'http://localhost:3001';
    const ctx = this.federation.createContext(new URL(baseUrl), undefined);
    const actorUri = ctx.getActorUri(localUsername);

    const follow = new FedifyFollow({
      id: new URL(followActivity.activity_id),
      actor: actorUri,
      object: new URL(remoteId),
    });

    const undo = new Undo({
      id: new URL(`#undo/${Date.now()}`, actorUri),
      actor: actorUri,
      object: follow,
    });

    await ctx.sendActivity(
      { identifier: localUsername },
      {
        id: new URL(remoteId),
        inboxId: new URL(targetInbox),
      },
      undo,
    );

    await this.followRepository.delete({
      follower_id: localActor.id,
      following_id: remoteId,
    });

    if (undo.id?.href) {
      try {
        await this.inboxActivityRepository.save({
          activity_id: undo.id.href,
          type: 'OutgoingUndo',
          actor_id: localActor.id,
          object_id: followActivity.activity_id,
          raw_data: {
            type: 'Undo',
            id: undo.id.href,
            actor: actorUri.href,
            object: followActivity.activity_id,
          },
          processed: true,
        });
      } catch {
        // ignore
      }
    }

    return {
      ok: true,
      actor: actorUri.href,
      object: remoteId,
      inbox: targetInbox,
      undone: followActivity.activity_id,
      activityId: undo.id?.href,
    };
  }

  async getFollowingList(status?: string) {
    const localUsername = 'crohasang';
    const localActor = await this.actorService.getLocalActor(localUsername);
    if (!localActor) {
      throw new NotFoundException(`Local actor not found: ${localUsername}`);
    }

    const where: Record<string, string> = {
      follower_id: localActor.id,
    };
    if (status) {
      where.status = status;
    }

    return this.followRepository.find({
      where,
      order: { updated_at: 'DESC' },
      relations: {
        following: true,
      },
    });
  }

  async getFollowersList(status?: string) {
    const localUsername = 'crohasang';
    const localActor = await this.actorService.getLocalActor(localUsername);
    if (!localActor) {
      throw new NotFoundException(`Local actor not found: ${localUsername}`);
    }

    const where: Record<string, string> = {
      following_id: localActor.id,
    };
    if (status) {
      where.status = status;
    }

    return this.followRepository.find({
      where,
      order: { updated_at: 'DESC' },
      relations: {
        follower: true,
      },
    });
  }

  /**
   * 팔로잉 타임라인 조회 (Simple version: Create 액티비티만)
   */
  async getTimeline(limit: number = 50) {
    const timelineItems = await this.inboxActivityRepository.find({
      where: {
        type: 'Create',
      },
      order: {
        created_at: 'DESC',
      },
      take: limit,
      relations: {
        actor: true,
      },
    });

    return timelineItems.map((item) => ({
      id: item.id,
      activity_id: item.activity_id,
      type: item.type,
      actor_id: item.actor_id,
      object_id: item.object_id,
      created_at: item.created_at,
      actor: item.actor
        ? {
            id: item.actor.id,
            username: item.actor.username,
            display_name: item.actor.display_name,
            url: item.actor.url,
            type: item.actor.type,
          }
        : null,
      raw_data: item.raw_data,
    }));
  }
}
