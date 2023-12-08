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
  cost_total: number;

  @Column({ nullable: false, default: 1 })
  phase_number: number;

  @Column({ nullable: false, default: PhaseStatusEnum.PROCESSING })
  phase_status: PhaseStatusEnum;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Project, (project) => project.phases)
  project: Project;

  @OneToMany(() => Category, (category) => category.phase)
  categories: Category[];
}
