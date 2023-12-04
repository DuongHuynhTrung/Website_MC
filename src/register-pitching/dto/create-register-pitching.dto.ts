import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRegisterPitchingDto {
  @ApiProperty({
    description: 'Group ID',
    example: 1,
  })
  @IsNotEmpty()
  groupId: number;

  @ApiProperty({
    description: 'Project ID',
    example: 1,
  })
  @IsNotEmpty()
  projectId: number;
}
