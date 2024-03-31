import { Project } from 'src/project/entities/project.entity';
import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { UserGroup } from 'src/user-group/entities/user-group.entity';
import { UserGroupService } from 'src/user-group/user-group.service';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { RegisterPitching } from 'src/register-pitching/entities/register-pitching.entity';
import { RegisterPitchingService } from 'src/register-pitching/register-pitching.service';
import { ProjectService } from 'src/project/project.service';
import { ResponsiblePerson } from 'src/responsible_person/entities/responsible_person.entity';
import { ResponsiblePersonService } from 'src/responsible_person/responsible_person.service';
import { NotificationService } from 'src/notification/notification.service';
import { Notification } from 'src/notification/entities/notification.entity';

import { Role } from 'src/role/entities/role.entity';
import { RoleService } from 'src/role/role.service';
import { EmailService } from 'src/email/email.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Group,
      UserGroup,
      User,
      RegisterPitching,
      Group,
      Project,
      ResponsiblePerson,
      Notification,
      Role,
    ]),
  ],
  controllers: [GroupController],
  providers: [
    RoleService,
    GroupService,
    UserGroupService,
    UserService,
    RegisterPitchingService,
    ProjectService,
    GroupService,
    ResponsiblePersonService,
    NotificationService,
    EmailService,
    JwtService,
    ConfigService,
  ],
})
export class GroupModule {}
