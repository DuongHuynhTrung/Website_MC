import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateResponsiblePersonDto {
  @ApiProperty({
    description: 'Full Name of Responsible Person Information',
    example: 'Huỳnh Trùng Dương',
    nullable: false,
  })
  @IsNotEmpty()
  @IsString()
  fullname: string;

  @ApiProperty({
    description: 'Position of Responsible Person Information',
    example: 'Leader',
    nullable: false,
  })
  @IsNotEmpty()
  @IsString()
  position: string;

  @ApiProperty({
    description: 'Email of Responsible Person Information',
    example: 'trungduong22021619@gmail.com',
    nullable: false,
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Phone Number of Responsible Person Information',
    example: '0838323403',
    nullable: false,
  })
  @IsNotEmpty()
  phone_number: string;

  @ApiProperty({
    description: 'Zalo of Responsible Person Information',
    example: 'Abc',
    nullable: true,
  })
  @IsNotEmpty()
  zalo: string;

  @ApiProperty({
    description: 'Facebook of Responsible Person Information',
    example: 'Abc',
    nullable: true,
  })
  @IsNotEmpty()
  facebook: string;

  @ApiProperty({
    description: 'Business Email',
    example: 'Abc',
    nullable: true,
  })
  @IsNotEmpty()
  businessEmail: string;
}
