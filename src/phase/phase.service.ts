import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { CreatePhaseDto } from './dto/create-phase.dto';
import { UpdatePhaseDto } from './dto/update-phase.dto';
import { Repository } from 'typeorm';
import { Phase } from './entities/phase.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectService } from 'src/project/project.service';
import { Project } from 'src/project/entities/project.entity';
import { ProjectStatusEnum } from 'src/project/enum/project-status.enum';
import { PhaseStatusEnum } from './enum/phase-status.enum';
import { User } from 'src/user/entities/user.entity';
import { UserGroup } from 'src/user-group/entities/user-group.entity';
import { UserGroupService } from 'src/user-group/user-group.service';
import * as moment from 'moment';
import { RoleInGroupEnum } from 'src/user-group/enum/role-in-group.enum';
import { RoleEnum } from 'src/role/enum/role.enum';
import { UploadFeedbackDto } from './dto/upload-feedback.dto';
import { GroupService } from 'src/group/group.service';
import { Group } from 'src/group/entities/group.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RegisterPitchingService } from 'src/register-pitching/register-pitching.service';
import { RegisterPitching } from 'src/register-pitching/entities/register-pitching.entity';
import { RegisterPitchingStatusEnum } from 'src/register-pitching/enum/register-pitching.enum';
import { UserService } from 'src/user/user.service';
import { NotificationService } from 'src/notification/notification.service';
import { CreateNotificationDto } from 'src/notification/dto/create-notification.dto';
import { NotificationTypeEnum } from 'src/notification/enum/notification-type.enum';
import { SocketGateway } from 'socket.gateway';

@Injectable()
export class PhaseService {
  constructor(
    @InjectRepository(Phase)
    private readonly phaseRepository: Repository<Phase>,

    private readonly projectService: ProjectService,

    private readonly userGroupService: UserGroupService,

    private readonly groupService: GroupService,

    private readonly registerPitchingService: RegisterPitchingService,

    private readonly notificationService: NotificationService,

    private readonly userService: UserService,

    private readonly socketGateway: SocketGateway,
  ) {}

  async createPhase(
    createPhaseDto: CreatePhaseDto,
    user: User,
  ): Promise<Phase> {
    const start_date = moment(createPhaseDto.phase_start_date);
    const expected_end_date = moment(createPhaseDto.phase_expected_end_date);
    if (start_date.isAfter(expected_end_date)) {
      throw new BadRequestException(
        'Ngày bắt đầu phải trước ngày mong muốn kết thúc',
      );
    }
    const group: Group = await this.groupService.getGroupByGroupId(
      createPhaseDto.groupId,
    );
    const userGroup: UserGroup = await this.userGroupService.checkUserInGroup(
      user.id,
      group.id,
    );
    if (!userGroup) {
      throw new BadRequestException('Thành viên không thuộc về nhóm');
    }
    if (userGroup.role_in_group != RoleInGroupEnum.LEADER) {
      throw new ForbiddenException(
        'Chỉ có trưởng nhóm có quyền tạo giai đoạn mới',
      );
    }
    const project: Project = await this.projectService.getProjectById(
      createPhaseDto.projectId,
    );
    if (project.project_status !== ProjectStatusEnum.PROCESSING) {
      throw new BadRequestException('Dự án không trong giai đoạn triển khai');
    }
    const project_start_date = moment(project.project_start_date);
    const project_expected_end_date = moment(project.project_expected_end_date);
    if (
      start_date.isBefore(project_start_date) ||
      expected_end_date.isAfter(project_expected_end_date)
    ) {
      throw new BadRequestException(
        'Thời gian triển khai giai đoạn phải nằm trong thời gian dự án tiến hành',
      );
    }
    const phases: Phase[] = await this.getAllPhaseOfProject(project.id);
    const phase_number: number = phases.length;
    if (phase_number === 4) {
      throw new BadRequestException(
        'Một dự án chỉ có thể có tối đa 4 giai đoạn',
      );
    }
    if (phase_number === 0) {
      const phase: Phase = this.phaseRepository.create(createPhaseDto);
      if (!phase) {
        throw new BadRequestException('Có lỗi xảy ra khi tạo phase mới');
      }
      phase.project = project;
      try {
        const result: Phase = await this.phaseRepository.save(phase);
        if (!result) {
          throw new InternalServerErrorException(
            'Có lỗi xảy ra khi lưu dự liệu giai đoạn mới',
          );
        }
        await this.handleGetPhases(project.id);
        return await this.getPhaseById(result.id);
      } catch (error) {
        throw new InternalServerErrorException(error.message);
      }
    } else {
      const phaseOfProject: Phase = await this.getPhaseOfProjectAtPhaseNumber(
        project.id,
        phase_number,
      );
      const end_date_phase_before = moment(
        phaseOfProject.phase_expected_end_date,
      );

      if (end_date_phase_before.isAfter(start_date)) {
        throw new BadRequestException(
          'Ngày bắt đầu của giai đoạn tiếp theo phải bằng hoặc sau ngày kết thúc mong muốn của giai đoạn trước đó',
        );
      }
      const phase: Phase = this.phaseRepository.create(createPhaseDto);
      if (!phase) {
        throw new BadRequestException('Có lỗi xảy ra khi tạo phase mới');
      }
      phase.phase_number = phase_number + 1;
      phase.project = project;
      try {
        const result: Phase = await this.phaseRepository.save(phase);
        if (!result) {
          throw new InternalServerErrorException(
            'Có lỗi xảy ra khi lưu dự liệu giai đoạn mới',
          );
        }
        await this.handleGetPhases(project.id);
        return await this.getPhaseById(result.id);
      } catch (error) {
        throw new InternalServerErrorException(error.message);
      }
    }
  }

