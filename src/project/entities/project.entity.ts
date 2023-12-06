import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProjectStatusEnum } from '../enum/project-status.enum';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';
import { ResponsiblePerson } from 'src/responsible_person/entities/responsible_person.entity';
import { RegisterPitching } from 'src/register-pitching/entities/register-pitching.entity';
import { Phase } from 'src/phase/entities/phase.entity';

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
    description: 'Business Sector of Project',
    example: 'Friendly',
    nullable: false,
  })
  @Column({ nullable: false })
  business_sector: string;

  @ApiProperty({
    description: 'Specialized Field of Project',
    example: 'Friendly',
    nullable: false,
  })
  @Column({ nullable: false })
  specialized_field: string;

  @ApiProperty({
    description: 'Purpose of Project',
    example: 'Friendly',
    nullable: false,
  })
  @Column({ nullable: false })
  purpose: string;

  @ApiProperty({
    description: 'Description of Project',
    example: 'Friendly',
    nullable: false,
  })
  @Column({ nullable: false })
  description_project: string;

  @ApiProperty({
    description: 'Request of Project',
    example: 'Friendly',
    nullable: false,
  })
  @Column({ nullable: false })
  request: string;

  @ApiProperty({
    description: 'Note of Project',
    example: 'Friendly',
    nullable: false,
  })
  @Column({ nullable: false })
  note: string;

  @ApiProperty({
    description: 'Document related link',
    example: 'Friendly',
    nullable: true,
  })
  @Column({ nullable: true })
  document_related_link: string;

  @ApiProperty({
    description: 'Project Registration Expired Date',
    example: '23/12/2023',
    nullable: true,
  })
  @Column({ nullable: false })
  project_registration_expired_date: Date;

  @ApiProperty({
    description: 'Project Start Date',
    example: '25/12/2023',
    nullable: false,
  })
  @Column({ nullable: false })
  project_start_date: Date;

  @ApiProperty({
    description: 'Project Expected End Date',
    example: '25/05/2024',
    nullable: false,
  })
  @Column({ nullable: false })
  project_expected_end_date: Date;

  @ApiProperty({
    description: 'Project Actual End Date',
    example: '25/05/2024',
    nullable: true,
  })
  @Column({ nullable: true })
  project_actual_end_date: Date;

  @ApiProperty({
    description: 'Project Status',
    example: ProjectStatusEnum.PENDING,
    nullable: false,
  })
  @Column({ nullable: false, default: ProjectStatusEnum.PENDING })
  project_status: ProjectStatusEnum;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.projects)
  business: User;

  @ManyToOne(
    () => ResponsiblePerson,
    (responsible_person) => responsible_person.projects,
  )
  responsible_person: ResponsiblePerson;

  @OneToMany(
    () => RegisterPitching,
    (registerPitching) => registerPitching.group,
  )
  register_pitchings: RegisterPitching[];

  @OneToMany(() => Phase, (phase) => phase.projects)
  phase: Phase;
}
