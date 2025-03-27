import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { NotificationType, NotificationChannel } from '../../../types/enums';

@Entity('notification_preferences')
@Unique(['userId', 'type'])
export class NotificationPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: NotificationType
  })
  type: NotificationType;

  @Column({
    type: 'boolean',
    default: true
  })
  enabled: boolean;

  @Column({
    type: 'simple-array',
    default: NotificationChannel.IN_APP
  })
  channels: NotificationChannel[];

  @Column({
    type: 'boolean',
    name: 'real_time',
    default: true
  })
  realTime: boolean;

  @Column({
    type: 'boolean',
    name: 'include_in_digest',
    default: true
  })
  includeInDigest: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
