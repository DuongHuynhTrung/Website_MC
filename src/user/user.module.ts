import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { Role } from 'src/role/entities/role.entity';
import { RoleService } from 'src/role/role.service';
import { Project } from 'src/project/entities/project.entity';
import { RegisterPitching } from 'src/register-pitching/entities/register-pitching.entity';
import { ProjectService } from 'src/project/project.service';
import { RegisterPitchingService } from 'src/register-pitching/register-pitching.service';
import { GroupService } from 'src/group/group.service';
import { EmailService } from 'src/email/email.service';
import { UserGroupService } from 'src/user-group/user-group.service';
import { NotificationService } from 'src/notification/notification.service';
import { Group } from 'src/group/entities/group.entity';
import { UserGroup } from 'src/user-group/entities/user-group.entity';
import { Notification } from 'src/notification/entities/notification.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserProjectService } from 'src/user-project/user-project.service';
import { UserProject } from 'src/user-project/entities/user-project.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Role,
      Project,
      RegisterPitching,
      Group,
      UserGroup,
      Notification,
      UserProject,
    ]),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    RoleService,
    ProjectService,
    RegisterPitchingService,
    GroupService,
    EmailService,
    JwtService,
    UserGroupService,
    NotificationService,
    ConfigService,
    UserProjectService,
  ],
})
export class UserModule {}
