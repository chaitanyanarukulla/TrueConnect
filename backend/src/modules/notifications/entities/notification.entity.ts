import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { NotificationType, NotificationStatus, NotificationChannel } from '../../../types/enums';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'recipient_id' })
  @Index()
  recipientId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipient_id' })
  recipient: User;

  @Column({ name: 'sender_id', nullable: true })
  senderId: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'sender_id' })
  sender: User | null;

  @Column({
    type: 'text',
    default: NotificationType.SYSTEM
  })
  type: NotificationType;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'text',
    default: NotificationStatus.UNREAD
  })
  @Index()
  status: NotificationStatus;

  @Column({ type: 'text', nullable: true, transformer: {
    to: (value: Record<string, any> | null) => value ? JSON.stringify(value) : null,
    from: (value: string | null) => value ? JSON.parse(value) : null
  }})
  data: Record<string, any> | null;

  @Column({
    type: 'text',
    default: NotificationChannel.IN_APP,
    transformer: {
      to: (value: NotificationChannel[]) => value.join(','),
      from: (value: string) => value.split(',') as NotificationChannel[]
    }
  })
  channels: NotificationChannel[];

  @Column({ name: 'read_at', type: 'datetime', nullable: true })
  readAt: Date | null;

  @Column({ name: 'action_url', type: 'varchar', nullable: true, length: 255 })
  actionUrl: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}
