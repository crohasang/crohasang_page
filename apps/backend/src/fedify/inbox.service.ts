import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from './entities/follow.entity';
import { InboxActivity } from './entities/inbox-activity.entity';
import { ActorService } from './actor.service';
import { Context, Follow as FedifyFollow, Undo } from '@fedify/fedify';

function isFollowActivity(obj: unknown): obj is FedifyFollow {
  return obj instanceof FedifyFollow;
}

@Injectable()
export class InboxService {
  constructor(
    @InjectRepository(Follow)
    private followRepository: Repository<Follow>,
    @InjectRepository(InboxActivity)
    private inboxActivityRepository: Repository<InboxActivity>,
    private actorService: ActorService,
  ) {}

  /**
   * Follow 액티비티 처리
   * 누군가 나를 팔로우할 때
   */
  async handleFollow(ctx: Context<void>, follow: FedifyFollow): Promise<void> {
    try {
      const followerId = follow.actorId?.href;
      const followingId = follow.objectId?.href;

      if (!followerId || !followingId) {
        console.error('Invalid Follow activity: missing actor or object');
        return;
      }

      console.log(`📥 Received Follow: ${followerId} -> ${followingId}`);

      // Inbox 활동 로그 저장
      await this.inboxActivityRepository.save({
        activity_id: follow.id?.href || `follow-${Date.now()}`,
        type: 'Follow',
        actor_id: followerId,
        object_id: followingId,
        raw_data: follow,
        processed: false,
      });

      // 팔로워 정보 가져오기 (원격 액터)
      const followerActor = await follow.getActor();
      if (followerActor) {
        await this.actorService.createOrUpdateRemoteActor({
          id: followerId,
          username:
            typeof followerActor.preferredUsername === 'string'
              ? followerActor.preferredUsername
              : followerActor.preferredUsername?.toString(),
          display_name: followerActor.name?.toString(),
          bio: followerActor.summary?.toString(),
          inbox_url: followerActor.inboxId?.href,
          url: followerActor.url ? String(followerActor.url.href) : undefined,
          type: 'Person',
        });
      }

      // Follow 관계 저장
      const existingFollow = await this.followRepository.findOne({
        where: {
          follower_id: followerId,
          following_id: followingId,
        },
      });

      if (!existingFollow) {
        await this.followRepository.save({
          follower_id: followerId,
          following_id: followingId,
          status: 'accepted', // 자동 수락
        });

        console.log(`✅ Follow accepted: ${followerId} -> ${followingId}`);
      }

      // Accept 응답은 OutboxService에서 처리
    } catch (error) {
      console.error('Error handling Follow activity:', error);
      throw error;
    }
  }

  /**
   * Undo 액티비티 처리
   * 언팔로우할 때
   */
  async handleUndo(ctx: Context<void>, undo: Undo): Promise<void> {
  try {
    const actorId = undo.actorId?.href;
    const undoObject = await undo.getObject(); // 여기서 Activity로 타입 지정하지 않기

    if (!actorId || !undoObject) {
      console.error('Invalid Undo activity');
      return;
    }

    console.log(`📥 Received Undo from: ${actorId}`);

    if (isFollowActivity(undoObject)) {
      const followingId = undoObject.objectId?.href;
      if (followingId) {
        await this.followRepository.delete({
          follower_id: actorId,
          following_id: followingId,
        });
        console.log(`✅ Unfollow processed: ${actorId} -> ${followingId}`);
      }
    }

    await this.inboxActivityRepository.save({
      activity_id: undo.id?.href || `undo-${Date.now()}`,
      type: 'Undo',
      actor_id: actorId,
      object_id: undoObject.id?.href,
      raw_data: undo,
      processed: true,
    });
  } catch (error) {
    console.error('Error handling Undo activity:', error);
    throw error;
  }
}


  /**
   * 팔로워 목록 조회
   */
  async getFollowers(actorId: string): Promise<Follow[]> {
    return this.followRepository.find({
      where: {
        following_id: actorId,
        status: 'accepted',
      },
    });
  }

  /**
   * 팔로잉 목록 조회
   */
  async getFollowing(actorId: string): Promise<Follow[]> {
    return this.followRepository.find({
      where: {
        follower_id: actorId,
        status: 'accepted',
      },
    });
  }
}
