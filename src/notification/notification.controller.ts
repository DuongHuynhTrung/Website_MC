import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import {
  ApiBadGatewayResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/jwt.guard';
import { Notification } from './entities/notification.entity';

@Controller('notifications')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@ApiTags('Notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiOperation({ summary: 'Create New Notification' })
  @ApiBadGatewayResponse({
    description: 'Tài khoản gửi thông báo không hoạt động',
  })
  @ApiBadGatewayResponse({
    description: 'Tài khoản nhận thông báo không hoạt động',
  })
  @ApiBadGatewayResponse({
    description: 'Có lỗi xảy ra khi tạo thông báo mới',
  })
  @ApiInternalServerErrorResponse({
    description: 'Có lỗi xảy ra khi lưu thông báo mới',
  })
  @Post()
  create(
    @Body() createNotificationDto: CreateNotificationDto,
    @GetUser() user: User,
  ): Promise<Notification> {
    return this.notificationService.createNotification(
      createNotificationDto,
      user,
    );
  }

  @ApiOperation({ summary: 'Get All Notifications Of Receiver' })
  @ApiInternalServerErrorResponse({
    description: 'Có lỗi khi truy xuất tất cả thông báo của người nhận',
  })
  @Get()
  getAllNotificationOfReceiver(
    @GetUser() user: User,
  ): Promise<[number, Notification[]]> {
    return this.notificationService.getAllNotificationOfReceiver(user);
  }

  @ApiOperation({ summary: 'Get Notification Of Receiver By Id' })
  @ApiNotFoundResponse({
    description: 'Không tìm thấy thông báo',
  })
  @Get(':id')
  getNotificationById(@Param('id') id: number): Promise<Notification> {
    return this.notificationService.getNotificationById(id);
  }

  @ApiOperation({ summary: 'Mark Notification Of Receiver had read' })
  @ApiNotFoundResponse({
    description: 'Không tìm thấy thông báo',
  })
  @ApiNotFoundResponse({
    description: 'Không thể đánh dấu đã đọc thông báo của thông báo người khác',
  })
  @ApiInternalServerErrorResponse({
    description: 'Có lỗi xảy ra khi đánh dấu người nhận đã đọc thông báo',
  })
  @Patch(':id')
  updateNotificationOfReceiver(
    @Param('id') id: number,
    @GetUser() user: User,
  ): Promise<Notification> {
    return this.notificationService.updateNotificationOfReceiver(id, user);
  }

  @ApiOperation({ summary: 'Mark All Notifications Of Receiver had read' })
  @ApiNotFoundResponse({
    description: 'Người dùng không có thông báo',
  })
  @ApiInternalServerErrorResponse({
    description:
      'Có lỗi xảy ra khi đánh dấu người nhận đã đọc tất cả thông báo',
  })
  @Patch('all/:id')
  updateAllNotificationOfReceiver(
    @GetUser() user: User,
  ): Promise<Notification[]> {
    return this.notificationService.updateAllNotificationOfReceiver(user);
  }
}
