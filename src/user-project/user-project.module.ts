import { Module } from '@nestjs/common';
import { UserProjectService } from './user-project.service';
import { UserProjectController } from './user-project.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProject } from './entities/user-project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserProject])],
  controllers: [UserProjectController],
  providers: [UserProjectService],
})
export class UserProjectModule {}
