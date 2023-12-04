import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RegisterPitchingStatusEnum } from '../enum/register-pitching.enum';
import { Group } from 'src/group/entities/group.entity';
import { Project } from 'src/project/entities/project.entity';

@Entity()
export class RegisterPitching {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, default: RegisterPitchingStatusEnum.PENDING })
  register_pitching_status: RegisterPitchingStatusEnum;

  @ManyToOne(() => Group, (group) => group.register_pitchings)
  group: Group;

  @ManyToOne(() => Project, (project) => project.register_pitchings)
  project: Project;
}
