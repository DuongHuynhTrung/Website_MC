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
import { RoleEnum } from 'src/role/enum/role.enum';
import { GroupStatusEnum } from './enum/group-status.enum';
import { RoleInGroupEnum } from 'src/user-group/enum/role-in-group.enum';
import { RegisterPitching } from 'src/register-pitching/entities/register-pitching.entity';
import { RegisterPitchingStatusEnum } from 'src/register-pitching/enum/register-pitching.enum';
import { ProjectStatusEnum } from 'src/project/enum/project-status.enum';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,

    @InjectRepository(RegisterPitching)
    private readonly registerPitchingRepository: Repository<RegisterPitching>,

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
      role_in_group: RoleInGroupEnum.LEADER,
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
      return groups.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Something went wrong while retrieving groups',
      );
    }
  }

  async getGroupByGroupId(id: number): Promise<Group> {
    try {
      const group: Group = await this.groupRepository.findOneBy({ id });
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
    const member: User = await this.userService.getUserByEmail(userEmail);
    if (
      member.role.role_name != RoleEnum.STUDENT &&
      member.role.role_name != RoleEnum.LECTURER
    ) {
      throw new BadRequestException(
        'Chỉ có thể gửi lời mời cho sinh viên hoặc giảng viên',
      );
    }
    const group: Group = await this.getGroupByGroupId(groupId);

    if (user.role_name !== RoleEnum.ADMIN) {
      const checkUserInGroup: UserGroup =
        await this.userGroupService.checkUserInGroup(user.id, group.id);
      if (!checkUserInGroup) {
        throw new ForbiddenException(
          `Học sinh ngoài nhóm không có quyền mời thành viên`,
        );
      } else if (checkUserInGroup.role_in_group != RoleInGroupEnum.LEADER) {
        throw new ForbiddenException('Chỉ có leader mới được mời thành viên');
      }
    }

    const checkMemberInGroup: UserGroup =
      await this.userGroupService.checkUserInGroup(member.id, group.id);
    if (checkMemberInGroup) {
      throw new BadRequestException(
        'Sinh viên hoặc giảng viên đã trong nhóm hoặc đang chờ phản hồi',
      );
    }

    if (member.role.role_name == RoleEnum.STUDENT) {
      const createUserGroupDto = new CreateUserGroupDto({
        role_in_group: RoleInGroupEnum.MEMBER,
        user: member,
        group,
        relationship_status: RelationshipStatusEnum.PENDING,
      });
      try {
        await this.userGroupService.createUserGroup(createUserGroupDto);
        return 'Mời thành viên thành công!';
      } catch (error) {
        throw new InternalServerErrorException(
          'Có lỗi xảy ra khi mời thành viên',
        );
      }
    } else {
      const checkGroupHasLecturer: UserGroup[] =
        await this.userGroupService.checkGroupHasLecturer(groupId);
      if (checkGroupHasLecturer && checkGroupHasLecturer.length >= 2) {
        throw new BadRequestException(
          'Nhóm đã có 2 giáo viên hướng dẫn. Không thể mời thêm',
        );
      }
      const isInviteLecturer = await this.userGroupService.checkUserInGroup(
        member.id,
        groupId,
      );
      if (
        isInviteLecturer &&
        isInviteLecturer.relationship_status == RelationshipStatusEnum.PENDING
      ) {
        throw new BadRequestException(
          'Nhóm đã mời giáo viên hướng dẫn. Hãy đợi hồi đáp',
        );
      }

      const createUserGroupDto = new CreateUserGroupDto({
        role_in_group: RoleInGroupEnum.LECTURER,
        user: member,
        group,
        relationship_status: RelationshipStatusEnum.PENDING,
      });
      try {
        await this.userGroupService.createUserGroup(createUserGroupDto);
        return 'Mời giảng viên thành công!';
      } catch (error) {
        throw new InternalServerErrorException(
          'Có lỗi xảy ra khi mời giảng viên',
        );
      }
    }
  }

  async replyInvite(
    userGroupId: number,
    relationStatus: RelationshipStatusEnum,
    user: User,
  ): Promise<UserGroup> {
    if (
      relationStatus !== RelationshipStatusEnum.JOINED &&
      relationStatus !== RelationshipStatusEnum.REJECT
    ) {
      throw new BadRequestException('Chỉ có thể từ chối/chấp nhận lời mời');
    }
    const userGroup: UserGroup =
      await this.userGroupService.findUserGroupById(userGroupId);
    if (userGroup.user.id != user.id) {
      throw new ForbiddenException(
        'Sinh viên/Giảng viên không thể trả lời lời mời của người khác!',
      );
    }
    if (userGroup.relationship_status != RelationshipStatusEnum.PENDING) {
      throw new BadRequestException(
        'Chỉ có lời mời đang chờ phản hồi mới thực hiện được chức năng này',
      );
    }
    userGroup.relationship_status = relationStatus;
    await this.userGroupService.saveUserGroup(userGroup);
    if (user.role.role_name == RoleEnum.STUDENT) {
      if (relationStatus === RelationshipStatusEnum.JOINED) {
        const group = await this.getGroupByGroupId(userGroup.group.id);
        group.group_quantity += 1;
        try {
          await this.groupRepository.save(group);
        } catch (error) {
          throw new InternalServerErrorException(
            'Có lỗi khi tăng số lượng thành viên trong nhóm',
          );
        }
      }
    }
    return await this.userGroupService.findUserGroupById(userGroupId);
  }

  async kickMember(
    groupId: number,
    userId: number,
    user: User,
  ): Promise<string> {
    const lecturer: User = await this.userService.getUserByEmail(user.email);
    if (lecturer.role.role_name !== RoleEnum.LECTURER) {
      throw new ForbiddenException(
        'Chỉ có giảng viên mới có thể kick thành viên',
      );
    }
    const checkUserInGroup: UserGroup =
      await this.userGroupService.checkUserInGroup(user.id, groupId);
    if (!checkUserInGroup) {
      throw new BadRequestException(
        'Giảng viên không thể kick thành viên của nhóm khác',
      );
    }
    if (lecturer.id == userId) {
      throw new BadRequestException(
        'Giảng viên không thể tự kick chính mình ra khỏi nhóm',
      );
    }
    const userInGroup: UserGroup = await this.userGroupService.checkUserInGroup(
      userId,
      groupId,
    );
    if (!userInGroup) {
      throw new BadRequestException('Không thể kick thành viên của nhóm khác');
    }
    if (userInGroup.relationship_status !== RelationshipStatusEnum.JOINED) {
      throw new BadRequestException(
        'Không thể kick thành viên không trong nhóm',
      );
    }
    userInGroup.relationship_status = RelationshipStatusEnum.OUTED;
    await this.userGroupService.saveUserGroup(userInGroup);
    // Minus group quantity when kick member
    const group = await this.getGroupByGroupId(userInGroup.group.id);
    group.group_quantity -= 1;
    try {
      await this.groupRepository.save(group);
    } catch (error) {
      throw new InternalServerErrorException(
        'Có lỗi khi tăng số lượng thành viên trong nhóm',
      );
    }
    return 'Thành viên đã bị kick khỏi nhóm';
  }

  async getMembersOfGroup(groupId: number): Promise<UserGroup[]> {
    const group: Group = await this.getGroupByGroupId(groupId);
    if (!group) {
      throw new BadRequestException(`Nhóm với id ${groupId} không tồn tại`);
    }
    return await this.userGroupService.findAllUserGroupByGroupId(groupId);
  }

  async changeGroupStatusToActive(groupId: number): Promise<void> {
    const group: Group = await this.getGroupByGroupId(groupId);
    if (group.group_status === GroupStatusEnum.INACTIVE) {
      throw new BadRequestException(
        `Nhóm ${group.group_name} đã dừng hoạt động`,
      );
    } else if (group.group_status === GroupStatusEnum.FREE) {
      group.group_status = GroupStatusEnum.ACTIVE;
      try {
        await this.groupRepository.save(group);
      } catch (error) {
        throw new InternalServerErrorException(
          'Có lỗi xảy ra khi thay đổi trạng thái của nhóm sang đang làm việc',
        );
      }
    }
  }

  async getAllRegisterPitchingByGroupId(
    groupId: number,
  ): Promise<RegisterPitching[]> {
    await this.getGroupByGroupId(groupId);
    try {
      let registerPitchings: RegisterPitching[] =
        await this.registerPitchingRepository.find({
          relations: ['group', 'project'],
        });
      if (!registerPitchings || registerPitchings.length === 0) {
        return [];
      }
      registerPitchings = registerPitchings.filter(
        (registerPitching) => registerPitching.group.id == groupId,
      );
      if (!registerPitchings || registerPitchings.length === 0) {
        return [];
      }
      return registerPitchings;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async changeGroupStatusToFree(groupId: number): Promise<void> {
    const group: Group = await this.getGroupByGroupId(groupId);
    const registerPitchings: RegisterPitching[] =
      await this.getAllRegisterPitchingByGroupId(groupId);
    if (registerPitchings.length === 0) {
      return;
    }
    let count = 0;
    registerPitchings.forEach((registerPitching) => {
      if (
        (registerPitching.register_pitching_status ==
          RegisterPitchingStatusEnum.SELECTED &&
          registerPitching.project.project_status ==
            ProjectStatusEnum.PROCESSING) ||
        (registerPitching.register_pitching_status ==
          RegisterPitchingStatusEnum.PENDING &&
          registerPitching.project.project_status == ProjectStatusEnum.PUBLIC)
      ) {
        count++;
      }
    });

    if (count > 0) {
      return;
    } else {
      group.group_status = GroupStatusEnum.FREE;
      try {
        await this.groupRepository.save(group);
      } catch (error) {
        throw new InternalServerErrorException(
          'Có lỗi xảy ra khi chuyển trạng thái nhóm về đang rảnh',
        );
      }
    }
  }
}
