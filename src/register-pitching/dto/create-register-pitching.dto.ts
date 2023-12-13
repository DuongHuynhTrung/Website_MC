import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRegisterPitchingDto {
  @ApiProperty({
    description: 'Group ID',
    example: 1,
  })
  @IsNotEmpty()
  groupId: number;

  @IsOptional()
  @IsString()
  document_url: string;

  @IsNotEmpty()
  @IsString()
  subject_code: string;

  @IsNotEmpty()
  @IsString()
  lecturer_email: string;

  @ApiProperty({
    description: 'Project ID',
    example: 1,
  })
  @IsNotEmpty()
  projectId: number;
}
