import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateFeedbackDto {
  @ApiProperty({
    description: 'Project ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  projectId: number;

  @ApiProperty({
    description: 'Coordination Work',
    example: 'string',
  })
  @IsNotEmpty()
  @IsString()
  coordination_work: string;

  @ApiProperty({
    description: 'Compare Results',
    example: 'string',
  })
  @IsNotEmpty()
  @IsString()
  compare_results: string;

  @ApiProperty({
    description: 'Comment',
    example: 'string',
  })
  @IsNotEmpty()
  @IsString()
  comment: string;

  @ApiProperty({
    description: 'Suggest Improvement',
    example: 'string',
  })
  @IsOptional()
  @IsString()
  suggest_improvement: string;

  @ApiProperty({
    description: 'General Assessment',
    example: 10,
  })
  @IsNotEmpty()
  @IsNumber()
  general_assessment: number;

  @ApiProperty({
    description: 'Conclusion',
    example: 'string',
  })
  @IsNotEmpty()
  @IsString()
  conclusion: string;
}
