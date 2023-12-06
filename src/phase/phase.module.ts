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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Phase,
      Project,
      ResponsiblePerson,
      User,
      UserGroup,
    ]),
  ],
  controllers: [PhaseController],
  providers: [
    PhaseService,
    ProjectService,
    ResponsiblePersonService,
    UserService,
    UserGroupService,
  ],
})
export class PhaseModule {}
