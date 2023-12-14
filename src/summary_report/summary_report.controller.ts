import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SummaryReportService } from './summary_report.service';
import { CreateSummaryReportDto } from './dto/create-summary_report.dto';
import { UpdateSummaryReportDto } from './dto/update-summary_report.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/jwt.guard';
import { RolesGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/role.decorator';
import { RoleEnum } from 'src/role/enum/role.enum';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/user/entities/user.entity';

@ApiTags('Summary Report')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('summary-report')
export class SummaryReportController {
  constructor(private readonly summaryReportService: SummaryReportService) {}

  @ApiOperation({ summary: 'Leader create new summary report' })
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.STUDENT)
  @Post()
  createSummaryReport(@Body() createSummaryReportDto: CreateSummaryReportDto) {
    return this.summaryReportService.createSummaryReport(
      createSummaryReportDto,
    );
  }

  @Get()
  findAll() {
    return this.summaryReportService.getAllSummaryReport();
  }

  @ApiOperation({ summary: 'Get Summary Report By Id' })
  @Get(':id')
  getSummaryReportById(@Param('id') id: string) {
    return this.summaryReportService.getSummaryReportById(+id);
  }

  @ApiOperation({ summary: 'Leader update summary report' })
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.STUDENT)
  @Patch(':id')
  updateSummaryReport(
    @Param('id') id: number,
    @Body() updateSummaryReportDto: UpdateSummaryReportDto,
  ) {
    return this.summaryReportService.updateSummaryReport(
      id,
      updateSummaryReportDto,
    );
  }

  @ApiOperation({ summary: 'Business/Lecturer confirm summary report' })
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.BUSINESS, RoleEnum.LECTURER)
  @Patch('confirm/:id')
  confirmSummaryReport(@Param('id') id: number, @GetUser() user: User) {
    return this.summaryReportService.confirmSummaryReport(id, user);
  }
}
