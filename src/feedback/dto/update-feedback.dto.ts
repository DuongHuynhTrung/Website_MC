import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateFeedbackDto {
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
  @IsNotEmpty()
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
