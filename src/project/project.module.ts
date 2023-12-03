import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { UserService } from 'src/user/user.service';
import { ResponsiblePersonService } from 'src/responsible_person/responsible_person.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { User } from 'src/user/entities/user.entity';
import { ResponsiblePerson } from 'src/responsible_person/entities/responsible_person.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Project, User, ResponsiblePerson])],
  controllers: [ProjectController],
  providers: [ProjectService, UserService, ResponsiblePersonService],
})
export class ProjectModule {}
