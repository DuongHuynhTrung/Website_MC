import { SocketGateway } from 'socket.gateway';
import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,

    private readonly userService: UserService,

    private readonly socketGateway: SocketGateway,
  ) {}
  async createNotification(
    createNotificationDto: CreateNotificationDto,
    user: User,
  ): Promise<Notification> {
    const sender: User = await this.userService.getUserByEmail(
      createNotificationDto.sender_email,
    );
    if (!sender.status) {
      throw new BadGatewayException('Tài khoản gửi thông báo không hoạt động');
    }
    if (sender.id != user.id) {
      throw new BadGatewayException('Không thể tạo thông báo cho người khác');
    }
    const receiver: User = await this.userService.getUserByEmail(
      createNotificationDto.receiver_email,
    );
    if (!receiver.status) {
      throw new BadGatewayException('Tài khoản nhận thông báo không hoạt động');
    }
    const notification: Notification = this.notificationRepository.create(
      createNotificationDto,
    );
    if (!notification) {
      throw new BadGatewayException('Có lỗi xảy ra khi tạo thông báo mới');
    }
    notification.sender = sender;
    notification.receiver = receiver;
    try {
      const result: Notification =
        await this.notificationRepository.save(notification);
      if (!result) {
        throw new InternalServerErrorException(
          'Có lỗi xảy ra khi lưu thông báo mới',
        );
      }
      await this.handleGetNotifications(receiver);
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAllNotificationOfReceiver(
    user: User,
  ): Promise<[total_notifications: number, Notification[]]> {
    try {
      const receiverId: number = user.id;
      const notifications: Notification[] = await this.notificationRepository
        .createQueryBuilder('notification')
        .leftJoinAndSelect('notification.receiver', 'receiver')
        .leftJoinAndSelect('notification.sender', 'sender')
        .where('receiver.id = :receiverId', { receiverId })
        .getMany();
      const total_notifications: number = notifications.filter(
        (notification) => notification.is_new,
      ).length;
      notifications.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      );
      return [total_notifications, notifications];
    } catch (error) {
      throw new InternalServerErrorException(
        'Có lỗi khi truy xuất tất cả thông báo của người nhận',
      );
    }
  }

  async getNotificationById(id: number): Promise<Notification> {
    try {
      const notification: Notification =
        await this.notificationRepository.findOne({
          where: { id },
          relations: ['sender', 'receiver'],
        });
      if (!notification) {
        throw new NotFoundException('Không tìm thấy thông báo');
      }
      return notification;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async updateNotificationOfReceiver(
    id: number,
    user: User,
  ): Promise<Notification> {
    const notification: Notification = await this.getNotificationById(id);
    if (notification.receiver.id != user.id) {
      throw new BadGatewayException(
        'Không thể đánh dấu đã đọc thông báo của thông báo người khác',
      );
    }
    try {
      notification.is_new = false;
      const result: Notification =
        await this.notificationRepository.save(notification);
      if (!result) {
        throw new InternalServerErrorException(
          'Có lỗi xảy ra khi đánh dấu người nhận đã đọc thông báo',
        );
      }
      await this.handleGetNotifications(user);
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateAllNotificationOfReceiver(user: User): Promise<Notification[]> {
    const notifications_response: [number, Notification[]] =
      await this.getAllNotificationOfReceiver(user);
    if (notifications_response[0] == 0) {
      throw new NotFoundException('Người dùng không có thông báo');
    }
    const notifications: Notification[] = notifications_response[1];
    notifications.forEach((notification) => (notification.is_new = false));
    try {
      const result: Notification[] =
        await this.notificationRepository.save(notifications);
      if (!result || result.length === 0) {
        throw new InternalServerErrorException(
          'Có lỗi xảy ra khi đánh dấu người nhận đã đọc tất cả thông báo',
        );
      }
      await this.handleGetNotifications(user);
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async handleGetNotifications(user: User): Promise<void> {
    try {
      const receiverId: number = user.id;
      const notifications: Notification[] = await this.notificationRepository
        .createQueryBuilder('notification')
        .leftJoinAndSelect('notification.receiver', 'receiver')
        .leftJoinAndSelect('notification.sender', 'sender')
        .where('receiver.id = :receiverId', { receiverId })
        .getMany();
      const total_notifications: number = notifications.filter(
        (notification) => notification.is_new,
      ).length;

      this.socketGateway.handleGetNotifications({
        total_notifications: total_notifications,
        notifications: notifications,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Có lỗi khi truy xuất tất cả thông báo của người nhận',
      );
    }
  }
}
