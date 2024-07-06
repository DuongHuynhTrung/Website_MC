import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserProjectStatusEnum } from 'src/user-project/enum/user-project-status.enum';

export class AddResponsiblePersonToProjectDto {
  @ApiProperty({
    description: 'Project Id',
    example: 1,
    nullable: false,
  })
  @IsNumber()
  @IsNotEmpty()
  projectId: 1;

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
    description: 'Is Create Account',
    example: true,
    nullable: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  is_create_account: boolean = false;

  @ApiProperty({
    description: 'Is Change Responsible Info',
    example: true,
    nullable: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  is_change_responsible_info: boolean;

  @ApiProperty({
    description: 'User Project Status',
    example: UserProjectStatusEnum.EDIT,
    nullable: false,
  })
  @IsEnum(UserProjectStatusEnum)
  @IsNotEmpty()
  user_project_status: UserProjectStatusEnum;
}
