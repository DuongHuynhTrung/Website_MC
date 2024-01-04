import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { UserChatService } from './user-chat.service';
import { CreateUserChatDto } from './dto/create-user-chat.dto';
import { UpdateUserChatDto } from './dto/update-user-chat.dto';

@Controller('user-chat')
export class UserChatController {
  constructor(private readonly userChatService: UserChatService) {}

  @Post()
  createUserChat(@Body() createUserChatDto: CreateUserChatDto) {
    return this.userChatService.createUserChat(createUserChatDto);
  }

  @Get(':identifierUserChat')
  getAllUserChats(@Param('identifierUserChat') identifierUserChat: string) {
    return this.userChatService.getAllUserChats(identifierUserChat);
  }

  @Patch(':identifierUserChat')
  updateUserChatsByIdentifier(
    @Param('identifierUserChat') identifierUserChat: string,
    @Body() updateUserChatDto: UpdateUserChatDto,
  ) {
    return this.userChatService.updateUserChatsByIdentifier(
      identifierUserChat,
      updateUserChatDto,
    );
  }
}
