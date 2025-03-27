import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import {
  ReportType,
  ContentStatus,
  ModerationAction
} from '../../../types/enums';

@Entity('content_moderation')
export class ContentModeration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'content_id' })
  @Index()
  contentId: string;

  @Column({
    type: 'enum',
    enum: ReportType
  })
  @Index()
  contentType: ReportType;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: ContentStatus,
    default: ContentStatus.PENDING_REVIEW
  })
  @Index()
  status: ContentStatus;

  @Column({ type: 'text', nullable: true })
  moderationNotes: string | null;

  @Column({ name: 'moderated_by_id', nullable: true })
  moderatedById: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'moderated_by_id' })
  moderatedBy: User | null;

  @Column({ name: 'content_creator_id' })
  @Index()
  contentCreatorId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'content_creator_id' })
  contentCreator: User;

  @Column({
    type: 'enum',
    enum: ModerationAction,
    nullable: true
  })
  action: ModerationAction | null;

  @Column({ type: 'boolean', default: false })
  isAutomated: boolean;

  @Column({ type: 'simple-array', nullable: true })
  detectedIssues: string[] | null;

  @Column({ type: 'float', nullable: true })
  confidenceScore: number | null;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
