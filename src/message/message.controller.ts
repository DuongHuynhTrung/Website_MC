import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './entities/message.entity';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/jwt.guard';

@ApiTags('Message')
@UseGuards(JwtGuard)
@ApiBearerAuth()
@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @ApiOperation({ summary: 'Create a new message' })
  @Post()
  createMessage(@Body() createMessageDto: CreateMessageDto): Promise<Message> {
    return this.messageService.createMessage(createMessageDto);
  }

  @ApiOperation({ summary: 'Get All Messages' })
  @Get()
  getAllMessages(
    @Param('identifierUserChat') identifierUserChat: string,
  ): Promise<Message[]> {
    return this.messageService.getAllMessages(identifierUserChat);
  }
}