  async getAllPhaseOfProject(projectId: number): Promise<Phase[]> {
    try {
      const phases: Phase[] = await this.phaseRepository.find({
        relations: ['project'],
      });
      if (phases.length === 0) {
        return [];
      }
      const result = phases.filter((phase) => phase.project.id == projectId);
      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        'Có lỗi xảy ra khi truy xuất tất cả giai đoạn của project',
      );
    }
  }

  async getPhaseById(id: number): Promise<Phase> {
    try {
      const phase = await this.phaseRepository.findOne({
        where: { id },
        relations: ['project'],
      });
      if (!phase) {
        throw new NotFoundException(
          `Giai đoạn với mã số ${id} không được tìm thấy`,
        );
      }
      return phase;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async getPhaseOfProjectAtPhaseNumber(
    projectId: number,
    phaseNumber: number,
  ): Promise<Phase> {
    const project: Project =
      await this.projectService.getProjectById(projectId);
    if (project.project_status !== ProjectStatusEnum.PROCESSING) {
      throw new BadRequestException('Dự án không trong giai đoạn triển khai');
    }
    const phases: Phase[] = await this.getAllPhaseOfProject(project.id);
    if (phases.length === 0) {
      return null;
    }
    const result = phases.find(
      (phase) =>
        phase.project.id == projectId && phase.phase_number == phaseNumber,
    );
    if (!result) {
      throw new NotFoundException(
        `Không tìm thấy dự án với giai đoạn ${phaseNumber}`,
      );
    }
    return result;
  }

  async updatePhase(
    id: number,
    updatePhaseDto: UpdatePhaseDto,
    user: User,
  ): Promise<Phase> {
    const start_date = moment(updatePhaseDto.phase_start_date);
    const expected_end_date = moment(updatePhaseDto.phase_expected_end_date);
    if (start_date.isAfter(expected_end_date)) {
      throw new BadRequestException(
        'Ngày bắt đầu phải trước ngày mong muốn kết thúc',
      );
    }
    const userGroup: UserGroup = await this.userGroupService.checkUserInGroup(
      user.id,
      updatePhaseDto.groupId,
    );
    if (!userGroup) {
      throw new BadRequestException('Thành viên không thuộc về nhóm');
    }
    if (userGroup.role_in_group != RoleInGroupEnum.LEADER) {
      throw new ForbiddenException(
        'Chỉ có trưởng nhóm có quyền thay đổi thông tin của giai đoạn',
      );
    }
    const phase: Phase = await this.getPhaseById(id);

    if (phase.phase_status != PhaseStatusEnum.PROCESSING) {
      throw new BadRequestException(
        'Chỉ có thể cập nhật thông tin giai đoạn trong khi đang thực hiện',
      );
    }
    phase.phase_start_date = updatePhaseDto.phase_start_date;
    phase.phase_expected_end_date = updatePhaseDto.phase_expected_end_date;
    try {
      const result: Phase = await this.phaseRepository.save(phase);
      if (!result) {
        throw new InternalServerErrorException(
          'Có lỗi xảy ra khi lưu dự liệu giai đoạn mới',
        );
      }
      await this.handleGetPhases(phase.project.id);
      return await this.getPhaseById(result.id);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async changePhaseStatus(
    phaseId: number,
    phaseStatus: PhaseStatusEnum,
  ): Promise<Phase> {
    const phase: Phase = await this.getPhaseById(phaseId);
    if (phase.phase_number != 1) {
      const phaseBefore: Phase = await this.getPhaseOfProjectAtPhaseNumber(
        phase.project.id,
        phase.phase_number - 1,
      );

      if (phaseBefore.phase_status != PhaseStatusEnum.DONE) {
        throw new BadRequestException(
          'Không thể bắt đầu giai đoạn mới khi giai đoạn trước chưa hoàn thành',
        );
      }
    }
    if (phaseStatus === PhaseStatusEnum.PENDING) {
      throw new BadRequestException(
        'Không thể cập nhật giai đoạn về chờ triển khai',
      );
    }
    if (
      phase.phase_status == PhaseStatusEnum.PENDING &&
      phaseStatus !== PhaseStatusEnum.PROCESSING
    ) {
      throw new BadRequestException(
        'Giai đoạn đang chờ triển khai chỉ có thể chuyển sang trạng thái triển khai',
      );
    }
    if (
      phase.phase_status == PhaseStatusEnum.WARNING &&
      phaseStatus === PhaseStatusEnum.PROCESSING
    ) {
      throw new BadRequestException(
        'Không thể chuyển trạng thái giai đoạn từ cảnh báo sang triển khai',
      );
    }
    if (phase.phase_status == PhaseStatusEnum.DONE) {
      throw new BadRequestException(
        'Giai đoạn đã hoàn thành không thể chuyển sang trạng thái khác',
      );
    }
    if (phaseStatus === PhaseStatusEnum.DONE) {
      phase.phase_actual_end_date = new Date();
    }
    phase.phase_status = phaseStatus;
    try {
      const result: Phase = await this.phaseRepository.save(phase);
      this.socketGateway.handleChangePhaseStatus({
        phase: phase,
      });
      return await this.getPhaseById(result.id);
    } catch (error) {
      throw new InternalServerErrorException(
        'Có lỗi xảy ra khi thay đổi trạng thái giai đoạn',
      );
    }
  }

  async updateExpectedCost(
    phaseId: number,
    expected_cost: number,
  ): Promise<void> {
    try {
      const phase: Phase = await this.getPhaseById(phaseId);
      phase.expected_cost_total += expected_cost;
      await this.handleGetPhases(phase.project.id);
      await this.phaseRepository.save(phase);
    } catch (error) {
      throw new InternalServerErrorException(
        'Có lỗi xảy ra khi cập nhật chi phí mong muốn',
      );
    }
  }

  async updateActualCost(phaseId: number, actual_cost: number): Promise<void> {
    try {
      const phase: Phase = await this.getPhaseById(phaseId);
      phase.actual_cost_total += actual_cost;
      await this.phaseRepository.save(phase);
    } catch (error) {
      throw new InternalServerErrorException(
        'Có lỗi xảy ra khi cập nhật chi phí thực tế',
      );
    }
  }

  async savePhase(phase: Phase): Promise<void> {
    try {
      await this.phaseRepository.save(phase);
    } catch (error) {
      throw new InternalServerErrorException(
        'Có lỗi xảy ra khi lưu giai đoạn bằng hàm',
      );
    }
  }

  async uploadFeedback(
    uploadFeedbackDto: UploadFeedbackDto,
    user: User,
  ): Promise<Phase> {
    const phase: Phase = await this.getPhaseById(uploadFeedbackDto.phaseId);
    if (phase.phase_status != PhaseStatusEnum.DONE) {
      throw new BadRequestException(
        'Chỉ được thêm feedback khi giai đoạn đã kết thúc',
      );
    }
    if (user.role.role_name == RoleEnum.LECTURER) {
      phase.lecturer_feedback = uploadFeedbackDto.feedback;
      try {
        await this.phaseRepository.save(phase);
        await this.handleGetPhases(phase.project.id);
        return await this.getPhaseById(phase.id);
      } catch (error) {
        throw new InternalServerErrorException(
          'Có lỗi xảy ra khi thêm feedback của giảng viên',
        );
      }
    } else if (user.role.role_name == RoleEnum.BUSINESS) {
      phase.business_feeback = uploadFeedbackDto.feedback;
      try {
        await this.phaseRepository.save(phase);
        await this.handleGetPhases(phase.project.id);
        return await this.getPhaseById(phase.id);
      } catch (error) {
        throw new InternalServerErrorException(
          'Có lỗi xảy ra khi thêm feedback của doanh nghiệp',
        );
      }
    }
  }

  async checkProjectCanBeDone(projectId: number): Promise<boolean> {
    const phasesOfProject: Phase[] = await this.getAllPhaseOfProject(projectId);
    if (phasesOfProject.length === 0) {
      throw new NotFoundException('Dự án không có giai đoạn nào');
    }
    const isNotDone: Phase = phasesOfProject.find(
      (phase) => phase.phase_status != PhaseStatusEnum.DONE,
    );
    if (isNotDone) {
      throw new BadRequestException('Dự án tồn tại giai đoạn chưa hoàn thành');
    }
    return true;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleWarningPhase() {
    const warning = PhaseStatusEnum.WARNING;
    const done = PhaseStatusEnum.DONE;
    const phases: Phase[] = await this.phaseRepository
      .createQueryBuilder('phase')
      .leftJoinAndSelect('phase.project', 'project')
      .where('phase.phase_status != :warning', { warning })
      .andWhere('phase.phase_status != :done', { done })
      .getMany();
    // Get the current date
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    const currentDate = moment(date);

    phases.forEach(async (phase) => {
      const expected_end_date = moment(phase.phase_expected_end_date);
      if (currentDate.isSameOrAfter(expected_end_date)) {
        phase.phase_status = PhaseStatusEnum.WARNING;
        // Save warning status for phase
        try {
          await this.phaseRepository.save(phase);
        } catch (error) {
          throw new InternalServerErrorException(
            'Có lỗi xảy ra khi chuyển trạng thái của giai đoạn sang cảnh báo',
          );
        }
        // Get leader information
        const leader: UserGroup = await this.getLeaderByPhase(phase);
        const admin: User =
          await this.userService.getUserByEmail('admin@gmail.com');
        // create notification for leader
        const createNotificationDtoLeader: CreateNotificationDto =
          new CreateNotificationDto(
            NotificationTypeEnum.WARNING_PHASE_STUDENT,
            `Nhóm bạn có giai đoạn ${phase.phase_number} của dự án ${phase.project.name_project} quá thời hạn dự kiến kết thúc`,
            'admin@gmail.com',
            leader.user.email,
          );
        await this.notificationService.createNotification(
          createNotificationDtoLeader,
          admin,
        );
        // create notification for lecturer
        const group: Group = await this.groupService.getGroupByGroupId(
          leader.group.id,
        );
        const registerPitchigns: RegisterPitching[] =
          await this.registerPitchingService.getAllRegisterPitchingByProjectId(
            phase.project.id,
          );
        const selectedPitching: RegisterPitching = registerPitchigns.find(
          (registerpitching) =>
            registerpitching.register_pitching_status ==
            RegisterPitchingStatusEnum.SELECTED,
        );
        const createNotificationDtoLecturer: CreateNotificationDto =
          new CreateNotificationDto(
            NotificationTypeEnum.WARNING_PHASE_LECTURER,
            `Nhóm ${group.group_name} có giai đoạn ${phase.phase_number} của dự án ${phase.project.name_project} quá thời hạn dự kiến kết thúc`,
            'admin@gmail.com',
            selectedPitching.lecturer.email,
          );
        await this.notificationService.createNotification(
          createNotificationDtoLecturer,
          admin,
        );
      }
    });
  }

  async getLeaderByPhase(phase: Phase): Promise<UserGroup> {
    try {
      const registerPitchigns: RegisterPitching[] =
        await this.registerPitchingService.getAllRegisterPitchingByProjectId(
          phase.project.id,
        );
      const selectedPitching: RegisterPitching = registerPitchigns.find(
        (registerpitching) =>
          registerpitching.register_pitching_status ==
          RegisterPitchingStatusEnum.SELECTED,
      );
      const userGroups: UserGroup[] =
        await this.userGroupService.findAllUserGroupByGroupId(
          selectedPitching.group.id,
        );
      const leader: UserGroup = userGroups.find(
        (userGroup) => userGroup.role_in_group == RoleInGroupEnum.LEADER,
      );
      return leader;
    } catch (error) {
      throw new InternalServerErrorException(
        'Có lỗi xảy ra khi truy xuất thông tin trưởng nhóm của giai đoạn',
      );
    }
  }

  async handleGetPhases(projectId: number): Promise<void> {
    try {
      const phases: Phase[] = await this.phaseRepository.find({
        relations: ['project'],
      });
      if (phases.length === 0) {
        this.socketGateway.handleGetPhases({
          totalPhases: 0,
          phases: [],
        });
      }
      const result = phases.filter((phase) => phase.project.id == projectId);
      const totalPhases: number = result.length;
      this.socketGateway.handleGetPhases({
        totalPhases: totalPhases,
        phases: result,
        projectId: projectId,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Có lỗi xảy ra khi truy xuất tất cả giai đoạn của project',
      );
    }
  }
}
