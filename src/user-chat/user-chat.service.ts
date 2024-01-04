import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserChatDto } from './dto/create-user-chat.dto';
import { UpdateUserChatDto } from './dto/update-user-chat.dto';
import { UserChat } from './entities/user-chat.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SocketGateway } from 'socket.gateway';

@Injectable()
export class UserChatService {
  constructor(
    @InjectRepository(UserChat)
    private readonly userChatRepository: Repository<UserChat>,

    private readonly socketGateway: SocketGateway,
  ) {}
  async createUserChat(
    createUserChatDto: CreateUserChatDto,
  ): Promise<UserChat> {
    const userChat: UserChat =
      this.userChatRepository.create(createUserChatDto);
    if (!userChat) {
      throw new BadRequestException(
        'Có lỗi xảy ra khi tạo cuộc hội thoại nhắn tin',
      );
    }
    try {
      const result: UserChat = await this.userChatRepository.save(userChat);
      if (!result) {
        throw new InternalServerErrorException(
          'Có lỗi xảy ra khi lưu thông tin tạo cuộc hội thoại nhắn tin',
        );
      }
      await this.handleGetAllUserChats(createUserChatDto.identifierUserChat);
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAllUserChats(identifierUserChat: string): Promise<UserChat[]> {
    try {
      const userChats: UserChat[] = await this.userChatRepository.find({
        where: { identifierUserChat },
      });
      if (!userChats) {
        throw new InternalServerErrorException(
          'Có lỗi xảy ra khi truy xuất tất cả cuộc hội thoại nhắn tin',
        );
      }
      await this.handleGetAllUserChats(identifierUserChat);
      return userChats;
    } catch (error) {}
  }

  async updateUserChatsByIdentifier(
    identifierUserChat: string,
    updateUserChatDto: UpdateUserChatDto,
  ): Promise<UserChat> {
    let userChat: UserChat = null;
    try {
      userChat = await this.userChatRepository.findOne({
        where: {
          identifierUserChat,
        },
      });
      if (!userChat) {
        throw new NotFoundException('Không tìm thấy cuộc hội thoại tin nhắn');
      }
    } catch (error) {
      throw new NotFoundException(error.message);
    }
    userChat.senderEmail = updateUserChatDto.senderEmail;
    userChat.lastNameSender = updateUserChatDto.lastNameSender;
    userChat.lastMessage = updateUserChatDto.lastMessage;
    try {
      const result: UserChat = await this.userChatRepository.save(userChat);
      if (!result) {
        throw new InternalServerErrorException(
          'Có lỗi xảy ra khi cập nhật thông tin cuộc hội thoại',
        );
      }
      await this.handleGetAllUserChats(identifierUserChat);
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async handleGetAllUserChats(identifierUserChat: string): Promise<void> {
    try {
      const userChats: UserChat[] = await this.userChatRepository.find({
        where: { identifierUserChat },
      });
      if (!userChats) {
        throw new InternalServerErrorException(
          'Có lỗi xảy ra khi truy xuất tất cả tin nhắn',
        );
      }
      this.socketGateway.handleGetAllUserChats({
        userChats: userChats,
        identifierUserChat: identifierUserChat,
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
