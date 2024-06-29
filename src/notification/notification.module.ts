import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';

import { Role } from 'src/role/entities/role.entity';
import { RoleService } from 'src/role/role.service';
import { UserGroup } from 'src/user-group/entities/user-group.entity';
import { UserGroupService } from 'src/user-group/user-group.service';
import { RegisterPitching } from 'src/register-pitching/entities/register-pitching.entity';
import { RegisterPitchingService } from 'src/register-pitching/register-pitching.service';
import { Project } from 'src/project/entities/project.entity';
import { ProjectService } from 'src/project/project.service';
import { Group } from 'src/group/entities/group.entity';
import { GroupService } from 'src/group/group.service';
import { ConfigService } from '@nestjs/config';
import { UserProject } from 'src/user-project/entities/user-project.entity';
import { UserProjectService } from 'src/user-project/user-project.service';
import { EmailService } from 'src/email/email.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notification,
      User,
      Role,
      UserGroup,
      RegisterPitching,
      Project,
      Group,
      UserProject,
    ]),
  ],
  controllers: [NotificationController],
  providers: [
    RoleService,
    NotificationService,
    UserService,
    UserGroupService,
    RegisterPitchingService,
    ProjectService,
    GroupService,
    ConfigService,
    UserProjectService,
    EmailService,
    JwtService,
  ],
})
export class NotificationModule {}
