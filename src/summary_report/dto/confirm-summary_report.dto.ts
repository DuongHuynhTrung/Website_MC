import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class ConfirmSummaryReportDto {
  @ApiProperty({
    description: 'Summary report id',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  summary_report_id: number;

  @ApiProperty({
    description: 'Project id',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  project_id: number;

  @ApiProperty({
    description: 'Group id',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  groupId: number;
}
