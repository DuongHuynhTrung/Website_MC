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

@Injectable()
export class PhaseService {
  constructor(
    @InjectRepository(Phase)
    private readonly phaseRepository: Repository<Phase>,

    private readonly projectService: ProjectService,

    private readonly userGroupService: UserGroupService,
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
    const userGroup: UserGroup = await this.userGroupService.checkUserInGroup(
      user.id,
      createPhaseDto.groupId,
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
        return await this.getPhaseById(result.id);
      } catch (error) {
        throw new InternalServerErrorException(error.message);
      }
    } else {
      const phaseOfProject: Phase = await this.getPhaseOfProjectAtPhaseNumber(
        project.id,
        phase_number,
      );
      console.log(phaseOfProject);
      const end_date_phase_before = moment(
        phaseOfProject.phase_expected_end_date,
      );

      if (end_date_phase_before.isAfter(start_date)) {
        throw new BadRequestException(
          'Ngày bắt đầu của giai đoạn tiếp theo phải sau ngày kết thúc mong muốn của giai đoạn trước đó',
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
      console.log(phaseBefore);
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
}
