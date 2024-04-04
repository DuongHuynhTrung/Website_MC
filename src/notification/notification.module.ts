import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';

import { ResponsiblePerson } from 'src/responsible_person/entities/responsible_person.entity';
import { ResponsiblePersonService } from 'src/responsible_person/responsible_person.service';
import { Role } from 'src/role/entities/role.entity';
import { RoleService } from 'src/role/role.service';
import { UserGroup } from 'src/user-group/entities/user-group.entity';
import { UserGroupService } from 'src/user-group/user-group.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notification,
      User,
      ResponsiblePerson,
      Role,
      UserGroup,
    ]),
  ],
  controllers: [NotificationController],
  providers: [
    RoleService,
    NotificationService,
    UserService,
    ResponsiblePersonService,
    UserGroupService,
  ],
})
export class NotificationModule {}
