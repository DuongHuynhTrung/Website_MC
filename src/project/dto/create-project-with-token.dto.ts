import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProjectWithTokenDto {
  @ApiProperty({
    description: 'Is Admin Create Project',
    example: true,
    nullable: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  is_created_by_admin: boolean;

  // Business properties
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
  @IsEmail()
  @IsNotEmpty()
  businessEmail: string;

  @ApiProperty({
    description: 'Link Website of User',
    example: 'Friendly',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  link_web: string;

  @ApiProperty({
    description: 'Description of Business',
    example: 'Friendly',
    nullable: true,
  })
  @IsString()
  @IsNotEmpty()
  business_description: string;

  @ApiProperty({
    description: 'Business Sector',
    example: 'Friendly',
    nullable: true,
  })
  @IsString()
  @IsNotEmpty()
  business_sector: string;

  @ApiProperty({
    description: 'Address of User',
    example: 'Ho Chi Minh',
    nullable: true,
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: 'Address Detail of User',
    example: 'Số 123, khu phố 4',
    nullable: true,
  })
  @IsString()
  @IsNotEmpty()
  address_detail: string;

  @ApiProperty({
    description: 'Is Change Business Info',
    example: true,
    nullable: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  is_change_business_info: boolean;

  // Responsible Person Properties
  @ApiProperty({
    description: 'UserName of User',
    example: 'DuongHuynh02',
    nullable: true,
  })
  @IsString()
  @IsNotEmpty()
  fullname: string;

  @ApiProperty({
    description: 'Phone Number of User',
    example: '0838462852',
    nullable: true,
  })
  @IsString()
  @IsNotEmpty()
  phone_number: string;

  @ApiProperty({
    description: 'Position of Responsible Person Information',
    example: 'Leader',
    nullable: true,
  })
  @IsString()
  @IsNotEmpty()
  position: string;

  @ApiProperty({
    description: 'Email of Responsible Person',
    example: 'trungduong22021619@gmail.com',
    nullable: false,
  })
  @IsEmail()
  @IsNotEmpty()
  email_responsible_person: string;

  @ApiProperty({
    description: 'Other Contact of Responsible Person Information',
    example: 'Abc',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  other_contact: string;

  @ApiProperty({
    description: 'Is Change Responsible Info',
    example: true,
    nullable: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  is_change_responsible_info: boolean;

  // Project Properties
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
  @IsString()
  @IsNotEmpty()
  business_type: string;

  @ApiProperty({
    description: 'Project Purpose',
    example: 'Friendly',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  purpose: string;

  @ApiProperty({
    description: 'Target Object',
    example: 'Friendly',
    nullable: false,
  })
  @IsString()
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
  @IsString()
  @IsNotEmpty()
  request: string;

  @ApiProperty({
    description: 'Project Implement Time',
    example: '23/12/2023',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  project_implement_time: string;

  @ApiProperty({
    description: 'Project Start Date',
    example: '2023-12-25',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  project_start_date: string;

  @ApiProperty({
    description: 'Is Extent',
    example: true,
    nullable: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  is_extent: boolean;

  @ApiProperty({
    description: 'Project Expected End Date',
    example: '2024-05-25 18:47:22.132523',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  project_expected_end_date: string;

  @ApiProperty({
    description: 'Project Expected Budget',
    example: 100000,
    nullable: false,
  })
  @IsString()
  @IsOptional()
  expected_budget: string;

  @ApiProperty({
    description: 'Is First Project',
    example: false,
    nullable: false,
  })
  @IsBoolean()
  @IsOptional()
  is_first_project: boolean;
}
