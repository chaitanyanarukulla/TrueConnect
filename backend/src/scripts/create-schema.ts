import { DataSource } from 'typeorm';
import { join } from 'path';
import { User } from '../modules/users/entities/user.entity';
import { Community } from '../modules/communities/entities/community.entity';
import { CommunityMember } from '../modules/communities/entities/community-member.entity';
import { Post } from '../modules/communities/entities/post.entity';
import { Comment } from '../modules/communities/entities/comment.entity';
import { PostReaction } from '../modules/communities/entities/post-reaction.entity';
import { CommentReaction } from '../modules/communities/entities/comment-reaction.entity';
import { Event } from '../modules/communities/entities/event.entity';
import { EventAttendee } from '../modules/communities/entities/event-attendee.entity';
import { Match } from '../modules/matches/entities/match.entity';
import { Conversation } from '../modules/messages/entities/conversation.entity';
import { Message } from '../modules/messages/entities/message.entity';
import { Notification } from '../modules/notifications/entities/notification.entity';
import { NotificationPreference } from '../modules/notifications/entities/notification-preference.entity';
import { Report } from '../modules/moderation/entities/report.entity';
import { ContentModeration } from '../modules/moderation/entities/content-moderation.entity';

async function createSchema() {
  try {
    const AppDataSource = new DataSource({
      type: 'sqlite',
      database: join(__dirname, '../../trueconnect.sqlite'),
      entities: [
        User,
        Community,
        CommunityMember,
        Post,
        Comment,
        PostReaction,
        CommentReaction,
        Event,
        EventAttendee,
        Match,
        Conversation,
        Message,
        Notification,
        NotificationPreference,
        Report,
        ContentModeration
      ],
      synchronize: true,
      logging: true
    });

    await AppDataSource.initialize();
    console.log('Database schema created successfully');
    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error creating database schema:', error);
    process.exit(1);
  }
}

createSchema();
