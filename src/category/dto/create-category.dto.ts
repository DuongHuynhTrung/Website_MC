import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category Name',
    example: 'Chạy quảng cáo',
  })
  @IsNotEmpty()
  @IsString()
  category_name: string;

  @ApiProperty({
    description: 'Category Details',
    example: 'Chạy quảng cáo',
  })
  @IsNotEmpty()
  @IsString()
  detail: string;

  @ApiProperty({
    description: 'Category Start Date',
    example: '2023-12-15',
  })
  @IsNotEmpty()
  @IsDateString()
  category_start_date: Date;

  @ApiProperty({
    description: 'Categort Expected End Date',
    example: '2024-01-01',
  })
  @IsNotEmpty()
  @IsDateString()
  category_expected_end_date: Date;

  @ApiProperty({
    description: 'Category Expected Result',
    example: 'Hoàn thành 5 quảng cáo',
  })
  @IsNotEmpty()
  @IsString()
  result_expected: string;

  @ApiProperty({
    description: 'Phase ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  phaseId: number;

  @ApiProperty({
    description: 'Group ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  groupId: number;
}
