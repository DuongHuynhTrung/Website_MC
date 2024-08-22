import { Module } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feedback } from './entities/feedback.entity';
import { Project } from 'src/project/entities/project.entity';
import { UserProject } from 'src/user-project/entities/user-project.entity';
import { ProjectService } from 'src/project/project.service';
import { UserProjectService } from 'src/user-project/user-project.service';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { RegisterPitching } from 'src/register-pitching/entities/register-pitching.entity';
import { RegisterPitchingService } from 'src/register-pitching/register-pitching.service';
import { Group } from 'src/group/entities/group.entity';
import { GroupService } from 'src/group/group.service';
import { UserGroup } from 'src/user-group/entities/user-group.entity';
import { UserGroupService } from 'src/user-group/user-group.service';
import { Notification } from 'src/notification/entities/notification.entity';
import { NotificationService } from 'src/notification/notification.service';
import { ConfigService } from '@nestjs/config';
import { RoleService } from 'src/role/role.service';
import { EmailService } from 'src/email/email.service';
import { Role } from 'src/role/entities/role.entity';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Feedback,
      Project,
      UserProject,
      User,
      RegisterPitching,
      Group,
      UserGroup,
      Notification,
      Role,
    ]),
  ],
  controllers: [FeedbackController],
  providers: [
    FeedbackService,
    ProjectService,
    UserProjectService,
    UserService,
    RegisterPitchingService,
    GroupService,
    UserGroupService,
    NotificationService,
    ConfigService,
    RoleService,
    EmailService,
    JwtService,
  ],
})
export class FeedbackModule {}
