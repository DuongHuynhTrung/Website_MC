import { UserGroup } from './../user-group/entities/user-group.entity';
import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateSummaryReportDto } from './dto/create-summary_report.dto';
import { UpdateSummaryReportDto } from './dto/update-summary_report.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SummaryReport } from './entities/summary_report.entity';
import { Repository } from 'typeorm';
import { ProjectService } from 'src/project/project.service';
import { Project } from 'src/project/entities/project.entity';
import { ProjectStatusEnum } from 'src/project/enum/project-status.enum';
import { User } from 'src/user/entities/user.entity';
import { RoleEnum } from 'src/role/enum/role.enum';
import { UserGroupService } from 'src/user-group/user-group.service';
import { RoleInGroupEnum } from 'src/user-group/enum/role-in-group.enum';
import { RegisterPitching } from 'src/register-pitching/entities/register-pitching.entity';
import { RegisterPitchingService } from 'src/register-pitching/register-pitching.service';
import { Group } from 'src/group/entities/group.entity';
import { GroupService } from 'src/group/group.service';
import { ConfirmSummaryReportDto } from './dto/confirm-summary_report.dto';

@Injectable()
export class SummaryReportService {
  constructor(
    @InjectRepository(SummaryReport)
    private readonly summaryReportRepository: Repository<SummaryReport>,

    private readonly projectService: ProjectService,

    private readonly userGroupService: UserGroupService,

    private readonly registerPitchingService: RegisterPitchingService,

    private readonly groupService: GroupService,
  ) {}

  async createSummaryReport(
    createSummaryReportDto: CreateSummaryReportDto,
    user: User,
  ): Promise<SummaryReport> {
    const group: Group = await this.groupService.getGroupByGroupId(
      createSummaryReportDto.groupId,
    );
    const userGroup: UserGroup = await this.userGroupService.checkUserInGroup(
      user.id,
      group.id,
    );
    if (!userGroup) {
      throw new BadGatewayException('Sinh viên không phải thành viên của nhóm');
    }
    if (userGroup.role_in_group != RoleInGroupEnum.LEADER) {
      throw new BadGatewayException(
        'Chỉ có trưởng nhóm mới có thể đăng tải kết quả tổng kết',
      );
    }
    const project: Project = await this.projectService.getProjectById(
      createSummaryReportDto.projectId,
    );
    if (project.project_status != ProjectStatusEnum.DONE) {
      throw new BadGatewayException(
        'Chỉ có thể tải báo cáo tổng hợp khi dự án đã kết thúc',
      );
    }
    const summaryReport: SummaryReport = this.summaryReportRepository.create(
      createSummaryReportDto,
    );
    if (!summaryReport) {
      throw new BadGatewayException(
        'Có lỗi xảy ra khi tạo mới báo cáo tổng hợp',
      );
    }
    summaryReport.project = project;
    try {
      const result: SummaryReport =
        await this.summaryReportRepository.save(summaryReport);
      if (!result) {
        throw new InternalServerErrorException(
          'Có lỗi xảy ra khi lưu báo cáo tổng hợp',
        );
      }
      return await this.getSummaryReportByProjectId(result.project.id);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getSummaryReportByProjectId(projectId: number): Promise<SummaryReport> {
    try {
      const summaryReport: SummaryReport = await this.summaryReportRepository
        .createQueryBuilder('summary_report')
        .leftJoinAndSelect('summary_report.project', 'project')
        .where('project.id = :projectId', { projectId })
        .getOne();
      if (!summaryReport) {
        throw new NotFoundException(
          `Không tìm thấy báo cáo tổng hợp với mã số dự án ${projectId}`,
        );
      }
      return summaryReport;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async updateSummaryReport(
    updateSummaryReportDto: UpdateSummaryReportDto,
    user: User,
  ): Promise<SummaryReport> {
    const group: Group = await this.groupService.getGroupByGroupId(
      updateSummaryReportDto.groupId,
    );
    const userGroup: UserGroup = await this.userGroupService.checkUserInGroup(
      user.id,
      group.id,
    );
    if (!userGroup) {
      throw new BadGatewayException('Sinh viên không phải thành viên của nhóm');
    }
    if (userGroup.role_in_group != RoleInGroupEnum.LEADER) {
      throw new BadGatewayException(
        'Chỉ có trưởng nhóm mới có thể đăng tải kết quả tổng kết',
      );
    }
    const project: Project = await this.projectService.getProjectById(
      updateSummaryReportDto.projectId,
    );
    if (project.project_status != ProjectStatusEnum.DONE) {
      throw new BadGatewayException(
        'Chỉ có thể cập nhật báo cáo tổng hợp khi dự án đã kết thúc',
      );
    }
    const summaryReport: SummaryReport = await this.getSummaryReportByProjectId(
      project.id,
    );
    if (
      summaryReport.isBusinessConfirmed ||
      summaryReport.isLecturerConfirmed
    ) {
      throw new BadGatewayException(
        'Chỉ có thể tải lại báo cáo tổng hợp khi chưa được doanh nghiệp hoặc giảng viên xác nhận',
      );
    }
    summaryReport.summary_report_url =
      updateSummaryReportDto.summary_report_url;
    try {
      await this.summaryReportRepository.save(summaryReport);
    } catch (error) {
      throw new InternalServerErrorException(
        'Có lỗi xảy ra khi cập nhật báo cáo tổng hợp',
      );
    }
    return await this.getSummaryReportByProjectId(project.id);
  }

  async confirmSummaryReport(
    confirmSummaryReportDto: ConfirmSummaryReportDto,
    user: User,
  ): Promise<SummaryReport> {
    const summaryReport: SummaryReport = await this.getSummaryReportByProjectId(
      confirmSummaryReportDto.project_id,
    );
    if (user.role.role_name == RoleEnum.LECTURER) {
      const group: Group = await this.groupService.getGroupByGroupId(
        confirmSummaryReportDto.groupId,
      );
      const project: Project = await this.projectService.getProjectById(
        confirmSummaryReportDto.project_id,
      );
      const registerPitching: RegisterPitching =
        await this.registerPitchingService.getRegisterPitchingByGroupIdAndProjectId(
          group.id,
          project.id,
        );
      if (registerPitching.lecturer.id != user.id) {
        throw new BadGatewayException(
          'Chỉ có giảng viên hướng dẫn dự án mới có thể xác nhận báo cáo tổng hợp',
        );
      }
      summaryReport.isLecturerConfirmed = true;
    } else {
      const project: Project = await this.projectService.getProjectById(
        confirmSummaryReportDto.project_id,
      );
      if (project.business.id != user.id) {
        throw new BadGatewayException(
          'Chỉ có doanh nghiệp sở hữu dự án mới có thể xác nhận báo cáo tổng hợp',
        );
      }
      summaryReport.isBusinessConfirmed = true;
    }
    try {
      await this.summaryReportRepository.save(summaryReport);
    } catch (error) {
      throw new InternalServerErrorException(
        'Có lỗi xảy ra khi xác nhận báo cáo tổng hợp',
      );
    }
    return await this.getSummaryReportByProjectId(
      confirmSummaryReportDto.project_id,
    );
  }
}
