import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column({ type: 'date' })
  birthdate: Date;

  @Column({
    type: 'varchar',
    // Using check constraint instead of enum for SQLite compatibility
    // While keeping the values limited to these options
  })
  gender: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true, type: 'text' })
  bio: string;

  @Column({ nullable: true })
  profilePicture: string;

  @Column({ type: 'simple-array', nullable: true })
  interests: string[];

  @Column({ type: 'json', nullable: true })
  preferences: {
    ageRange?: { min: number; max: number };
    distance?: number;
    genderPreferences?: string[];
  };

  @Column({ type: 'json', nullable: true })
  socialMedia: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    other?: string;
  };

  @Column({ nullable: true })
  lookingFor: string;

  @Column({ nullable: true })
  occupation: string;

  @Column({ nullable: true })
  education: string;

  @Column({ type: 'json', nullable: true })
  privacySettings: {
    showLocation?: boolean;
    showAge?: boolean;
    showLastActive?: boolean;
    showOnlineStatus?: boolean;
  };

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: false })
  isPremium: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 'user' })
  role: string;
  
  @Column({ default: false })
  acceptedTerms: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
