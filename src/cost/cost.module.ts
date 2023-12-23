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
import { ResponsiblePerson } from 'src/responsible_person/entities/responsible_person.entity';
import { ResponsiblePersonService } from 'src/responsible_person/responsible_person.service';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';
import { Group } from 'src/group/entities/group.entity';
import { GroupService } from 'src/group/group.service';
import { RegisterPitching } from 'src/register-pitching/entities/register-pitching.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cost,
      Category,
      Phase,
      UserGroup,
      Project,
      ResponsiblePerson,
      User,
      Group,
      RegisterPitching,
    ]),
  ],
  controllers: [CostController],
  providers: [
    CostService,
    CategoryService,
    PhaseService,
    UserGroupService,
    ProjectService,
    ResponsiblePersonService,
    UserService,
    GroupService,
  ],
})
export class CostModule {}
