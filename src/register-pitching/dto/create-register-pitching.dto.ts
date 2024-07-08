import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SubjectCodeEnum } from '../enum/subject-code.enum';

export class CreateRegisterPitchingDto {
  @ApiProperty({
    description: 'Group ID',
    example: 1,
  })
  @IsNotEmpty()
  groupId: number;

  @ApiProperty({
    description: 'Document Url',
    example: 'abc',
  })
  @IsOptional()
  @IsString()
  document_url: string;

  @ApiProperty({
    description: 'Subject Code',
    example: SubjectCodeEnum.MKT304,
  })
  @IsNotEmpty()
  @IsEnum(SubjectCodeEnum)
  subject_code: SubjectCodeEnum;

  @ApiProperty({
    description: 'Lecturer Email',
    example: ['lecturer@gmail.com'],
  })
  @IsOptional()
  @IsArray()
  lecturer_email: string[];

  @ApiProperty({
    description: 'Project ID',
    example: 1,
  })
  @IsNotEmpty()
  projectId: number;
}
