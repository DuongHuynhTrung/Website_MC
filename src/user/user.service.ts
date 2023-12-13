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

  async searchUserByEmailString(
    searchEmail: string,
    roleName: RoleEnum,
  ): Promise<User[]> {
    let users: User[] = [];
    try {
      users = await this.userRepository.find({
        where: {
          email: Like(`%${searchEmail}%`),
        },
        relations: ['role'],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Có lỗi xảy ra khi tìm kiếm sinh viên/giảng viên`,
      );
    }
    if (!users || users.length === 0) {
      return [];
    }
    if (roleName === RoleEnum.STUDENT) {
      users = users.filter((user) => user.role.role_name == RoleEnum.STUDENT);
      return users;
    } else if (roleName === RoleEnum.LECTURER) {
      users = users.filter((user) => user.role.role_name == RoleEnum.LECTURER);
      return users;
    } else {
      throw new BadRequestException(
        'Chỉ có thể tìm kiếm sinh viên hoặc giảng viên',
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
