import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { ProjectModule } from './project/project.module';
import { EmailModule } from './email/email.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { ResponsiblePersonModule } from './responsible_person/responsible_person.module';
import { GroupModule } from './group/group.module';
import { UserGroupModule } from './user-group/user-group.module';
import { RegisterPitchingModule } from './register-pitching/register-pitching.module';
import { PhaseModule } from './phase/phase.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('PG_HOST'),
        port: configService.get('PG_PORT'),
        username: configService.get('PG_USERNAME'),
        password: configService.get('PG_PASSWORD'),
        database: configService.get('PG_DATABASE'),
        ssl: true,
        entities: ['dist/**/*.entity{.ts,.js}'],
        useNewUrlParser: true,
        synchronize: true,
        logging: true,
        autoLoadEntities: true,
      }),
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.get('MAIL_HOST'),
          secure: false,
          auth: {
            user: config.get('MAIL_USER'),
            pass: config.get('MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: `"MC" <${config.get('MAIL_FROM')}>`,
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    RoleModule,
    ProjectModule,
    EmailModule,
    ResponsiblePersonModule,
    GroupModule,
    UserGroupModule,
    RegisterPitchingModule,
    PhaseModule,
    // TransactionModule,
    // ShareImageModule,
    // MessageModule,
  ],
  // providers: [SocketGateway, MessageService],
})
export class AppModule {}
