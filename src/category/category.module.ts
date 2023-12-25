import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { Category } from './entities/category.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Phase } from 'src/phase/entities/phase.entity';
import { User } from 'src/user/entities/user.entity';
import { UserGroup } from 'src/user-group/entities/user-group.entity';
import { PhaseService } from 'src/phase/phase.service';
import { UserService } from 'src/user/user.service';
import { UserGroupService } from 'src/user-group/user-group.service';
import { Project } from 'src/project/entities/project.entity';
import { ProjectService } from 'src/project/project.service';
import { ResponsiblePerson } from 'src/responsible_person/entities/responsible_person.entity';
import { ResponsiblePersonService } from 'src/responsible_person/responsible_person.service';
import { Group } from 'src/group/entities/group.entity';
import { GroupService } from 'src/group/group.service';
import { RegisterPitching } from 'src/register-pitching/entities/register-pitching.entity';
import { RegisterPitchingService } from 'src/register-pitching/register-pitching.service';
import { Notification } from 'src/notification/entities/notification.entity';
import { NotificationService } from 'src/notification/notification.service';
import { SocketGateway } from 'socket.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Category,
      Phase,
      User,
      UserGroup,
      Project,
      ResponsiblePerson,
      Group,
      RegisterPitching,
      Notification,
    ]),
  ],
  controllers: [CategoryController],
  providers: [
    CategoryService,
    PhaseService,
    UserService,
    UserGroupService,
    ProjectService,
    ResponsiblePersonService,
    GroupService,
    RegisterPitchingService,
    NotificationService,
    SocketGateway,
  ],
})
export class CategoryModule {}
