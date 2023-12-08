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
        'Có lỗi xảy ra khi lưu user-group',
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
      let user_group = await this.userGroupRepository.find({
        relations: ['user', 'group'],
      });
      user_group = user_group.filter(
        (user_group) => user_group.user._id == user._id,
      );
      if (!user_group) {
        throw new NotFoundException(
          `Không tìm thấy user_group với user id ${user._id}`,
        );
      }
      return user_group;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async findAllUserGroupByGroupId(groupId: number): Promise<UserGroup[]> {
    try {
      const user_group: UserGroup[] = await this.userGroupRepository.find({
        relations: ['user', 'group'],
      });
      const userGroup = user_group.filter(
        (user_group) => user_group.group.id == groupId,
      );
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
      const userGroup = user_group.find(
        (user_group) =>
          user_group.group.id == groupId && user_group.user._id == userId,
      );
      if (!userGroup) {
        throw new NotFoundException(
          `Sinh viên không phải là thành viên của nhóm`,
        );
      }
      return userGroup;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
