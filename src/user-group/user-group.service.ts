import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserGroupDto } from './dto/create-user-group.dto';
import { Repository } from 'typeorm';
import { UserGroup } from './entities/user-group.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { RoleInGroupEnum } from './enum/role-in-group.enum';

@Injectable()
export class UserGroupService {
  constructor(
    @InjectRepository(UserGroup)
    private readonly userGroupRepository: Repository<UserGroup>,

    // private readonly userService: UserService,

    // private readonly groupService: GroupService,
  ) {}
  async createUserGroup(
    createUserGroupDto: CreateUserGroupDto,
  ): Promise<UserGroup> {
    const user_group = this.userGroupRepository.create(createUserGroupDto);
    if (!user_group) {
      throw new BadRequestException('Có lỗi xảy ra khi tạo user_group');
    }
    try {
      const result = await this.userGroupRepository.save(user_group);
      if (!result) {
        throw new InternalServerErrorException(
          'Something went wrong when saving user_group',
        );
      }
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async saveUserGroup(userGroup: UserGroup): Promise<void> {
    try {
      await this.userGroupRepository.save(userGroup);
    } catch (error) {
      throw new InternalServerErrorException(
        'Có lỗi xảy ra khi lưu user-group bằng hàm',
      );
    }
  }

  async findUserGroupById(id: number): Promise<UserGroup> {
    try {
      const user_group = await this.userGroupRepository.findOne({
        where: {
          id,
        },
        relations: ['user', 'group'],
      });

      if (!user_group) {
        throw new NotFoundException(`Không tìm thấy user_group với id ${id}`);
      }
      return user_group;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async findAllUserGroupByUserId(user: User): Promise<UserGroup[]> {
    try {
      const userId = user.id;
      const user_group: UserGroup[] = await this.userGroupRepository
        .createQueryBuilder('user_group')
        .leftJoinAndSelect('user_group.user', 'user')
        .leftJoinAndSelect('user_group.group', 'group')
        .leftJoinAndSelect('user.role', 'role')
        .where('user.id = :userId', { userId })
        .getMany();
      if (!user_group) {
        throw new NotFoundException(
          `Không tìm thấy user_group với user id ${user.id}`,
        );
      }
      return user_group;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async findAllUserGroupByGroupId(groupId: number): Promise<UserGroup[]> {
    try {
      const userGroup: UserGroup[] = await this.userGroupRepository
        .createQueryBuilder('user_group')
        .leftJoinAndSelect('user_group.user', 'user')
        .leftJoinAndSelect('user_group.group', 'group')
        .leftJoinAndSelect('user.role', 'role')
        .where('group.id = :groupId', { groupId })
        .getMany();
      if (!userGroup) {
        throw new NotFoundException(
          `Nhóm với id ${groupId} không có thành viên`,
        );
      }
      return userGroup;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async checkUserInGroup(userId: number, groupId: number): Promise<UserGroup> {
    try {
      const user_group: UserGroup[] = await this.userGroupRepository.find({
        relations: ['user', 'group'],
      });
      if (user_group.length === 0) {
        throw new NotFoundException('Hệ thống hiện chưa có nhóm nào');
      }
      const userGroup = user_group.find(
        (user_group) =>
          user_group.group.id == groupId && user_group.user.id == userId,
      );
      return userGroup;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async checkGroupHasLecturer(groupId: number): Promise<UserGroup[]> {
    try {
      const roleName = RoleInGroupEnum.LECTURER;
      const userGroup: UserGroup[] = await this.userGroupRepository
        .createQueryBuilder('user_group')
        .leftJoinAndSelect('user_group.user', 'user')
        .leftJoinAndSelect('user_group.group', 'group')
        .where('group.id = :groupId', { groupId })
        .andWhere('user_group.role_in_group = :roleName', { roleName })
        .getMany();
      if (!userGroup) {
        return null;
      }
      return userGroup;
    } catch (error) {
      throw new InternalServerErrorException(
        'Có lỗi xảy ra khi kiểm tra nhóm có giảng viên chưa',
      );
    }
  }

  async getLeaderOfGroup(groupId: number): Promise<UserGroup> {
    try {
      const role_in_group = RoleInGroupEnum.LEADER;
      const userGroup: UserGroup = await this.userGroupRepository
        .createQueryBuilder('user_group')
        .leftJoinAndSelect('user_group.user', 'user')
        .leftJoinAndSelect('user_group.group', 'group')
        .where('group.id = :groupId', { groupId })
        .andWhere('role_in_group = :role_in_group', { role_in_group })
        .getOne();
      if (!userGroup) {
        throw new InternalServerErrorException(
          'Có lỗi xảy ra khi truy xuất thông tin trưởng nhóm để chọn',
        );
      }
      return userGroup;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
