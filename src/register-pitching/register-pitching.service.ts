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

@Injectable()
export class RegisterPitchingService {
  constructor(
    @InjectRepository(RegisterPitching)
    private readonly registerPitchingRepository: Repository<RegisterPitching>,

    private readonly groupService: GroupService,

    private readonly projectService: ProjectService,

    private readonly userGroupService: UserGroupService,

    private readonly userService: UserService,
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
    const lecturer: User = await this.userService.getUserByEmail(
      createRegisterPitchingDto.lecturer_email,
    );
    if (lecturer.role.role_name != RoleEnum.LECTURER) {
      throw new BadRequestException('Chỉ có thể mời');
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
    await this.groupService.changeGroupStatusToActive(group.id);
    return await this.getRegisterPitchingById(result.id);
  }

  async getAllRegisterPitchingOfUser(user: User): Promise<RegisterPitching[]> {
    const registerPitchings: RegisterPitching[] =
      await this.registerPitchingRepository.find({
        relations: ['project', 'group'],
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
    return result;
  }

  async getAllRegisterPitchingOfBusiness(
    projectId: number,
  ): Promise<RegisterPitching[]> {
    const registerPitchings: RegisterPitching[] =
      await this.registerPitchingRepository.find({
        relations: ['project', 'group'],
      });
    if (registerPitchings.length === 0) {
      return [];
    }
    const result: RegisterPitching[] = registerPitchings.filter(
      (registerPitching) => registerPitching.project.id == projectId,
    );
    return result;
  }

  async getRegisterPitchingById(id: number): Promise<RegisterPitching> {
    try {
      const registerPitching: RegisterPitching =
        await this.registerPitchingRepository.findOne({
          where: { id },
          relations: ['group', 'project'],
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

  async getAllRegisterPitchingByProjectId(
    projectId: number,
  ): Promise<RegisterPitching[]> {
    await this.projectService.getProjectById(projectId);
    try {
      let registerPitchings: RegisterPitching[] =
        await this.registerPitchingRepository.find({
          relations: ['group', 'project'],
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

  async getAllRegisterPitchingByGroupId(
    groupId: number,
  ): Promise<RegisterPitching[]> {
    await this.groupService.getGroupByGroupId(groupId);
    try {
      let registerPitchings: RegisterPitching[] =
        await this.registerPitchingRepository.find({
          relations: ['group', 'project'],
        });
      if (!registerPitchings || registerPitchings.length === 0) {
        throw new NotFoundException('Không có một đăng ký pitching nào');
      }
      registerPitchings = registerPitchings.filter(
        (registerPitching) => registerPitching.group.id == groupId,
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
          relations: ['group', 'project'],
        });
      if (!registerPitchings || registerPitchings.length === 0) {
        throw new NotFoundException('Không có một đăng ký pitching nào');
      }
      const registerPitching: RegisterPitching = registerPitchings.find(
        (registerPitching) =>
          registerPitching.project.id == projectId &&
          registerPitching.group.id == groupId,
      );
      if (!registerPitching) {
        throw new NotFoundException(
          'Nhóm đã chọn không đăng kí pitching dự án',
        );
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
    await this.checkGroupRegisterPitchingProject(projectId, groupId);

    registerPitchings.forEach(async (registerPitching) => {
      if (registerPitching.group.id == groupId) {
        registerPitching.register_pitching_status =
          RegisterPitchingStatusEnum.SELECTED;
        await this.registerPitchingRepository.save(registerPitching);
      } else {
        registerPitching.register_pitching_status =
          RegisterPitchingStatusEnum.REJECTED;
        await this.registerPitchingRepository.save(registerPitching);
      }
    });
    await this.projectService.changeProjectStatus(
      project.id,
      ProjectStatusEnum.PROCESSING,
    );

    return await this.checkGroupRegisterPitchingProject(projectId, groupId);
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
}
