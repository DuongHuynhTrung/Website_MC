import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({
    description: 'Group name',
    example: '3 con cá',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty({ message: 'Tên nhóm không được bỏ trống' })
  group_name: string;
}
