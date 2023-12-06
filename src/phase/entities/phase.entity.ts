import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PhaseStatusEnum } from '../enum/phase-status.enum';
import { Project } from 'src/project/entities/project.entity';

@Entity()
export class Phase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  phase_start_date: Date;

  @Column({ nullable: false })
  phase_expected_end_date: Date;

  @Column()
  phase_actual_end_date: Date;

  @Column()
  cost_total: number;

  @Column({ nullable: false, default: PhaseStatusEnum.PENDING })
  phase_status: PhaseStatusEnum;

  @ManyToOne(() => Project, (project) => project.phase)
  projects: Project[];
}
