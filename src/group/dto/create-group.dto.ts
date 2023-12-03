import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({
    description: 'Group name',
    example: '3 con cá',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  group_name: string;
}
