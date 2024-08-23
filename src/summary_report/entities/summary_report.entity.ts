import { Project } from 'src/project/entities/project.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class SummaryReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  summary_report_name: string;

  @Column({ nullable: false })
  summary_report_url: string;

  @Column({ nullable: true })
  isBusinessConfirmed: boolean;

  @Column({ nullable: true })
  isLecturerConfirmed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Project, (project) => project.summary_report)
  @JoinColumn()
  project: Project;
}
