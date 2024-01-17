import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateRegisterPitchingDto } from './dto/create-register-pitching.dto';
import { RegisterPitching } from './entities/register-pitching.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupService } from 'src/group/group.service';
import { ProjectService } from 'src/project/project.service';
import { ProjectStatusEnum } from 'src/project/enum/project-status.enum';
import { Project } from 'src/project/entities/project.entity';
import { Group } from 'src/group/entities/group.entity';
import { User } from 'src/user/entities/user.entity';
import { UserGroupService } from 'src/user-group/user-group.service';
import { UserGroup } from 'src/user-group/entities/user-group.entity';
import { RegisterPitchingStatusEnum } from './enum/register-pitching.enum';
import { UserService } from 'src/user/user.service';
import { RoleEnum } from 'src/role/enum/role.enum';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { RoleInGroupEnum } from 'src/user-group/enum/role-in-group.enum';
import * as moment from 'moment';
import { CreateUserGroupDto } from 'src/user-group/dto/create-user-group.dto';
import { RelationshipStatusEnum } from 'src/user-group/enum/relationship-status.enum';
import { NotificationService } from 'src/notification/notification.service';
import { CreateNotificationDto } from 'src/notification/dto/create-notification.dto';
import { NotificationTypeEnum } from 'src/notification/enum/notification-type.enum';
import { SocketGateway } from 'socket.gateway';

@Injectable()
export class RegisterPitchingService {
  constructor(
    @InjectRepository(RegisterPitching)
    private readonly registerPitchingRepository: Repository<RegisterPitching>,

    private readonly groupService: GroupService,

    private readonly projectService: ProjectService,

    private readonly userGroupService: UserGroupService,

    private readonly userService: UserService,

    private readonly notificationService: NotificationService,

    private readonly socketGateway: SocketGateway,
  ) {}

  async registerPitching(
    createRegisterPitchingDto: CreateRegisterPitchingDto,
    user: User,
  ): Promise<RegisterPitching> {
    const project: Project = await this.projectService.getProjectById(
      createRegisterPitchingDto.projectId,
    );
    if (project.project_status !== ProjectStatusEnum.PUBLIC) {
      throw new BadRequestException(
        'Chỉ có dự án đang được công bố mới có thể đăng kí pitching',
      );
    }
    const expired_date = moment(project.project_registration_expired_date);
    const nowDate = moment(new Date());
    if (expired_date.isBefore(nowDate)) {
      throw new BadRequestException('Đã hết hạn đăng ký pitching dự án');
    }
    const group: Group = await this.groupService.getGroupByGroupId(
      createRegisterPitchingDto.groupId,
    );
    const user_group: UserGroup = await this.userGroupService.checkUserInGroup(
      user.id,
      group.id,
    );
    if (!user_group) {
      throw new ForbiddenException(
        'Sinh viên không có trong nhóm, không thể đăng ký pitching',
      );
    }
    if (user_group.role_in_group != RoleInGroupEnum.LEADER) {
      throw new ForbiddenException(
        'Chỉ có trưởng nhóm mới có thế đăng ký pitching',
      );
    }
    const checkGroupRegisterPitchingProject: RegisterPitching =
      await this.checkGroupRegisterPitchingProject(project.id, group.id);
    if (checkGroupRegisterPitchingProject) {
      throw new BadRequestException('Nhóm đã đăng ký pitching dự án này');
    }
    const checkGroupHasLecturer: UserGroup =
      await this.userGroupService.checkGroupHasLecturer(group.id);
    if (checkGroupHasLecturer) {
      const lecturer: User = await this.userService.getUserByEmail(
        checkGroupHasLecturer.user.email,
      );
      const registerPitching: RegisterPitching =
        this.registerPitchingRepository.create(createRegisterPitchingDto);
      registerPitching.group = group;
      registerPitching.project = project;
      registerPitching.lecturer = lecturer;
      let result: RegisterPitching = null;
      try {
        result = await this.registerPitchingRepository.save(registerPitching);
      } catch (error) {
        throw new InternalServerErrorException(
          'Có lỗi xảy ra khi lưu thông tin đăng ký pitching',
        );
      }
      // Change status of Group to Active
      await this.groupService.changeGroupStatusToActive(group.id);

      return await this.getRegisterPitchingById(result.id);
    } else {
      const lecturer: User = await this.userService.getUserByEmail(
        createRegisterPitchingDto.lecturer_email,
      );
      if (lecturer.role.role_name != RoleEnum.LECTURER) {
        throw new BadRequestException(
          'Chỉ có thể mời giảng viên khi đăng ký pitching',
        );
      }
      const registerPitching: RegisterPitching =
        this.registerPitchingRepository.create(createRegisterPitchingDto);
      registerPitching.group = group;
      registerPitching.project = project;
      registerPitching.lecturer = lecturer;
      let result: RegisterPitching = null;
      try {
        result = await this.registerPitchingRepository.save(registerPitching);
      } catch (error) {
        throw new InternalServerErrorException(
          'Có lỗi xảy ra khi lưu thông tin đăng ký pitching',
        );
      }
      // Create UserGroup for Lecturer and Group
      const createUserGroupDto: CreateUserGroupDto = new CreateUserGroupDto({
        group: group,
        relationship_status: RelationshipStatusEnum.PENDING,
        role_in_group: RoleInGroupEnum.LECTURER,
        user: lecturer,
      });
      await this.userGroupService.createUserGroup(createUserGroupDto);
      // Sent Notification to Lecturer
      const createNotificationDto: CreateNotificationDto =
        new CreateNotificationDto(
          NotificationTypeEnum.INVITE_LECTURER,
          `${group.group_name} đã gửi lời mời bạn làm Mentor cho dự án ${project.name_project}`,
          user_group.user.email,
          lecturer.email,
        );
      await this.notificationService.createNotification(
        createNotificationDto,
        user_group.user,
      );
      // Change status of Group to Active
      await this.groupService.changeGroupStatusToActive(group.id);

      return await this.getRegisterPitchingById(result.id);
    }
  }

