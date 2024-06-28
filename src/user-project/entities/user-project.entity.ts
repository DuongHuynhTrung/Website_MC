import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserProjectStatusEnum } from '../enum/user-project-status.enum';
import { User } from 'src/user/entities/user.entity';
import { Project } from 'src/project/entities/project.entity';

@Entity()
export class UserProject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  user_project_status: UserProjectStatusEnum;

  @ManyToOne(() => Project, (project) => project.user_projects)
  project: Project;

  @ManyToOne(() => User, (user) => user.user_projects)
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(user: User, project: Project) {
    this.user = user;
    this.project = project;
  }
}
