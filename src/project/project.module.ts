import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { UserService } from 'src/user/user.service';
import { ResponsiblePersonService } from 'src/responsible_person/responsible_person.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { User } from 'src/user/entities/user.entity';
import { ResponsiblePerson } from 'src/responsible_person/entities/responsible_person.entity';
import { GroupService } from 'src/group/group.service';
import { Group } from 'src/group/entities/group.entity';
import { UserGroup } from 'src/user-group/entities/user-group.entity';
import { UserGroupService } from 'src/user-group/user-group.service';
import { RegisterPitching } from 'src/register-pitching/entities/register-pitching.entity';

import { Role } from 'src/role/entities/role.entity';
import { RoleService } from 'src/role/role.service';
import { EmailService } from 'src/email/email.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      User,
      ResponsiblePerson,
      RegisterPitching,
      Group,
      UserGroup,
      Role,
    ]),
  ],
  controllers: [ProjectController],
  providers: [
    RoleService,
    ProjectService,
    UserService,
    ResponsiblePersonService,
    GroupService,
    UserGroupService,
    EmailService,
    JwtService,
    ConfigService,
  ],
})
export class ProjectModule {}
