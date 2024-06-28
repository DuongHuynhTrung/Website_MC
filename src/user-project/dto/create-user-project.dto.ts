import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserProjectStatusEnum } from '../enum/user-project-status.enum';
import { Project } from 'src/project/entities/project.entity';
import { User } from 'src/user/entities/user.entity';

export class CreateUserProjectDto {
  @IsNotEmpty()
  @IsEnum(UserProjectStatusEnum)
  user_project_status: UserProjectStatusEnum;

  @IsNotEmpty()
  project: Project;

  @IsNotEmpty()
  user: User;

  constructor(data: {
    user_project_status: UserProjectStatusEnum;
    project: Project;
    user: User;
  }) {
    this.user_project_status = data.user_project_status;
    this.project = data.project;
    this.user = data.user;
  }
}
