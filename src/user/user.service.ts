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
import { ResponsiblePerson } from 'src/responsible_person/entities/responsible_person.entity';
import { Role } from 'src/role/entities/role.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(ResponsiblePerson)
    private readonly responsiblePersonRepository: Repository<ResponsiblePerson>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
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

  async getUserEmail(
    email: string,
  ): Promise<{ user: User; responsiblePerson: ResponsiblePerson }> {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
        relations: ['role'],
      });
      if (!user) {
        throw new Error(`Người dùng với email ${email} không tồn tại`);
      }
      if (user.role.role_name == RoleEnum.BUSINESS) {
        const responsiblePersons = await this.responsiblePersonRepository.find({
          relations: ['business'],
        });
        if (!responsiblePersons && responsiblePersons.length > 0) {
          const responsiblePerson = responsiblePersons.find(
            (p) => p.business.id == user.id,
          );
          if (responsiblePerson) {
            return { user, responsiblePerson };
          }
        }
      }
      return { user, responsiblePerson: null };
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
      const role = await this.roleRepository.findOne({
        where: { role_name: updateProfileDto.role_name },
      });
      user.role = role;
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

  async statisticsBusinessFollowProvince(): Promise<
    { key: string; value: number }[]
  > {
    try {
      const users: User[] = await this.userRepository.find({
        relations: ['role'],
      });
      if (!users || users.length === 0) {
        return null;
      }
      const tmpCountData: { [key: string]: number } = {
        'Hà Nội': 0,
        'Hồ Chí Minh': 0,
        'Hải Phòng': 0,
        'Đà Nẵng': 0,
        'Biên Hòa': 0,
        'Nha Trang': 0,
        Huế: 0,
        'Cần Thơ': 0,
        'An Giang': 0,
        'Bà Rịa - Vũng Tàu': 0,
        'Bắc Giang': 0,
        'Bắc Kạn': 0,
        'Bạc Liêu': 0,
        'Bắc Ninh': 0,
        'Bến Tre': 0,
        'Bình Định': 0,
        'Bình Dương': 0,
        'Bình Phước': 0,
        'Bình Thuận': 0,
        'Cao Bằng': 0,
        'Đắk Lắk': 0,
        'Đắk Nông': 0,
        'Đồng Nai': 0,
        'Đồng Tháp': 0,
        'Gia Lai': 0,
        'Hà Giang': 0,
        'Hà Nam': 0,
        'Hà Tĩnh': 0,
        'Hải Dương': 0,
        'Hậu Giang': 0,
        'Hưng Yên': 0,
        'Khánh Hòa': 0,
        'Kiên Giang': 0,
        'Kon Tum': 0,
        'Lai Châu': 0,
        'Lâm Đồng': 0,
        'Lạng Sơn': 0,
        'Lào Cai': 0,
        'Long An': 0,
        'Nam Định': 0,
        'Nghệ An': 0,
        'Ninh Bình': 0,
        'Ninh Thuận': 0,
        'Phú Thọ': 0,
        'Phú Yên': 0,
        'Quảng Bình': 0,
        'Quảng Nam': 0,
        'Quảng Ngãi': 0,
        'Quảng Ninh': 0,
        'Quảng Trị': 0,
        'Sóc Trăng': 0,
        'Sơn La': 0,
        'Tây Ninh': 0,
        'Thái Bình': 0,
        'Thái Nguyên': 0,
        'Thanh Hóa': 0,
        'Thừa Thiên Huế': 0,
        'Tiền Giang': 0,
        'Trà Vinh': 0,
        'Tuyên Quang': 0,
        'Vĩnh Long': 0,
        'Vĩnh Phúc': 0,
        'Yên Bái': 0,
      };

      users.forEach((user: User) => {
        if (user.role.role_name == RoleEnum.BUSINESS) {
          const province = user.address_detail.split(',')[0];
          tmpCountData[province] = tmpCountData[province] + 1;
        }
      });

      const result: { key: string; value: number }[] = Object.keys(
        tmpCountData,
      ).map((key) => ({ key, value: tmpCountData[key] }));
      return result.sort((a, b) => b.value - a.value);
    } catch (error) {
      throw new InternalServerErrorException(
        'Có lỗi xảy ra khi thống kê doanh nghiệp theo tỉnh/thành phố',
      );
    }
  }
}
