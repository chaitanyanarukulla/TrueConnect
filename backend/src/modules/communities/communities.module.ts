import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { CommunitiesController } from './communities.controller';
import { CommunitiesService } from './communities.service';
import { Community } from './entities/community.entity';
import { CommunityMember } from './entities/community-member.entity';
import { Post } from './entities/post.entity';
import { Comment } from './entities/comment.entity';
import { PostsController } from './controllers/posts.controller';
import { PostsService } from './services/posts.service';
import { CommentsController } from './controllers/comments.controller';
import { CommentsService } from './services/comments.service';
import { PostReaction } from './entities/post-reaction.entity';
import { CommentReaction } from './entities/comment-reaction.entity';
import { ReactionsService } from './services/reactions.service';
import { ReactionsController } from './controllers/reactions.controller';
import { Event } from './entities/event.entity';
import { EventAttendee } from './entities/event-attendee.entity';
import { EventsService } from './services/events.service';
import { EventsController } from './controllers/events.controller';
import { EventDiscoveryController } from './controllers/event-discovery.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { LoggingModule } from '../logging/logging.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Community, 
      CommunityMember, 
      Post, 
      Comment, 
      PostReaction, 
      CommentReaction,
      Event,
      EventAttendee
    ]),
    UsersModule,
    NotificationsModule,
    LoggingModule,
  ],
  controllers: [
    CommunitiesController, 
    PostsController, 
    CommentsController, 
    ReactionsController,
    EventsController,
    EventDiscoveryController
  ],
  providers: [
    CommunitiesService, 
    PostsService, 
    CommentsService, 
    ReactionsService,
    EventsService
  ],
  exports: [
    CommunitiesService, 
    PostsService, 
    CommentsService, 
    ReactionsService,
    EventsService
  ],
})
export class CommunitiesModule {}
