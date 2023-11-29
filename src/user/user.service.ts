import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

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
      let users = await this.userRepository.find();
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
      const user = await this.userRepository.findOneBy({
        email,
      });
      if (!user) {
        throw new Error(`User ${email} not found`);
      }
      return user;
    } catch (error) {
      throw new NotFoundException(error.message);
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
      throw new NotFoundException(`User ${email} not found`);
    }
    if (!user.status) {
      throw new BadRequestException(`User status is ${user.status}`);
    }
    const USERNAME_REGEX = /^[a-zA-Z0-9_]{4,15}$/;
    if (!USERNAME_REGEX.test(userName)) {
      throw new BadRequestException(`UserName is not following regex pattern`);
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
