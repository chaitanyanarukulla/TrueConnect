import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Post } from './post.entity';
import { CommentReaction } from './comment-reaction.entity';

export enum CommentStatus {
  PUBLISHED = 'published',
  HIDDEN = 'hidden',
  DELETED = 'deleted'
}

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'varchar',
    default: CommentStatus.PUBLISHED
  })
  status: CommentStatus;

  @ManyToOne(() => Post, post => post.comments)
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @Column()
  postId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column()
  authorId: string;

  @ManyToOne(() => Comment, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: Comment;

  @Column({ nullable: true })
  parentId: string;

  @OneToMany(() => Comment, comment => comment.parent)
  replies: Comment[];

  @OneToMany(() => CommentReaction, reaction => reaction.comment)
  reactions: CommentReaction[];

  @Column({ default: 0 })
  reactionCount: number;

  @Column({ default: 0 })
  replyCount: number;

  @Column({ type: 'text', array: true, nullable: true })
  mediaUrls: string[];

  @Column({ type: 'json', nullable: true })
  metadata: object;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isEdited: boolean;
}
