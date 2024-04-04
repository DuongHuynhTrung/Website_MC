import { Module } from '@nestjs/common';
import { ResponsiblePersonController } from './responsible_person.controller';
import { ResponsiblePersonService } from './responsible_person.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResponsiblePerson } from './entities/responsible_person.entity';
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
import { GroupService } from 'src/group/group.service';
import { Group } from 'src/group/entities/group.entity';
import { NotificationService } from 'src/notification/notification.service';
import { Notification } from 'src/notification/entities/notification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ResponsiblePerson,
      User,
      Role,
      UserGroup,
      RegisterPitching,
      Project,
      Group,
      Notification,
    ]),
  ],
  controllers: [ResponsiblePersonController],
  providers: [
    ResponsiblePersonService,
    UserService,
    RoleService,
    UserGroupService,
    RegisterPitchingService,
    ProjectService,
    GroupService,
    NotificationService,
  ],
})
export class ResponsiblePersonModule {}
