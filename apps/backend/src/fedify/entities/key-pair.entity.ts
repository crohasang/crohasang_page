import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Actor } from './actor.entity';

@Entity('key_pairs')
export class KeyPair {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  actor_id: string;

  @PrimaryColumn({ type: 'varchar', length: 50 })
  type: string; // 'RSASSA-PKCS1-v1_5', 'Ed25519', etc.

  @Column({ type: 'text' })
  private_key: string;

  @Column({ type: 'text' })
  public_key: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @ManyToOne(() => Actor)
  @JoinColumn({ name: 'actor_id' })
  actor: Actor;
}
