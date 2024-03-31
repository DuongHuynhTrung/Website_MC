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
import { ResponsiblePerson } from 'src/responsible_person/entities/responsible_person.entity';
import { ResponsiblePersonService } from 'src/responsible_person/responsible_person.service';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';
import { Notification } from 'src/notification/entities/notification.entity';
import { NotificationService } from 'src/notification/notification.service';

import { Role } from 'src/role/entities/role.entity';
import { RoleService } from 'src/role/role.service';
import { EmailService } from 'src/email/email.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RegisterPitching,
      Project,
      Group,
      UserGroup,
      ResponsiblePerson,
      User,
      Notification,
      Role,
    ]),
  ],
  controllers: [RegisterPitchingController],
  providers: [
    RoleService,
    RegisterPitchingService,
    ProjectService,
    GroupService,
    UserGroupService,
    ResponsiblePersonService,
    UserService,
    NotificationService,
    EmailService,
    JwtService,
    ConfigService,
  ],
})
export class RegisterPitchingModule {}
