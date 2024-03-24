import { Module } from '@nestjs/common';
import { SummaryReportService } from './summary_report.service';
import { SummaryReportController } from './summary_report.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SummaryReport } from './entities/summary_report.entity';
import { Project } from 'src/project/entities/project.entity';
import { ProjectService } from 'src/project/project.service';
import { ResponsiblePerson } from 'src/responsible_person/entities/responsible_person.entity';
import { ResponsiblePersonService } from 'src/responsible_person/responsible_person.service';
import { Group } from 'src/group/entities/group.entity';
import { GroupService } from 'src/group/group.service';
import { UserGroup } from 'src/user-group/entities/user-group.entity';
import { UserGroupService } from 'src/user-group/user-group.service';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { RegisterPitching } from 'src/register-pitching/entities/register-pitching.entity';
import { RegisterPitchingService } from 'src/register-pitching/register-pitching.service';
import { Notification } from 'src/notification/entities/notification.entity';
import { NotificationService } from 'src/notification/notification.service';
import { SocketGateway } from 'socket.gateway';
import { Phase } from 'src/phase/entities/phase.entity';
import { PhaseService } from 'src/phase/phase.service';
import { Role } from 'src/role/entities/role.entity';
import { RoleService } from 'src/role/role.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SummaryReport,
      Project,
      ResponsiblePerson,
      Group,
      UserGroup,
      User,
      RegisterPitching,
      Notification,
      Phase,
      Role,
    ]),
  ],
  controllers: [SummaryReportController],
  providers: [
    RoleService,
    SummaryReportService,
    ProjectService,
    ResponsiblePersonService,
    GroupService,
    UserGroupService,
    UserService,
    RegisterPitchingService,
    NotificationService,
    SocketGateway,
    PhaseService,
  ],
})
export class SummaryReportModule {}
