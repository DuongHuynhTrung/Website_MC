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
export class Feedback {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  coordination_work: string;

  @Column({ nullable: false })
  compare_results: string;

  @Column({ nullable: false })
  comment: string;

  @Column({ nullable: false })
  suggest_improvement: string;

  @Column({ nullable: false })
  general_assessment: number;

  @Column({ nullable: false })
  conclusion: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Project, (project) => project.feedback)
  @JoinColumn()
  project: Project;
}
