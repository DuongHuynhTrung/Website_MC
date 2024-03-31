import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordOtpDto {
  @ApiProperty({
    description: 'Email address of user to register',
    example: 'trungduong22021619@gmail.com',
    nullable: false,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
