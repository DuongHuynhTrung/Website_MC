import { UserProjectService } from 'src/user-project/user-project.service';
import { UserGroup } from './../user-group/entities/user-group.entity';
import {
  BadGatewayException,
  BadRequestException,
  ForbiddenException,
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
import { User } from 'src/user/entities/user.entity';
import { RoleEnum } from 'src/role/enum/role.enum';
import { UserGroupService } from 'src/user-group/user-group.service';
import { RoleInGroupEnum } from 'src/user-group/enum/role-in-group.enum';
import { Group } from 'src/group/entities/group.entity';
import { GroupService } from 'src/group/group.service';
import { ConfirmSummaryReportDto } from './dto/confirm-summary_report.dto';

import { ProjectTypeEnum } from 'src/project/enum/project-type.enum';
import { PhaseService } from 'src/phase/phase.service';
import { ProjectStatusEnum } from 'src/project/enum/project-status.enum';
import { SocketGateway } from 'socket.gateway';
import { UserProject } from 'src/user-project/entities/user-project.entity';
import { UserProjectStatusEnum } from 'src/user-project/enum/user-project-status.enum';
import { EmailService } from 'src/email/email.service';
import { FeedbackService } from 'src/feedback/feedback.service';

@Injectable()
export class SummaryReportService {
  constructor(
    @InjectRepository(SummaryReport)
    private readonly summaryReportRepository: Repository<SummaryReport>,

    private readonly projectService: ProjectService,

    private readonly userGroupService: UserGroupService,

    private readonly groupService: GroupService,

    private readonly phaseService: PhaseService,

    private readonly userProjectService: UserProjectService,

    private readonly emailService: EmailService,

    private readonly feedbackService: FeedbackService,
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
    if (project.business_type == ProjectTypeEnum.PLAN) {
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

        const authorityPerson: UserProject[] =
          await this.userProjectService.getAuthorityPersonInProject(project.id);
        authorityPerson.forEach(async (person) => {
          await this.emailService.announceSummaryReport(
            person.user.email,
            person.user.fullname,
            project.name_project,
          );
        });

        await this.handleGetSummaryReports(result.project.id);
        return await this.getSummaryReportByProjectId(result.project.id);
      } catch (error) {
        throw new InternalServerErrorException(error.message);
      }
    } else {
      const canUpload: boolean = await this.phaseService.checkProjectCanBeDone(
        project.id,
      );
      if (!canUpload) {
        throw new BadRequestException(
          'Dự án tồn tại giai đoạn chưa hoàn thành',
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
        const authorityPerson: UserProject[] =
          await this.userProjectService.getAuthorityPersonInProject(project.id);
        authorityPerson.forEach(async (person) => {
          await this.emailService.announceSummaryReport(
            person.user.email,
            person.user.fullname,
            project.name_project,
          );
        });

        await this.handleGetSummaryReports(result.project.id);
        return await this.getSummaryReportByProjectId(result.project.id);
      } catch (error) {
        throw new InternalServerErrorException(error.message);
      }
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
      await this.handleGetSummaryReports(projectId);
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
    const canUpload: boolean = await this.phaseService.checkProjectCanBeDone(
      project.id,
    );
    if (!canUpload) {
      throw new BadRequestException('Dự án tồn tại giai đoạn chưa hoàn thành');
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
    await this.handleGetSummaryReports(project.id);
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
      if (!summaryReport.isBusinessConfirmed) {
        throw new BadRequestException(
          'Doanh nghiệp chưa nghiệm thu dự án. Hãy đợi doanh nghiệp nghiệm thu',
        );
      }
      const group: Group = await this.groupService.getGroupByGroupId(
        confirmSummaryReportDto.groupId,
      );
      const project: Project = await this.projectService.getProjectById(
        confirmSummaryReportDto.project_id,
      );
      const lecturerOfGroup = await this.userGroupService.checkGroupHasLecturer(
        group.id,
      );
      let checkPermission: boolean = false;
      lecturerOfGroup.forEach(
        (lecturer) => (checkPermission = lecturer.user.id === user.id),
      );

      if (!checkPermission) {
        throw new BadGatewayException(
          'Chỉ có giảng viên hướng dẫn dự án mới có thể xác nhận báo cáo tổng hợp',
        );
      }
      if (project.business_type == ProjectTypeEnum.PROJECT) {
        const canConfirm: boolean =
          await this.phaseService.checkProjectCanBeDone(project.id);
        if (!canConfirm) {
          throw new BadRequestException(
            'Dự án tồn tại giai đoạn chưa hoàn thành',
          );
        }
        summaryReport.isLecturerConfirmed = true;
        try {
          await this.summaryReportRepository.save(summaryReport);
        } catch (error) {
          throw new InternalServerErrorException(
            'Có lỗi xảy ra khi xác nhận báo cáo tổng hợp',
          );
        }
        await this.projectService.changeProjectStatus(
          project.id,
          ProjectStatusEnum.DONE,
          group.id,
          user,
        );
        await this.handleGetSummaryReports(confirmSummaryReportDto.project_id);
        return await this.getSummaryReportByProjectId(
          confirmSummaryReportDto.project_id,
        );
      } else {
        summaryReport.isLecturerConfirmed = true;
        try {
          await this.summaryReportRepository.save(summaryReport);
        } catch (error) {
          throw new InternalServerErrorException(
            'Có lỗi xảy ra khi xác nhận báo cáo tổng hợp',
          );
        }
        await this.projectService.changeProjectStatus(
          project.id,
          ProjectStatusEnum.DONE,
          group.id,
          user,
        );
        await this.handleGetSummaryReports(confirmSummaryReportDto.project_id);
        return await this.getSummaryReportByProjectId(
          confirmSummaryReportDto.project_id,
        );
      }
    } else {
      const project: Project = await this.projectService.getProjectById(
        confirmSummaryReportDto.project_id,
      );
      const checkUserInProject: UserProject =
        await this.userProjectService.checkUserInProject(user.id, project.id);
      if (!checkUserInProject) {
        throw new NotFoundException('Người dùng không thuộc dự án');
      }
      if (
        checkUserInProject.user_project_status != UserProjectStatusEnum.OWNER &&
        checkUserInProject.user_project_status != UserProjectStatusEnum.EDIT
      ) {
        throw new ForbiddenException(
          'Chỉ có doanh nghiệp và người phụ trách được cấp quyền có thể xác nhận báo cáo tổng hợp',
        );
      }
      const checkProjectExistFeedback: boolean =
        await this.feedbackService.checkProjectExistFeedback(project.id);
      if (!checkProjectExistFeedback) {
        throw new BadGatewayException(
          'Dự án phải có đánh giá trước khi xác nhận báo cáo tổng hợp',
        );
      }
      if (project.business_type == ProjectTypeEnum.PROJECT) {
        const canConfirm: boolean =
          await this.phaseService.checkProjectCanBeDone(project.id);
        if (!canConfirm) {
          throw new BadRequestException(
            'Dự án tồn tại giai đoạn chưa hoàn thành',
          );
        }
        summaryReport.isBusinessConfirmed = true;
        try {
          await this.summaryReportRepository.save(summaryReport);
        } catch (error) {
          throw new InternalServerErrorException(
            'Có lỗi xảy ra khi xác nhận báo cáo tổng hợp',
          );
        }
        await this.handleGetSummaryReports(confirmSummaryReportDto.project_id);
        return await this.getSummaryReportByProjectId(
          confirmSummaryReportDto.project_id,
        );
      } else {
        summaryReport.isBusinessConfirmed = true;
        try {
          await this.summaryReportRepository.save(summaryReport);
        } catch (error) {
          throw new InternalServerErrorException(
            'Có lỗi xảy ra khi xác nhận báo cáo tổng hợp',
          );
        }
        await this.handleGetSummaryReports(confirmSummaryReportDto.project_id);
        return await this.getSummaryReportByProjectId(
          confirmSummaryReportDto.project_id,
        );
      }
    }
  }

  async handleGetSummaryReports(projectId: number): Promise<void> {
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
      SocketGateway.handleGetSummaryReports({
        summaryReport: summaryReport,
        projectId: projectId,
      });
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
