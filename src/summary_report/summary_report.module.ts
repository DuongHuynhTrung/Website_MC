import { Module } from '@nestjs/common';
import { SummaryReportService } from './summary_report.service';
import { SummaryReportController } from './summary_report.controller';

@Module({
  controllers: [SummaryReportController],
  providers: [SummaryReportService],
})
export class SummaryReportModule {}
