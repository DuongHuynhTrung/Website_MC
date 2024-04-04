import { Module } from '@nestjs/common';
import { ResponsiblePersonController } from './responsible_person.controller';
import { ResponsiblePersonService } from './responsible_person.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResponsiblePerson } from './entities/responsible_person.entity';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Role } from 'src/role/entities/role.entity';
import { RoleService } from 'src/role/role.service';
import { UserGroup } from 'src/user-group/entities/user-group.entity';
import { UserGroupService } from 'src/user-group/user-group.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ResponsiblePerson, User, Role, UserGroup]),
  ],
  controllers: [ResponsiblePersonController],
  providers: [
    ResponsiblePersonService,
    UserService,
    RoleService,
    UserGroupService,
  ],
})
export class ResponsiblePersonModule {}
