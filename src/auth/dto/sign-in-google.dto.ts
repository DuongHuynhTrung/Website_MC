import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SignInGoogleDto {
  @ApiProperty({
    description: 'Email address of Google account',
    example: 'trungduong22021619@gmail.com',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  email: string;
}
