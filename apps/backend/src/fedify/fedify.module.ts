import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Actor } from './entities/actor.entity';
import { KeyPair } from './entities/key-pair.entity';
import { MicroPost } from './entities/micro-post.entity';
import { Follow } from './entities/follow.entity';
import { InboxActivity } from './entities/inbox-activity.entity';
import { FedifyService } from './fedify.service';
import { ActorService } from './actor.service';
import { KeypairService } from './keypair.service';
import { InboxService } from './inbox.service';
import { OutboxService } from './outbox.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Actor, KeyPair, MicroPost, Follow, InboxActivity]),
  ],
  providers: [
    FedifyService,
    ActorService,
    KeypairService,
    InboxService,
    OutboxService,
  ],
  exports: [
    FedifyService,
    ActorService,
    KeypairService,
    InboxService,
    OutboxService,
  ],
})
export class FedifyModule {}
