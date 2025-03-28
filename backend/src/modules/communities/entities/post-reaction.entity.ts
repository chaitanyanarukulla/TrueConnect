import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn, Unique } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Post } from './post.entity';
import { ReactionType } from '../../../types/enums';

@Entity('post_reactions')
@Unique(['userId', 'postId'])
export class PostReaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Post, post => post.reactions)
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @Column()
  postId: string;

  @Column({
    type: 'varchar',
    default: ReactionType.LIKE
  })
  type: ReactionType;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
}
