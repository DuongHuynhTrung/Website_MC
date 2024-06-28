import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { RoleEnum } from 'src/role/enum/role.enum';

export class ProvideAccountDto {
  @ApiProperty({
    description: 'Full Name of User',
    example: 'Abc',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  fullname: string;

  @ApiProperty({
    description: 'Email of User',
    example: 'trungduong22021619@gmail.com',
    nullable: false,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Role Name of Account',
    example: RoleEnum.BUSINESS,
  })
  @IsNotEmpty()
  @IsEnum(RoleEnum)
  roleName: RoleEnum;

  @ApiProperty({
    description: 'Project Id of Responsible Person',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  projectId: number;
}
