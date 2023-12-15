import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
  @ApiProperty({
    description: 'Email of User',
    example: 'trungduong22021619@gmail.com',
    nullable: false,
  })
  @IsEmail()
  @IsNotEmpty({ message: 'Email không được rỗng' })
  email: string;

  @ApiProperty({
    description: 'Password of User',
    example: 'Dht123!@#',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu không được rỗng' })
  password: string;
}
