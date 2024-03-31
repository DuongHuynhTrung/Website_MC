import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Group } from 'src/group/entities/group.entity';
import { GroupService } from 'src/group/group.service';
import { RegisterPitching } from 'src/register-pitching/entities/register-pitching.entity';
import { RegisterPitchingService } from 'src/register-pitching/register-pitching.service';
import { UserGroup } from 'src/user-group/entities/user-group.entity';
import { UserGroupService } from 'src/user-group/user-group.service';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Project } from 'src/project/entities/project.entity';
import { ProjectService } from 'src/project/project.service';
import { NotificationService } from 'src/notification/notification.service';
import { Notification } from 'src/notification/entities/notification.entity';
import { ResponsiblePerson } from 'src/responsible_person/entities/responsible_person.entity';
import { ResponsiblePersonService } from 'src/responsible_person/responsible_person.service';

import { Role } from 'src/role/entities/role.entity';
import { RoleService } from 'src/role/role.service';
import { EmailService } from 'src/email/email.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Message,
      Group,
      RegisterPitching,
      UserGroup,
      User,
      Project,
      Notification,
      ResponsiblePerson,
      Role,
    ]),
  ],
  controllers: [MessageController],
  providers: [
    RoleService,
    MessageService,
    GroupService,
    RegisterPitchingService,
    UserGroupService,
    UserService,
    ProjectService,
    NotificationService,
    ResponsiblePersonService,
    EmailService,
    JwtService,
    ConfigService,
  ],
})
export class MessageModule {}
