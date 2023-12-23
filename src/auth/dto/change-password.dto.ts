import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Old Password of User',
    example: 'Dht123!@#',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({
    description: 'New Password of User',
    example: 'Dht123!@#',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
