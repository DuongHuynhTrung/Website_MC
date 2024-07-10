import { Module } from '@nestjs/common';
import { PhaseService } from './phase.service';
import { PhaseController } from './phase.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Phase } from './entities/phase.entity';
import { Project } from 'src/project/entities/project.entity';
import { ProjectService } from 'src/project/project.service';
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

import { Role } from 'src/role/entities/role.entity';
import { RoleService } from 'src/role/role.service';
import { EmailService } from 'src/email/email.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserProjectService } from 'src/user-project/user-project.service';
import { UserProject } from 'src/user-project/entities/user-project.entity';
import { Cost } from 'src/cost/entities/cost.entity';
import { Evidence } from 'src/evidence/entities/evidence.entity';
import { Category } from 'src/category/entities/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Phase,
      Project,
      User,
      UserGroup,
      Group,
      RegisterPitching,
      Notification,
      Role,
      UserProject,
      Cost,
      Evidence,
      Category,
    ]),
  ],
  controllers: [PhaseController],
  providers: [
    RoleService,
    PhaseService,
    ProjectService,
    UserService,
    UserGroupService,
    GroupService,
    RegisterPitchingService,
    NotificationService,
    EmailService,
    JwtService,
    ConfigService,
    UserProjectService,
  ],
})
export class PhaseModule {}
