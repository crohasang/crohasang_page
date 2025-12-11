import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Actor } from './actor.entity';

@Entity('follows')
export class Follow {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  follower_id: string; // 팔로우하는 사람

  @Column({ type: 'varchar', length: 255 })
  following_id: string; // 팔로우받는 사람

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status: string; // 'pending', 'accepted', 'rejected'

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => Actor)
  @JoinColumn({ name: 'follower_id' })
  follower: Actor;

  @ManyToOne(() => Actor)
  @JoinColumn({ name: 'following_id' })
  following: Actor;
}
