import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Is Admin Create Project',
    example: true,
    nullable: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  is_created_by_admin: boolean;

  @ApiProperty({
    description: 'Name of Business',
    example: 'Acb',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  businessName: string;

  @ApiProperty({
    description: 'Email of Business',
    example: 'Acb',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  businessEmail: string;

  @ApiProperty({
    description: 'Email of Responsible Person',
    example: 'trungduong22021619@gmail.com',
    nullable: false,
  })
  @IsEmail()
  @IsNotEmpty()
  email_responsible_person: string;

  @ApiProperty({
    description: 'Name of Project',
    example: 'abc',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  name_project: string;

  @ApiProperty({
    description: 'Type of Project',
    example: 'Project',
    nullable: false,
  })
  @IsNotEmpty()
  business_type: string;

  @ApiProperty({
    description: 'Project Purpose',
    example: 'Friendly',
    nullable: false,
  })
  @IsNotEmpty()
  purpose: string;

  @ApiProperty({
    description: 'Target Object',
    example: 'Friendly',
    nullable: false,
  })
  @IsNotEmpty()
  target_object: string;

  @ApiProperty({
    description: 'Note of Project',
    example: 'Friendly',
    nullable: false,
  })
  @IsOptional()
  @IsString()
  note: string;

  @ApiProperty({
    description: 'Document related link',
    example: ['Friendly'],
    nullable: true,
  })
  @IsOptional()
  @IsArray()
  document_related_link: string[];

  @ApiProperty({
    description: 'Project Request',
    example: 'Friendly',
    nullable: true,
  })
  @IsOptional()
  request: string;

  @ApiProperty({
    description: 'Project Implement Time',
    example: '23/12/2023',
    nullable: false,
  })
  @IsNotEmpty()
  project_implement_time: string;

  @ApiProperty({
    description: 'Project Start Date',
    example: '2023-12-25',
    nullable: false,
  })
  @IsNotEmpty()
  project_start_date: string;

  @ApiProperty({
    description: 'Is Extent',
    example: true,
    nullable: true,
  })
  @IsOptional()
  is_extent: boolean;

  @ApiProperty({
    description: 'Project Expected End Date',
    example: '2024-05-25 18:47:22.132523',
    nullable: false,
  })
  @IsNotEmpty()
  project_expected_end_date: string;

  @ApiProperty({
    description: 'Project Expected Budget',
    example: 100000,
    nullable: false,
  })
  @IsNotEmpty()
  expected_budget: string;

  @ApiProperty({
    description: 'Is First Project',
    example: false,
    nullable: false,
  })
  @IsOptional()
  is_first_project: boolean;
}
