import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Actor } from './entities/actor.entity';

@Injectable()
export class ActorService {
  constructor(
    @InjectRepository(Actor)
    private actorRepository: Repository<Actor>,
  ) {}

  /**
   * 로컬 액터 조회 (username으로)
   */
  async getLocalActor(username: string): Promise<Actor | null> {
    return this.actorRepository.findOne({
      where: {
        username,
        is_local: true,
      },
    });
  }

  /**
   * 액터 조회 (ID로)
   */
  async getActorById(id: string): Promise<Actor | null> {
    return this.actorRepository.findOne({
      where: { id },
    });
  }

  /**
   * 원격 액터 생성 또는 업데이트
   * Fediverse의 다른 서버에서 온 액터 정보를 저장
   */
  async createOrUpdateRemoteActor(actorData: {
    id: string;
    username?: string;
    display_name?: string;
    bio?: string;
    inbox_url?: string;
    shared_inbox_url?: string;
    url?: string;
    avatar_url?: string;
    type?: string;
  }): Promise<Actor> {
    const existingActor = await this.getActorById(actorData.id);

    if (existingActor) {
      // 업데이트
      Object.assign(existingActor, actorData);
      return this.actorRepository.save(existingActor);
    }

    // 새로 생성
    const actor = this.actorRepository.create({
      ...actorData,
      is_local: false,
    });

    return this.actorRepository.save(actor);
  }

  /**
   * 로컬 액터 생성 (최초 1회)
   */
  async createLocalActor(actorData: {
    username: string;
    display_name: string;
    bio?: string;
  }): Promise<Actor> {
    const baseUrl = process.env.FEDIFY_BASE_URL || 'https://crohasang.com';
    const id = `${baseUrl}/users/${actorData.username}`;

    const actor = this.actorRepository.create({
      id,
      username: actorData.username,
      display_name: actorData.display_name,
      bio: actorData.bio,
      inbox_url: `${baseUrl}/users/${actorData.username}/inbox`,
      url: `${baseUrl}/users/${actorData.username}`,
      type: 'Person',
      is_local: true,
    });

    return this.actorRepository.save(actor);
  }

  /**
   * 모든 로컬 액터 조회
   */
  async getAllLocalActors(): Promise<Actor[]> {
    return this.actorRepository.find({
      where: { is_local: true },
    });
  }
}
