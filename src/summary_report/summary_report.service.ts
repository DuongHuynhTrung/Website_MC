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

@Injectable()
export class SummaryReportService {
  constructor(
    @InjectRepository(SummaryReport)
    private readonly summaryReportRepository: Repository<SummaryReport>,

    private readonly projectService: ProjectService,
  ) {}

  async createSummaryReport(
    createSummaryReportDto: CreateSummaryReportDto,
  ): Promise<SummaryReport> {
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
      return await this.getSummaryReportById(result.id);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  getAllSummaryReport() {
    return `This action returns all summaryReport`;
  }

  async getSummaryReportById(id: number): Promise<SummaryReport> {
    try {
      const summaryReport: SummaryReport =
        await this.summaryReportRepository.findOne({
          where: { id },
          relations: ['project'],
        });
      if (!summaryReport) {
        throw new NotFoundException(
          `Không tìm thấy báo cáo tổng hợp với id ${id}`,
        );
      }
      return summaryReport;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async updateSummaryReport(
    id: number,
    updateSummaryReportDto: UpdateSummaryReportDto,
  ) {
    const project: Project = await this.projectService.getProjectById(
      updateSummaryReportDto.projectId,
    );
    if (project.project_status != ProjectStatusEnum.DONE) {
      throw new BadGatewayException(
        'Chỉ có thể cập nhật báo cáo tổng hợp khi dự án đã kết thúc',
      );
    }
    const summaryReport: SummaryReport = await this.getSummaryReportById(id);
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
    return await this.getSummaryReportById(id);
  }

  async confirmSummaryReport(id: number, user: User): Promise<SummaryReport> {
    const summaryReport: SummaryReport = await this.getSummaryReportById(id);
    if (user.role.role_name == RoleEnum.LECTURER) {
      summaryReport.isLecturerConfirmed = true;
    } else {
      summaryReport.isBusinessConfirmed = true;
    }
    try {
      await this.summaryReportRepository.save(summaryReport);
    } catch (error) {
      throw new InternalServerErrorException(
        'Có lỗi xảy ra khi xác nhận báo cáo tổng hợp',
      );
    }
    return await this.getSummaryReportById(id);
  }
}
