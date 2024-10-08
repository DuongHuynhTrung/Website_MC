import { Module } from '@nestjs/common';
import { SummaryReportService } from './summary_report.service';
import { SummaryReportController } from './summary_report.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SummaryReport } from './entities/summary_report.entity';
import { Project } from 'src/project/entities/project.entity';
import { ProjectService } from 'src/project/project.service';
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

import { Phase } from 'src/phase/entities/phase.entity';
import { PhaseService } from 'src/phase/phase.service';
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
import { Feedback } from 'src/feedback/entities/feedback.entity';
import { FeedbackService } from 'src/feedback/feedback.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SummaryReport,
      Project,
      Group,
      UserGroup,
      User,
      RegisterPitching,
      Notification,
      Phase,
      Role,
      UserProject,
      Cost,
      Evidence,
      Category,
      Feedback,
    ]),
  ],
  controllers: [SummaryReportController],
  providers: [
    RoleService,
    SummaryReportService,
    ProjectService,
    GroupService,
    UserGroupService,
    UserService,
    RegisterPitchingService,
    NotificationService,
    PhaseService,
    EmailService,
    JwtService,
    ConfigService,
    UserProjectService,
    FeedbackService,
  ],
})
export class SummaryReportModule {}