  async getAllRegisterPitchingOfUser(user: User): Promise<RegisterPitching[]> {
    const registerPitchings: RegisterPitching[] =
      await this.registerPitchingRepository.find({
        relations: ['group', 'project', 'lecturer'],
      });
    if (registerPitchings.length === 0) {
      return [];
    }
    const result: RegisterPitching[] = [];
    const userGroups: UserGroup[] =
      await this.userGroupService.findAllUserGroupByUserId(user);
    userGroups.forEach((userGroup) => {
      registerPitchings.forEach((registerPitching) => {
        if (registerPitching.group.id == userGroup.group.id) {
          result.push(registerPitching);
        }
      });
    });
    await this.handleGetAllRegisterPitching(user);
    return result;
  }

  async getAllRegisterPitchingOfBusiness(
    projectId: number,
  ): Promise<RegisterPitching[]> {
    const registerPitchings: RegisterPitching[] =
      await this.registerPitchingRepository.find({
        relations: ['group', 'project', 'lecturer'],
      });
    if (registerPitchings.length === 0) {
      return [];
    }
    const result: RegisterPitching[] = registerPitchings.filter(
      (registerPitching) => registerPitching.project.id == projectId,
    );
    return result;
  }

  async getAllRegisterPitchingOfStudent(
    projectId: number,
    user: User,
  ): Promise<RegisterPitching[]> {
    const registerPitchings: RegisterPitching[] =
      await this.registerPitchingRepository.find({
        relations: ['group', 'project', 'lecturer'],
      });
    if (registerPitchings.length === 0) {
      return [];
    }
    const userGroups: UserGroup[] =
      await this.userGroupService.findAllUserGroupByUserId(user);
    const result: RegisterPitching[] = [];
    userGroups.forEach((userGroup) => {
      registerPitchings.forEach((registerPitching) => {
        if (
          registerPitching.project.id == projectId &&
          registerPitching.group.id == userGroup.group.id
        ) {
          result.push(registerPitching);
        }
      });
    });
    if (result.length === 0) {
      return [];
    }
    return result;
  }

