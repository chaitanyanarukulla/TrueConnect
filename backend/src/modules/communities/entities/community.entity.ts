import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CommunityCategory } from '../dto/create-community.dto';

@Entity('communities')
export class Community {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 255 })
  description: string;

  @Column({ nullable: true, length: 255 })
  imageUrl: string;

  @Column({ nullable: true, length: 255 })
  coverImageUrl: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @Column()
  creatorId: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isPrivate: boolean;

  @Column({ 
    type: 'text',
    nullable: true 
  })
  category: CommunityCategory;

  @Column({ type: 'text', nullable: true, transformer: { to: val => val ? JSON.stringify(val) : null, from: val => val ? JSON.parse(val) : null } })
  settings: object;

  @Column({ type: 'text', default: '[]', transformer: { to: val => JSON.stringify(val), from: val => JSON.parse(val) } })
  tags: string[];

  @OneToMany('CommunityMember', 'community')
  members: any[];

  @OneToMany('Event', 'community')
  events: any[];

  @OneToMany('Post', 'community')
  posts: any[];

  @Column({ default: 0 })
  memberCount: number;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
