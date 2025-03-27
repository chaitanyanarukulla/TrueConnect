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
  ReportReason,
  ReportStatus,
  ModerationAction
} from '../../../types/enums';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'reporter_id' })
  @Index()
  reporterId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reporter_id' })
  reporter: User;

  @Column({ name: 'reported_id' })
  @Index()
  reportedId: string;

  @Column({
    type: 'enum',
    enum: ReportType
  })
  @Index()
  type: ReportType;

  @Column({
    type: 'enum',
    enum: ReportReason
  })
  reason: ReportReason;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.PENDING
  })
  @Index()
  status: ReportStatus;

  @Column({ name: 'handled_by_id', nullable: true })
  handledById: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'handled_by_id' })
  handledBy: User | null;

  @Column({
    type: 'enum',
    enum: ModerationAction,
    nullable: true
  })
  action: ModerationAction | null;

  @Column({ type: 'text', name: 'admin_notes', nullable: true })
  adminNotes: string | null;

  @Column({ name: 'resolved_at', type: 'timestamp', nullable: true })
  resolvedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
