import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProjectStatusEnum } from '../enum/project-status.enum';
import { ApiProperty } from '@nestjs/swagger';
import { RegisterPitching } from 'src/register-pitching/entities/register-pitching.entity';
import { Phase } from 'src/phase/entities/phase.entity';
import { SummaryReport } from 'src/summary_report/entities/summary_report.entity';
import { UserProject } from 'src/user-project/entities/user-project.entity';

@Entity()
export class Project {
  @ApiProperty({
    description: 'Id of Project',
    example: 1,
    nullable: false,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Name of Project',
    example: 'abc',
    nullable: false,
  })
  @Column({ nullable: false })
  name_project: string;

  @ApiProperty({
    description: 'Type of Project',
    example: 'Project',
    nullable: false,
  })
  @Column({ nullable: false })
  business_type: string;

  @ApiProperty({
    description: 'Project Purpose',
    example: 'Friendly',
    nullable: false,
  })
  @Column({ nullable: false })
  purpose: string;

  @ApiProperty({
    description: 'Target Object',
    example: 'Friendly',
    nullable: false,
  })
  @Column({ nullable: false })
  target_object: string;

  @ApiProperty({
    description: 'Note of Project',
    example: 'Friendly',
    nullable: true,
  })
  @Column({ nullable: true })
  note: string;

  @ApiProperty({
    description: 'Document related link',
    example: 'Friendly',
    nullable: true,
  })
  @Column({ type: 'jsonb', nullable: true })
  document_related_link: string[];

  @ApiProperty({
    description: 'Project Request',
    example: 'Friendly',
    nullable: true,
  })
  @Column({ nullable: true })
  request: string;

  @ApiProperty({
    description: 'Project Implement Time',
    example: '23/12/2023',
    nullable: false,
  })
  @Column({ nullable: false })
  project_implement_time: string;

  @ApiProperty({
    description: 'Project Start Date',
    example: '25/12/2023',
    nullable: true,
  })
  @Column({ nullable: true })
  project_start_date: string;

  @ApiProperty({
    description: 'Project Actual Start Date',
    example: '25/12/2023',
    nullable: true,
  })
  @Column({ nullable: true })
  project_actual_start_date: string;

  @ApiProperty({
    description: 'Is Extent',
    example: true,
    nullable: true,
  })
  @Column({ nullable: true })
  is_extent: boolean;

  @ApiProperty({
    description: 'Project Expected End Date',
    example: '25/05/2024',
    nullable: true,
  })
  @Column({ nullable: true })
  project_expected_end_date: string;

  @ApiProperty({
    description: 'Project Actual End Date',
    example: '25/05/2024',
    nullable: true,
  })
  @Column({ nullable: true })
  project_actual_end_date: string;

  @ApiProperty({
    description: 'Project Expected Budget',
    example: 100000,
    nullable: false,
  })
  @Column({ nullable: false })
  expected_budget: string;

  @ApiProperty({
    description: 'Project Status',
    example: ProjectStatusEnum.PENDING,
    nullable: false,
  })
  @Column({ nullable: false, default: ProjectStatusEnum.PENDING })
  project_status: ProjectStatusEnum;

  @ApiProperty({
    description: 'Is First Project',
    example: false,
    nullable: false,
  })
  @Column({ nullable: false, default: false })
  is_first_project: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(
    () => RegisterPitching,
    (registerPitching) => registerPitching.group,
  )
  register_pitchings: RegisterPitching[];

  @OneToMany(() => Phase, (phase) => phase.project)
  phases: Phase[];

  @OneToOne(() => SummaryReport, (summary_report) => summary_report.project)
  summary_report: SummaryReport;

  @OneToMany(() => UserProject, (user_project) => user_project.project)
  user_projects: UserProject[];
}
