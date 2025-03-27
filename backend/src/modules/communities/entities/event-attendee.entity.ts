import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn, Unique } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Event } from './event.entity';

export enum AttendeeStatus {
  INTERESTED = 'interested',
  GOING = 'going',
  NOT_GOING = 'not_going',
  WAITLIST = 'waitlist'
}

@Entity('event_attendees')
@Unique(['userId', 'eventId'])
export class EventAttendee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Event, event => event.attendees)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column()
  eventId: string;

  @Column({
    type: 'text',
    default: AttendeeStatus.GOING
  })
  status: AttendeeStatus;

  @Column({ nullable: true, type: 'text' })
  note: string;

  @Column({ default: true })
  notifications: boolean;

  @Column({ default: false })
  attended: boolean;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @Column({ nullable: true, type: 'datetime' })
  checkedInAt: Date;
}
