import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateSummaryReportDto {
  @ApiProperty({
    description: 'Summary report url',
    example: 'abc',
  })
  @IsNotEmpty()
  @IsString()
  summary_report_url: string;

  @ApiProperty({
    description: 'Project Id',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  projectId: number;

  @ApiProperty({
    description: 'Group Id',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  groupId: number;
}
