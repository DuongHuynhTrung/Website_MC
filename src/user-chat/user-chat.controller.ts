import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UserChatService } from './user-chat.service';
import { CreateUserChatDto } from './dto/create-user-chat.dto';
import { UpdateUserChatDto } from './dto/update-user-chat.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/jwt.guard';

@ApiTags('User Chat')
@UseGuards(JwtGuard)
@ApiBearerAuth()
@Controller('user-chat')
export class UserChatController {
  constructor(private readonly userChatService: UserChatService) {}

  @ApiOperation({ summary: 'Create a new User-Chat' })
  @Post()
  createUserChat(@Body() createUserChatDto: CreateUserChatDto) {
    return this.userChatService.createUserChat(createUserChatDto);
  }

  @ApiOperation({ summary: 'Get All User-Chat' })
  @Get()
  getAllUserChats() {
    return this.userChatService.getAllUserChats();
  }

  @ApiOperation({ summary: 'Update User-Chat' })
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
