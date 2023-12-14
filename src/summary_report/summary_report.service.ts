import { Injectable } from '@nestjs/common';
import { CreateSummaryReportDto } from './dto/create-summary_report.dto';
import { UpdateSummaryReportDto } from './dto/update-summary_report.dto';

@Injectable()
export class SummaryReportService {
  create(createSummaryReportDto: CreateSummaryReportDto) {
    return 'This action adds a new summaryReport';
  }

  findAll() {
    return `This action returns all summaryReport`;
  }

  findOne(id: number) {
    return `This action returns a #${id} summaryReport`;
  }

  update(id: number, updateSummaryReportDto: UpdateSummaryReportDto) {
    return `This action updates a #${id} summaryReport`;
  }

  remove(id: number) {
    return `This action removes a #${id} summaryReport`;
  }
}
