import { ConfigService, ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { Role } from 'src/role/entities/role.entity';
import { UserService } from 'src/user/user.service';
import { EmailService } from 'src/email/email.service';
import { UserGroup } from 'src/user-group/entities/user-group.entity';
import { UserGroupService } from 'src/user-group/user-group.service';
import { RegisterPitching } from 'src/register-pitching/entities/register-pitching.entity';
import { Project } from 'src/project/entities/project.entity';
import { RegisterPitchingService } from 'src/register-pitching/register-pitching.service';
import { ProjectService } from 'src/project/project.service';
import { Group } from 'src/group/entities/group.entity';
import { GroupService } from 'src/group/group.service';
import { NotificationService } from 'src/notification/notification.service';
import { Notification } from 'src/notification/entities/notification.entity';
import { UserProjectService } from 'src/user-project/user-project.service';
import { UserProject } from 'src/user-project/entities/user-project.entity';
import { RoleService } from 'src/role/role.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      User,
      Role,
      UserGroup,
      RegisterPitching,
      Project,
      Group,
      Notification,
      UserProject,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('ACCESS_TOKEN_SECRET'),
        // signOptions: {
        //   expiresIn: 3600,
        // },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    UserService,
    EmailService,
    UserGroupService,
    RegisterPitchingService,
    ProjectService,
    GroupService,
    NotificationService,
    UserProjectService,
    RoleService,
  ],
})
export class AuthModule {}
