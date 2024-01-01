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
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getUsers(page: number): Promise<[{ totalUsers: number }, User[]]> {
    const limit = 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    try {
      let users = await this.userRepository.find({ relations: ['role'] });
      if (!users || users.length === 0) {
        return [{ totalUsers: 0 }, []];
      }
      users = users.filter((user) => user.email !== 'admin@gmail.com');
      const totalUsers = users.length;
      return [{ totalUsers }, users.slice(startIndex, endIndex)];
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
    leader: User,
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
      users = users.filter(
        (user) =>
          user.role.role_name == RoleEnum.STUDENT && user.email != leader.email,
      );
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

  async updateProfile(
    updateProfileDto: UpdateProfileDto,
    user: User,
  ): Promise<User> {
    try {
      Object.assign(user, updateProfileDto);
      await this.userRepository.save(user);
      return await this.getUserByEmail(user.email);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async statisticsAccount(): Promise<{ key: string; value: number }[]> {
    try {
      const users: User[] = await this.userRepository.find({
        relations: ['role'],
      });
      if (!users || users.length === 0) {
        return null;
      }
      const tmpCountData: { [key: string]: number } = {
        Lecturer: 0,
        Business: 0,
        Student: 0,
      };

      users.forEach((user: User) => {
        const role_name = user.role.role_name;
        tmpCountData[role_name] = tmpCountData[role_name] + 1;
      });

      const result: { key: string; value: number }[] = Object.keys(
        tmpCountData,
      ).map((key) => ({ key, value: tmpCountData[key] }));
      return result.filter(
        (value) => value.key != 'Admin' && value.key != 'Staff',
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Có lỗi xảy ra khi thống kê tài khoản',
      );
    }
  }
}
