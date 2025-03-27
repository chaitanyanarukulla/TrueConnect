import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn, Unique } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Comment } from './comment.entity';
import { ReactionType } from '../../../types/enums';

@Entity('comment_reactions')
@Unique(['userId', 'commentId'])
export class CommentReaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Comment, comment => comment.reactions)
  @JoinColumn({ name: 'comment_id' })
  comment: Comment;

  @Column()
  commentId: string;

  @Column({
    type: 'varchar',
    default: ReactionType.LIKE
  })
  type: ReactionType;

  @CreateDateColumn()
  createdAt: Date;
}
