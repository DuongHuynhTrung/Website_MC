import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Full Name of Responsible Person',
    example: 'Duong Huynh',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  fullname: string;

  @ApiProperty({
    description: 'Position of Responsible Person',
    example: 'abc',
    nullable: false,
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
    description: 'Phone Number of Responsible Person',
    example: '0838323403',
    nullable: false,
  })
  @IsNotEmpty()
  phone_number: string;

  @ApiProperty({
    description: 'Name of Project',
    example: 'abc',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  name_project: string;

  @ApiProperty({
    description: 'Business Sector of Project',
    example: 'Friendly',
    nullable: false,
  })
  @IsNotEmpty()
  @IsString()
  business_sector: string;

  @ApiProperty({
    description: 'Specialized Field of Project',
    example: 'Friendly',
    nullable: false,
  })
  @IsNotEmpty()
  @IsString()
  specialized_field: string;

  @ApiProperty({
    description: 'Purpose of Project',
    example: 'Friendly',
    nullable: false,
  })
  @IsNotEmpty()
  @IsString()
  purpose: string;

  @ApiProperty({
    description: 'Description of Project',
    example: 'Friendly',
    nullable: false,
  })
  @IsNotEmpty()
  @IsString()
  description_project: string;

  @ApiProperty({
    description: 'Request of Project',
    example: 'Friendly',
    nullable: false,
  })
  @IsNotEmpty()
  @IsString()
  request: string;

  @ApiProperty({
    description: 'Note of Project',
    example: 'Friendly',
    nullable: false,
  })
  @IsNotEmpty()
  @IsString()
  note: string;

  @ApiProperty({
    description: 'Document related link',
    example: 'Friendly',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  document_related_link: string;

  @ApiProperty({
    description: 'Project Registration Expired Date',
    example: '2023-12-05 18:47:22.132523',
    nullable: true,
  })
  @IsNotEmpty()
  project_registration_expired_date: Date;

  @ApiProperty({
    description: 'Project Start Date',
    example: '2023-12-25 18:47:22.132523',
    nullable: false,
  })
  @IsNotEmpty()
  project_start_date: Date;

  @ApiProperty({
    description: 'Project Expected End Date',
    example: '2024-05-25 18:47:22.132523',
    nullable: false,
  })
  @IsNotEmpty()
  project_expected_end_date: Date;
}
