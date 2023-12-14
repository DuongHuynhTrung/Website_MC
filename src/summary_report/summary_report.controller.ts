import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SummaryReportService } from './summary_report.service';
import { CreateSummaryReportDto } from './dto/create-summary_report.dto';
import { UpdateSummaryReportDto } from './dto/update-summary_report.dto';

@Controller('summary-report')
export class SummaryReportController {
  constructor(private readonly summaryReportService: SummaryReportService) {}

  @Post()
  create(@Body() createSummaryReportDto: CreateSummaryReportDto) {
    return this.summaryReportService.create(createSummaryReportDto);
  }

  @Get()
  findAll() {
    return this.summaryReportService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.summaryReportService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSummaryReportDto: UpdateSummaryReportDto) {
    return this.summaryReportService.update(+id, updateSummaryReportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.summaryReportService.remove(+id);
  }
}
