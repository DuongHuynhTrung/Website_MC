import { Controller, Get, Post, Patch, Param } from '@nestjs/common';
import { NewMessageService } from './new-message.service';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/user/entities/user.entity';

@Controller('new-message')
export class NewMessageController {
  constructor(private readonly newMessageService: NewMessageService) {}

  @Post('identifierUserChat')
  createNewMessage(
    @Param('identifierUserChat') identifierUserChat: string,
    @GetUser() user: User,
  ) {
    return this.newMessageService.createNewMessage(identifierUserChat, user);
  }

  @Get('identifierUserChat')
  getAllNewMessage(@Param('identifierUserChat') identifierUserChat: string) {
    return this.newMessageService.getAllNewMessage(identifierUserChat);
  }

  @Patch('all/:identifierUserChat')
  updateAllNewMessage(
    @Param('identifierUserChat') identifierUserChat: string,
    @GetUser() user: User,
  ) {
    return this.newMessageService.updateAllNewMessage(identifierUserChat, user);
  }

  @Patch(':identifierUserChat')
  updateNewMessage(
    @Param('identifierUserChat') identifierUserChat: string,
    @GetUser() user: User,
  ) {
    return this.newMessageService.updateNewMessage(identifierUserChat, user);
  }
}
