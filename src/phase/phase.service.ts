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
      user._id,
      createPhaseDto.groupId,
    );
    if (!userGroup.is_leader) {
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
    const phases: Phase[] = await this.getAllPhaseOfProject(project.id);
    const phase_number: number = phases.length;
    const phaseOfProject: Phase = await this.getPhaseOfProjectAtPhaseNumber(
      project.id,
      phase_number,
    );
    if (!phaseOfProject) {
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
      if (phaseOfProject.phase_status != PhaseStatusEnum.DONE) {
        throw new BadRequestException(
          'Giai đoạn trước của dự án chưa được hoàn thành',
        );
      }
      const end_date_phase_before = moment(
        phaseOfProject.phase_actual_end_date,
      );
      if (end_date_phase_before.isBefore(start_date)) {
        throw new BadRequestException(
          'Ngày bắt đầu của giai đoạn tiếp theo phải sau ngày kết thúc của giai đoạn trước đó',
        );
      }
      const phase: Phase = this.phaseRepository.create(createPhaseDto);
      if (!phase) {
        throw new BadRequestException('Có lỗi xảy ra khi tạo phase mới');
      }
      phase.phase_number = phase_number + 1;
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
      user._id,
      updatePhaseDto.groupId,
    );
    if (!userGroup.is_leader) {
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
}
