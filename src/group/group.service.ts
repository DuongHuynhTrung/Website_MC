import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { User } from 'src/user/entities/user.entity';
import { Group } from './entities/group.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserGroupService } from 'src/user-group/user-group.service';
import { CreateUserGroupDto } from 'src/user-group/dto/create-user-group.dto';
import { RelationshipStatusEnum } from 'src/user-group/enum/relationship-status.enum';
import { UserGroup } from 'src/user-group/entities/user-group.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,

    private readonly userGroupService: UserGroupService,

    private readonly userService: UserService,
  ) {}

  async createGroup(
    user: User,
    createGroupDto: CreateGroupDto,
  ): Promise<UserGroup> {
    const checkGroupName = await this.groupRepository.findBy({
      group_name: createGroupDto.group_name,
    });
    if (checkGroupName.length > 0) {
      throw new BadRequestException(
        `Nhóm với tên ${createGroupDto.group_name} đã tồn tại. Vui lòng chọn tên khác!`,
      );
    }
    const group = this.groupRepository.create(createGroupDto);
    if (!group) {
      throw new BadRequestException('Có lỗi xảy ra khi tạo group');
    }
    group.group_quantity = 1;
    try {
      await this.groupRepository.save(group);
    } catch (error) {
      throw new InternalServerErrorException(
        'Something went wrong when saving group',
      );
    }
    const createUserGroupDto: CreateUserGroupDto = new CreateUserGroupDto({
      is_leader: true,
      relationship_status: RelationshipStatusEnum.JOINED,
      group,
      user,
    });
    const user_group =
      await this.userGroupService.createUserGroup(createUserGroupDto);

    return await this.userGroupService.findUserGroupById(user_group.id);
  }

  async getGroups(): Promise<Group[]> {
    try {
      const groups = await this.groupRepository.find();
      return groups;
    } catch (error) {
      throw new InternalServerErrorException(
        'Something went wrong while retrieving groups',
      );
    }
  }

  async getGroupsByGroupId(id: number): Promise<Group> {
    try {
      const group = await this.groupRepository.findOneBy({ id });
      if (!group) {
        throw new NotFoundException(`Nhóm với id ${id} không tồn tại`);
      }
      return group;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async inviteMember(
    groupId: number,
    userEmail: string,
    user: User,
  ): Promise<string> {
    const member = await this.userService.getUserByEmail(userEmail);
    const group = await this.getGroupsByGroupId(groupId);
    const checkUserInGroup = await this.userGroupService.checkUserInGroup(
      user._id,
      group.id,
    );
    if (checkUserInGroup.length === 0) {
      throw new ForbiddenException(
        `Học sinh ngoài nhóm không có quyền mời thành viên`,
      );
    } else {
      const checkLeader = checkUserInGroup.filter(
        (leader) => leader.is_leader === true,
      );
      if (checkLeader.length === 0) {
        throw new ForbiddenException('Chỉ có leader mới được mời thành viên');
      }
    }
    const createUserGroupDto = new CreateUserGroupDto({
      is_leader: false,
      user: member,
      group,
      relationship_status: RelationshipStatusEnum.PENDING,
    });
    try {
      await this.userGroupService.createUserGroup(createUserGroupDto);
    } catch (error) {
      throw new InternalServerErrorException('Có lỗi xảy ra khi invite member');
    }
    return 'Mời thành viên thành công!';
  }

  async replyInvite(
    userGroupId: number,
    relationStatus: RelationshipStatusEnum,
    user: User,
  ): Promise<UserGroup> {
    const userGroup =
      await this.userGroupService.findUserGroupById(userGroupId);
    if (userGroup.user._id !== user._id) {
      throw new ForbiddenException(
        'Học sinh không thể trả lời lời mời của người khác!',
      );
    }
    userGroup.relationship_status = relationStatus;
    await this.userGroupService.saveUserGroup(userGroup);
    return await this.userGroupService.findUserGroupById(userGroupId);
  }

  // async getGroupByID(id: number): Promise<Group> {
  //   try {
  //     const group = await this.groupRepository.findOneBy({ id });
  //   } catch (error) {}
  //   return `This action returns a #${id} group`;
  // }

  // updateGroupName(id: number, user: User, updateGroupDto: UpdateGroupDto) {
  //   return `This action updates a #${id} group`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} group`;
  // }
}
