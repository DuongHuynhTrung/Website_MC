import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { UserService } from 'src/user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { User } from 'src/user/entities/user.entity';
import { GroupService } from 'src/group/group.service';
import { Group } from 'src/group/entities/group.entity';
import { UserGroup } from 'src/user-group/entities/user-group.entity';
import { UserGroupService } from 'src/user-group/user-group.service';
import { RegisterPitching } from 'src/register-pitching/entities/register-pitching.entity';

import { Role } from 'src/role/entities/role.entity';
import { RoleService } from 'src/role/role.service';
import { EmailService } from 'src/email/email.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Notification } from 'src/notification/entities/notification.entity';
import { NotificationService } from 'src/notification/notification.service';
import { UserProjectService } from 'src/user-project/user-project.service';
import { UserProject } from 'src/user-project/entities/user-project.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      User,
      RegisterPitching,
      Group,
      UserGroup,
      Role,
      Notification,
      UserProject,
    ]),
  ],
  controllers: [ProjectController],
  providers: [
    RoleService,
    ProjectService,
    UserService,
    GroupService,
    UserGroupService,
    EmailService,
    JwtService,
    ConfigService,
    NotificationService,
    UserProjectService,
  ],
})
export class ProjectModule {}
