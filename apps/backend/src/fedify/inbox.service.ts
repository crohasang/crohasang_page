import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from './entities/follow.entity';
import { InboxActivity } from './entities/inbox-activity.entity';
import { ActorService } from './actor.service';
import { Accept, Context, Create, Follow as FedifyFollow, Undo } from '@fedify/fedify';

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

      // FK(inbox_activities.actor_id -> actors.id) 제약을 만족시키기 위해
      // 원격 액터를 먼저 upsert
      await this.actorService.createOrUpdateRemoteActor({
        id: followerId,
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

      // Inbox 활동 로그 저장
      await this.inboxActivityRepository.save({
        activity_id: follow.id?.href || `follow-${Date.now()}`,
        type: 'Follow',
        actor_id: followerId,
        object_id: followingId,
        raw_data: follow,
        processed: false,
      });

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
   * Accept 액티비티 처리
   * 내가 보낸 Follow 요청이 수락되었을 때
   */
  async handleAccept(ctx: Context<void>, accept: Accept): Promise<void> {
    try {
      const acceptActorId = accept.actorId?.href;
      const acceptObject = await accept.getObject();

      if (!acceptActorId || !acceptObject) {
        console.error('Invalid Accept activity');
        return;
      }

      console.log(`📥 Received Accept from: ${acceptActorId}`);

      // FK(inbox_activities.actor_id -> actors.id) 제약을 만족시키기 위해 원격 액터 upsert
      await this.actorService.createOrUpdateRemoteActor({ id: acceptActorId });

      let followerId: string | undefined;
      let followingId: string | undefined;

      // Accept의 object가 Follow 객체인 경우
      if (isFollowActivity(acceptObject)) {
        followerId = acceptObject.actorId?.href;
        followingId = acceptObject.objectId?.href;
      } 
      // Accept의 object가 URL만 있는 경우 (Follow ID)
      else if (acceptObject.id?.href) {
        // OutgoingFollow에서 해당 Follow 찾기
        const outgoingFollow = await this.inboxActivityRepository.findOne({
          where: {
            activity_id: acceptObject.id.href,
            type: 'OutgoingFollow',
          },
        });

        if (outgoingFollow) {
          followerId = outgoingFollow.actor_id;
          followingId = outgoingFollow.object_id ?? undefined;
        }
      }

      // followerId와 followingId를 못 찾았으면, Accept한 사람이 following이라고 추정
      if (!followerId || !followingId) {
        console.log(`⚠️ Could not extract Follow info from Accept, using fallback logic`);
        const localActor = await this.actorService.getLocalActor('crohasang');
        if (localActor) {
          followerId = localActor.id;
          followingId = acceptActorId;
        }
      }

      if (followerId && followingId) {
        const result = await this.followRepository.update(
          {
            follower_id: followerId,
            following_id: followingId,
          },
          {
            status: 'accepted',
          },
        );

        console.log(`✅ Outgoing Follow accepted: ${followerId} -> ${followingId} (affected: ${result.affected})`);
      }

      await this.inboxActivityRepository.save({
        activity_id: accept.id?.href || `accept-${Date.now()}`,
        type: 'Accept',
        actor_id: acceptActorId,
        object_id: acceptObject.id?.href,
        raw_data: JSON.parse(JSON.stringify(accept)),
        processed: true,
      });
    } catch (error) {
      console.error('Error handling Accept activity:', error);
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

      // FK(inbox_activities.actor_id -> actors.id) 제약을 만족시키기 위해
      // 원격 액터를 먼저 upsert
      await this.actorService.createOrUpdateRemoteActor({
        id: actorId,
      });

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
   * Create 액티비티 처리 (팔로우하는 계정의 글 작성)
   */
  async handleCreate(ctx: Context<void>, create: Create): Promise<void> {
    try {
      const actorId = create.actorId?.href;
      const createObject = await create.getObject();

      if (!actorId || !createObject) {
        console.error('Invalid Create activity: missing actor or object');
        return;
      }

      // 1. 이 글을 쓴 사람(actorId)을 내가(crohasang) 팔로우하고 있는지 확인
      const localActor = await this.actorService.getLocalActor('crohasang');
      if (!localActor) {
        return;
      }

      const follow = await this.followRepository.findOne({
        where: {
          follower_id: localActor.id,
          following_id: actorId,
          status: 'accepted',
        },
      });

      // 팔로우 중이 아니면 무시 (내 타임라인에 저장 안 함)
      if (!follow) {
        // console.log(`Ignoring Create from non-followed actor: ${actorId}`);
        return;
      }

      console.log(`📥 Received Create from followed actor: ${actorId}`);

      // 2. 보낸 사람 정보 최신화 (프로필 사진 등 변경되었을 수 있으므로)
      await this.actorService.createOrUpdateRemoteActor({ id: actorId });

      // 3. DB에 저장 (InboxActivity)
      // 나중에 이 테이블을 조회해서 타임라인을 보여줌
      await this.inboxActivityRepository.save({
        activity_id: create.id?.href || `create-${Date.now()}`,
        type: 'Create',
        actor_id: actorId,
        object_id: createObject.id?.href,
        raw_data: create,
        processed: false, // 추후 알림 처리 등을 위해 false로 둠
      });

    } catch (error) {
      console.error('Error handling Create activity:', error);
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
