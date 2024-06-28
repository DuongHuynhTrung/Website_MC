import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { CostService } from './cost.service';
import { CostController } from './cost.controller';
import { Cost } from './entities/cost.entity';
import { Category } from 'src/category/entities/category.entity';
import { CategoryService } from 'src/category/category.service';
import { Phase } from 'src/phase/entities/phase.entity';
import { PhaseService } from 'src/phase/phase.service';
import { UserGroup } from 'src/user-group/entities/user-group.entity';
import { UserGroupService } from 'src/user-group/user-group.service';
import { Project } from 'src/project/entities/project.entity';
import { ProjectService } from 'src/project/project.service';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';
import { Group } from 'src/group/entities/group.entity';
import { GroupService } from 'src/group/group.service';
import { RegisterPitching } from 'src/register-pitching/entities/register-pitching.entity';
import { RegisterPitchingService } from 'src/register-pitching/register-pitching.service';
import { Notification } from 'src/notification/entities/notification.entity';
import { NotificationService } from 'src/notification/notification.service';
import { Role } from 'src/role/entities/role.entity';
import { RoleService } from 'src/role/role.service';
import { EmailService } from 'src/email/email.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserProjectService } from 'src/user-project/user-project.service';
import { UserProject } from 'src/user-project/entities/user-project.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cost,
      Category,
      Phase,
      UserGroup,
      Project,
      User,
      Group,
      RegisterPitching,
      Notification,
      Role,
      UserProject,
    ]),
  ],
  controllers: [CostController],
  providers: [
    RoleService,
    CostService,
    CategoryService,
    PhaseService,
    UserGroupService,
    ProjectService,
    UserService,
    GroupService,
    RegisterPitchingService,
    NotificationService,
    EmailService,
    JwtService,
    ConfigService,
    UserProjectService,
  ],
})
export class CostModule {}
