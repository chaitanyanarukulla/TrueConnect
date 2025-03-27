import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Community } from './community.entity';
import { Comment } from './comment.entity';
import { PostReaction } from './post-reaction.entity';

export enum PostType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  LINK = 'link',
  EVENT = 'event',
  POLL = 'poll'
}

export enum PostStatus {
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  HIDDEN = 'hidden',
  DELETED = 'deleted'
}

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    default: PostType.TEXT
  })
  type: PostType;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'varchar',
    default: PostStatus.PUBLISHED
  })
  status: PostStatus;

  @Column({ type: 'text', array: true, nullable: true })
  mediaUrls: string[];

  @Column({ nullable: true, length: 255 })
  linkUrl: string;

  @Column({ nullable: true, length: 255 })
  linkTitle: string;

  @Column({ nullable: true, length: 255 })
  linkDescription: string;

  @Column({ nullable: true, length: 255 })
  linkImageUrl: string;

  @ManyToOne(() => Community, community => community.posts)
  @JoinColumn({ name: 'community_id' })
  community: Community;

  @Column()
  communityId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column()
  authorId: string;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  commentCount: number;

  @Column({ default: 0 })
  reactionCount: number;

  @Column({ default: 0 })
  shareCount: number;

  @OneToMany(() => Comment, comment => comment.post)
  comments: Comment[];

  @OneToMany(() => PostReaction, reaction => reaction.post)
  reactions: PostReaction[];

  @Column({ type: 'json', nullable: true })
  metadata: object;

  @Column({ type: 'text', array: true, default: '{}' })
  tags: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true, type: 'json' })
  pollOptions: object;

  @Column({ default: false })
  isAnnouncement: boolean;

  @Column({ default: false })
  isPinned: boolean;
}
