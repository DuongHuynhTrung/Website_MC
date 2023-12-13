import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RegisterPitchingStatusEnum } from '../enum/register-pitching.enum';
import { Group } from 'src/group/entities/group.entity';
import { Project } from 'src/project/entities/project.entity';
import { User } from 'src/user/entities/user.entity';

@Entity()
export class RegisterPitching {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, default: RegisterPitchingStatusEnum.PENDING })
  register_pitching_status: RegisterPitchingStatusEnum;

  // @Column({ nullable: true })
  // document_url: string;

  // // Enum đang đợi thầy đưa subjectcode
  // @Column({ nullable: false })
  // subject_code: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // @ManyToOne(() => User, (lecturer) => lecturer.register_pitchings)
  // lecturer: User;

  @ManyToOne(() => Group, (group) => group.register_pitchings)
  group: Group;

  @ManyToOne(() => Project, (project) => project.register_pitchings)
  project: Project;
}
