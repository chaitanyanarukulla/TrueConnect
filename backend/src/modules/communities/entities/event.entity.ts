import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Community } from './community.entity';
// Removed circular import - this will be handled in @OneToMany relation

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

export enum EventType {
  IN_PERSON = 'in_person',
  ONLINE = 'online',
  HYBRID = 'hybrid'
}

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'text',
    default: EventType.IN_PERSON
  })
  type: EventType;

  @Column({
    type: 'text',
    default: EventStatus.DRAFT
  })
  status: EventStatus;

  @Column({ type: 'datetime' })
  startTime: Date;

  @Column({ type: 'datetime' })
  endTime: Date;

  @Column({ nullable: true, length: 255 })
  location: string;

  @Column({ nullable: true, length: 255 })
  virtualMeetingUrl: string;

  @Column({ nullable: true, length: 255 })
  imageUrl: string;

  @ManyToOne(() => Community, community => community.events)
  @JoinColumn({ name: 'community_id' })
  community: Community;

  @Column()
  communityId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @Column()
  creatorId: string;

  @Column({ default: 0 })
  attendeeLimit: number;

  @Column({ default: 0 })
  attendeeCount: number;

  @Column({ default: false })
  isPrivate: boolean;

  @OneToMany('EventAttendee', 'event')
  attendees: any[];

  @Column({ type: 'text', nullable: true, transformer: { to: val => val ? JSON.stringify(val) : null, from: val => val ? JSON.parse(val) : null } })
  settings: object;

  @Column({ type: 'text', nullable: true, default: '[]', transformer: { to: val => JSON.stringify(val), from: val => JSON.parse(val) } })
  tags: string[];

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