  async getRegisterPitchingById(id: number): Promise<RegisterPitching> {
    try {
      const registerPitching: RegisterPitching =
        await this.registerPitchingRepository.findOne({
          where: { id },
          relations: ['group', 'project', 'lecturer'],
        });
      if (!registerPitching) {
        throw new NotFoundException(
          `Không tìm thấy lịch đăng ký pitching với id ${id}`,
        );
      }
      return registerPitching;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async getRegisterPitchingByGroupIdAndProjectId(
    groupId: number,
    projectId: number,
  ): Promise<RegisterPitching> {
    try {
      const registerPitchings: RegisterPitching[] =
        await this.registerPitchingRepository.find({
          relations: ['group', 'project', 'lecturer'],
        });
      if (!registerPitchings) {
        throw new NotFoundException('Hệ thống không có registerPitching nào');
      }
      const registerPitching: RegisterPitching = registerPitchings.find(
        (registerPitching) =>
          registerPitching.group.id == groupId &&
          registerPitching.project.id == projectId,
      );
      return registerPitching;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async getAllRegisterPitchingByProjectId(
    projectId: number,
  ): Promise<RegisterPitching[]> {
    await this.projectService.getProjectById(projectId);
    try {
      let registerPitchings: RegisterPitching[] =
        await this.registerPitchingRepository.find({
          relations: ['group', 'project', 'lecturer'],
        });
      if (!registerPitchings || registerPitchings.length === 0) {
        throw new NotFoundException('Không có một đăng ký pitching nào');
      }
      registerPitchings = registerPitchings.filter(
        (registerPitching) => registerPitching.project.id == projectId,
      );
      if (!registerPitchings || registerPitchings.length === 0) {
        throw new NotFoundException('Dự án không có đăng ký pitching nào');
      }
      return registerPitchings;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async checkGroupRegisterPitchingProject(
    projectId: number,
    groupId: number,
  ): Promise<RegisterPitching> {
    try {
      const registerPitchings: RegisterPitching[] =
        await this.registerPitchingRepository.find({
          relations: ['group', 'project', 'lecturer'],
        });
      if (!registerPitchings || registerPitchings.length === 0) {
        return null;
      }
      const registerPitching: RegisterPitching = registerPitchings.find(
        (registerPitching) =>
          registerPitching.project.id == projectId &&
          registerPitching.group.id == groupId,
      );
      if (!registerPitching) {
        return null;
      }
      return registerPitching;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async chooseGroup(
    groupId: number,
    projectId: number,
    user: User,
  ): Promise<RegisterPitching> {
    const project: Project =
      await this.projectService.getProjectById(projectId);
    if (project.business.id != user.id) {
      throw new ForbiddenException(
        'Chỉ có doanh nghiệp của dự án mới có thể chọn nhóm',
      );
    }
    if (project.project_status != ProjectStatusEnum.PUBLIC) {
      throw new BadRequestException(
        'Chỉ có dự án đang được công bố mới cần chọn nhóm làm',
      );
    }
    const registerPitchings: RegisterPitching[] =
      await this.getAllRegisterPitchingByProjectId(projectId);
    // check Group Register Pitching Project
    const group: Group = await this.groupService.getGroupByGroupId(groupId);
    const checkGroupRegisterPitchingProject: RegisterPitching =
      await this.checkGroupRegisterPitchingProject(projectId, group.id);
    if (
      !checkGroupRegisterPitchingProject ||
      checkGroupRegisterPitchingProject === null
    ) {
      throw new NotFoundException('Nhóm đã chọn không đăng kí pitching dự án');
    }
    registerPitchings.forEach(async (registerPitching) => {
      if (registerPitching.group.id == groupId) {
        registerPitching.register_pitching_status =
          RegisterPitchingStatusEnum.SELECTED;
        //Send notification to leader when selected
        const userGroup: UserGroup =
          await this.userGroupService.getLeaderOfGroup(
            registerPitching.group.id,
          );
        const createNotificationDto: CreateNotificationDto =
          new CreateNotificationDto(
            NotificationTypeEnum.SELECTED_REGISTER_PITCHING,
            `Doanh nghiệp ${project.business.fullname} đã chọn nhóm bạn tham gia dự án ${project.name_project}`,
            project.business.email,
            userGroup.user.email,
          );

        await this.notificationService.createNotification(
          createNotificationDto,
          project.business,
        );
      } else {
        registerPitching.register_pitching_status =
          RegisterPitchingStatusEnum.REJECTED;
        //Send notification to leader when selected
        const userGroup: UserGroup =
          await this.userGroupService.getLeaderOfGroup(
            registerPitching.group.id,
          );
        const createNotificationDto: CreateNotificationDto =
          new CreateNotificationDto(
            NotificationTypeEnum.REJECTED_REGISTER_PITCHING,
            `Doanh nghiệp ${project.business.fullname} đã không chọn nhóm bạn tham gia dự án ${project.name_project}`,
            project.business.email,
            userGroup.user.email,
          );

        await this.notificationService.createNotification(
          createNotificationDto,
          project.business,
        );
      }
    });
    await this.registerPitchingRepository.save(registerPitchings);

    await this.projectService.changeProjectStatus(
      project.id,
      ProjectStatusEnum.PROCESSING,
      groupId,
    );

    return await this.getRegisterPitchingByGroupIdAndProjectId(
      groupId,
      projectId,
    );
  }

  async uploadDocument(
    uploadDocumentDto: UploadDocumentDto,
    user: User,
  ): Promise<RegisterPitching> {
    const registerPitching: RegisterPitching =
      await this.getRegisterPitchingById(
        uploadDocumentDto.register_pitching_id,
      );
    const user_group: UserGroup = await this.userGroupService.checkUserInGroup(
      user.id,
      registerPitching.group.id,
    );
    if (!user_group) {
      throw new ForbiddenException(
        'Sinh viên không có trong nhóm, không thể upload tài liệu',
      );
    }
    if (user_group.role_in_group != RoleInGroupEnum.LEADER) {
      throw new ForbiddenException(
        'Chỉ có trưởng nhóm mới có thế upload tài liệu',
      );
    }
    if (
      registerPitching.register_pitching_status !=
      RegisterPitchingStatusEnum.PENDING
    ) {
      throw new BadRequestException(
        'Chỉ có thể upload tài liệu khi đang chờ doanh nghiệp phản hồi',
      );
    }
    registerPitching.document_url = uploadDocumentDto.document_url;
    try {
      const result: RegisterPitching =
        await this.registerPitchingRepository.save(registerPitching);
      if (!result) {
        throw new InternalServerErrorException(
          'Có lỗi xảy ra khi upload tài liệu khi đăng kí pitching',
        );
      }
      return await this.getRegisterPitchingById(result.id);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async handleGetAllRegisterPitching(user: User): Promise<void> {
    try {
      const registerPitchings: RegisterPitching[] =
        await this.registerPitchingRepository.find({
          relations: ['group', 'project', 'lecturer'],
        });
      if (registerPitchings.length === 0) {
        this.socketGateway.handleGetAllRegisterPitching({
          registerPitchings: [],
          email: user.email,
        });
      } else {
        const result: RegisterPitching[] = [];
        const userGroups: UserGroup[] =
          await this.userGroupService.findAllUserGroupByUserId(user);
        userGroups.forEach((userGroup) => {
          registerPitchings.forEach((registerPitching) => {
            if (registerPitching.group.id == userGroup.group.id) {
              result.push(registerPitching);
            }
          });
        });
        this.socketGateway.handleGetAllRegisterPitching({
          registerPitchings: result,
          email: user.email,
        });
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
