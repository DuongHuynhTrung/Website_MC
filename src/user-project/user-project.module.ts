import { Module } from '@nestjs/common';
import { UserProjectService } from './user-project.service';
import { UserProjectController } from './user-project.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProject } from './entities/user-project.entity';
import { User } from 'src/user/entities/user.entity';
import { EmailService } from 'src/email/email.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([UserProject, User])],
  controllers: [UserProjectController],
  providers: [UserProjectService, EmailService, JwtService, ConfigService],
})
export class UserProjectModule {}
