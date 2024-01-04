import { Controller, Get, Post, Patch, Param, UseGuards } from '@nestjs/common';
import { NewMessageService } from './new-message.service';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/jwt.guard';

@ApiTags('New Message')
@UseGuards(JwtGuard)
@ApiBearerAuth()
@Controller('new-message')
export class NewMessageController {
  constructor(private readonly newMessageService: NewMessageService) {}

  @ApiOperation({ summary: 'Create a new New-Message' })
  @Post('identifierUserChat')
  createNewMessage(
    @Param('identifierUserChat') identifierUserChat: string,
    @GetUser() user: User,
  ) {
    return this.newMessageService.createNewMessage(identifierUserChat, user);
  }

  @ApiOperation({ summary: 'Get all New-Messages' })
  @Get('identifierUserChat')
  getAllNewMessage(@Param('identifierUserChat') identifierUserChat: string) {
    return this.newMessageService.getAllNewMessage(identifierUserChat);
  }

  @ApiOperation({ summary: 'Update All New-Message To True' })
  @Patch('all/:identifierUserChat')
  updateAllNewMessage(
    @Param('identifierUserChat') identifierUserChat: string,
    @GetUser() user: User,
  ) {
    return this.newMessageService.updateAllNewMessage(identifierUserChat, user);
  }

  @ApiOperation({ summary: 'Update New-Message To False' })
  @Patch(':identifierUserChat')
  updateNewMessage(
    @Param('identifierUserChat') identifierUserChat: string,
    @GetUser() user: User,
  ) {
    return this.newMessageService.updateNewMessage(identifierUserChat, user);
  }
}
