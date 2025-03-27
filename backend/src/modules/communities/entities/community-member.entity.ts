import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn, Unique } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Community } from './community.entity';

export enum CommunityRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  MEMBER = 'member'
}

@Entity('community_members')
@Unique(['userId', 'communityId'])
export class CommunityMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Community, community => community.members)
  @JoinColumn({ name: 'community_id' })
  community: Community;

  @Column()
  communityId: string;

  @Column({
    type: 'varchar',
    default: CommunityRole.MEMBER
  })
  role: CommunityRole;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  notifications: boolean;

  @CreateDateColumn()
  joinedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  lastVisitedAt: Date;

  @Column({ nullable: true, length: 255 })
  customTitle: string;
}
