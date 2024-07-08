import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Phase } from 'src/phase/entities/phase.entity';
import { Category } from 'src/category/entities/category.entity';
import { NotificationService } from 'src/notification/notification.service';
import { Notification } from 'src/notification/entities/notification.entity';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';
import { Role } from 'src/role/entities/role.entity';
import { UserGroup } from 'src/user-group/entities/user-group.entity';
import { UserProjectService } from 'src/user-project/user-project.service';
import { EmailService } from 'src/email/email.service';
import { JwtService } from '@nestjs/jwt';
import { UserGroupService } from 'src/user-group/user-group.service';
import { Project } from 'src/project/entities/project.entity';
import { RegisterPitching } from 'src/register-pitching/entities/register-pitching.entity';
import { UserProject } from 'src/user-project/entities/user-project.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Phase,
      Category,
      Notification,
      User,
      Role,
      UserGroup,
      Project,
      RegisterPitching,
      UserProject,
    ]),
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    ConfigService,
    NotificationService,
    UserService,
    UserProjectService,
    EmailService,
    JwtService,
    UserGroupService,
  ],
})
export class PaymentModule {}
