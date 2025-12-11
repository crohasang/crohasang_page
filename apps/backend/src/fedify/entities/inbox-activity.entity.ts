import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Actor } from './actor.entity';

@Entity('inbox_activities')
export class InboxActivity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  activity_id: string;

  @Column({ type: 'varchar', length: 100 })
  type: string; // 'Follow', 'Create', 'Like', 'Announce', etc.

  @Column({ type: 'varchar', length: 255, nullable: true })
  actor_id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  object_id: string;

  @Column({ type: 'json' })
  raw_data: any;

  @Column({ type: 'boolean', default: false })
  processed: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @ManyToOne(() => Actor)
  @JoinColumn({ name: 'actor_id' })
  actor: Actor;
}
