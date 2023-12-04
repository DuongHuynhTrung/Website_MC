import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RoleEnum } from '../role/enum/role.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getUsers(page: number): Promise<User[]> {
    const limit = 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    try {
      let users = await this.userRepository.find({ relations: ['role'] });
      if (!users || users.length === 0) {
        return [];
      }
      users = users.filter((user) => user.email !== 'admin@gmail.com');
      return users.slice(startIndex, endIndex);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async getUserByEmail(email: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
        relations: ['role'],
      });
      if (!user) {
        throw new Error(`Người dùng với email ${email} không tồn tại`);
      }
      return user;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async searchUserByEmailString(searchEmail: string): Promise<User[]> {
    try {
      let users: User[] = await this.userRepository.find({
        where: {
          email: Like(`%${searchEmail}%`),
        },
        relations: ['role'],
      });
      if (!users || users.length === 0) {
        return [];
      }
      users = users.filter((user) => user.role.role_name === RoleEnum.STUDENT);
      return users;
    } catch (error) {
      throw new InternalServerErrorException(
        `Something went wrong when searching for user by email`,
      );
    }
  }

  async changeUserName(email: string, userName: string): Promise<string> {
    let user = null;
    try {
      user = await this.getUserByEmail(email);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
    if (!user) {
      throw new NotFoundException(
        `Người dùng với email ${email} không tồn tại`,
      );
    }
    if (!user.status) {
      throw new BadRequestException(`User status is ${user.status}`);
    }
    const USERNAME_REGEX = /^[a-zA-Z0-9_]{4,15}$/;
    if (!USERNAME_REGEX.test(userName)) {
      throw new BadRequestException(
        `Tên người dùng phải tuân theo nguyên tắc!`,
      );
    }
    user.userName = userName;
    try {
      const updateUserName = await this.userRepository.save(user);
      if (!updateUserName) {
        throw new Error(`Something went wrong when changing user name`);
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
    return 'UserName has been changed';
  }
}
