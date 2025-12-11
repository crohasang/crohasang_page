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

@Entity('micro_posts')
export class MicroPost {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  actor_id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  content_html: string;

  @Column({ type: 'varchar', length: 50, default: 'public' })
  visibility: string; // 'public', 'unlisted', 'followers'

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => Actor)
  @JoinColumn({ name: 'actor_id' })
  actor: Actor;
}
