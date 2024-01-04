import { Module } from '@nestjs/common';
import { NewMessageService } from './new-message.service';
import { NewMessageController } from './new-message.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewMessage } from './entities/new-message.entity';
import { SocketGateway } from 'socket.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([NewMessage])],
  controllers: [NewMessageController],
  providers: [NewMessageService, SocketGateway],
})
export class NewMessageModule {}
