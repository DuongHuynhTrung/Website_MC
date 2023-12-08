import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreatePhaseDto {
  @ApiProperty({
    description: 'Phase Start Date',
    example: '2023-12-10',
  })
  @IsNotEmpty()
  @IsDateString()
  phase_start_date: Date;

  @ApiProperty({
    description: 'Phase Expected End Date',
    example: '2024-01-10',
  })
  @IsNotEmpty()
  @IsDateString()
  phase_expected_end_date: Date;

  @ApiProperty({
    description: 'Project ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  projectId: number;

  @ApiProperty({
    description: 'Group ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  groupId: number;
}
