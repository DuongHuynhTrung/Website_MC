import { Module } from '@nestjs/common';
import { EvidenceService } from './evidence.service';
import { EvidenceController } from './evidence.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Evidence } from './entities/evidence.entity';
import { Cost } from 'src/cost/entities/cost.entity';
import { CostService } from 'src/cost/cost.service';
import { Category } from 'src/category/entities/category.entity';
import { CategoryService } from 'src/category/category.service';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Phase } from 'src/phase/entities/phase.entity';
import { PhaseService } from 'src/phase/phase.service';
import { UserGroup } from 'src/user-group/entities/user-group.entity';
import { UserGroupService } from 'src/user-group/user-group.service';
import { Project } from 'src/project/entities/project.entity';
import { ProjectService } from 'src/project/project.service';
import { ResponsiblePerson } from 'src/responsible_person/entities/responsible_person.entity';
import { ResponsiblePersonService } from 'src/responsible_person/responsible_person.service';
import { Group } from 'src/group/entities/group.entity';
import { GroupService } from 'src/group/group.service';
import { RegisterPitching } from 'src/register-pitching/entities/register-pitching.entity';
import { Notification } from 'src/notification/entities/notification.entity';
import { RegisterPitchingService } from 'src/register-pitching/register-pitching.service';
import { NotificationService } from 'src/notification/notification.service';
import { SocketGateway } from 'socket.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Evidence,
      Cost,
      Category,
      User,
      Phase,
      UserGroup,
      Project,
      ResponsiblePerson,
      Group,
      RegisterPitching,
      Notification,
    ]),
  ],
  controllers: [EvidenceController],
  providers: [
    EvidenceService,
    CostService,
    CategoryService,
    UserService,
    PhaseService,
    UserGroupService,
    ProjectService,
    ResponsiblePersonService,
    GroupService,
    RegisterPitchingService,
    NotificationService,
    SocketGateway,
  ],
})
export class EvidenceModule {}
