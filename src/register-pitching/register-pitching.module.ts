import { Module } from '@nestjs/common';
import { RegisterPitchingService } from './register-pitching.service';
import { RegisterPitchingController } from './register-pitching.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegisterPitching } from './entities/register-pitching.entity';
import { Project } from 'src/project/entities/project.entity';
import { Group } from 'src/group/entities/group.entity';
import { ProjectService } from 'src/project/project.service';
import { GroupService } from 'src/group/group.service';
import { UserGroup } from 'src/user-group/entities/user-group.entity';
import { UserGroupService } from 'src/user-group/user-group.service';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';
import { Notification } from 'src/notification/entities/notification.entity';
import { NotificationService } from 'src/notification/notification.service';

import { Role } from 'src/role/entities/role.entity';
import { RoleService } from 'src/role/role.service';
import { EmailService } from 'src/email/email.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserProjectService } from 'src/user-project/user-project.service';
import { UserProject } from 'src/user-project/entities/user-project.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RegisterPitching,
      Project,
      Group,
      UserGroup,
      User,
      Notification,
      Role,
      UserProject,
    ]),
  ],
  controllers: [RegisterPitchingController],
  providers: [
    RoleService,
    RegisterPitchingService,
    ProjectService,
    GroupService,
    UserGroupService,
    UserService,
    NotificationService,
    EmailService,
    JwtService,
    ConfigService,
    UserProjectService,
  ],
})
export class RegisterPitchingModule {}
