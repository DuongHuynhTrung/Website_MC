import { Module } from '@nestjs/common';
import { SummaryReportService } from './summary_report.service';
import { SummaryReportController } from './summary_report.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SummaryReport } from './entities/summary_report.entity';
import { Project } from 'src/project/entities/project.entity';
import { ProjectService } from 'src/project/project.service';
import { ResponsiblePerson } from 'src/responsible_person/entities/responsible_person.entity';
import { ResponsiblePersonService } from 'src/responsible_person/responsible_person.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SummaryReport, Project, ResponsiblePerson]),
  ],
  controllers: [SummaryReportController],
  providers: [SummaryReportService, ProjectService, ResponsiblePersonService],
})
export class SummaryReportModule {}
