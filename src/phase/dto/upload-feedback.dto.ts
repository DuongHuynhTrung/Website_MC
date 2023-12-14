import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UploadFeedbackDto {
  @ApiProperty({
    description: 'Phase Id',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  phaseId: number;

  @ApiProperty({
    description: 'Feedback content',
    example: 'Làm tốt lắm',
  })
  @IsNotEmpty()
  @IsString()
  feedback: string;
}
