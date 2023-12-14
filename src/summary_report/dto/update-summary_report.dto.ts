import { PartialType } from '@nestjs/swagger';
import { CreateSummaryReportDto } from './create-summary_report.dto';

export class UpdateSummaryReportDto extends PartialType(CreateSummaryReportDto) {}
