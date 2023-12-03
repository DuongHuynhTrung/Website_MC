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

  async findAllUserGroupByUserId(id: number): Promise<UserGroup[]> {
    try {
      let user_group = await this.userGroupRepository.find({
        relations: ['user', 'group'],
      });
      user_group = user_group.filter(
        (user_group) => user_group.user._id === id,
      );
      if (!user_group) {
        throw new NotFoundException(
          `Không tìm thấy user_group với user id ${id}`,
        );
      }
      return user_group;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async findAllUserGroupByGroupId(id: number): Promise<UserGroup[]> {
    try {
      let user_group = await this.userGroupRepository.find({
        relations: ['user', 'group'],
      });
      user_group = user_group.filter(
        (user_group) => user_group.group.id === id,
      );
      if (!user_group) {
        throw new NotFoundException(
          `Không tìm thấy user_group với group id ${id}`,
        );
      }
      return user_group;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async checkUserInGroup(
    userId: number,
    groupId: number,
  ): Promise<UserGroup[]> {
    try {
      let user_group = await this.userGroupRepository.find({
        relations: ['user', 'group'],
      });
      user_group = user_group.filter(
        (user_group) =>
          user_group.group.id === groupId && user_group.user._id === userId,
      );
      if (!user_group) {
        throw new NotFoundException(
          `Không tìm thấy user_group với group id ${groupId} và user id ${userId}`,
        );
      }
      return user_group;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
