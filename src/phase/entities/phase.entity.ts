import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PhaseStatusEnum } from '../enum/phase-status.enum';
import { Project } from 'src/project/entities/project.entity';
import { Category } from 'src/category/entities/category.entity';
import { CostStatusEnum } from '../enum/cost-status.enum';

@Entity()
export class Phase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  phase_start_date: Date;

  @Column({ nullable: false })
  phase_expected_end_date: Date;

  @Column({ nullable: true })
  phase_actual_end_date: Date;

  @Column({ nullable: true })
  expected_cost_total: number;

  @Column({ nullable: true })
  actual_cost_total: number;

  @Column({ nullable: true })
  cost_status: CostStatusEnum;

  @Column({ nullable: false, default: 1 })
  phase_number: number;

  @Column({ nullable: false, default: PhaseStatusEnum.PENDING })
  phase_status: PhaseStatusEnum;

  @Column({ nullable: true })
  lecturer_feedback: string;

  @Column({ nullable: true })
  business_feeback: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Project, (project) => project.phases)
  project: Project;

  @OneToMany(() => Category, (category) => category.phase)
  categories: Category[];
}
