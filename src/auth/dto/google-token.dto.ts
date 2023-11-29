import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export default class GoogleTokenDto {
  @ApiProperty({
    description: 'Token from FrontEnd',
    example: 'token',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}
