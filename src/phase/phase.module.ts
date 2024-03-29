import { Module } from '@nestjs/common';
import { PhaseService } from './phase.service';
import { PhaseController } from './phase.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Phase } from './entities/phase.entity';
import { Project } from 'src/project/entities/project.entity';
import { ProjectService } from 'src/project/project.service';
import { ResponsiblePerson } from 'src/responsible_person/entities/responsible_person.entity';
import { ResponsiblePersonService } from 'src/responsible_person/responsible_person.service';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { UserGroup } from 'src/user-group/entities/user-group.entity';
import { UserGroupService } from 'src/user-group/user-group.service';
import { GroupService } from 'src/group/group.service';
import { Group } from 'src/group/entities/group.entity';
import { RegisterPitching } from 'src/register-pitching/entities/register-pitching.entity';
import { RegisterPitchingService } from 'src/register-pitching/register-pitching.service';
import { NotificationService } from 'src/notification/notification.service';
import { Notification } from 'src/notification/entities/notification.entity';
import { SocketGateway } from 'socket.gateway';
import { Role } from 'src/role/entities/role.entity';
import { RoleService } from 'src/role/role.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Phase,
      Project,
      ResponsiblePerson,
      User,
      UserGroup,
      Group,
      RegisterPitching,
      Notification,
      Role,
    ]),
  ],
  controllers: [PhaseController],
  providers: [
    RoleService,
    PhaseService,
    ProjectService,
    ResponsiblePersonService,
    UserService,
    UserGroupService,
    GroupService,
    RegisterPitchingService,
    NotificationService,
    SocketGateway,
  ],
})
export class PhaseModule {}
